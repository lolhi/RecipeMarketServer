var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var RecipeProcessSchema = new Schema({
    RECIPE_ID:              String,     // 레시피 아이디
    COOKING_NO:             Number,     // 요리 순서
    COOKING_DC:             String,     // 요리 설명
    STRE_STEP_IMAGE_URL:    String,     // 과정 이미지 URL
    STEP_TIP:               String      // 과정팁
});

module.exports = mongoose.model('recipeprocess', RecipeProcessSchema);