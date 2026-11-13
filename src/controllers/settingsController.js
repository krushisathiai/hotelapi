import { query } from '../config/database.js';
import { AppError } from '../middleware/errorHandler.js';

// GET /api/settings
export const getSettings = async (req, res, next) => {
  try {
    const restaurantId = req.user.restaurantId;
    const result = await query('SELECT * FROM restaurants WHERE id = $1', [restaurantId]);
    if (result.rows.length === 0) throw new AppError('Restaurant not found.', 404);
    res.json({ success: true, data: result.rows[0] });
  } catch (err) { next(err); }
};

// PUT /api/settings
export const updateSettings = async (req, res, next) => {
  try {
    const restaurantId = req.user.restaurantId;
    const { name, description, address, city, state, zip_code, country, phone, email, website,
            currency, currency_symbol, tax_rate, tax_name, service_charge_rate,
            invoice_prefix, invoice_footer, logo_url } = req.body;

    const result = await query(
      `UPDATE restaurants SET
       name = COALESCE($1, name), description = COALESCE($2, description),
       address = COALESCE($3, address), city = COALESCE($4, city),
       state = COALESCE($5, state), zip_code = COALESCE($6, zip_code),
       country = COALESCE($7, country), phone = COALESCE($8, phone),
       email = COALESCE($9, email), website = COALESCE($10, website),
       currency = COALESCE($11, currency), currency_symbol = COALESCE($12, currency_symbol),
       tax_rate = COALESCE($13, tax_rate), tax_name = COALESCE($14, tax_name),
       service_charge_rate = COALESCE($15, service_charge_rate),
       invoice_prefix = COALESCE($16, invoice_prefix), invoice_footer = COALESCE($17, invoice_footer),
       logo_url = COALESCE($18, logo_url)
       WHERE id = $19 RETURNING *`,
      [name, description, address, city, state, zip_code, country, phone, email, website,
       currency, currency_symbol, tax_rate, tax_name, service_charge_rate,
       invoice_prefix, invoice_footer, logo_url, restaurantId]
    );

    if (result.rows.length === 0) throw new AppError('Restaurant not found.', 404);

    await query(
      `INSERT INTO activity_logs (restaurant_id, user_id, action, entity_type, entity_id, description)
       VALUES ($1, $2, 'update', 'restaurant', $1, 'Updated restaurant settings')`,
      [restaurantId, req.user.id]
    );

    res.json({ success: true, data: result.rows[0] });
  } catch (err) { next(err); }
};

// PUT /api/settings/profile
export const updateProfile = async (req, res, next) => {
  try {
    const { full_name, phone, avatar_url } = req.body;

    const result = await query(
      `UPDATE users SET
       full_name = COALESCE($1, full_name),
       phone = COALESCE($2, phone),
       avatar_url = COALESCE($3, avatar_url)
       WHERE id = $4 RETURNING id, full_name, email, phone, avatar_url`,
      [full_name, phone, avatar_url, req.user.id]
    );

    res.json({ success: true, data: result.rows[0] });
  } catch (err) { next(err); }
};
