module.exports = function(app, RecipeBasics, RecipeMaterial, RecipeProcess, TodaySpecialPrice){
    var respond;
    var respond2;
    var call = 0;

    app.get('/.well-known/acme-challenge/XSVM2lU73AWP1fJb0l-MQNKKBWqftZXddUP-wQhihjo',function(req,res){
        res.end('XSVM2lU73AWP1fJb0l-MQNKKBWqftZXddUP-wQhihjo.ARrnk9GBHJb2QjljnJ5GLlJDW89kbLnvBsAfBAhnE5k');
    });

    app.get('/TodaySpecialPrice',function(req,res){
        TodaySpecialPrice.DBname.find({}, function(err, tpi){
            if(err){
                console.error(err);
                return;
            }
            respond = new Array();
            respond2 = new Array();
            FindMaterial(tpi, res);
        }).limit(100);
    });

    app.get('/SearchRecipe/:SEARCHSTRING',function(req,res){
        RecipeBasics.DBname.find({NATION_NM: req.params.SEARCHSTRING}, function(err,rb){
            if(err){
                console.log(err);
                return;
            }

            res.json(rb);
        })

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
                            var d;
                            var flag1 = 0;
                            for(d = 0; d < respond2.length; d++) {
                                if(respond2[d].RECIPE_ID == rb.RECIPE_ID) {
                                    flag1 = 1;
                                    break;
                                }
                            }
                            if(respond2.length == 0 || flag1 == 0){
                                respond2.push(rb);
                            }

                            if(respond2.length == 10){
                                res.json(respond2);
                                respond2.push(rb);
                            }
                        });
                    }
                    return;
                }
            }).limit(1);
        }
    }
}

