const express = require('express');
const app = express();
const mongoose = require('mongoose');
require('dotenv/config');

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Import routes
const accountsRoute = require('./routes/accounts');

app.use('/login', (req, res, next) => {
  console.log('middleware is running...');
  next();
})

// Routes
app.get('/', (req, res) => {
  res.send('welcome');
});
app.use('/account', accountsRoute);

// Connect to Database
mongoose.connect(process.env.NOTIZ_MONGODB, { useNewUrlParser: true, useUnifiedTopology: true }, () => { 
  console.log('connected to Notiz MongoDB') 
});

app.listen(3000);