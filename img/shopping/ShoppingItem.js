var config = require('../../config');
module.exports = { 
    getShoppingItem: function() {
        var arrays = new Array();
        arrays.push(MakeObject('라니네 농수산물', '제주도에서 온 미니밤호박 5kg', 2500, 26000, 'hobak_main.png', 'hobak_detail.jpg'));
        arrays.push(MakeObject('라니네 농수산물', '소양강 꿀 고구마 한 박스', 2500, 29000, 'goguma_main.png', 'goguma_detail.jpg'));
        arrays.push(MakeObject('라니네 농수산물', '무농약 영월 양배추 3~4포기', 2500, 17000, 'yangbaechu_main.png', 'yangbaechu_detail.jpg'));
        return arrays;
    }
};

function MakeObject(sShopName, sProductName, iDeliverCost, iProductCost, sProductImg, sProductImgDetail){
    var obj = new Object();
    obj.SHOP_NM = sShopName;
    obj.PRODUCT_NM = sProductName;
    obj.DELIVER_COST = iDeliverCost;
    obj.PRODUCT_COST = iProductCost;
    obj.PRODUCT_IMG = 'https://' + config.domain +'/img/shopping/' + sProductImg;
    obj.PRODUCT_IMG_DETAIL = 'https://' + config.domain +'/img/shopping/' + sProductImgDetail;
    return obj;
}