var mongoose = require('mongoose');

var notificationSchema = mongoose.Schema({
    user_id: String,
    greater_than: Number,
    frequency: Number
});

var notification = mongoose.model('notification', notificationSchema);

module.exports = notification;