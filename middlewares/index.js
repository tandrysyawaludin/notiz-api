const jwt = require('jsonwebtoken');
const Account = require('../models/Account');
const Activity = require('../models/Activity');
const { NOT_VALID } = require('../helpers/ErrorCodes');

exports.generateToken = (payload, headers) => {
  try {
    const expireAt = new Date();
    expireAt.setHours( expireAt.getHours() + 24 );
    const token = jwt.sign(
      { name, email, phone_number } = payload
      , 'privateKey'
      , { expiresIn: '24h' }
      );
    const activity = new Activity({
      token: token,
      active: true,
      userAgent: headers['user-agent'],
      ipAddress: headers['ip-address'],
      expire_at: expireAt
    });
    
    activity.save();
    
    return token
  } catch (error) {
    return 'no token'
  }
};
  
exports.verifyToken = (req, res, next) => {
  try {    
    const { headers, originalUrl } = req;
    const { authorization = '' } = headers;
    
    if (originalUrl === '/account/generateGuestToken') {
      return next();
    }

    if (!authorization.startsWith('Bearer ')) {    
      res.json({
        status: 'error',
        code: NOT_VALID,
        message: 'Authorization is not valid'
      });
    }
    
    const token = authorization.substring(7);
    const accountData = jwt.verify(token, 'privateKey');
    Activity.findOne({ token: token, active: true });
    req.accountData = accountData;
  } catch (error) {
    res.json({
      status: 'error',
      code: NOT_VALID,
      message: 'Token is not valid'
    });
  }
  
  return next();
}

exports.checkLoggedIn = () => {
  return async (req, res, next) => {
    try {
      const { accountData = {} } = req;
      const { email = '' } = accountData;
      
      if (email !== 'guest') {
        return next();
      }
      else {
        res.json({
          status: 'error',
          code: NOT_VALID,
          message: 'Pemission denied'
        });
      }
    } catch (error) {
      res.json({
        status: 'error',
        code: NOT_VALID,
        message: 'Pemission denied'
      });
    }
  }
}
  