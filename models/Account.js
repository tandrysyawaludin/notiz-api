const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const SALT_WORK_FACTOR = 10;

const AccountSchema = mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    index: { unique: true }
  },
  password: {
    type: String,
    required: true
  },
  phone_number: {
    type: String,
    required: true,
    index: { unique: true }
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

AccountSchema.pre('save', function(next) {
  const account = this;  

  // only hash the password if it has been modified (or is new)
  if (!account.isModified('password')) return next();

  // generate a salt
  bcrypt.genSalt(SALT_WORK_FACTOR, (err, salt) => {
    if (err) return next(err);

    // hash the password using our new salt
    bcrypt.hash(account.password, salt, (err, hash) => {
      if (err) return next(err);

      // override the cleartext password with the hashed one
      account.password = hash;
      next();
    });
  });
});

AccountSchema.methods.comparePassword = (candidatePassword, currentPassword, cb) => {  
  bcrypt.compare(candidatePassword, currentPassword, (err, isMatch) => {
    if (err) return cb(err);
    cb(null, isMatch);
  });
};

module.exports = mongoose.model('Account', AccountSchema);
