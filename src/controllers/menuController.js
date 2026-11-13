import { query } from '../config/database.js';
import { AppError } from '../middleware/errorHandler.js';

// GET /api/menu
export const getMenuItems = async (req, res, next) => {
  try {
    const restaurantId = req.user.restaurantId;
    const { category, search, is_veg, is_available, page = 1, limit = 20, sort = 'name', order = 'asc' } = req.query;

    let sql = `SELECT mi.*, mc.name as category_name
               FROM menu_items mi
               LEFT JOIN menu_categories mc ON mc.id = mi.category_id
               WHERE mi.restaurant_id = $1`;
    const params = [restaurantId];
    let paramIndex = 2;

    if (category) {
      sql += ` AND mi.category_id = $${paramIndex}`;
      params.push(category);
      paramIndex++;
    }

    if (search) {
      sql += ` AND (mi.name ILIKE $${paramIndex} OR mi.description ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (is_veg !== undefined) {
      sql += ` AND mi.is_veg = $${paramIndex}`;
      params.push(is_veg === 'true');
      paramIndex++;
    }

    if (is_available !== undefined) {
      sql += ` AND mi.is_available = $${paramIndex}`;
      params.push(is_available === 'true');
      paramIndex++;
    }

    // Count total
    const countResult = await query(`SELECT COUNT(*) as total FROM (${sql}) subq`, params);
    const total = parseInt(countResult.rows[0].total);

    // Sorting
    const allowedSorts = ['name', 'price', 'created_at'];
    const sortField = allowedSorts.includes(sort) ? `mi.${sort}` : 'mi.name';
    const sortOrder = order === 'desc' ? 'DESC' : 'ASC';
    sql += ` ORDER BY ${sortField} ${sortOrder}`;

    // Pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);
    sql += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(parseInt(limit), offset);

    const result = await query(sql, params);

    res.json({
      success: true,
      data: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (err) { next(err); }
};

// GET /api/menu/:id
export const getMenuItem = async (req, res, next) => {
  try {
    const restaurantId = req.user.restaurantId;
    const result = await query(
      `SELECT mi.*, mc.name as category_name FROM menu_items mi
       LEFT JOIN menu_categories mc ON mc.id = mi.category_id
       WHERE mi.id = $1 AND mi.restaurant_id = $2`,
      [req.params.id, restaurantId]
    );
    if (result.rows.length === 0) throw new AppError('Menu item not found.', 404);
    res.json({ success: true, data: result.rows[0] });
  } catch (err) { next(err); }
};

// POST /api/menu
export const createMenuItem = async (req, res, next) => {
  try {
    const restaurantId = req.user.restaurantId;
    const { name, description, price, category_id, is_veg, is_available, image_url, preparation_time } = req.body;

    if (!name || !name.trim()) throw new AppError('Item name is required.', 400);
    if (price === undefined || price === null || isNaN(Number(price)) || Number(price) < 0) {
      throw new AppError('Valid price is required.', 400);
    }

    const result = await query(
      `INSERT INTO menu_items (restaurant_id, name, description, price, category_id, is_veg, is_available, image_url, preparation_time)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [restaurantId, name.trim(), description || null, Number(price), category_id || null,
       is_veg !== undefined ? is_veg : true, is_available !== undefined ? is_available : true,
       image_url || null, preparation_time || 15]
    );

    // Get category name
    if (result.rows[0].category_id) {
      const cat = await query('SELECT name FROM menu_categories WHERE id = $1', [result.rows[0].category_id]);
      result.rows[0].category_name = cat.rows[0]?.name || null;
    }

    await query(
      `INSERT INTO activity_logs (restaurant_id, user_id, action, entity_type, entity_id, description)
       VALUES ($1, $2, 'create', 'menu_item', $3, $4)`,
      [restaurantId, req.user.id, result.rows[0].id, `Added menu item: ${name}`]
    );

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) { next(err); }
};

// PUT /api/menu/:id
export const updateMenuItem = async (req, res, next) => {
  try {
    const restaurantId = req.user.restaurantId;
    const { id } = req.params;
    const { name, description, price, category_id, is_veg, is_available, image_url, preparation_time } = req.body;

    const result = await query(
      `UPDATE menu_items SET
       name = COALESCE($1, name),
       description = COALESCE($2, description),
       price = COALESCE($3, price),
       category_id = $4,
       is_veg = COALESCE($5, is_veg),
       is_available = COALESCE($6, is_available),
       image_url = COALESCE($7, image_url),
       preparation_time = COALESCE($8, preparation_time)
       WHERE id = $9 AND restaurant_id = $10 RETURNING *`,
      [name, description, price !== undefined ? Number(price) : null, category_id,
       is_veg, is_available, image_url, preparation_time, id, restaurantId]
    );

    if (result.rows.length === 0) throw new AppError('Menu item not found.', 404);

    await query(
      `INSERT INTO activity_logs (restaurant_id, user_id, action, entity_type, entity_id, description)
       VALUES ($1, $2, 'update', 'menu_item', $3, $4)`,
      [restaurantId, req.user.id, id, `Updated menu item: ${result.rows[0].name}`]
    );

    res.json({ success: true, data: result.rows[0] });
  } catch (err) { next(err); }
};

// DELETE /api/menu/:id
export const deleteMenuItem = async (req, res, next) => {
  try {
    const restaurantId = req.user.restaurantId;
    const { id } = req.params;

    const result = await query(
      'DELETE FROM menu_items WHERE id = $1 AND restaurant_id = $2 RETURNING name',
      [id, restaurantId]
    );

    if (result.rows.length === 0) throw new AppError('Menu item not found.', 404);

    res.json({ success: true, message: `${result.rows[0].name} deleted successfully.` });
  } catch (err) { next(err); }
};
