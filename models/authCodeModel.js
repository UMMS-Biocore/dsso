const mongoose = require('mongoose');

const AuthCodeSchema = new mongoose.Schema({
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
  redirectUri: {
    type: String,
    trim: true,
    required: true
  },
  scope: {
    type: String
  }
});

const AuthCode = mongoose.model('AuthCode', AuthCodeSchema);

module.exports = AuthCode;
