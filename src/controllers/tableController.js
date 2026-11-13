import { query } from '../config/database.js';
import { AppError } from '../middleware/errorHandler.js';

// GET /api/tables
export const getTables = async (req, res, next) => {
  try {
    const restaurantId = req.user.restaurantId;
    const { status } = req.query;

    let sql = `SELECT rt.*,
               (SELECT o.order_number FROM orders o WHERE o.table_id = rt.id AND o.status NOT IN ('completed', 'cancelled') LIMIT 1) as current_order
               FROM restaurant_tables rt WHERE rt.restaurant_id = $1`;
    const params = [restaurantId];

    if (status) {
      sql += ' AND rt.status = $2';
      params.push(status);
    }

    sql += ' ORDER BY rt.table_number ASC';
    const result = await query(sql, params);
    res.json({ success: true, data: result.rows });
  } catch (err) { next(err); }
};

// POST /api/tables
export const createTable = async (req, res, next) => {
  try {
    const restaurantId = req.user.restaurantId;
    const { table_number, seating_capacity, location } = req.body;

    if (!table_number) throw new AppError('Table number is required.', 400);

    const result = await query(
      `INSERT INTO restaurant_tables (restaurant_id, table_number, seating_capacity, location)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [restaurantId, table_number, seating_capacity || 4, location || 'indoor']
    );

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) { next(err); }
};

// PUT /api/tables/:id
export const updateTable = async (req, res, next) => {
  try {
    const restaurantId = req.user.restaurantId;
    const { id } = req.params;
    const { table_number, seating_capacity, status, location, is_active } = req.body;

    const result = await query(
      `UPDATE restaurant_tables SET
       table_number = COALESCE($1, table_number),
       seating_capacity = COALESCE($2, seating_capacity),
       status = COALESCE($3, status),
       location = COALESCE($4, location),
       is_active = COALESCE($5, is_active)
       WHERE id = $6 AND restaurant_id = $7 RETURNING *`,
      [table_number, seating_capacity, status, location, is_active, id, restaurantId]
    );

    if (result.rows.length === 0) throw new AppError('Table not found.', 404);
    res.json({ success: true, data: result.rows[0] });
  } catch (err) { next(err); }
};

// DELETE /api/tables/:id
export const deleteTable = async (req, res, next) => {
  try {
    const restaurantId = req.user.restaurantId;
    const { id } = req.params;

    // Check for active orders
    const active = await query(
      "SELECT COUNT(*) as count FROM orders WHERE table_id = $1 AND status NOT IN ('completed', 'cancelled')",
      [id]
    );
    if (parseInt(active.rows[0].count) > 0) {
      throw new AppError('Cannot delete: Table has active orders.', 400);
    }

    const result = await query(
      'DELETE FROM restaurant_tables WHERE id = $1 AND restaurant_id = $2 RETURNING table_number',
      [id, restaurantId]
    );

    if (result.rows.length === 0) throw new AppError('Table not found.', 404);
    res.json({ success: true, message: `Table ${result.rows[0].table_number} deleted.` });
  } catch (err) { next(err); }
};
