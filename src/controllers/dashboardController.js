import { query } from '../config/database.js';

// GET /api/dashboard/stats
export const getStats = async (req, res, next) => {
  try {
    const restaurantId = req.user.restaurantId;

    // Total orders
    const totalOrders = await query(
      'SELECT COUNT(*) as count FROM orders WHERE restaurant_id = $1', [restaurantId]
    );

    // Today's revenue
    const todayRevenue = await query(
      `SELECT COALESCE(SUM(total_amount), 0) as total FROM orders
       WHERE restaurant_id = $1 AND DATE(created_at) = CURRENT_DATE AND status NOT IN ('cancelled')`,
      [restaurantId]
    );

    // Total menu items
    const totalMenuItems = await query(
      'SELECT COUNT(*) as count FROM menu_items WHERE restaurant_id = $1', [restaurantId]
    );

    // Active tables
    const activeTables = await query(
      "SELECT COUNT(*) as count FROM restaurant_tables WHERE restaurant_id = $1 AND is_active = true", [restaurantId]
    );

    // Pending orders
    const pendingOrders = await query(
      "SELECT COUNT(*) as count FROM orders WHERE restaurant_id = $1 AND status IN ('pending', 'confirmed', 'preparing')",
      [restaurantId]
    );

    // Completed orders today
    const completedToday = await query(
      "SELECT COUNT(*) as count FROM orders WHERE restaurant_id = $1 AND status = 'completed' AND DATE(created_at) = CURRENT_DATE",
      [restaurantId]
    );

    res.json({
      success: true,
      data: {
        totalOrders: parseInt(totalOrders.rows[0].count),
        todayRevenue: parseFloat(todayRevenue.rows[0].total),
        totalMenuItems: parseInt(totalMenuItems.rows[0].count),
        activeTables: parseInt(activeTables.rows[0].count),
        pendingOrders: parseInt(pendingOrders.rows[0].count),
        completedToday: parseInt(completedToday.rows[0].count),
      },
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/dashboard/revenue-chart
export const getRevenueChart = async (req, res, next) => {
  try {
    const restaurantId = req.user.restaurantId;
    const days = parseInt(req.query.days) || 7;

    const result = await query(
      `SELECT DATE(created_at) as date, COALESCE(SUM(total_amount), 0) as revenue, COUNT(*) as orders
       FROM orders
       WHERE restaurant_id = $1
       AND created_at >= NOW() - INTERVAL '1 day' * $2
       AND status != 'cancelled'
       GROUP BY DATE(created_at)
       ORDER BY date ASC`,
      [restaurantId, days]
    );

    res.json({ success: true, data: result.rows });
  } catch (err) {
    next(err);
  }
};

// GET /api/dashboard/order-status-chart
export const getOrderStatusChart = async (req, res, next) => {
  try {
    const restaurantId = req.user.restaurantId;

    const result = await query(
      `SELECT status, COUNT(*) as count
       FROM orders WHERE restaurant_id = $1
       GROUP BY status`,
      [restaurantId]
    );

    res.json({ success: true, data: result.rows });
  } catch (err) {
    next(err);
  }
};

// GET /api/dashboard/recent-orders
export const getRecentOrders = async (req, res, next) => {
  try {
    const restaurantId = req.user.restaurantId;

    const result = await query(
      `SELECT o.id, o.order_number, o.order_type, o.status, o.total_amount, o.customer_name,
              o.created_at, rt.table_number
       FROM orders o
       LEFT JOIN restaurant_tables rt ON rt.id = o.table_id
       WHERE o.restaurant_id = $1
       ORDER BY o.created_at DESC
       LIMIT 10`,
      [restaurantId]
    );

    res.json({ success: true, data: result.rows });
  } catch (err) {
    next(err);
  }
};

// GET /api/dashboard/popular-items
export const getPopularItems = async (req, res, next) => {
  try {
    const restaurantId = req.user.restaurantId;

    const result = await query(
      `SELECT oi.item_name, SUM(oi.quantity) as total_quantity, SUM(oi.total_price) as total_revenue
       FROM order_items oi
       JOIN orders o ON o.id = oi.order_id
       WHERE o.restaurant_id = $1 AND o.status != 'cancelled'
       GROUP BY oi.item_name
       ORDER BY total_quantity DESC
       LIMIT 5`,
      [restaurantId]
    );

    res.json({ success: true, data: result.rows });
  } catch (err) {
    next(err);
  }
};

// GET /api/dashboard/recent-activity
export const getRecentActivity = async (req, res, next) => {
  try {
    const restaurantId = req.user.restaurantId;

    const result = await query(
      `SELECT al.id, al.action, al.entity_type, al.description, al.created_at, u.full_name
       FROM activity_logs al
       LEFT JOIN users u ON u.id = al.user_id
       WHERE al.restaurant_id = $1
       ORDER BY al.created_at DESC
       LIMIT 10`,
      [restaurantId]
    );

    res.json({ success: true, data: result.rows });
  } catch (err) {
    next(err);
  }
};
