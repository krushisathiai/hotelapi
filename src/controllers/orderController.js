import { query, getClient } from '../config/database.js';
import { AppError } from '../middleware/errorHandler.js';

// GET /api/orders
export const getOrders = async (req, res, next) => {
  try {
    const restaurantId = req.user.restaurantId;
    const { status, order_type, search, page = 1, limit = 20, date_from, date_to } = req.query;

    let sql = `SELECT o.*, rt.table_number, u.full_name as created_by_name
               FROM orders o
               LEFT JOIN restaurant_tables rt ON rt.id = o.table_id
               LEFT JOIN users u ON u.id = o.created_by
               WHERE o.restaurant_id = $1`;
    const params = [restaurantId];
    let idx = 2;

    if (status) { sql += ` AND o.status = $${idx}`; params.push(status); idx++; }
    if (order_type) { sql += ` AND o.order_type = $${idx}`; params.push(order_type); idx++; }
    if (search) {
      sql += ` AND (o.order_number ILIKE $${idx} OR o.customer_name ILIKE $${idx})`;
      params.push(`%${search}%`); idx++;
    }
    if (date_from) { sql += ` AND o.created_at >= $${idx}`; params.push(date_from); idx++; }
    if (date_to) { sql += ` AND o.created_at <= $${idx}`; params.push(date_to); idx++; }

    const countResult = await query(`SELECT COUNT(*) as total FROM (${sql}) subq`, params);
    const total = parseInt(countResult.rows[0].total);

    sql += ' ORDER BY o.created_at DESC';
    const offset = (parseInt(page) - 1) * parseInt(limit);
    sql += ` LIMIT $${idx} OFFSET $${idx + 1}`;
    params.push(parseInt(limit), offset);

    const result = await query(sql, params);

    res.json({
      success: true,
      data: result.rows,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, totalPages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (err) { next(err); }
};

// GET /api/orders/:id
export const getOrder = async (req, res, next) => {
  try {
    const restaurantId = req.user.restaurantId;

    const orderResult = await query(
      `SELECT o.*, rt.table_number, u.full_name as created_by_name
       FROM orders o
       LEFT JOIN restaurant_tables rt ON rt.id = o.table_id
       LEFT JOIN users u ON u.id = o.created_by
       WHERE o.id = $1 AND o.restaurant_id = $2`,
      [req.params.id, restaurantId]
    );

    if (orderResult.rows.length === 0) throw new AppError('Order not found.', 404);

    const itemsResult = await query(
      `SELECT oi.*, mi.is_veg, mi.image_url
       FROM order_items oi
       LEFT JOIN menu_items mi ON mi.id = oi.menu_item_id
       WHERE oi.order_id = $1
       ORDER BY oi.created_at ASC`,
      [req.params.id]
    );

    const paymentsResult = await query(
      'SELECT * FROM payments WHERE order_id = $1 ORDER BY paid_at DESC',
      [req.params.id]
    );

    res.json({
      success: true,
      data: {
        ...orderResult.rows[0],
        items: itemsResult.rows,
        payments: paymentsResult.rows,
      },
    });
  } catch (err) { next(err); }
};

// POST /api/orders
export const createOrder = async (req, res, next) => {
  const client = await getClient();
  try {
    const restaurantId = req.user.restaurantId;
    const { items, table_id, order_type, customer_name, customer_phone, notes, discount_amount, discount_type } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new AppError('At least one item is required.', 400);
    }

    await client.query('BEGIN');

    // Generate order number
    const orderNumResult = await client.query('SELECT generate_order_number($1) as order_number', [restaurantId]);
    const orderNumber = orderNumResult.rows[0].order_number;

    // Get restaurant tax rate
    const taxResult = await client.query('SELECT tax_rate, service_charge_rate FROM restaurants WHERE id = $1', [restaurantId]);
    const taxRate = parseFloat(taxResult.rows[0].tax_rate) || 0;
    const serviceChargeRate = parseFloat(taxResult.rows[0].service_charge_rate) || 0;

    // Calculate prices from menu items
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const menuItem = await client.query(
        'SELECT id, name, price, is_available FROM menu_items WHERE id = $1 AND restaurant_id = $2',
        [item.menu_item_id, restaurantId]
      );

      if (menuItem.rows.length === 0) throw new AppError(`Menu item not found: ${item.menu_item_id}`, 400);
      if (!menuItem.rows[0].is_available) throw new AppError(`${menuItem.rows[0].name} is currently unavailable.`, 400);

      const mi = menuItem.rows[0];
      const qty = parseInt(item.quantity) || 1;
      const totalPrice = parseFloat(mi.price) * qty;
      subtotal += totalPrice;

      orderItems.push({
        menu_item_id: mi.id,
        item_name: mi.name,
        item_price: parseFloat(mi.price),
        quantity: qty,
        total_price: totalPrice,
        notes: item.notes || null,
      });
    }

    const disc = parseFloat(discount_amount) || 0;
    const discType = discount_type || 'flat';
    const actualDiscount = discType === 'percentage' ? (subtotal * disc / 100) : disc;
    const taxableAmount = subtotal - actualDiscount;
    const taxAmount = Math.round(taxableAmount * taxRate) / 100;
    const serviceCharge = Math.round(taxableAmount * serviceChargeRate) / 100;
    const totalAmount = taxableAmount + taxAmount + serviceCharge;

    // Create order
    const orderResult = await client.query(
      `INSERT INTO orders (restaurant_id, order_number, table_id, order_type, subtotal, tax_amount, discount_amount, discount_type, service_charge, total_amount, customer_name, customer_phone, notes, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) RETURNING *`,
      [restaurantId, orderNumber, table_id || null, order_type || 'dine-in',
       subtotal, taxAmount, actualDiscount, discType, serviceCharge, totalAmount,
       customer_name || null, customer_phone || null, notes || null, req.user.id]
    );

    const order = orderResult.rows[0];

    // Insert order items
    for (const oi of orderItems) {
      await client.query(
        `INSERT INTO order_items (order_id, menu_item_id, item_name, item_price, quantity, total_price, notes)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [order.id, oi.menu_item_id, oi.item_name, oi.item_price, oi.quantity, oi.total_price, oi.notes]
      );
    }

    // Update table status if dine-in
    if (table_id && order_type === 'dine-in') {
      await client.query(
        "UPDATE restaurant_tables SET status = 'occupied' WHERE id = $1 AND restaurant_id = $2",
        [table_id, restaurantId]
      );
    }

    // Activity log
    await client.query(
      `INSERT INTO activity_logs (restaurant_id, user_id, action, entity_type, entity_id, description)
       VALUES ($1, $2, 'create', 'order', $3, $4)`,
      [restaurantId, req.user.id, order.id, `Created order ${orderNumber}`]
    );

    await client.query('COMMIT');

    // Get full order with items
    const fullOrder = await query(
      `SELECT o.*, rt.table_number FROM orders o
       LEFT JOIN restaurant_tables rt ON rt.id = o.table_id
       WHERE o.id = $1`,
      [order.id]
    );

    const fullItems = await query('SELECT * FROM order_items WHERE order_id = $1', [order.id]);

    res.status(201).json({
      success: true,
      data: { ...fullOrder.rows[0], items: fullItems.rows },
    });
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
};

// PATCH /api/orders/:id/status
export const updateOrderStatus = async (req, res, next) => {
  try {
    const restaurantId = req.user.restaurantId;
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'served', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      throw new AppError(`Invalid status. Must be one of: ${validStatuses.join(', ')}`, 400);
    }

    const updates = { status };
    if (status === 'completed' || status === 'cancelled') {
      updates.completed_at = new Date();
    }

    const result = await query(
      `UPDATE orders SET status = $1, completed_at = $2
       WHERE id = $3 AND restaurant_id = $4 RETURNING *`,
      [status, updates.completed_at || null, id, restaurantId]
    );

    if (result.rows.length === 0) throw new AppError('Order not found.', 404);

    // Free table if order is completed or cancelled
    if ((status === 'completed' || status === 'cancelled') && result.rows[0].table_id) {
      // Check if table has other active orders
      const activeOrders = await query(
        "SELECT COUNT(*) as count FROM orders WHERE table_id = $1 AND id != $2 AND status NOT IN ('completed', 'cancelled')",
        [result.rows[0].table_id, id]
      );
      if (parseInt(activeOrders.rows[0].count) === 0) {
        await query(
          "UPDATE restaurant_tables SET status = 'available' WHERE id = $1",
          [result.rows[0].table_id]
        );
      }
    }

    await query(
      `INSERT INTO activity_logs (restaurant_id, user_id, action, entity_type, entity_id, description)
       VALUES ($1, $2, 'update', 'order', $3, $4)`,
      [restaurantId, req.user.id, id, `Order ${result.rows[0].order_number} status changed to ${status}`]
    );

    res.json({ success: true, data: result.rows[0] });
  } catch (err) { next(err); }
};
