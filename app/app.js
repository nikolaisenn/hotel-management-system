var createError = require('http-errors');
var express = require('express');
var expressLayouts = require('express-ejs-layouts');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var mysql = require('mysql');
var flash = require('connect-flash');
var session = require('express-session');
var passport = require('passport');
var bodyParser = require('body-parser');
var cors = require('cors');

// Passport config
require('./config/passport')(passport);

// Database
const db = require('./config/database');

// Test database
db 
  .authenticate()
  .then(() => {
    console.log('Connection with Sequelize database has been established successfully.');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });

// The application
var app = express();

app.use(cors());
// Static folder
app.use(express.static(path.join(__dirname, 'public')));
// view engine setup
app.set('views', path.join(__dirname, 'views'));
// EJS
app.use(expressLayouts);
app.set('view engine', 'ejs');
// Body parser
app.use(bodyParser.urlencoded({ extended: true }));

app.use(logger('dev'));
app.use(cookieParser());

// Express Session
app.use(session({
  secret: 'secret',
  resave: false,
  saveUninitialized: false
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Connect flash
app.use(flash());

// Global variables
global.userData = 'undefined';
global.userType = 'undefined';

app.use(function(req, res, next) {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  next();
});

// Display any failures
app.use(function(err, req, res, next) {
  console.log(err);
  next();
});

var usersController = require('./controllers/usersController');
var indexRouter = require('./api/routes/index');
var usersRouter = require('./api/routes/users');
var roomsRouter = require('./api/routes/rooms');
var staffRouter = require("./api/routes/staff")

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/rooms', roomsRouter);
app.use('/staff', staffRouter);

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

// app.listen(3000, () => console.log('App listening on port 3000!'))

module.exports = app;

