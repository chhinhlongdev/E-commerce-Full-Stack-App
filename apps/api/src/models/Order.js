const { Schema, model } = require('mongoose');

const orderSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{
    product:  { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    name:     { type: String, required: true },
    price:    { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
  }],
  total:   { type: Number, required: true },
  status:  { type: String, enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'], default: 'pending' },
  address: {
    street:  { type: String, required: true },
    city:    { type: String, required: true },
    country: { type: String, required: true },
    zip:     { type: String, required: true },
  },
  paymentMethod: { type: String, default: 'cod' },
}, { timestamps: true });

module.exports = model('Order', orderSchema);
