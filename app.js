var express = require('express');
var cors = require('cors');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

//Database
var mongo = require('mongodb');
var monk = require('monk');
var db = monk('localhost:27017/ionic_server');

var index = require('./routes/index');
var users = require('./routes/users');
var authenticate = require('./routes/authenticate');
var bank = require('./routes/bank');
var notification = require('./routes/notification');
var push = require('./routes/push');
var transaction = require('./routes/transaction');
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//Make our db accessible to our router
app.use(function(req, res, next) {
	req.db = db;
	next();
});

app.use('/', index);
app.use('/users', users);
app.use('/authenticate', authenticate);
app.use('/bank', bank);
app.use('/notification', notification );
app.use('/push_notification', push);
app.use('/transaction', transaction);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
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
