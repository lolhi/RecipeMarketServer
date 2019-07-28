var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var TodaySpecialPriceSchema = new Schema({
    PRDLST_NAME: String,
    SPCIES_NAME: String,
    CommonYearReduction: Number,
    YearReduction: Number,
    YesterdayCommonYearReduction: Number,
    YesterdayYearReduction: Number,
    Severity: Number
});

module.exports = mongoose.model('todayspecialpriceamtion', TodaySpecialPriceSchema);