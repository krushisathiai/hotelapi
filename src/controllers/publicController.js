import { query } from '../config/database.js';
import { AppError } from '../middleware/errorHandler.js';

// POST /api/contact
export const submitContact = async (req, res, next) => {
  try {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !message) throw new AppError('Name, email, and message are required.', 400);

    await query(
      'INSERT INTO contact_messages (name, email, subject, message) VALUES ($1, $2, $3, $4)',
      [name, email, subject || null, message]
    );

    res.status(201).json({ success: true, message: 'Message received! We will get back to you soon.' });
  } catch (err) { next(err); }
};

// POST /api/newsletter
export const subscribe = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) throw new AppError('Email is required.', 400);

    await query(
      `INSERT INTO newsletter_subscribers (email) VALUES ($1)
       ON CONFLICT (email) DO UPDATE SET is_active = true, unsubscribed_at = NULL`,
      [email.toLowerCase()]
    );

    res.status(201).json({ success: true, message: 'Successfully subscribed to our newsletter!' });
  } catch (err) { next(err); }
};
