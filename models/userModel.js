const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const beautifyUnique = require('mongoose-beautiful-unique-validation');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please tell us your name!']
  },
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    unique: 'The email ({VALUE}) already exists. Please use a different email.',
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email']
  },
  username: {
    type: String,
    required: [true, 'Please provide your username'],
    unique: 'The username ({VALUE}) already in use. Please use a different username.',
    lowercase: true
  },
  photo: {
    type: String,
    default: 'default.jpg'
  },
  role: {
    type: String,
    enum: ['user', 'developer', 'admin'],
    default: 'user'
  },
  loginType: {
    type: String,
    enum: ['password', 'google', 'ldap'],
    default: 'password'
  },
  scope: {
    type: String
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 6,
    select: false
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
    validate: {
      // This only works on CREATE and SAVE!!!
      validator: function(el) {
        return el === this.password;
      },
      message: 'Passwords are not the same!'
    }
  },
  emailConfirm: {
    type: String,
    select: false
  },
  adminConfirm: {
    type: String,
    select: false
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: false,
    select: false
  },
  updated: {
    type: Date
  },
  created: {
    type: Date,
    default: Date.now
  }
});

// proper warning message when field is not entered as unique
userSchema.plugin(beautifyUnique);

userSchema.pre('save', async function(next) {
  // Only run this function if password was actually modified
  if (!this.isModified('password')) return next();

  // Hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);

  // Delete passwordConfirm field
  this.passwordConfirm = undefined;
  next();
});

userSchema.pre('save', function(next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
});

userSchema.pre(/^find/, function(next) {
  // this points to the current query
  this.find({ active: { $ne: false } });
  next();
});

userSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);

    return JWTTimestamp < changedTimestamp;
  }

  // False means NOT changed
  return false;
};

userSchema.methods.createPasswordResetToken = function() {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

userSchema.methods.createEmailValidationToken = function() {
  const emailToken = crypto.randomBytes(32).toString('hex');

  this.emailConfirm = crypto
    .createHash('sha256')
    .update(emailToken)
    .digest('hex');

  return emailToken;
};

userSchema.methods.createAdminValidationToken = function() {
  const adminToken = crypto.randomBytes(32).toString('hex');

  this.adminConfirm = crypto
    .createHash('sha256')
    .update(adminToken)
    .digest('hex');

  return adminToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
