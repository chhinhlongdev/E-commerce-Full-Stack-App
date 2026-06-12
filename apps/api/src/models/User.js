const { Schema, model } = require('mongoose');
const bcrypt = require('bcryptjs');

const addressSchema = new Schema({
  label:    { type: String, default: 'Home' },
  street:   { type: String, required: true },
  city:     { type: String, required: true },
  district: { type: String, default: '' },
  province: { type: String, default: '' },
  country:  { type: String, required: true },
  zip:      { type: String, default: '' },
  isDefault: { type: Boolean, default: false },
}, { _id: true });

const userSchema = new Schema({
  name:      { type: String, required: true, trim: true },
  email:     { type: String, required: true, unique: true, lowercase: true },
  password:  { type: String, required: true, minlength: 6 },
  phone:     { type: String, default: '' },
  avatar:    { type: String, default: '' },
  role:      { type: String, enum: ['user', 'admin'], default: 'user' },
  addresses: { type: [addressSchema], default: [] },
}, { timestamps: true });

// Hash password before save
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = function (plain) {
  return bcrypt.compare(plain, this.password);
};

module.exports = model('User', userSchema);
