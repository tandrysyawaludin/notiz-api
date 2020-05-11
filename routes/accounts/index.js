const express = require('express');
const router = express.Router();
const Account = require('../../models/Account');
const Middleware = require('../../middlewares');
const {
  NEW,
  DUPLICATED,
  NOT_VALID,
  NOT_FOUND,
  FOUND,
  DELETED,
  FAILED
} = require('../../helpers/ErrorCodes');

router.get('/generateGuestToken', (req, res) => {
  const { headers } = req;

  try {
    const token = Middleware.generateToken(
      { 
        name: 'guest', 
        email: 'guest', 
        phone_number: 'guest'
      }
      , headers
    )
  
    res.json({
      status: 'success',
      code: NEW,
      message: 'success create token for guest',
      token: token
    });
  } catch (error) {
    res.json({
      status: 'error',
      code: FAILED,
      message: 'failed create token for guest'
    });
  }
});

router.get('/findAll', Middleware.checkLoggedIn(), async (req, res) => {
  try {
    const accounts = await Account.find();
    res.json({
      status: 'success',
      code: FOUND,
      message: 'accounts are found',
      data: account
    })
  } catch (error) {
    res.json({
      status: 'success',
      code: NOT_FOUND,
      message: 'account is not available',
      data: account
    })
  }
});

router.get('/findById/:accountId', Middleware.checkLoggedIn(), async (req, res) => {
  try {
    const account = await findById(req.params.accountId);
    res.json({
      status: 'success',
      code: FOUND,
      message: 'account is found',
      data: account
    })
  } catch (error) {
    switch (error.name) {
      case 'CastError':
        res.json({
          status: 'error',
          code: NOT_FOUND,
          message: 'account is not found'
        })
        break;
      default:
        res.json(error)
        break;
    }
  }
});

router.post('/create', Middleware.checkLoggedIn(), async (req, res) => {
  const { name, email, phone_number, password } = req.body;
  const account = new Account({ name, email, password, phone_number });

  try {
    const saveAccount = await account.save();
    res.json({
      status: 'success',
      code: NEW,
      message: 'success create account'
    });
  } catch (error) {
    const { name: errorName = '' } = error;

    if (errorName === 'MongoError') {
      res.json({
        status: 'error',
        code: DUPLICATED,
        message: 'account already exist'
      });
    }
    else if (errorName === 'ValidationError') {
      res.json({
        status: 'error',
        code: NOT_VALID,
        message: 'parameters are not valid'
      });
    }
    else {
      res.json(error)
    }
  }
});

router.post('/auth', Middleware.checkLoggedIn(), async (req, res) => {
  const { body, headers } = req;
  const { email, password } = body;

  try {
    await Account.findOne({ email }, (error, account) => {
      const { password: currentPassword } = account;

      if (!account) {
        res.json({
          status: 'error',
          code: NOT_FOUND,
          message: 'email is not match'
        });
      }

      account.comparePassword(password, currentPassword, (error, isMatch) => {        
        if (isMatch) {
          res.json({
            status: 'success',
            code: FOUND,
            message: 'success authentication',
            token: Middleware.generateToken(account, headers)
          });
        }
        else {
          res.json({
            status: 'error',
            code: NOT_FOUND,
            message: 'password is not match'
          });
        }
      });
    });
  } catch (error) {
    res.json(error);
  }
});

router.delete('/:accountId', Middleware.checkLoggedIn(), async (req, res) => {
  try {
    const account = await remove({ _id: req.params.accountId });
    res.json({
      status: 'error',
      code: DELETED,
      message: 'account is deleted'
    })
  } catch (error) {
    res.json(error)
  }
});

router.patch('/:accountId', Middleware.checkLoggedIn(), async (req, res) => {
  const { name, email, phone_number, password } = req.body;

  try {
    const account = await updateOne(
      { _id: req.params.accountId },
      { $set: { name, email, phone_number, password } });
    res.json({
      status: 'error',
      code: DELETED,
      message: 'account is deleted'
    })
  } catch (error) {
    res.json(error)
  }
});

module.exports = router;
