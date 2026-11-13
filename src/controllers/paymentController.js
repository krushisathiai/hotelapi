import { query } from '../config/database.js';
import { AppError } from '../middleware/errorHandler.js';

// GET /api/payments
export const getPayments = async (req, res, next) => {
  try {
    const restaurantId = req.user.restaurantId;
    const { order_id, payment_method, status, page = 1, limit = 20, date_from, date_to } = req.query;

    let sql = `SELECT p.*, o.order_number, o.customer_name
               FROM payments p
               JOIN orders o ON o.id = p.order_id
               WHERE p.restaurant_id = $1`;
    const params = [restaurantId];
    let idx = 2;

    if (order_id) { sql += ` AND p.order_id = $${idx}`; params.push(order_id); idx++; }
    if (payment_method) { sql += ` AND p.payment_method = $${idx}`; params.push(payment_method); idx++; }
    if (status) { sql += ` AND p.payment_status = $${idx}`; params.push(status); idx++; }
    if (date_from) { sql += ` AND p.paid_at >= $${idx}`; params.push(date_from); idx++; }
    if (date_to) { sql += ` AND p.paid_at <= $${idx}`; params.push(date_to); idx++; }

    const countResult = await query(`SELECT COUNT(*) as total FROM (${sql}) subq`, params);
    const total = parseInt(countResult.rows[0].total);

    sql += ' ORDER BY p.paid_at DESC';
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

// POST /api/payments
export const createPayment = async (req, res, next) => {
  try {
    const restaurantId = req.user.restaurantId;
    const { order_id, amount, payment_method, transaction_id, notes } = req.body;

    if (!order_id) throw new AppError('Order ID is required.', 400);
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) throw new AppError('Valid amount is required.', 400);
    if (!payment_method) throw new AppError('Payment method is required.', 400);

    // Verify order belongs to restaurant
    const order = await query(
      'SELECT id, total_amount, status FROM orders WHERE id = $1 AND restaurant_id = $2',
      [order_id, restaurantId]
    );
    if (order.rows.length === 0) throw new AppError('Order not found.', 404);

    // Check total payments already made
    const existingPayments = await query(
      "SELECT COALESCE(SUM(amount), 0) as total_paid FROM payments WHERE order_id = $1 AND payment_status = 'completed'",
      [order_id]
    );
    const totalPaid = parseFloat(existingPayments.rows[0].total_paid);
    const orderTotal = parseFloat(order.rows[0].total_amount);

    if (totalPaid + Number(amount) > orderTotal + 0.01) {
      throw new AppError(`Payment exceeds order total. Order total: ${orderTotal}, Already paid: ${totalPaid}`, 400);
    }

    const result = await query(
      `INSERT INTO payments (restaurant_id, order_id, amount, payment_method, transaction_id, notes)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [restaurantId, order_id, Number(amount), payment_method, transaction_id || null, notes || null]
    );

    // Activity log
    await query(
      `INSERT INTO activity_logs (restaurant_id, user_id, action, entity_type, entity_id, description)
       VALUES ($1, $2, 'create', 'payment', $3, $4)`,
      [restaurantId, req.user.id, result.rows[0].id,
       `Payment of ${amount} via ${payment_method} for order ${order.rows[0].id}`]
    );

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) { next(err); }
};

// GET /api/payments/order/:orderId/invoice
export const getInvoice = async (req, res, next) => {
  try {
    const restaurantId = req.user.restaurantId;
    const { orderId } = req.params;

    const orderResult = await query(
      `SELECT o.*, rt.table_number FROM orders o
       LEFT JOIN restaurant_tables rt ON rt.id = o.table_id
       WHERE o.id = $1 AND o.restaurant_id = $2`,
      [orderId, restaurantId]
    );
    if (orderResult.rows.length === 0) throw new AppError('Order not found.', 404);

    const items = await query('SELECT * FROM order_items WHERE order_id = $1', [orderId]);
    const payments = await query(
      "SELECT * FROM payments WHERE order_id = $1 AND payment_status = 'completed'", [orderId]
    );

    const restaurant = await query(
      'SELECT name, address, phone, email, tax_name, tax_rate, invoice_prefix, invoice_footer, currency_symbol FROM restaurants WHERE id = $1',
      [restaurantId]
    );

    const totalPaid = payments.rows.reduce((sum, p) => sum + parseFloat(p.amount), 0);
    const orderTotal = parseFloat(orderResult.rows[0].total_amount);

    res.json({
      success: true,
      data: {
        restaurant: restaurant.rows[0],
        order: orderResult.rows[0],
        items: items.rows,
        payments: payments.rows,
        totalPaid,
        balanceDue: Math.max(0, orderTotal - totalPaid),
        paymentStatus: totalPaid >= orderTotal ? 'paid' : totalPaid > 0 ? 'partial' : 'unpaid',
      },
    });
  } catch (err) { next(err); }
};
