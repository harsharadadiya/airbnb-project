import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 50 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    // select: false = the password is never returned by queries unless we ask for it
    password: { type: String, required: true, minlength: 8, select: false },
    // "guest" can book stays. "host" can also create listings.
    role: { type: String, enum: ['guest', 'host'], default: 'guest' },
    avatarUrl: { type: String, default: '' },
  },
  { timestamps: true }
);

// Hash the password before saving (only when it is new or changed)
userSchema.pre('save', async function hashPassword() {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = function comparePassword(plainPassword) {
  return bcrypt.compare(plainPassword, this.password);
};

// Never send the password hash to the browser
userSchema.set('toJSON', {
  transform(_doc, ret) {
    delete ret.password;
    delete ret.__v;
    return ret;
  },
});

export const User = mongoose.model('User', userSchema);
