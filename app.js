const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const mongoose = require('mongoose');
var methodOverride = require('method-override');
const jwt = require('jsonwebtoken');
const fileUpload = require('express-fileupload');

const User = require('./Models/User');

const tokenKey = 'MIHCAgEAMA0GCSqGSIb3DQEBAQUABIGtMIGqAgEAAiEAhzo0TLmplZq8hlpWVQidQNpEd2IkJz9cOknwnz+sRbsCAwEAAQIgZdTm3YBSvF4x6drNeGtsPvixGrgDEI1e';

// Importing routes
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const administratorRouter = require('./routes/administrator');
const restaurantAdministratorsRouter = require('./routes/restaurantAdministrators');
const deliverersRouter = require('./routes/deliverers');
const customersRouter = require('./routes/customers');

// Connecting to MongoDB Atlas
mongoose.connect('mongodb+srv://almedina_a:djwfu826i@cluster0.bspzc.mongodb.net/restaurant_db?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false
}).then(() => {
  console.log('Mongodb connected.');
});

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(fileUpload());
app.use(methodOverride('_method'));

//Token resolver
app.use((req, res, next) => {

  if (req.originalUrl === '/login' || req.originalUrl === '/signup') {
    next();
    return;
  }

  try {
    const token = req.cookies['token'];
    if (token === null || token === undefined) {
      res.redirect(req.baseUrl + '/login');
      return;
    }

    jwt.verify(token, tokenKey, function (err, payload) {

      if (payload) {
        User.findOne({ _id: mongoose.Types.ObjectId(payload.userId)})
            .then(user => {
              if (user != null) {
                req.user = user;
                next();
                return;
              }

              res.clearCookie('token');
              res.redirect(req.baseUrl + '/login');
        });
      } else {
        res.redirect(req.baseUrl + '/login');
      }
    });
  } catch (e) {
    res.redirect(req.baseUrl + '/login');
  }
});

// Routes
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/administrator', administratorRouter);
app.use('/restaurant-administrators', restaurantAdministratorsRouter);
app.use('/deliverers', deliverersRouter);
app.use('/customers', customersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
