module.exports = function(app, RecipeBasics, RecipeMaterial, RecipeProcess, TodaySpecialPrice, Notice, fs, UserData){
    var searchres;

    app.get('/PrivacyPolicy',function(req,res){
        res.sendfile('/PrivacyPolicy.html', {root: __dirname});
    });

    app.get('/Test',function(req,res){
        UserData.DBname.find({}, function(err, ud){
            res.json(ud);
        });
    });

    app.get('/Test3',function(req,res){
        RecipeBasics.DBname.find({}, function(err, ud){
            res.json(ud);
        });
    });

    app.get('/TestRemove', function(req,res){
        UserData.DBname.remove({}, function(err, output){
            res.end('remove success');
        });
    });
    
    app.get('/GetPopular',function(req,res){
        TodaySpecialPrice.DBname.find({}, function(err, ud){
            res.json(ud);
        }).sort({CommonYearReduction: -1});
    });

    app.get('/TodaySpecialPrice',function(req,res){
        var call = 0;
        var respond = new Array();
        TodaySpecialPrice.DBname.find({}, function(err, tpi){
            if(err){
                console.error(err);
                return;
            }
            var i = 0;
            FindMaterial(tpi, res, i, call, respond)
        }).sort({Severity: 1, CommonYearReduction: -1});
    });

    async function FindMaterial(tpi, res, i, call, respond){
        await FindMaterialPromise(tpi[i])
            .then(function(rb){
                //성공
                var j;
                for(j = 0; j < respond.length; j++){
                    if(respond[j].RECIPE_NM_KO == rb.RECIPE_NM_KO){
                        // 중복레시피 발견시 pass
                        i++;
                        FindMaterial(tpi,res, i, call, respond);
                        return;
                    }
                }
                respond.push(rb);
                call++;
                if(respond.length == 6 || call == tpi.length){
                    res.json(respond);
                    return;
                }
                i++;
                FindMaterial(tpi, res, i, call, respond);
            }, function(errorlog){
                //실패
                console.log(errorlog);
                if(respond.length == 6 || call == tpi.length){
                    res.json(respond);
                    return;
                }
                i++;
                FindMaterial(tpi, res, i, call, respond);
            });
    }

    var FindMaterialPromise =  function(tpiItem){
        return new Promise(function(resolve, reject){
            RecipeMaterial.DBname.findOne({IRDNT_NM: tpiItem.PRDLST_NAME}, function(err,rm){
                if(err){
                    console.error(err);
                    return;
                }
                
                if(rm == null){
                    reject("RecipeMaterial not found : " + tpiItem.PRDLST_NAME);
                    return;
                }

                // 재료 단위 통일시 정렬 후 가장 많이 쓰이는 걸로 검색할것

                RecipeBasics.DBname.findOne({RECIPE_ID: rm.RECIPE_ID}, function(err,rb){
                    if(err){
                        console.error(err);
                        return;
                    }

                    if(rb == null){
                        reject("RecipeBasic not found");
                        return;
                    }

                    resolve(rb);
                });
                
            });
        });
    }

    app.get('/GetComment/:RECIPE_ID',function(req,res){
        RecipeBasics.DBname.findOne({RECIPE_ID: req.params.RECIPE_ID}, function(err, rb){
            if(err){
                console.error(err);
                return;
            }
            res.json(rb.COMMENT);
        });
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

    app.post('/GetRecentSearch' ,function(req, res){
        if(!isFormData(req)){
		    res.status(400).end('Bad Request : expecting multipart/form-data');
		    return;
        }
        UserData.DBname.findOne({ID : req.body.ID}, function(err, ud){
            if(err) return res.status(500).json({ error: "get clipping fail" });
           
	        if(ud.RECENTSEARCH.length == 0){
                res.status(200).end("");
                return;
            }
            
            res.json(ud.RECENTSEARCH);
        });
    });


    app.post('/AddComment' ,function(req, res){
        if(!isFormData(req)){
		    res.status(400).end('Bad Request : expecting multipart/form-data');
		    return;
        }
        RecipeBasics.DBname.findOne({RECIPE_ID: req.body.RECIPE_ID}, function(err, rb){
            if(err) return res.status(500).json({ error: "add comment fail" });
           
            var i;
            var tempArr = new Array;
            for(i = 0; i < rb.COMMENT.length; i++){
                var tempObj = new Object();
                tempObj.WRITER = rb.COMMENT[i].WRITER;
                tempObj.TIME = rb.COMMENT[i].TIME;
                tempObj.COMM = rb.COMMENT[i].COMM;
                tempObj.PROFILE_IMG = rb.COMMENT[i].PROFILE_IMG;
                tempArr.push(tempObj);
            }
            var tempObj = new Object();
            tempObj.WRITER = req.body.WRITER;
            tempObj.TIME = req.body.TIME;
            tempObj.COMM = req.body.COMM;
            tempObj.PROFILE_IMG = req.body.PROFILE_IMG;
            tempArr.push(tempObj);

            RecipeBasics.DBname.findOneAndUpdate({RECIPE_ID: req.body.RECIPE_ID}, {$set:{COMMENT:tempArr}}, function(err1, reply){
                if(err1) return res.status(500).json({ error: "add comment fail" });

                res.status(200).end('add complete');
            })
        })
    });

    app.post('/AddResentSearch' ,function(req, res){
        if(!isFormData(req)){
		    res.status(400).end('Bad Request : expecting multipart/form-data');
		    return;
        }
        UserData.DBname.findOne({ID : req.body.ID}, function(err, ud){
            if(err) return res.status(500).json({ error: "add recentsearch fail" });
           
            var k;    
            var flag = 0;
            for(k = 0; k < ud.RECENTSEARCH.length; k++){
                if(ud.RECENTSEARCH[k].SEARCH_STRING == req.body.SEARCH_STRING){
                    flag = 1;
                    break;
                }
            }
            if(flag == 1){
                res.status(200).end("exist");
                return;
            }

            var i;
            var tempArr = new Array;
            for(i = 0; i < ud.RECENTSEARCH.length; i++){
                var tempObj = new Object();
                tempObj.SEARCH_STRING = ud.RECENTSEARCH[i].SEARCH_STRING;
                tempArr.push(tempObj);
            }
            var tempObj = new Object();
            tempObj.SEARCH_STRING = req.body.SEARCH_STRING;
            tempArr.push(tempObj);

            UserData.DBname.findOneAndUpdate({ID: req.body.ID}, {$set:{RECENTSEARCH:tempArr}}, function(err1, reply){
                if(err1) return res.status(500).json({ error: "add recentsearch fail" });

                res.status(200).end('add complete');
            })
        });

    });

    app.post('/GetClipping' ,function(req, res){
        if(!isFormData(req)){
		    res.status(400).end('Bad Request : expecting multipart/form-data');
		    return;
        }
        var rbfind = new Array();
        UserData.DBname.findOne({ID : req.body.ID}, function(err, ud){
            if(err) return res.status(500).json({ error: "get clipping fail" });
           
            var i;
	        if(ud.CLIPPING.length == 0){
                res.status(200).end("");
                return;
            }
            for(i = 0; i < ud.CLIPPING.length; i++){
                RecipeBasics.DBname.findOne({RECIPE_ID: ud.CLIPPING[i].RECIPE_ID}, function(err, rb){
                    if(err) return res.status(500).json({ error: "get clipping fail" });
		            console.log('rb: ' + rb);
                    rbfind.push(rb);
                    if(rbfind.length == ud.CLIPPING.length){
                        res.json(rbfind);
                    }
                });
            }
        });
    });

    app.post('/AddClipping', function(req, res){
        if(!isFormData(req)){
		    res.status(400).end('Bad Request : expecting multipart/form-data');
		    return;
        }
        UserData.DBname.findOne({ID: req.body.ID}, function(err,ud){
            if(err) return res.status(500).json({ error: "add clipping fail" });
            
            var k;    
            var flag = 0;
            for(k = 0; k < ud.CLIPPING.length; k++){
                if(ud.CLIPPING[k].RECIPE_ID == req.body.RECIPE_ID){
                    flag = 1;
                    break;
                }
            }
            if(flag == 1){
                res.status(200).end("exist");
                return;
            }
            var i;
            var tempArr = new Array;
            for(i = 0; i < ud.CLIPPING.length; i++){
                var tempObj = new Object();
                tempObj.RECIPE_ID = ud.CLIPPING[i].RECIPE_ID;
                tempArr.push(tempObj);
            }
            var tempObj = new Object();
            tempObj.RECIPE_ID = req.body.RECIPE_ID;
            tempArr.push(tempObj);

            UserData.DBname.findOneAndUpdate({ID: req.body.ID}, {$set:{CLIPPING:tempArr}}, function(err1, reply){
                if(err1) return res.status(500).json({ error: "add clipping fail" });

                res.status(200).end('add complete');
            });
        });
    })

    app.post('/UnlinkUser', function(req, res){
        if(!isFormData(req)){
		    res.status(400).end('Bad Request : expecting multipart/form-data');
		    return;
        }

        UserData.DBname.remove({ID: req.body.ID}, function(err, output){
            if(err) return res.status(500).json({ error: "database failure" });

            res.json({ message: "user deleted" });
        });
    })

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
                var newUserData = new UserData.DBname({
                    ID: req.body.ID,
                    NICKNAME: req.body.NICKNAME,
                    PROFILE_IMG: req.body.PROFILE_IMG,
		    RECENTSEARCH: req.body.RECENT_SEARCH,
                    CLIPPING: req.body.CLIPPING
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
}

