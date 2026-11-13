import { Router } from 'express';
import { getSalesReport, getBestSellers, getPaymentMethodReport, exportCSV } from '../controllers/reportController.js';

const router = Router();
router.get('/sales', getSalesReport);
router.get('/best-sellers', getBestSellers);
router.get('/payment-methods', getPaymentMethodReport);
router.get('/export/csv', exportCSV);

export default router;
