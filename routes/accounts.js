const express = require('express');
const router = express.Router();
const Account = require('../models/Account');
const { NEW, DUPLICATED, NOT_VALID, NOT_FOUND, FOUND } = require('../helpers/constants');

router.get('/findAll', async (req, res) => {  
  const accounts = await Account.find();
  res.json(accounts)
});

router.get('/findById/:accountId', async (req, res) => {
  try {
    const account = await Account.findById(req.params.accountId);
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

router.post('/create', async (req, res) => {
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
      res.json({ error })
    }
  }
});

router.post('/auth', async (req, res) => {
  const { email, password } = req.body;

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
            message: 'success authentication'
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
    res.json({ error });
  }
});

module.exports = router;
