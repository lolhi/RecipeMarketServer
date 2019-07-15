var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserDataSchema = new Schema({
    ID: Number,
    NICKNAME: String,
    PROFILE_IMG: String,
    RECENTSEARCH: Array,
    CLIPPING: Array
});

module.exports = mongoose.model('userdata', UserDataSchema);