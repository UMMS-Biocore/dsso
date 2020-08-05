const mongoose = require('mongoose');
const utils = require('./../utils/utils');

const clientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please fill Oauthclient name!'],
    trim: true
  },
  clientId: {
    type: String,
    trim: true
  },
  clientSecret: {
    type: String,
    trim: true
  },
  created: {
    type: Date,
    default: Date.now
  },
  trusted_client: {
    type: Boolean,
    default: false
  },
  allowedDomainURL: {
    type: String,
    default: '',
    required: [true, 'Please provide allowed Domain URL'],
    trim: true
  }
});

clientSchema.pre('save', function(next) {
  if (!this.isNew) return next();
  this.clientId = utils.uid(16);
  this.clientSecret = utils.uid(32);
  next();
});

const Client = mongoose.model('Client', clientSchema);

module.exports = Client;
