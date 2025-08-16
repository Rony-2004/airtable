const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  airtableId: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  name: String,
  accessToken: {
    type: String,
    required: true
  },
  refreshToken: String,
  tokenExpiresAt: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', userSchema);
