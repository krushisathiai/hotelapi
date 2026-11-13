import { AppError } from './errorHandler.js';

// Generic validation middleware factory
export const validate = (schema) => {
  return (req, res, next) => {
    const errors = [];
    for (const [field, rules] of Object.entries(schema)) {
      const value = req.body[field];
      for (const rule of rules) {
        const error = rule(value, field);
        if (error) {
          errors.push(error);
          break; // Stop at first error for each field
        }
      }
    }
    if (errors.length > 0) {
      return res.status(400).json({ success: false, message: 'Validation failed', errors });
    }
    next();
  };
};

// Validation rules
export const rules = {
  required: (value, field) => {
    if (value === undefined || value === null || (typeof value === 'string' && value.trim() === '')) {
      return `${field} is required`;
    }
    return null;
  },
  email: (value, field) => {
    if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return `${field} must be a valid email address`;
    }
    return null;
  },
  minLength: (min) => (value, field) => {
    if (value && value.length < min) {
      return `${field} must be at least ${min} characters`;
    }
    return null;
  },
  maxLength: (max) => (value, field) => {
    if (value && value.length > max) {
      return `${field} must not exceed ${max} characters`;
    }
    return null;
  },
  phone: (value, field) => {
    if (value && !/^[\+]?[\d\s\-\(\)]{7,20}$/.test(value)) {
      return `${field} must be a valid phone number`;
    }
    return null;
  },
  number: (value, field) => {
    if (value !== undefined && value !== null && value !== '' && isNaN(Number(value))) {
      return `${field} must be a number`;
    }
    return null;
  },
  positive: (value, field) => {
    if (value !== undefined && value !== null && value !== '' && Number(value) < 0) {
      return `${field} must be a positive number`;
    }
    return null;
  },
  oneOf: (options) => (value, field) => {
    if (value && !options.includes(value)) {
      return `${field} must be one of: ${options.join(', ')}`;
    }
    return null;
  },
  passwordStrength: (value, field) => {
    if (value && value.length < 8) {
      return `${field} must be at least 8 characters`;
    }
    return null;
  },
};
