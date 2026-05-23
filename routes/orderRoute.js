const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');
const Order = require('../models/Order');
const auth = require('../middleware/authMiddleware');
const { sendResponse, getPaginatedData } = require('../utils/helpers');
const { processTestPayment } = require('../utils/testPayment');
const { sendOrderStatusEmail } = require('../utils/orderStatusEmail');

function generateOrderNumber() {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const suffix = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `TS-${date}-${suffix}`;
}

// Place order from session cart + test payment
router.post('/place', async (req, res) => {
  try {
    const { sessionId, customer, payment } = req.body;

    if (!sessionId || !customer?.name || !customer?.email || !customer?.phone || !customer?.address) {
      return sendResponse(res, 400, false, 'Session ID and complete customer details are required');
    }

    if (!payment?.cardNumber) {
      return sendResponse(res, 400, false, 'Payment card number is required');
    }

    const cart = await Cart.findOne({ sessionId });
    if (!cart || cart.items.length === 0) {
      return sendResponse(res, 400, false, 'Cart is empty');
    }

    const items = cart.items.map((item) => ({
      teaName: item.teaName,
      quantity: item.quantity,
      price: item.price,
      lineTotal: item.price * item.quantity,
    }));

    const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
    const tax = 0;
    const shipping = 0;
    const total = subtotal + tax + shipping;

    const paymentResult = processTestPayment({
      cardNumber: payment.cardNumber,
      amount: total,
    });

    const order = new Order({
      orderNumber: generateOrderNumber(),
      sessionId,
      customer,
      items,
      subtotal,
      tax,
      shipping,
      total,
      paymentMethod: 'test',
      paymentStatus: paymentResult.success ? 'paid' : 'failed',
      paymentTransactionId: paymentResult.transactionId || null,
      paymentError: paymentResult.error || null,
      orderStatus: paymentResult.success ? 'confirmed' : 'pending',
    });

    await order.save();

    if (paymentResult.success) {
      cart.items = [];
      cart.total = 0;
      await cart.save();
    }

    return sendResponse(res, paymentResult.success ? 201 : 402, paymentResult.success, paymentResult.message || paymentResult.error, {
      order,
      payment: paymentResult,
    });
  } catch (error) {
    console.error('Place order error:', error);
    return sendResponse(res, 500, false, 'Failed to place order');
  }
});

// Get order by order number (confirmation page)
router.get('/number/:orderNumber', async (req, res) => {
  try {
    const order = await Order.findOne({ orderNumber: req.params.orderNumber });
    if (!order) {
      return sendResponse(res, 404, false, 'Order not found');
    }
    return sendResponse(res, 200, true, 'Order retrieved', order);
  } catch (error) {
    console.error('Get order error:', error);
    return sendResponse(res, 500, false, 'Failed to get order');
  }
});

// Admin: list orders (paginated)
router.get('/', auth(['admin']), async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const paginatedResult = await getPaginatedData(
      Order,
      {},
      page,
      limit,
      [],
      { createdAt: -1 }
    );
    return sendResponse(res, 200, true, 'Orders retrieved', paginatedResult);
  } catch (error) {
    console.error('List orders error:', error);
    return sendResponse(res, 500, false, 'Failed to list orders');
  }
});

// Admin: update order status
router.patch('/:id/status', auth(['admin']), async (req, res) => {
  try {
    const { orderStatus } = req.body;
    const allowed = ['pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled'];

    if (!allowed.includes(orderStatus)) {
      return sendResponse(res, 400, false, 'Invalid order status');
    }

    const existing = await Order.findById(req.params.id);
    if (!existing) {
      return sendResponse(res, 404, false, 'Order not found');
    }

    const previousStatus = existing.orderStatus;
    existing.orderStatus = orderStatus;
    existing.updatedAt = Date.now();
    await existing.save();

    const emailResult = await sendOrderStatusEmail(existing, previousStatus, orderStatus);

    let message = 'Order status updated';
    if (emailResult.sent) {
      message = `Order status updated. Notification email sent to ${emailResult.to}`;
    } else if (emailResult.reason === 'send_failed') {
      message = `Order status updated, but email could not be sent: ${emailResult.error}`;
    }

    return sendResponse(res, 200, true, message, {
      order: existing,
      emailNotification: emailResult,
    });
  } catch (error) {
    console.error('Update order status error:', error);
    return sendResponse(res, 500, false, 'Failed to update order status');
  }
});

// Admin: delete order
router.delete('/:id', auth(['admin']), async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) {
      return sendResponse(res, 404, false, 'Order not found');
    }
    return sendResponse(res, 200, true, 'Order deleted successfully', {
      orderId: req.params.id,
      orderNumber: order.orderNumber,
    });
  } catch (error) {
    console.error('Delete order error:', error);
    return sendResponse(res, 500, false, 'Failed to delete order');
  }
});

module.exports = router;
