const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');
const { v4: uuidv4 } = require('uuid');

// Get or create cart for session
router.get('/session/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    let cart = await Cart.findOne({ sessionId });
    
    if (!cart) {
      cart = new Cart({
        sessionId: sessionId || uuidv4(),
        items: [],
        total: 0
      });
      await cart.save();
    }
    
    res.json(cart);
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({ error: 'Failed to get cart' });
  }
});

// Add item to cart
router.post('/add', async (req, res) => {
  try {
    const { sessionId, teaName, quantity = 1, price } = req.body;
    
    if (!sessionId || !teaName) {
      return res.status(400).json({ error: 'Session ID and tea name are required' });
    }
    
    let cart = await Cart.findOne({ sessionId });
    
    if (!cart) {
      cart = new Cart({
        sessionId,
        items: [],
        total: 0
      });
    }
    
    // Check if item already exists
    const existingItem = cart.items.find(item => item.teaName === teaName);
    
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({
        teaName,
        quantity,
        price: price != null ? Number(price) : 4.99,
      });
    }
    
    await cart.save();
    
    res.json({
      message: 'Item added to cart successfully',
      cart,
      item: { teaName, quantity }
    });
    
  } catch (error) {
    console.error('Add to cart error:', error);
    const message =
      error.name === 'ValidationError'
        ? Object.values(error.errors)
            .map((e) => e.message)
            .join(', ')
        : error.message || 'Failed to add item to cart';
    res.status(500).json({ error: message });
  }
});

// Update item quantity
router.put('/update', async (req, res) => {
  try {
    const { sessionId, teaName, quantity } = req.body;
    
    if (!sessionId || !teaName || quantity < 0) {
      return res.status(400).json({ error: 'Invalid request data' });
    }
    
    const cart = await Cart.findOne({ sessionId });
    
    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' });
    }
    
    const itemIndex = cart.items.findIndex(item => item.teaName === teaName);
    
    if (itemIndex === -1) {
      return res.status(404).json({ error: 'Item not found in cart' });
    }
    
    if (quantity === 0) {
      cart.items.splice(itemIndex, 1);
    } else {
      cart.items[itemIndex].quantity = quantity;
    }
    
    await cart.save();
    
    res.json({
      message: 'Cart updated successfully',
      cart
    });
    
  } catch (error) {
    console.error('Update cart error:', error);
    res.status(500).json({ error: 'Failed to update cart' });
  }
});

// Remove item from cart
router.delete('/remove', async (req, res) => {
  try {
    const { sessionId, teaName } = req.body;
    
    if (!sessionId || !teaName) {
      return res.status(400).json({ error: 'Session ID and tea name are required' });
    }
    
    const cart = await Cart.findOne({ sessionId });
    
    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' });
    }
    
    cart.items = cart.items.filter(item => item.teaName !== teaName);
    
    await cart.save();
    
    res.json({
      message: 'Item removed from cart successfully',
      cart
    });
    
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({ error: 'Failed to remove item from cart' });
  }
});

// Clear cart
router.delete('/clear/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    const cart = await Cart.findOne({ sessionId });
    
    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' });
    }
    
    cart.items = [];
    cart.total = 0;
    
    await cart.save();
    
    res.json({
      message: 'Cart cleared successfully',
      cart
    });
    
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({ error: 'Failed to clear cart' });
  }
});

module.exports = router;
