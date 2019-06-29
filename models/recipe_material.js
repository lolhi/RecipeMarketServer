var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var RecipeMatrialSchema = new Schema({
    RECIPE_ID:      String,         // 레시피 아이디
    IRDNT_SN:       Number,         // 재료 순번
    IRDNT_NM:       String,         // 재료명
    IRDNT_CPCTY:    String,         // 재료용량
    IRDNT_TY_NM:    String          // 재료타입명
});

module.exports = mongoose.model('recipematrial', RecipeMatrialSchema);