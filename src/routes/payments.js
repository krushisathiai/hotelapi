import { Router } from 'express';
import { getPayments, createPayment, getInvoice } from '../controllers/paymentController.js';

const router = Router();
router.get('/', getPayments);
router.post('/', createPayment);
router.get('/order/:orderId/invoice', getInvoice);

export default router;
