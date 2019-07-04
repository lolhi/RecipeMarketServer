var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var PriceInfoSchema = new Schema({
    DATE: String,
    PRDLST_NAME: {type: String, index: true},
    SPCIES_NAME: {type: String, index: true},
    SPCIES_CODE: String,
    WEIGHT_VAL: {type: Number, index: true},
    WEIGHT_UNIT: String,
    AVGPRICE: Number
});

module.exports = mongoose.model('priceinfomation', PriceInfoSchema);
