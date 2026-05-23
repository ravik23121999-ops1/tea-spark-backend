const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  teaName: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1
  },
  price: {
    type: Number,
    required: true,
    default: 4.99 // Default price for all teas
  },
  addedAt: {
    type: Date,
    default: Date.now
  }
});

const cartSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    unique: true
  },
  items: [cartItemSchema],
  total: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Calculate total before saving (Mongoose 9+ — no next callback)
cartSchema.pre('save', function () {
  this.total = this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  this.updatedAt = Date.now();
});

module.exports = mongoose.model('Cart', cartSchema);
