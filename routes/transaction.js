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
    res.status(200).json(BANK_STATEMENT);
        // Bank.findOne({_id: req.params.bank_id}, function(err, bank_info) {
        //     if(err) return console.error(err);
        //     if (bank_info) {
        //         var bank = Banking({
        //             fid: bank_info.bank_data.fi_id
        //             , fidOrg: bank_info.bank_data.fi_org
        //             , url: bank_info.bank_data.url
        //             , bankId: null /* If bank account use your bank routing number otherwise set to null */
        //             , user: bank_info.bank_user_name
        //             , password: bank_info.bank_user_password
        //             , accId: bank_info.user_account_number /* Account Number */
        //             , accType: 'CHECKING' /* CHECKING || SAVINGS || MONEYMRKT || CREDITCARD */
        //             , ofxVer: 102 /* default 102 */
        //             , app: 'QWIN' /* default  'QWIN' */
        //             , appVer: '1700' /* default 1700 */
        //         });
        //         // date format YYYYMMDDHHMMSS
        //         bank.getStatement({start:20130101, end:20171101}, function(err, statement){
        //             if(err) console.log(err)
        //             Banking.parse(statement, function (json_statement) {
        //                 res.status(200).json(json_statement);
        //             });
        //             return res;
        //         });  
        //         res.status(200).json(BANK_STATEMENT);
        //     }
        // });
        // var ofx4js = require("ofx4js");
        // //var financial_institution = require("FinancialInstitutionImpl");
        // var BaseFinancialInstitutionData = ofx4js.client.impl.BaseFinancialInstitutionData;
        // var OFXV1Connection = ofx4js.client.net.OFXV1Connection;

        // // input your bank's information.  See http://www.ofxhome.com/
        // var bank = new BaseFinancialInstitutionData();
        // bank.setFinancialInstitutionId("7101");
        // bank.setOrganization("Discover Financial Services");
        // bank.setOFXURL("https://www.discover.com");
        // //bank.setName("");

        // var connection = new OFXV1Connection();

        // var FinancialInstitutionImpl = ofx4js.client.impl.FinancialInstitutionImpl;
        // var service = new FinancialInstitutionImpl(bank, connection);
        // return service.readProfile()
        //   .then( data => {
        //     console.log(data);
        //     res.status(200).json(data);
        //   });

        // var ofx = require('ofx');

        // var header = {
        //     OFXHEADER: '100',
        //     DATA: 'OFXSGML',
        //     VERSION: '103',
        //     SECURITY: 'NONE',
        //     ENCODING: 'USASCII',
        //     CHARSET: '1252',
        //     COMPRESSION: 'NONE',
        //     OLDFILEUID: 'NONE',
        //     NEWFILEUID: 'unique id here'
        // };

        // var body = {
        //     SIGNONMSGSRQV1: {
        //       SONRQ: {
        //         DTCLIENT: '20161227101000',
        //         USERID: 'Blocktech17',
        //         USERPASS: 'Testing01$',
        //         LANGUAGE: 'ENG',
        //         FI: {
        //           ORG: 'BB&T',
        //           FID: 'BB&T'
        //         },
        //         APPID: 'QWIN',
        //         APPVER: '2100',
        //       },
        //     BANKMSGSRQV1: {
        //       STMTTRNRQ: {
        //         TRNUID: '1001',
        //         STMTRQ: {
        //           BANKACCTFROM: {
        //             BANKID: '053101121',
        //             ACCTID: '5207507727',
        //             ACCTTYPE: 'CHECKING'
        //           },
        //           INCTRAN: {
        //             INCLUDE: ''
        //           }
        //         }
        //       }
        //     }
        //     }
        // };
        // var ofx_string = ofx.serialize(header, body);
        // ofx.serialize(header, body).then(data => {
        //   console.log(data);
        //   res.json(data);
        // })

        // var bank = Banking({
        //     fid: "BB&T"
        //     , fidOrg: "BB&T"
        //     , url: "https://www.bbt.com/"
        //     , bankId: "053101121" /* If bank account use your bank routing number otherwise set to null */
        //     , user: "Blocktech17"
        //     , password: "Testing01$"
        //     , accId: "5207507727" /* Account Number */
        //     , accType: "CHECKING" /* CHECKING || SAVINGS || MONEYMRKT || CREDITCARD */
        // });
        // // date format YYYYMMDDHHMMSS
        // bank.getStatement({}, function(err, statement){
        //     if(err) console.log("error", err)
        //     console.log(statement);
        //     res.json(statement);
        // });  

	});
});

module.exports = transaction_router;
