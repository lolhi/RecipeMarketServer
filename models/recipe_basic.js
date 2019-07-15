var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var RecipeBasicSchema = new Schema({
    RECIPE_ID:      String,           // 레시피 아이디
    RECIPE_NM_KO:   String,           // 레시피 명
    SUMRY:          String,           // 요리 요약
    NATION_CODE:    Number,           // 유형 코드
    NATION_NM:      String,           // 유형분류(한식...)
    TY_NM:          String,           // 음식 분류(밥,찌개..)
    COOKING_TIME:   String,           // 조리시간
    CALORIE:        String,           // 칼로리
    QNT:            String,           // 분량(4인분)
    LEVEL_NM:       String,           // 난이도
    IRDNT_CODE:     String,           // 재료별 분류(곡류..)
    PC_NM:          String,           // 가격별 분류(5000원...)
    IMG_URL:        String,           // 대표이미지 URL
    COMMENT:        Array
});

module.exports = mongoose.model('recipebasic', RecipeBasicSchema);