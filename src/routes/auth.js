import { Router } from 'express';
import { signup, login, logout, getMe, forgotPassword, resetPassword, changePassword } from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';
import { validate, rules } from '../middleware/validate.js';

const router = Router();

router.post('/signup', validate({
  restaurantName: [rules.required, rules.minLength(2), rules.maxLength(150)],
  fullName: [rules.required, rules.minLength(2), rules.maxLength(100)],
  email: [rules.required, rules.email],
  password: [rules.required, rules.passwordStrength],
}), signup);

router.post('/login', validate({
  email: [rules.required, rules.email],
  password: [rules.required],
}), login);

router.post('/logout', logout);
router.get('/me', authenticate, getMe);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.put('/change-password', authenticate, changePassword);

export default router;
