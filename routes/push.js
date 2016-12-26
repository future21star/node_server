var express = require('express');
var push_router = express.Router();
var gcm = require('node-gcm');
var gcmApiKey = 'AIzaSyCuKc8fMsQXXbTtyDtwL0E9PM4nKNE1_aQ';

var mongoose = require('mongoose');
mongoose.createConnection('mongodb://localhost:27017/ionic_server');
var db = mongoose.connection;
mongoose.Promise = global.Promise;

//Models
var User = require('../models/user.model.js');

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
	  console.log('Connected to MongoDB');

  push_router.get('/:id', function(req, res) {
    User.findOne({_id: req.params.id}, function(err, obj){
        var device_tokens = obj.register_id; //create array for storing device tokens
        var retry_times = 4; //the number of times to retry sending the message if it fails
        var sender = new gcm.Sender(gcmApiKey); //create a new sender
        var message = new gcm.Message(); //create a new message
        message.addData('title', 'PushTitle');
        message.addData('message', "Push message");
        message.addData('sound', 'default');
        message.collapseKey = 'Testing Push'; //grouping messages
        message.delayWhileIdle = true; //delay sending while receiving device is offline
        message.timeToLive = 3; //number of seconds to keep the message on 
        //server if the device is offline
        
        //Take the registration id(lengthy string) that you logged 
        //in your ionic v2 app and update device_tokens[0] with it for testing.
        //Later save device tokens to db and 
        //get back all tokens and push to multiple devices
        console.log("device tokens", device_tokens);
        sender.send(message, device_tokens, retry_times, function (result) {
            console.log('push sent to: ' + device_tokens);
            res.status(200).send('Pushed notification ' + device_tokens);
        }, function (err) {
            res.status(500).send('failed to push notification ');
        });
        
    });
  });
  
});

module.exports = push_router;
