var express = require('express');
var notification_router = express.Router();

var mongoose = require('mongoose');
mongoose.createConnection('mongodb://localhost:27017/ionic_server');
var db = mongoose.connection;
mongoose.Promise = global.Promise;

//Models
var Notification = require('../models/notification.model.js');

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
	  console.log('Connected to MongoDB');

  notification_router.get('/:id', function(req, res) {
    Notification.find({user_id: req.params.id}, function(err, docs) {
      if(err) return console.error(err);
      res.json(docs);
    });
  });
  // create notification
  notification_router.post('/new', function(req, res) {
    Notification.create(req.body, function(err, obj) {
      if(err) return console.error(err);
      res.status(200).json(obj);
    });
  });
  // update by id
  notification_router.put('/:id', function(req, res) {
    _id = req.params.id;
    delete req.body._id;
    Notification.findOneAndUpdate({_id: _id}, req.body, function(err) {
      if(err) return console.error(err);
      res.sendStatus(200);
    })
  });
  // remove notification
  notification_router.delete('/:id', function(req, res) {
    Notification.findOneAndRemove({_id: req.params.id}, function(err) {
      if(err) return console.error(err);
      res.sendStatus(200);
    });
  });
  // get all notifications
  notification_router.get('/all', function(req, res) {
    Notification.find({}, function(err, docs) {
      if(err) return console.error(err);
      res.json(docs);
    });
  });
  
});

module.exports = notification_router;
