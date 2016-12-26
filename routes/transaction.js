var BANK_STATEMENT = {
  header: { 
    OFXHEADER: '100',
    DATA: 'OFXSGML',
    VERSION: '102',
    SECURITY: 'NONE',
    ENCODING: 'USASCII',
    CHARSET: '1252',
    COMPRESSION: 'NONE',
    OLDFILEUID: 'NONE',
    NEWFILEUID: 'boiS5QeFGTVMFtvJvqLtAqCEap3cvo69' 
  },
  body: {
    "OFX": {
      "SIGNONMSGSRSV1": {
        "SONRS": {
          "STATUS": {
            "CODE": "0",
            "SEVERITY": "INFO",
            "MESSAGE": "SUCCESS"
          },
          "DTSERVER": "20120126212302.454[-8:PST]",
          "LANGUAGE": "ENG",
          "FI": {
            "ORG": "DI",
            "FID": "321081669"
          }
        }
      },
      "BANKMSGSRSV1": {
        "STMTTRNRS": {
          "TRNUID": "BiJNgqjvbw5vg18Z5T8kZASgUKmsFnNY",
          "STATUS": {
            "CODE": "0",
            "SEVERITY": "INFO",
            "MESSAGE": "SUCCESS"
          },
          "CLTCOOKIE": "iXus7",
          "STMTRS": {
            "CURDEF": "USD",
            "BANKACCTFROM": {
              "BANKID": "321081669",
              "ACCTID": "3576960405",
              "ACCTTYPE": "CHECKING"
            },
            "BANKTRANLIST": {
              "DTSTART": "20010125120000.000",
              "DTEND": "20120126212302.638[-8:PST]",
              "STMTTRN": [{
                "TRNTYPE": "DEP",
                "DTPOSTED": "20110407070000.000",
                "DTAVAIL": "20110407070000.000",
                "TRNAMT": "1934.65",
                "FITID": "156599402",
                "NAME": "CLIENT DEPOSIT",
                "MEMO": "CLIENT DEPOSIT"
              }, {
                "TRNTYPE": "DEBIT",
                "DTPOSTED": "20110412070000.000",
                "DTAVAIL": "20110412070000.000",
                "TRNAMT": "-700.00",
                "FITID": "156950780",
                "NAME": "DOMESTIC WIRE FUNDS-DEBIT CHRIST",
                "MEMO": "DOMESTIC WIRE FUNDS-DEBIT CHRISTIAN SULLIVAN"
              }, {
                "TRNTYPE": "CHECK",
                "DTPOSTED": "20110414070000.000",
                "DTAVAIL": "20110414070000.000",
                "TRNAMT": "-38.20",
                "FITID": "157222076",
                "CHECKNUM": "10004",
                "NAME": "CHECK WITHDRAWAL",
                "MEMO": "CHECK WITHDRAWAL"
              }, {
                "TRNTYPE": "CHECK",
                "DTPOSTED": "20110414070000.000",
                "DTAVAIL": "20110414070000.000",
                "TRNAMT": "-349.79",
                "FITID": "157222077",
                "CHECKNUM": "10006",
                "NAME": "CHECK WITHDRAWAL",
                "MEMO": "CHECK WITHDRAWAL"
              }]
            },
            "LEDGERBAL": {
              "BALAMT": "1661.41",
              "DTASOF": "20120126212302.751[-8:PST]"
            },
            "AVAILBAL": {
              "BALAMT": "2761.41",
              "DTASOF": "20120126212302.751[-8:PST]"
            }
          }
        }
      }
    }
  },
  xml: '<OFX><SIGNONMSGSRSV1><SONRS>...'
}; 
var express = require('express');
var transaction_router = express.Router();
var Banking = require('banking');

var mongoose = require('mongoose');
mongoose.createConnection('mongodb://localhost:27017/ionic_server');
var db = mongoose.connection;
mongoose.Promise = global.Promise;

//Models
var Bank = require('../models/bank.model.js');
		
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {

	transaction_router.get('/:bank_id', function(req, res) {
        Bank.findOne({_id: req.params.bank_id}, function(err, bank_info) {
            if(err) return console.error(err);
            if (bank_info) {
                var bank = Banking({
                    fid: bank_info.bank_data.fi_id
                    , fidOrg: bank_info.bank_data.fi_org
                    , url: bank_info.bank_data.url
                    , bankId: null /* If bank account use your bank routing number otherwise set to null */
                    , user: bank_info.bank_user_name
                    , password: bank_info.bank_user_password
                    , accId: bank_info.user_account_number /* Account Number */
                    , accType: 'CHECKING' /* CHECKING || SAVINGS || MONEYMRKT || CREDITCARD */
                    , ofxVer: 102 /* default 102 */
                    , app: 'QWIN' /* default  'QWIN' */
                    , appVer: '1700' /* default 1700 */
                });
                // date format YYYYMMDDHHMMSS
                // bank.getStatement({start:20130101, end:20171101}, function(err, statement){
                //     if(err) console.log(err)
                //     Banking.parse(statement, function (json_statement) {
                //         res.status(200).json(json_statement);
                //     });
                //     return res;
                // });  
                res.status(200).json(BANK_STATEMENT);
            }
        });
	});
});

module.exports = transaction_router;
