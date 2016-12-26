var mongoose = require('mongoose');

var bankSchema = mongoose.Schema({
    user_id: String,
    bank_data: Object,
    bank_rating: Number,
    bank_user_name: String,
    bank_user_password: String,
    user_account_number: String
});

var Bank = mongoose.model('Bank', bankSchema);

module.exports = Bank;