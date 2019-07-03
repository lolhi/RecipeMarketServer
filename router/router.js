module.exports = function(app, PriceInfo,  RecipeBasics, RecipeMaterial, RecipeProcess, TodaySpecialPrice){
    var respond = new Array();
    var respond2 = new Array();


    app.get('/',function(req,res){
        TodaySpecialPrice.DBname.find({}, function(err, tpi){
            FindMaterial(0, 10, tpi, res);
        }).limit(100);
    });

    function FindMaterial(val, idx, tpi, res){
        var i;
        var call = 0;
        for(i = val; i < idx; i++){
            RecipeMaterial.DBname.findOne({IRDNT_NM: tpi[i].PRDLST_NAME}, function(err,rm){
                call++;
                if(rm != null){ 
                    var r;
                    var flag = 0;
                    for(r = 0; r < respond.length; r++) {
                        if(respond[r].RECIPE_ID == rm.RECIPE_ID) {
                            flag = 1;
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
                            respond2.push(rb);
                            if(respond2.length == 10)
                                res.json(respond2);
                        });
                    }
                    return;
                }
                else if(call == idx){
                    val = idx;
                    idx *= 2;
                    FindMaterial(val, idx, tpi, res);
                }
            }).limit(1);
        }
    }
}

