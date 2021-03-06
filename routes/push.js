var express = require('express');
var push_router = express.Router();
var gcmApiKey = 'AIzaSyCuKc8fMsQXXbTtyDtwL0E9PM4nKNE1_aQ';
var fcmApiKey = 'AAAAuUPr2SU:APA91bE3WjrKU2y_VDUKuYP9Mnr5eul7EoJAK92jfdmTLG-5gePjbCpcMVjp_-e8PZ76cqertqA8R-EDAPDsnBR_iMyfXWQGZGRIN5nn3wv841lbqTfI1vTxYrfPMo--mJHR5v5wzVuuz2Can7bWCkXbs8zuteJ_Bg'
var gcm = require('node-gcm');
var FCM = require('fcm-push');

var mongoose = require('mongoose');
mongoose.createConnection('mongodb://localhost:27017/ionic_server');
var db = mongoose.connection;
mongoose.Promise = global.Promise;
var count = 0;
var client_id = "586da085393619270a2ecb5a"; 
var secret = "ced7af46b51adb617b16c9cedaad2b";
var test_client_id = "test_id";
var test_secret = "test_secret";
var plaid = require('plaid');
var plaid_env = plaid.environments.tartan; 
var plaidClient = new plaid.Client(client_id, secret, plaid_env);
//Models
var User = require('../models/user.model.js');
var Bank = require('../models/bank.model.js');
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
	  console.log('Connected to MongoDB');

    setInterval(function(){
      count+=1;
      Bank.find({}, function(err, res){
        if (err) return console.log(err);
        for (var bank of res) {
          plaidClient.getConnectUser(bank.access_token, {
            pending: true
          }, function(err1, response) {
            console.log("check for updates", count);
            if (err1) console.log("check for updates error", err1);
            if (!err1) {
              console.log("response transactions length", response.transactions.length, "bank transaction count", bank.transactions_count);
              if (response.transactions.length > bank.transactions_count) {
                send_push_notification(bank["user_id"], response.transactions[0]);
                Bank.findOneAndUpdate({_id: bank["_id"]}, {transactions_count: response.transactions.length}, function(err, response){
                  if (err) console.log(err);
                });
              }
            }
          });
        }
      })
    }, 2000);

    function send_push_notification(user_id, transaction) {
        console.log("send push notification");
        User.findOne({_id: user_id}, function(err, obj){
            //FCM Message Send
            var fcm = new FCM(fcmApiKey);
            var device_tokens = obj.register_id; //create array for storing device tokens
            var body;
            body = "amount:"+transaction["amount"]+"date"+transaction["date"]+"name"+transaction["name"];
            var message = {
                to: device_tokens[0], // required fill with device token or topics
                // collapse_key: 'your_collapse_key', 
                // data: {
                //     your_custom_data_key: 'your_custom_data_value'
                // },
                notification: {
                    title: 'Transaction',
                    body: body
                }
            };

            //callback style
            fcm.send(message, function(err, response){
                if (err) {
                    console.log("Something has gone wrong!");
                } else {
                    console.log("Successfully sent with response: ", response);
                }
            });
        });            
    }
    push_router.post('/', function(req, res) {
        // console.log("push_notification_hook", req.body);
        // res.status(200);
        // User.findOne({_id: req.params.id}, function(err, obj){
        //     //FCM Message Send
        //     var fcm = new FCM(fcmApiKey);
        //     var device_tokens = obj.register_id; //create array for storing device tokens

        //     var message = {
        //         to: device_tokens[0], // required fill with device token or topics
        //         // collapse_key: 'your_collapse_key', 
        //         // data: {
        //         //     your_custom_data_key: 'your_custom_data_value'
        //         // },
        //         notification: {
        //             title: 'Title of your push notification',
        //             body: 'Body of your push notification'
        //         }
        //     };

        //     //callback style
        //     fcm.send(message, function(err, response){
        //         if (err) {
        //             console.log("Something has gone wrong!");
        //         } else {
        //             console.log("Successfully sent with response: ", response);
        //         }
        //     });
        // });            
    });
  push_router.get('/:id', function(req, res) {
        // GCM Message Send
        // var device_tokens = obj.register_id; //create array for storing device tokens
        // var retry_times = 4; //the number of times to retry sending the message if it fails
        // var sender = new gcm.Sender(gcmApiKey); //create a new sender
        // var message = new gcm.Message(); //create a new message
        // message.addData('title', 'PushTitle');
        // message.addData('message', "Push message");
        // message.addData('sound', 'default');
        // message.collapseKey = 'Testing Push'; //grouping messages
        // message.delayWhileIdle = true; //delay sending while receiving device is offline
        // message.timeToLive = 3; //number of seconds to keep the message on 
        // //server if the device is offline
        
        // //Take the registration id(lengthy string) that you logged 
        // //in your ionic v2 app and update device_tokens[0] with it for testing.
        // //Later save device tokens to db and 
        // //get back all tokens and push to multiple devices
        // console.log("device tokens", device_tokens);
        // sender.send(message, device_tokens, retry_times, function (result) {
        //     console.log('push sent to: ' + device_tokens);
        //     res.status(200).send('Pushed notification ' + device_tokens);
        // }, function (err) {
        //     res.status(500).send('failed to push notification ');
        // });
  });
  
});

module.exports = push_router;