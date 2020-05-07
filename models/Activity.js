const mongoose = require('mongoose');

const ActivitySchema = mongoose.Schema({
  token: {
    type: String,
    required: true
  },
  userAgent: {
    type: String,
    required: true
  },
  ipAddress: {
    type: String,
    required: true
  },
  active: {
    type: Boolean,
    required: true
  },
  expire_at: {
    type: Date,
    required: true
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Activity', ActivitySchema);
