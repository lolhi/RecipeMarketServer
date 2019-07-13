var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserDataSchema = new Schema({
    ID: Number,
    NICKNAME: String,
    PROFILE_IMG: String,
    LIKE: Array
});

module.exports = mongoose.model('userdata', UserDataSchema);