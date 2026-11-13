import { query } from '../config/database.js';
import { AppError } from '../middleware/errorHandler.js';

// GET /api/staff
export const getStaff = async (req, res, next) => {
  try {
    const restaurantId = req.user.restaurantId;
    const { role, search, is_active } = req.query;

    let sql = 'SELECT * FROM staff WHERE restaurant_id = $1';
    const params = [restaurantId];
    let idx = 2;

    if (role) { sql += ` AND role = $${idx}`; params.push(role); idx++; }
    if (search) {
      sql += ` AND (name ILIKE $${idx} OR email ILIKE $${idx} OR phone ILIKE $${idx})`;
      params.push(`%${search}%`); idx++;
    }
    if (is_active !== undefined) { sql += ` AND is_active = $${idx}`; params.push(is_active === 'true'); idx++; }

    sql += ' ORDER BY name ASC';
    const result = await query(sql, params);
    res.json({ success: true, data: result.rows });
  } catch (err) { next(err); }
};

// POST /api/staff
export const createStaff = async (req, res, next) => {
  try {
    const restaurantId = req.user.restaurantId;
    const { name, email, phone, role, salary, notes } = req.body;

    if (!name) throw new AppError('Staff name is required.', 400);
    if (!role) throw new AppError('Staff role is required.', 400);

    const result = await query(
      `INSERT INTO staff (restaurant_id, name, email, phone, role, salary, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [restaurantId, name, email || null, phone || null, role, salary || null, notes || null]
    );

    await query(
      `INSERT INTO activity_logs (restaurant_id, user_id, action, entity_type, entity_id, description)
       VALUES ($1, $2, 'create', 'staff', $3, $4)`,
      [restaurantId, req.user.id, result.rows[0].id, `Added staff: ${name} (${role})`]
    );

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) { next(err); }
};

// PUT /api/staff/:id
export const updateStaff = async (req, res, next) => {
  try {
    const restaurantId = req.user.restaurantId;
    const { id } = req.params;
    const { name, email, phone, role, salary, is_active, notes } = req.body;

    const result = await query(
      `UPDATE staff SET
       name = COALESCE($1, name), email = COALESCE($2, email),
       phone = COALESCE($3, phone), role = COALESCE($4, role),
       salary = COALESCE($5, salary), is_active = COALESCE($6, is_active),
       notes = COALESCE($7, notes)
       WHERE id = $8 AND restaurant_id = $9 RETURNING *`,
      [name, email, phone, role, salary, is_active, notes, id, restaurantId]
    );

    if (result.rows.length === 0) throw new AppError('Staff member not found.', 404);
    res.json({ success: true, data: result.rows[0] });
  } catch (err) { next(err); }
};

// DELETE /api/staff/:id
export const deleteStaff = async (req, res, next) => {
  try {
    const restaurantId = req.user.restaurantId;
    const { id } = req.params;

    // Soft-deactivate instead of hard delete
    const result = await query(
      'UPDATE staff SET is_active = false WHERE id = $1 AND restaurant_id = $2 RETURNING name',
      [id, restaurantId]
    );

    if (result.rows.length === 0) throw new AppError('Staff member not found.', 404);
    res.json({ success: true, message: `${result.rows[0].name} has been deactivated.` });
  } catch (err) { next(err); }
};
