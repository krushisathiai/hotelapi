import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import env from './config/env.js';
import errorHandler from './middleware/errorHandler.js';
import { authenticate, requireRestaurant } from './middleware/auth.js';

// Route imports
import authRoutes from './routes/auth.js';
import dashboardRoutes from './routes/dashboard.js';
import categoryRoutes from './routes/categories.js';
import menuRoutes from './routes/menu.js';
import tableRoutes from './routes/tables.js';
import orderRoutes from './routes/orders.js';
import paymentRoutes from './routes/payments.js';
import staffRoutes from './routes/staff.js';
import reportRoutes from './routes/reports.js';
import settingsRoutes from './routes/settings.js';
import { submitContact, subscribe } from './controllers/publicController.js';

const app = express();

// Security middleware
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({
  origin: (origin, callback) => {
    // Allow origins dynamically for seamless cross-origin communication
    callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Rate limiting for auth endpoints (generous for live college demo and testing)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000,
  message: { success: false, message: 'Too many attempts. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'DineFlow API is running', timestamp: new Date().toISOString() });
});

// Public routes (no auth)
app.use('/api/auth', authLimiter, authRoutes);
app.post('/api/contact', submitContact);
app.post('/api/newsletter', subscribe);

// Protected routes (require auth + restaurant)
app.use('/api/dashboard', authenticate, requireRestaurant, dashboardRoutes);
app.use('/api/categories', authenticate, requireRestaurant, categoryRoutes);
app.use('/api/menu', authenticate, requireRestaurant, menuRoutes);
app.use('/api/tables', authenticate, requireRestaurant, tableRoutes);
app.use('/api/orders', authenticate, requireRestaurant, orderRoutes);
app.use('/api/payments', authenticate, requireRestaurant, paymentRoutes);
app.use('/api/staff', authenticate, requireRestaurant, staffRoutes);
app.use('/api/reports', authenticate, requireRestaurant, reportRoutes);
app.use('/api/settings', authenticate, requireRestaurant, settingsRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'API endpoint not found' });
});

// Error handler
app.use(errorHandler);

export default app;
