const mongoose = require('mongoose');

const RefreshTokenSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  userId: {
    type: String,
    trim: true,
    default: null
  },
  clientId: {
    type: String,
    trim: true,
    required: true
  },
  scope: {
    type: Array
  }
});

const RefreshToken = mongoose.model('RefreshToken', RefreshTokenSchema);

module.exports = RefreshToken;
