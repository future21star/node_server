var express = require('express');
var bank_router = express.Router();

var mongoose = require('mongoose');
mongoose.createConnection('mongodb://localhost:27017/ionic_server');
var db = mongoose.connection;
mongoose.Promise = global.Promise;

//Models
var Bank = require('../models/bank.model.js');

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
	  console.log('Connected to MongoDB');

  bank_router.get('/:id', function(req, res) {
    Bank.findById(req.params.id, function(err, docs) {
      if(err) return console.error(err);
      res.json(docs);
    });
  });
  // create bank
  bank_router.post('/new', function(req, res) {
    console.log("new bank", req.body);
    Bank.create(req.body, function(err, obj) {
      if(err) return console.error(err);
      res.status(200).json(obj);
    });
  });
  // update by id
  bank_router.put('/:id', function(req, res) {
    _id = req.params.id;
    delete req.body._id;
    Bank.findOneAndUpdate({_id: _id}, req.body, function(err) {
      if(err) return console.error(err);
      res.sendStatus(200);
    })
  });
  // remove bank
  bank_router.delete('/:id', function(req, res) {
    Bank.findOneAndRemove({_id: req.params.id}, function(err) {
      if(err) return console.error(err); 
      res.sendStatus(200);
    });
  });
  // get all banks
  bank_router.get('/all', function(req, res) {
    Bank.find({}, function(err, docs) {
      if(err) return console.error(err);
      res.json(docs);
    });
  });

  // get banks for user
  bank_router.get('/allbanksforuser/:id', function(req, res) {
    Bank.find({user_id: req.params.id}, function(err, docs) {
      if(err) return console.error(err);
      res.json(docs);
    });
  });
  
});

module.exports = bank_router;
