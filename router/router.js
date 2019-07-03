module.exports = function(app, PriceInfo,  RecipeBasics, RecipeMaterial, RecipeProcess, TodaySpecialPrice){
    var respond;
    var respond2;
    var call = 0;

    app.get('/',function(req,res){
        TodaySpecialPrice.DBname.find({}, function(err, tpi){
            if(err){
                console.error(err);
                return;
            }
            console.log('find start');
            respond = new Array();
            respond2 = new Array();
            FindMaterial(tpi, res);
        }).limit(100);
    });

    function FindMaterial(tpi, res){
        var i;
        for(i = 0; i < tpi.length; i++){
            RecipeMaterial.DBname.findOne({IRDNT_NM: tpi[i].PRDLST_NAME}, function(err,rm){
                if(err){
                    console.error(err);
                    return;
                }
                call++;
                if(rm != null){ 
                    var r;
                    var flag = 0;
                    for(r = 0; r < respond.length; r++) {
                        if(respond[r].RECIPE_ID == rm.RECIPE_ID) {
                            flag = 1;
                            break;
                        }
                    }
                    if(respond.length == 0 || flag == 0){
                        respond.push(rm);
                    }
                }
                if(respond.length == 10){
                    var k;
                    for(k = 0; k < respond.length; k++){
                        RecipeBasics.DBname.findOne({RECIPE_ID: respond[k].RECIPE_ID},function(err,rb){
                            if(err){
                                console.error(err);
                                return;
                            }
                            respond2.push(rb);
                            if(respond2.length == 10)
                                res.json(respond2);
                        });
                    }
                    return;
                }
            }).limit(1);
        }
    }
}

