var express = require('express');
var authenticate_router = express.Router();

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/ionic_server');
var db = mongoose.connection;
mongoose.Promise = global.Promise;

//Models
var User = require('../models/user.model.js');
		
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
	  console.log('Connected to MongoDB');

	/* Create a new user. */
	authenticate_router.post('/register', function(req, res) {
		// console.log("new user register");
		console.log(req);
		User.create({username: req.body["username"], password: req.body["password"]}, function(err, obj){
		    if(err) return console.error(err);
        	res.status(200).json(obj);
    	}); 	
	});
	/* login */
	authenticate_router.post('/login', function(req, res) {
		// console.log(req.body["password"]);
		User.find({"username": req.body["username"], "password": req.body["password"]}, function(err, obj) {
			if (err) return console.error(err);
			res.status(200).json(obj);			
		});
	});
	/* change password */
	authenticate_router.post('/change_password', function(req, res) {
		User.findOneAndUpdate({_id: req.body["_id"]}, {password: req.body["password"]}, function(err) {
			if (err) return console.error(err);
			res.sendStatus(200);
 		});
	});
});

module.exports = authenticate_router;
