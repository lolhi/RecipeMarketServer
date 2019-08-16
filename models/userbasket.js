var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserBasketSchema = new Schema({
    ID: Number,
    BASKETITEM: Array
});

module.exports = mongoose.model('userbasket', UserBasketSchema);