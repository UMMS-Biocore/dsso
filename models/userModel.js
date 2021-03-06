const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
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
  institute: {
    type: String
  },
  lab: {
    type: String
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
    enum: ['password', 'google', 'ldap', ''],
    default: 'password'
  },
  scope: {
    type: String
  },
  password: {
    type: String,
    validate: {
      validator: function(el) {
        let update;
        if (this.getUpdate) update = this.getUpdate();
        let loginType;
        if (this.loginType) {
          // for createNewField
          loginType = this.loginType;
        } else if (update && update['$set'] && update['$set'].loginType) {
          loginType = update['$set'].loginType;
        } else if (this.r && this.r.loginType) {
          // for findByIdAndUpdate
          loginType = this.r.loginType;
        }
        if (loginType == 'password') {
          return el.length > 5;
        }
        return true;
      },
      message: 'Please provide a password longer than 5 characters'
    },
    select: false
  },
  passwordConfirm: {
    type: String,
    validate: {
      validator: function(el) {
        let update;
        if (this.getUpdate) update = this.getUpdate();
        let loginType;
        let password;
        if (this.loginType) {
          // for createNewField
          loginType = this.loginType;
          password = this.password;
        } else if (update && update['$set'] && update['$set'].loginType) {
          loginType = update['$set'].loginType;
          password = update['$set'].password;
        } else if (this.r && this.r.loginType) {
          // for findByIdAndUpdate
          loginType = this.r.loginType;
          password = this.r.password;
        }
        if (loginType == 'password') {
          return el === password;
        }
        return true;
      },
      message: 'Passwords are not the same!'
    },
    select: false
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

const hashEncrypt = (type, password) => {
  let hash = crypto.createHash(type);
  hash.update(password);
  return hash.digest('hex');
};

const createHash = password => {
  const salt = process.env.SALT ? process.env.SALT : '';
  const pepper = process.env.PEPPER ? process.env.PEPPER : '';
  const hash1 = hashEncrypt('md5', `${password}${salt}`);
  const hash2 = hashEncrypt('sha256', `${password}${pepper}`);
  return `${hash1}${hash2}`;
};

const compareHash = (candidatePassword, userPassword) => {
  if (createHash(candidatePassword) === userPassword) return true;
  return false;
};

userSchema.pre('save', async function(next) {
  // Only run this function if password was actually modified
  console.log('password isModified: ', this.isModified('password'));
  console.log('password isNew: ', this.isNew);
  if (!this.isModified('password')) return next();

  this.password = createHash(this.password);

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

userSchema.pre(/^findOneAnd/, async function(next) {
  this.r = await this.findOne();
  next();
});

userSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
  return compareHash(candidatePassword, userPassword);
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
