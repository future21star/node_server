var express = require('express');
var bank_router = express.Router();

var mongoose = require('mongoose');
mongoose.createConnection('mongodb://localhost:27017/ionic_server');
var db = mongoose.connection;
mongoose.Promise = global.Promise;
var plaid = require('plaid');

//Models
var Bank = require('../models/bank.model.js');

var client_id = "5864083c393619270a2ec6db"; 
var secret = "fef2d4a7533b2047230b7dfa719be3";
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
    
    plaidClient.addAuthUser(bank.bank_data.type, {username: bank.bank_user_name, password: bank.bank_user_password}, {}, function(err, mfaResponse, response){
      if (err) return console.error(err);
      if (mfaResponse != null) {
        bank.access_token = mfaResponse.access_token;
      } else {
        bank.access_token = response.access_token;          
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
    // var plaidClient = new plaid.Client(client_id, secret, plaid_env);
    // var plaidClient = new plaid.Client(test_client_id, test_secret, plaid_env);
    // var access_token;
    // // console.log("bank_type:   ", bank.bank_data.type, "   username:   ", bank.bank_user_name, "   password:   ", bank.bank_user_password);
    // plaidClient.addAuthUser(bank.bank_data.type, {username: bank.bank_user_name, password: bank.bank_user_password}, {}, function(err, mfaResponse, response){
    // // plaidClient.addAuthUser('wells', {username: 'plaid_test', password: 'plaid_good'}, {}, function(err, mfaResponse, response) {
    //   if (err != null) {
    //     // Bad request - invalid credentials, account locked, etc.
    //     return console.error(err);
    //   } else if (mfaResponse != null) {
    //     console.log("----------first auth mfa--------------", mfaResponse, "----------first auth mfa--------------");
    //     console.log("----------first auth response--------------", response, "----------first auth response--------------");        
    //     // plaidClient.stepAuthUser(mfaResponse.access_token, 'tomato', {},function(err, mfaRes, response) {
    //     plaidClient.stepAuthUser(mfaResponse.access_token, 'Providence', {},function(err, mfaRes, response2) {
    //       if (err) return console.log(err);
    //       console.log("final access token", response2.accounts);
    //       console.log("-------------access token-------------", access_token, "--------------------access token---------------------------");
    //       retrieve_transaction_history(plaidClient, access_token);
    //       Bank.create(req.body, function(err, obj) {
    //         if(err) return console.error(err);
    //         // res.status(200).json(obj);
    //       });

    //     });
    //   } else {
    //     // No MFA required - response body has accounts
    //     access_token = response.access_token;
    //     console.log("-------------access token-------------", access_token, "--------------------access token---------------------------");
    //     retrieve_transaction_history(plaidClient, access_token);
    //     // res.status(200).json(response);
    //   }            
    // });

  });

  bank_router.get('/get_transactions/:access_token', function(req, res){
    var plaidClient = new plaid.Client(client_id, secret, plaid_env);
    plaidClient.upgradeUser(req.params.access_token, "connect", {}, function(upgrade_err, upgrade_res){
      // if (upgrade_err) return console.log("upgrade error", upgrade_err);
      plaidClient.getConnectUser(req.params.access_token, {
        gte: '30 days ago',
      }, function(err1, response) {
        // console.log('You have ' + response.transactions.length +
        //             ' transactions from the last thirty days.');
        if (err1) return console.log("get connect user error", err1);
        console.log("------------------------all transaction history-------------------", response.transactions, "------------------------all transaction history-------------------");
        res.json(response.transactions);
      });
    });
  });
  //retrieve transaction
  function retrieve_transaction_history(plaidClient, access_token) {
    plaidClient.getConnectUser(access_token, {
      gte: '30 days ago',
    }, function(err, response) {
      // console.log('You have ' + response.transactions.length +
      //             ' transactions from the last thirty days.');
      console.log("------------------------all transaction history-------------------", response.transactions, "------------------------all transaction history-------------------");
    });
  }
  // dispute auth mfa
  bank_router.post('/dispute_mfa/:access_token/:answer', function(req,res){
    console.log(req.params.access_token, req.params.answer);
    var plaidClient = new plaid.Client(client_id, secret, plaid_env);
    plaidClient.stepAuthUser(req.params.access_token, req.params.answer, {},function(auth_err, mfaResponse, auth_res) {
      if (auth_err) return console.error(auth_err);
      if (mfaResponse != null) {
        res.status(201).json({mfa: mfaResponse});
      } else {
        res.status(200).json(auth_res);
      }
    });
  })
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
