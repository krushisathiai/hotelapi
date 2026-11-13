import { Router } from 'express';
import { getStats, getRevenueChart, getOrderStatusChart, getRecentOrders, getPopularItems, getRecentActivity } from '../controllers/dashboardController.js';

const router = Router();

router.get('/stats', getStats);
router.get('/revenue-chart', getRevenueChart);
router.get('/order-status-chart', getOrderStatusChart);
router.get('/recent-orders', getRecentOrders);
router.get('/popular-items', getPopularItems);
router.get('/recent-activity', getRecentActivity);

export default router;
