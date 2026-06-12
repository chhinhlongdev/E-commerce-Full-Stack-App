const { Schema, model } = require('mongoose');

const productSchema = new Schema({
  name:        { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  price:       { type: Number, required: true, min: 0 },
  stock:       { type: Number, default: 0, min: 0 },
  // supports both single string (legacy) and array of URLs
  images:      { type: [String], default: [] },
  category:    { type: String, default: 'general' },
}, { timestamps: true });

// Virtual: first image as `image` for backward-compat with frontend
productSchema.virtual('image').get(function () {
  return this.images?.[0] || '';
});

productSchema.set('toJSON',   { virtuals: true });
productSchema.set('toObject', { virtuals: true });

module.exports = model('Product', productSchema);
