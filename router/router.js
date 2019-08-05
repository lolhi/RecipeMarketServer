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
        }).sort({CommonYearReduction: -1}).limit(6);
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
            FindMaterial(tpi, res, i, call, respond, 0)
        }).sort({Severity: 1, CommonYearReduction: -1});
    });

    async function FindMaterial(tpi, res, i, call, respond, findIdx){
        await FindMaterialPromise(tpi[i], findIdx)
            .then(function(rb){
                //성공
                var j;
                for(j = 0; j < respond.length; j++){
                    if(respond[j].RECIPE_NM_KO == rb.RECIPE_NM_KO){
                        // 중복레시피 발견시 pass
                        FindMaterial(tpi,res, i, call, respond, findIdx + 1);
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
                FindMaterial(tpi, res, i, call, respond, 0);
            }, function(errorlog){
                //실패
                console.log("code : " + errorlog.code + ", msg : " + errorlog.msg);
                if(respond.length == 6 || call == tpi.length){
                    res.json(respond);
                    return;
                }
                FindMaterial(tpi, res, i, call, respond, findIdx + 1);
            });
    }

    function MakeQuery(IrdntnameArr){
    
        var PrdlstnameArr = new Array();
        var i;

        for(i = 0; i < IrdntnameArr.length; i++){
            var Prdlstname = new Object();
            Prdlstname['IRDNT_NM'] = IrdntnameArr[i];
            PrdlstnameArr.push(Prdlstname)
        }
        return PrdlstnameArr;
    }
    var FindMaterialPromise =  function(tpiItem, findIdx){
        var query = new Object();
        
        if(tpiItem.PRDLST_NAME == '쌀'){
            query['$or'] = MakeQuery(['멥쌀', '불린 멥쌀', '불린 쌀', '쌀'])
        }
        else if(tpiItem.PRDLST_NAME == '찹쌀'){
            query['$or'] = MakeQuery(['불린 찹쌀', '찹쌀']);
        }
        else if(tpiItem.PRDLST_NAME == '배추'){
            query['$or'] = MakeQuery(['배추', '절인 배추']);
        }
        else if(tpiItem.PRDLST_NAME == '상추'){
            query['$or'] = MakeQuery(['상추', '상추잎']);
        }
        else if(tpiItem.PRDLST_NAME == '얼갈이배추'){
            query['$or'] = MakeQuery(['얼갈이배추', '풋배추']);
        }
        else if(tpiItem.PRDLST_NAME == '오이'){
            query['$or'] = MakeQuery(['오이', '백오이']);
        }
        else if(tpiItem.PRDLST_NAME == '팥'){
            query['$or'] = MakeQuery(['팥', '삶은팥']);
        }
        else if(tpiItem.PRDLST_NAME == '붉은고추'){
            query['IRDNT_NM'] = '붉은 고추';
        }
        else if(tpiItem.PRDLST_NAME == '피망'){
            query['IRDNT_NM'] = '청피망';
        }
        else if(tpiItem.PRDLST_NAME == '파프리카'){
            query['IRDNT_NM'] = '파프리카(포함)';
        }
        else if(tpiItem.PRDLST_NAME == '호박'){
            query['IRDNT_NM'] = '애호박';
        }
        else{
            query['IRDNT_NM'] = tpiItem.PRDLST_NAME;
        }

        return new Promise(function(resolve, reject){
            RecipeMaterial.DBname.find(query, function(err,rm){
                if(err){
                    var errorlog = new Object();
                    errorlog['code'] = "3";
                    errorlog['msg'] = "RecipeMaterial : " + err
                    reject(errorlog);
                    return;
                }
                if(rm.length == 0){
                    var errorlog = new Object();
                    errorlog['code'] = "1";
                    errorlog['msg'] = "RecipeMaterial not found : " + tpiItem.PRDLST_NAME;
                    reject(errorlog);
                    return;
                }
                if(findIdx > rm.length - 1){
                    var errorlog = new Object();
                    errorlog['code'] = "0";
                    errorlog['msg'] = "find all material";
                    reject(errorlog);
                    return;
                }

                // 재료 단위 통일시 정렬 후 가장 많이 쓰이는 걸로 검색할것
                var j;
                for(j = 0; j < rm.length; j++){
                    var tmp = rm[j].IRDNT_CPCTY.match(/\d/g);
                    var tmp2 = 0;
                    if(/\d\D\d\/\d/.test(rm[j].IRDNT_CPCTY))
                        tmp2 = (Number(tmp[0]) * Number(tmp[2]) + Number(tmp[1])) / Number(tmp[2])
                    else if(/\d\/\d/.test(rm[j].IRDNT_CPCTY))
                        tmp2 = Number(tmp[0]) / Number(tmp[1])
                    else if(/\d\~\d|\d\-\d/.test(rm[j].IRDNT_CPCTY))
                        tmp2 = Number(tmp[1])
                    else if(/\d/.test(rm[j].IRDNT_CPCTY)){
                        var k;
                        for(k = 0; k < tmp.length; k++){
                            tmp2 += Math.pow(10, tmp.length - 1 - k) * Number(tmp[k]);
                        }
                    }
                    if(/컵/.test(rm[j].IRDNT_CPCTY))
                        rm[j].ConverWeight = tmp2 * 190;
                    else if(/g|G/.test(rm[j].IRDNT_CPCTY))
                        rm[j].ConverWeight = tmp2;
                    else if(/되/.test(rm[j].IRDNT_CPCTY))
                        rm[j].ConverWeight = tmp2 * 1600;
                    else if(/포기/.test(rm[j].IRDNT_CPCTY))
                        rm[j].ConverWeight = tmp2 * 3000;
                    else if(/단/.test(rm[j].IRDNT_CPCTY)){
                        if(tpiItem.PRDLST_NAME == '얼갈이배추')
                            rm[j].ConverWeight = tmp2 * 1500;
                        else if(tpiItem.PRDLST_NAME == '시금치')
                            rm[j].ConverWeight = tmp2 * 300;
                        else if(tpiItem.PRDLST_NAME == '열무')
                            rm[j].ConverWeight = tmp2 * 2000;
                        else if(tpiItem.PRDLST_NAME == '대파')
                            rm[j].ConverWeight = tmp2 * 2000;
                        else if(tpiItem.PRDLST_NAME == '미나리')
                            rm[j].ConverWeight = tmp2 * 1000;
                    }
                    else if(/개|토막|팩|통|뿌리|알|소|대|톨|쪽|줄기|봉|조각/.test(rm[j].IRDNT_CPCTY)){
                        var avgWeight;
                        if(/반개/.test(rm[j].IRDNT_CPCTY))
                            tmp2 = 0.5;
                        if(/작은토막/.test(rm[j].IRDNT_CPCTY))
                            tmp2 = 0.1;

                        if(tpiItem.PRDLST_NAME == '오이')
                            avgWeight = 150;
                        else if(tpiItem.PRDLST_NAME == '붉은고추')
                            avgWeight = 30;
                        else if(tpiItem.PRDLST_NAME == '피망')
                            avgWeight = 90;
                        else if(tpiItem.PRDLST_NAME == '파프리카')
                            avgWeight = 100;
                        else if(tpiItem.PRDLST_NAME == '호박')
                            avgWeight = 270;
                        else if(tpiItem.PRDLST_NAME == '고구마')
                            avgWeight = 160;
                        else if(tpiItem.PRDLST_NAME == '감자')
                            avgWeight = 150;
                        else if(tpiItem.PRDLST_NAME == '양배추')
                            avgWeight = 2000;
                        else if(tpiItem.PRDLST_NAME == '배추')
                            avgWeight = 3000;
                        else if(tpiItem.PRDLST_NAME == '시금치')
                            avgWeight = 16;
                        else if(tpiItem.PRDLST_NAME == '토마토')
                            avgWeight = 250;
                        else if(tpiItem.PRDLST_NAME == '방울토마토')
                            avgWeight = 12;
                        else if(tpiItem.PRDLST_NAME == '딸기')
                            avgWeight = 20;
                        else if(tpiItem.PRDLST_NAME == '무')
                            avgWeight = 700;
                        else if(tpiItem.PRDLST_NAME == '당근')
                            avgWeight = 70;
                        else if(/고추/.test(tpiItem.PRDLST_NAME))
                            avgWeight = 30;
                        else if(tpiItem.PRDLST_NAME == '마늘'){
                            if(/통/.test(rm[j].IRDNT_CPCTY))
                                avgWeight = 50;
                            else
                                avgWeight = 10;
                        }
                        else if(tpiItem.PRDLST_NAME == '양파')
                            avgWeight = 200;
                        else if(tpiItem.PRDLST_NAME == '대파')
                            avgWeight = 40;
                        else if(tpiItem.PRDLST_NAME == '쪽파')
                            avgWeight = 20;
                        else if(tpiItem.PRDLST_NAME == '생강'){
                            if(/개/.test(rm[j].IRDNT_CPCTY))
                                avgWeight = 300;
                            else
                                avgWeight = 20;
                        }
                        else if(tpiItem.PRDLST_NAME == '미나리')
                            avgWeight = 2;
                        else if(tpiItem.PRDLST_NAME == '깻잎')
                            avgWeight = 20;
                        else if(tpiItem.PRDLST_NAME == '땅콩')
                            avgWeight = 1;
                        else if(tpiItem.PRDLST_NAME == '느타리버섯')
                            avgWeight = 14;
                        else if(tpiItem.PRDLST_NAME == '팽이버섯'){
                            if(/봉/.test(rm[j].IRDNT_CPCTY))
                                avgWeight = 50;
                            else
                                avgWeight = 1;
                        }
                        else if(tpiItem.PRDLST_NAME == '새송이버섯')
                            avgWeight = 100;
                        else if(tpiItem.PRDLST_NAME == '사과')
                            avgWeight = 300;
                        else if(tpiItem.PRDLST_NAME == '배')
                            avgWeight = 300;
                        else if(tpiItem.PRDLST_NAME == '바나나')
                            avgWeight = 100;
                        else if(tpiItem.PRDLST_NAME == '오렌지')
                            avgWeight = 100;
                        else if(tpiItem.PRDLST_NAME == '레몬'){
                            if(/개/.test(rm[j].IRDNT_CPCTY))
                                avgWeight = 150;
                            else 
                                avgWeight = 20;
                        }
                        else if(tpiItem.PRDLST_NAME == '파인애플')
                            avgWeight = 20;

                        rm[j].ConverWeight = tmp2 * avgWeight;
                    }
                    else if(/장|묶음/.test(rm[j].IRDNT_CPCTY))
                        rm[j].ConverWeight = tmp2 * 2;
                    else{
                        rm[j].ConverWeight = 2;
                    }
                }

                rm.sort(function (a, b) { 
					return a.ConverWeight < b.ConverWeight ? 1 : a.ConverWeight > b.ConverWeight ? -1 : 0;  
				});

                RecipeBasics.DBname.findOne({RECIPE_ID: rm[findIdx].RECIPE_ID}, function(err,rb){
                    if(err){
                        var errorlog = new Object();
                        errorlog['code'] = "3";
                        errorlog['msg'] = "RecipeBasics : " + err
                        reject(errorlog);
                        return;
                    }

                    if(rb == null){
                        var errorlog = new Object();
                        errorlog['code'] = "2";
                        errorlog['msg'] = "RecipeBasic not found ID: " + rm[findIdx].RECIPE_ID
                        reject(errorlog);
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

    async function SearchMaterial(query, res, respond, findIdx){
        await FindMaterialPromise(query, findIdx)
            .then(function(rb){
                //성공
                respond.push(rb);
                SearchMaterial(query, res, respond, findIdx + 1);
            }, function(errorlog){
                //실패
                console.log("code : " + errorlog.code + ", msg : " + errorlog.msg);
                if(errorlog.code == 0){
                    //findIdx가 rm length보다 김
                    res.json(respond);
                    return;
                }
                else if(errorlog.code == 1){
                    //Material 못찾음
                    RecipeBasics.DBname.find({$or: [ { RECIPE_NM_KO: query.PRDLST_NAME }, 
                        { NATION_NM: query.PRDLST_NAME }, 
                        { TY_NM: query.PRDLST_NAME } ] }, function(err, rb){
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
                else if(errorlog.code == 2){
                    //Basics 못찾음
                    SearchMaterial(query, res, respond, findIdx + 1);
                }
            });
    }

    app.get('/SearchRecipe/:SEARCHSTRING',function(req,res){
        var query = new Object();
        query['PRDLST_NAME'] = req.params.SEARCHSTRING;
        var respond = new Array();
        SearchMaterial(query, res, respond, 0);
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

