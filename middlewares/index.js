const jwt = require('jsonwebtoken');
const Account = require('../models/Account');
const Activity = require('../models/Activity');
const { NOT_VALID } = require('../helpers/constants');

exports.generateToken = (payload, headers) => {
  try {
    const dt = new Date();
    dt.setHours( dt.getHours() + 2 );
    const token = jwt.sign(payload, 'privateKey', { expiresIn: '24h' });
    const activity = new Activity({
      token: token,
      active: true,
      userAgent: headers['user-agent'],
      ipAddress: headers['ip-address'],
      expire_at: Date.now()
    });

    activity.save();

    return token
  } catch (error) {
    return 'no token'
  }
};

exports.verifyToken = (req, res, next) => {
  const { headers } = req;
  const { authorization = '' } = headers;

  if (!authorization.startsWith('Bearer ')) {
    res.json({
      status: 'error',
      code: NOT_VALID,
      message: 'Authorization is not valid'
    });
  }

  try {
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

  next();
}
