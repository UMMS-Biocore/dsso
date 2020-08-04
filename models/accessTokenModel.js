const mongoose = require('mongoose');

//Note: The actual access token is never saved for security reasons. Instead only id's are saved.
const AccessTokenSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  userId: {
    type: String,
    trim: true,
    default: null
  },
  expirationDate: {
    type: Date,
    default: Date.now
  },
  clientId: {
    type: String,
    trim: true,
    required: true
  },
  scope: {
    type: String
  }
});

// userSchema.pre(/^find/, function(next) {
//   // this points to the current query
//   this.find({ active: { $ne: false } });
//   next();
// });

const AccessToken = mongoose.model('AccessToken', AccessTokenSchema);

module.exports = AccessToken;
