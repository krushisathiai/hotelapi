import { query } from '../config/database.js';
import { AppError } from '../middleware/errorHandler.js';

// GET /api/reports/sales
export const getSalesReport = async (req, res, next) => {
  try {
    const restaurantId = req.user.restaurantId;
    const { period = 'daily', date_from, date_to } = req.query;

    let dateFormat, interval;
    switch (period) {
      case 'monthly': dateFormat = 'YYYY-MM'; interval = '30 days'; break;
      case 'weekly': dateFormat = 'IYYY-IW'; interval = '7 days'; break;
      default: dateFormat = 'YYYY-MM-DD'; interval = '1 day'; break;
    }

    let dateFilter = '';
    const params = [restaurantId];
    let idx = 2;

    if (date_from) { dateFilter += ` AND o.created_at >= $${idx}`; params.push(date_from); idx++; }
    if (date_to) { dateFilter += ` AND o.created_at <= $${idx}`; params.push(date_to); idx++; }
    if (!date_from && !date_to) {
      dateFilter = ` AND o.created_at >= NOW() - INTERVAL '30 days'`;
    }

    const result = await query(
      `SELECT TO_CHAR(o.created_at, '${dateFormat}') as period,
              COUNT(*) as total_orders,
              SUM(CASE WHEN o.status != 'cancelled' THEN o.total_amount ELSE 0 END) as revenue,
              SUM(CASE WHEN o.status != 'cancelled' THEN o.tax_amount ELSE 0 END) as tax_collected,
              SUM(CASE WHEN o.status != 'cancelled' THEN o.discount_amount ELSE 0 END) as discounts_given,
              COUNT(CASE WHEN o.status = 'cancelled' THEN 1 END) as cancelled_orders
       FROM orders o
       WHERE o.restaurant_id = $1 ${dateFilter}
       GROUP BY TO_CHAR(o.created_at, '${dateFormat}')
       ORDER BY period ASC`,
      params
    );

    // Summary totals
    const summary = await query(
      `SELECT COUNT(*) as total_orders,
              COALESCE(SUM(CASE WHEN status != 'cancelled' THEN total_amount ELSE 0 END), 0) as total_revenue,
              COALESCE(AVG(CASE WHEN status != 'cancelled' THEN total_amount ELSE NULL END), 0) as avg_order_value,
              COALESCE(SUM(CASE WHEN status != 'cancelled' THEN tax_amount ELSE 0 END), 0) as total_tax
       FROM orders WHERE restaurant_id = $1 ${dateFilter}`,
      params
    );

    res.json({ success: true, data: { periods: result.rows, summary: summary.rows[0] } });
  } catch (err) { next(err); }
};

// GET /api/reports/best-sellers
export const getBestSellers = async (req, res, next) => {
  try {
    const restaurantId = req.user.restaurantId;
    const limit = parseInt(req.query.limit) || 10;

    const result = await query(
      `SELECT oi.item_name, SUM(oi.quantity) as total_qty, SUM(oi.total_price) as total_revenue,
              COUNT(DISTINCT oi.order_id) as order_count
       FROM order_items oi
       JOIN orders o ON o.id = oi.order_id
       WHERE o.restaurant_id = $1 AND o.status != 'cancelled'
       GROUP BY oi.item_name
       ORDER BY total_qty DESC
       LIMIT $2`,
      [restaurantId, limit]
    );

    res.json({ success: true, data: result.rows });
  } catch (err) { next(err); }
};

// GET /api/reports/payment-methods
export const getPaymentMethodReport = async (req, res, next) => {
  try {
    const restaurantId = req.user.restaurantId;

    const result = await query(
      `SELECT p.payment_method, COUNT(*) as count, SUM(p.amount) as total
       FROM payments p
       WHERE p.restaurant_id = $1 AND p.payment_status = 'completed'
       GROUP BY p.payment_method
       ORDER BY total DESC`,
      [restaurantId]
    );

    res.json({ success: true, data: result.rows });
  } catch (err) { next(err); }
};

// GET /api/reports/export/csv
export const exportCSV = async (req, res, next) => {
  try {
    const restaurantId = req.user.restaurantId;
    const { type = 'orders', date_from, date_to } = req.query;

    let result;
    if (type === 'orders') {
      let sql = `SELECT o.order_number, o.order_type, o.status, o.customer_name,
                        o.subtotal, o.tax_amount, o.discount_amount, o.total_amount,
                        o.created_at, o.completed_at, rt.table_number
                 FROM orders o
                 LEFT JOIN restaurant_tables rt ON rt.id = o.table_id
                 WHERE o.restaurant_id = $1`;
      const params = [restaurantId];
      let idx = 2;
      if (date_from) { sql += ` AND o.created_at >= $${idx}`; params.push(date_from); idx++; }
      if (date_to) { sql += ` AND o.created_at <= $${idx}`; params.push(date_to); idx++; }
      sql += ' ORDER BY o.created_at DESC';
      result = await query(sql, params);
    } else if (type === 'payments') {
      let sql = `SELECT p.amount, p.payment_method, p.payment_status, p.paid_at,
                        o.order_number, o.customer_name
                 FROM payments p
                 JOIN orders o ON o.id = p.order_id
                 WHERE p.restaurant_id = $1`;
      const params = [restaurantId];
      let idx = 2;
      if (date_from) { sql += ` AND p.paid_at >= $${idx}`; params.push(date_from); idx++; }
      if (date_to) { sql += ` AND p.paid_at <= $${idx}`; params.push(date_to); idx++; }
      sql += ' ORDER BY p.paid_at DESC';
      result = await query(sql, params);
    } else {
      throw new AppError('Invalid export type. Use "orders" or "payments".', 400);
    }

    if (result.rows.length === 0) {
      return res.json({ success: true, data: '', message: 'No data to export.' });
    }

    // Generate CSV
    const headers = Object.keys(result.rows[0]);
    const csvRows = [headers.join(',')];
    for (const row of result.rows) {
      const values = headers.map(h => {
        const val = row[h];
        if (val === null || val === undefined) return '';
        const str = String(val);
        return str.includes(',') || str.includes('"') || str.includes('\n')
          ? `"${str.replace(/"/g, '""')}"` : str;
      });
      csvRows.push(values.join(','));
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=${type}_report_${new Date().toISOString().split('T')[0]}.csv`);
    res.send(csvRows.join('\n'));
  } catch (err) { next(err); }
};
