import { query } from '../config/database.js';
import { AppError } from '../middleware/errorHandler.js';

// GET /api/categories
export const getCategories = async (req, res, next) => {
  try {
    const restaurantId = req.user.restaurantId;
    const result = await query(
      `SELECT mc.*, COUNT(mi.id) as item_count
       FROM menu_categories mc
       LEFT JOIN menu_items mi ON mi.category_id = mc.id
       WHERE mc.restaurant_id = $1
       GROUP BY mc.id
       ORDER BY mc.display_order ASC, mc.name ASC`,
      [restaurantId]
    );
    res.json({ success: true, data: result.rows });
  } catch (err) { next(err); }
};

// POST /api/categories
export const createCategory = async (req, res, next) => {
  try {
    const restaurantId = req.user.restaurantId;
    const { name, description, display_order } = req.body;

    if (!name || !name.trim()) throw new AppError('Category name is required.', 400);

    const result = await query(
      `INSERT INTO menu_categories (restaurant_id, name, description, display_order)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [restaurantId, name.trim(), description || null, display_order || 0]
    );

    await query(
      `INSERT INTO activity_logs (restaurant_id, user_id, action, entity_type, entity_id, description)
       VALUES ($1, $2, 'create', 'category', $3, $4)`,
      [restaurantId, req.user.id, result.rows[0].id, `Created category: ${name}`]
    );

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) { next(err); }
};

// PUT /api/categories/:id
export const updateCategory = async (req, res, next) => {
  try {
    const restaurantId = req.user.restaurantId;
    const { id } = req.params;
    const { name, description, display_order, is_active } = req.body;

    const result = await query(
      `UPDATE menu_categories SET
       name = COALESCE($1, name),
       description = COALESCE($2, description),
       display_order = COALESCE($3, display_order),
       is_active = COALESCE($4, is_active)
       WHERE id = $5 AND restaurant_id = $6 RETURNING *`,
      [name, description, display_order, is_active, id, restaurantId]
    );

    if (result.rows.length === 0) throw new AppError('Category not found.', 404);

    res.json({ success: true, data: result.rows[0] });
  } catch (err) { next(err); }
};

// DELETE /api/categories/:id
export const deleteCategory = async (req, res, next) => {
  try {
    const restaurantId = req.user.restaurantId;
    const { id } = req.params;

    // Check for items using this category
    const items = await query(
      'SELECT COUNT(*) as count FROM menu_items WHERE category_id = $1', [id]
    );

    if (parseInt(items.rows[0].count) > 0) {
      throw new AppError(`Cannot delete: ${items.rows[0].count} menu item(s) are in this category. Reassign or remove them first.`, 400);
    }

    const result = await query(
      'DELETE FROM menu_categories WHERE id = $1 AND restaurant_id = $2 RETURNING id',
      [id, restaurantId]
    );

    if (result.rows.length === 0) throw new AppError('Category not found.', 404);

    res.json({ success: true, message: 'Category deleted.' });
  } catch (err) { next(err); }
};
