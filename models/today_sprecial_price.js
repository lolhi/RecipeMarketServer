var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var TodaySpecialPriceSchema = new Schema({
    PRDLST_NAME: String,
    SPCIES_NAME: String,
    SPCIES_CODE: String,
    AVGPRICE: Number
});

module.exports = mongoose.model('todayspecialpriceamtion', TodaySpecialPriceSchema);