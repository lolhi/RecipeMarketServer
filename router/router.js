module.exports = function(app, RecipeBasics, RecipeMaterial, RecipeProcess, TodaySpecialPrice, Notice, fs, UserData){
    var respond;
    var respond2;
    var searchres;
    var call = 0;

    app.get('/PrivacyPolicy',function(req,res){
        res.sendfile('/PrivacyPolicy.html', {root: __dirname});
    });

    app.get('/Test',function(req,res){
        UserData.DBname.find({}, function(err, ud){
            res.json(ud);
        });
    });

    app.get('/Test2',function(req,res){
        TodaySpecialPrice.DBname.find({}, function(err, ud){
            res.json(ud);
        }).sort({AVGPRICE: -1});
    });

    app.get('/TestRemove', function(req,res){
        UserData.DBname.remove({}, function(err, output){
            res.end('remove success');
        });
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
        }).sort({AVGPRICE : -1});
    });

    app.get('/FullRecipe',function(req,res){
        RecipeBasics.DBname.find({}, function(err, rb){
            if(err){
                console.error(err);
                return;
            }
            res.json(rb);
        });
    });

    app.get('/GetMaterial/:RECIPEID',function(req,res){
        RecipeMaterial.DBname.find({RECIPE_ID: req.params.RECIPEID}, function(err, rm){
            if(err){
                console.error(err);
                return;
            }
            res.json(rm);
        });
    });

    app.get('/GetProcess/:RECIPEID',function(req,res){
        RecipeProcess.DBname.find({RECIPE_ID: req.params.RECIPEID}, function(err, rp){
            if(err){
                console.error(err);
                return;
            }
            res.json(rp);
        });
    });

    app.get('/SearchRecipe/:SEARCHSTRING',function(req,res){
        RecipeMaterial.DBname.find({IRDNT_NM: req.params.SEARCHSTRING}, function(err,rm){
            if(err){
                console.log(err);
                return;
            }
            searchres = new Array();
            if(rm.length != 0){
                var i;
                var lenlen = 0;
                
                for(i = 0; i < rm.length; i++){
                    RecipeBasics.DBname.count({RECIPE_ID: rm[i].RECIPE_ID},function(err, count){
                        if(err) console.log(err);
                        lenlen += count; 
                    });
                }
                for(i = 0; i < rm.length; i++){
                    RecipeBasics.DBname.find({RECIPE_ID: rm[i].RECIPE_ID}, function(err, rb){
                        if(err){
                            console.log(err);
                            return;
                        }
                        if(rb.length !=0) {
                            var j;
                            for(j = 0; j < rb.length; j++)
                                searchres.push(rb[j]);
                            if(searchres.length == lenlen){
                                res.json(searchres);
                                searchres.push(rb);
                            }
                        }
                    });
                }
                return;
            }
            else{
                RecipeBasics.DBname.find({$or: [ { RECIPE_NM_KO: req.params.SEARCHSTRING }, 
                    { NATION_NM: req.params.SEARCHSTRING }, 
                    { TY_NM: req.params.SEARCHSTRING } ] }, function(err, rb){
                    var len = rb.length;
                    if(err){
                        console.log(err);
                        return;
                    }
                    if(rb.length != 0){
                        res.json(rb);
                    }
                    else{
                        res.json([]);
                    }
                });
            }
        });
    });

    app.get('/SearchRecipe/:CATEGORY/:SEARCHSTRING',function(req,res){
        var category = req.params.CATEGORY;
        var value = req.params.SEARCHSTRING;
        var query = {};
        query[category] = value;

        RecipeBasics.DBname.find(query, function(err,rb){
            if(err){
                console.log(err);
                return;
            }
            res.json(rb);
        })
    });

    app.get('/SearchRecipe/:CATEGORY/:SEARCHSTRING/:SEARCHSTRING2',function(req,res){
        var category = req.params.CATEGORY;
        var value = req.params.SEARCHSTRING + '/' + req.params.SEARCHSTRING2;
        var query = {};
        query[category] = value;

        RecipeBasics.DBname.find(query, function(err,rb){
            if(err){
                console.log(err);
                return;
            }
            res.json(rb);
        })
    });

    app.get('/SearchRecipe/:CATEGORY/:SEARCHSTRING/:SEARCHSTRING2/:SEARCHSTRING3',function(req,res){
        var category = req.params.CATEGORY;
        var value = req.params.SEARCHSTRING + '/' + req.params.SEARCHSTRING2 + '/' + req.params.SEARCHSTRING3;
        var query = {};
        query[category] = value;

        RecipeBasics.DBname.find(query, function(err,rb){
            if(err){
                console.log(err);
                return;
            }
            res.json(rb);
        })
    });

    app.get('/GetNotice',function(req, res){
        Notice.DBname.find({},function(err,nt){
            if(err){
                console.log(err);
                return;
            }
            res.json(nt);
        })
    });

    app.get('/img/:IMGSRC', function(req,res){
        fs.readFile(__dirname + "/../img/" + req.params.IMGSRC,function(err,data){
            if(err){
                console.log(err);
                return;
            }
            res.writeHead(200, { "Content-Type": "image/jpg" });
            res.write(data);
            res.end();
        })//end readFile()
      })//end app.get()

    var isFormData = function(req){
         var type = req.headers['content-type'] || '';
         return 0 == type.indexOf('application/json');
    }
    
    app.post('/RegisterUser', function(req, res){
        if(!isFormData(req)){
		    res.status(400).end('Bad Request : expecting multipart/form-data');
		    return;
        }
        UserData.DBname.find({ID: req.body.ID}, function(err, ud){
            if(err){
                console.log(err);
                return;
            }
            if(ud.length == 0){
                console.log("ID : " + req.body.ID +"\nNICKNAME : " + req.body.NICKNAME + "\nPROFILE_IMG : " + req.body.PROFILE_IMG + "\nLIKE : " + req.body.LIKE[0].RECIPE_ID);
                var newUserData = new UserData.DBname({
                    ID: req.body.ID,
                    NICKNAME: req.body.NICKNAME,
                    PROFILE_IMG: req.body.PROFILE_IMG,
                    LIKE: req.body.LIKE
                });

                newUserData.save(function(err){
                    if(err){
                        console.error(err);
                        return;
                    }
                console.log('db save success');
                res.end('uesr data save success in db');
                });
            }
            else{
                console.log("user data already exist");
                res.end('user data already exist');
            }
        });
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

