var mongoose = require('mongoose');

var userSchema = mongoose.Schema({
    username: String,
    password: String,
    register_id: Array
});

var User = mongoose.model('User', userSchema);

module.exports = User;