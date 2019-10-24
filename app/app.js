var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mysql = require('mysql');
var flash = require('connect-flash');
var session = require('express-session');

// Database
const db = require('./config/database');

// Test database
db 
  .authenticate()
  .then(() => {
    console.log('Connection has been established successfully.');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });

var htmlController = require('./controllers/htmlController');

var indexRouter = require('./api/routes/index');
var usersRouter = require('./api/routes/users');
var accommodationRouter = require('./api/routes/accommodations');
var loginRouter = require('./api/routes/logins');
var registrationRouter = require('./api/routes/registration');
var clientRouter = require('./api/routes/client');

var app = express();

htmlController(app);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Express Session
app.use(session({
  secret: 'secret',
  resave: true,
  saveUninitialized: true
}))

// Connect flash
app.use(flash());


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/accommodations', accommodationRouter);
app.use('/logins', loginRouter);
app.use('/registration', registrationRouter);
app.use('/client', clientRouter);

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

