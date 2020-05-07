const express = require('express');
const app = express();
const mongoose = require('mongoose');
require('dotenv/config');
const Middleware = require('./middlewares');

// Import routes
const accountsRoute = require('./routes/accounts');

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Middleware
app.use(Middleware.verifyToken);

// Routes
app.use('/account', accountsRoute);

// Connect to Database
mongoose.connect(process.env.NOTIZ_MONGODB, { useNewUrlParser: true, useUnifiedTopology: true }, () => { 
  console.log('connected to Notiz MongoDB') 
});

app.listen(3000);