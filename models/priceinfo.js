var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var PriceInfoSchema = new Schema({
    DATE: String,
    SPCIES_NAME: String,
    SPCIES_CODE: String,
    WEIGHT_VAL: Number,
    WEIGHT_UNIT: String,
    AVGPRICE: Number
});

module.exports = mongoose.model('priceinfomation', PriceInfoSchema);