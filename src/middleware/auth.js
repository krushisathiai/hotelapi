import jwt from 'jsonwebtoken';
import env from '../config/env.js';
import { query } from '../config/database.js';

// Verify JWT from HttpOnly cookie
export const authenticate = async (req, res, next) => {
  try {
    const token = req.cookies?.token;

    if (!token) {
      return res.status(401).json({ success: false, message: 'Authentication required. Please log in.' });
    }

    const decoded = jwt.verify(token, env.jwt.secret);

    // Get user from database
    const result = await query(
      'SELECT id, full_name, email, role, is_active FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, message: 'User not found.' });
    }

    const user = result.rows[0];

    if (!user.is_active) {
      return res.status(403).json({ success: false, message: 'Account is deactivated.' });
    }

    // Get restaurant membership
    const memberResult = await query(
      `SELECT rm.restaurant_id, rm.role, r.name as restaurant_name
       FROM restaurant_members rm
       JOIN restaurants r ON r.id = rm.restaurant_id
       WHERE rm.user_id = $1 AND rm.is_active = true
       LIMIT 1`,
      [user.id]
    );

    req.user = {
      id: user.id,
      fullName: user.full_name,
      email: user.email,
      role: user.role,
    };

    if (memberResult.rows.length > 0) {
      req.user.restaurantId = memberResult.rows[0].restaurant_id;
      req.user.restaurantRole = memberResult.rows[0].role;
      req.user.restaurantName = memberResult.rows[0].restaurant_name;
    }

    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Session expired. Please log in again.' });
    }
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ success: false, message: 'Invalid token.' });
    }
    next(err);
  }
};

// Authorization: require specific roles
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }

    const userRole = req.user.restaurantRole || req.user.role;
    if (!roles.includes(userRole)) {
      return res.status(403).json({ success: false, message: 'You do not have permission to perform this action.' });
    }

    next();
  };
};

// Ensure user belongs to the restaurant
export const requireRestaurant = (req, res, next) => {
  if (!req.user?.restaurantId) {
    return res.status(403).json({ success: false, message: 'No restaurant associated with your account.' });
  }
  next();
};
