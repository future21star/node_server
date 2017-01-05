var express = require('express');
var bank_router = express.Router();

var mongoose = require('mongoose');
mongoose.createConnection('mongodb://localhost:27017/ionic_server');
var db = mongoose.connection;
mongoose.Promise = global.Promise;
var plaid = require('plaid');

//Models
var Bank = require('../models/bank.model.js');

var client_id = "586da085393619270a2ecb5a"; 
var secret = "ced7af46b51adb617b16c9cedaad2b";
var test_client_id = "test_id";
var test_secret = "test_secret";
var plaid_env = plaid.environments.tartan; 
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
	  console.log('Connected to MongoDB');

  // create bank
  bank_router.post('/new', function(req, res) {
    var bank = req.body;
    var plaidClient = new plaid.Client(client_id, secret, plaid_env);
    
    plaidClient.addConnectUser(bank.bank_data.type, {username: bank.bank_user_name, password: bank.bank_user_password}, {webhook: "http://localhost:3000/push_notification"}, function(err, mfaResponse, response){
      if (err) return console.error(err);
      if (mfaResponse != null) {
        bank.access_token = mfaResponse.access_token;
        bank.transactions_count = 0;
        console.log("transactions count:", 0)    
      } else {
        bank.access_token = response.access_token;      
        console.log("transactions count:", response.transactions.length)    
        bank.transactions_count = response.transactions.length;
      }
      Bank.create(bank, function(bank_err, bank_res) {
          if(bank_err) return console.error(bank_err);
        });
      if (mfaResponse != null) {
        console.log("-------------------------------------------mfaResponse---------------------------------------------");
        res.status(201).json({mfa: mfaResponse});
      } else {
        console.log("------------------------------------non mfaResponse---------------------------------------------");
        res.status(200).json(response);
      }
    });
  });
  // dispute auth mfa
  bank_router.post('/dispute_mfa/:access_token/:answer', function(req,res){
    console.log(req.params.access_token, req.params.answer);
    var plaidClient = new plaid.Client(client_id, secret, plaid_env);
    plaidClient.stepConnectUser(req.params.access_token, req.params.answer, {},function(auth_err, mfaResponse, auth_res) {
      if (auth_err) return console.error(auth_err);
      if (mfaResponse != null) {
        res.status(201).json({mfa: mfaResponse});
      } else {
        Bank.findOneAndUpdate({access_token: auth_res.access_token}, {transactions_count: auth_res.transactions.length}, function(update_err, update_res){
          res.status(200).json(auth_res);
        })
      }
    });
  })
  bank_router.get('/get_transactions/:access_token/:user_id', function(req, res){
    if (req.params.access_token != "undefined") {
      console.log("bank transactions");      
      var plaidClient = new plaid.Client(client_id, secret, plaid_env);
      plaidClient.upgradeUser(req.params.access_token, "connect", {"webhook":"https://server-for-financial-app-warzi117.c9users.io/push_notification"}, function(upgrade_err, upgrade_res){
        // if (upgrade_err) return console.log("upgrade error", upgrade_err);
        plaidClient.getConnectUser(req.params.access_token, {
          
        }, function(err1, response) {
          // console.log('You have ' + response.transactions.length +
          //             ' transactions from the last thirty days.');
          if (err1) return console.log("get connect user error", err1);
          // console.log("------------------------all transaction history-------------------", response.transactions, "------------------------all transaction history-------------------");
          res.json(response.transactions);
        });
      });
    }
    else if (req.params.user_id != "null"){
      console.log("all transactions");
      transactions = [];
      Bank.find({user_id: req.params.user_id }, function(err, banks){
        if (err) return console.log(err);
        var number_of_banks = banks.length;
        for (var bank of banks) {
          var plaidClient = new plaid.Client(client_id, secret, plaid_env);
          plaidClient.upgradeUser(bank.access_token, "connect", {}, function(upgrade_err, upgrade_res){
            // if (upgrade_err) return console.log("upgrade error", upgrade_err);
            plaidClient.getConnectUser(bank.access_token, {
              
            }, function(err1, response) {
              if (err1) return console.log("get connect user error", err1);
              transactions = transactions.concat(response.transactions);
              number_of_banks = number_of_banks - 1;
              if (number_of_banks === 0) {
                res.json(transactions);
              } 
            });
          });
        }
      });      
    }
    else {
      console.log("none transactions");
      res.json([]);
    }
  });
  //retrieve transaction
  // function retrieve_transaction_history(plaidClient, access_token) {
  //   plaidClient.getConnectUser(access_token, {
  //     gte: '30 days ago',
  //   }, function(err, response) {
  //     // console.log('You have ' + response.transactions.length +
  //     //             ' transactions from the last thirty days.');
  //     console.log("------------------------all transaction history-------------------", response.transactions, "------------------------all transaction history-------------------");
  //   });
  // }

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
  
  // get all available banks
  bank_router.get('/get_available_banks', function(req, res) {
    var plaid = require('plaid');
    plaid.getInstitutions(plaid.environments.tartan, function(err, banks){
      if (err) console.log(err);
      console.log(banks);
      res.json(banks);
    });

    // plaid.getCategories(plaid.environments.tartan, function(err, banks){
    //   if (err) console.log(err);
    //   console.log(banks);
    //   res.json(banks);
    // });
  });

  //get bank info
  bank_router.get('/:id', function(req, res) {
    Bank.findById(req.params.id, function(err, docs) {
      if(err) return console.error(err);
      res.json(docs);
    });
  });
});

module.exports = bank_router;
