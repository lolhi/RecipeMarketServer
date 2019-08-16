var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var request = require('request');
var mongoose = require('mongoose');
var config = require('./config');
var noticeconfig = require('./noticeString');
var fs = require('fs');

// CONNECT TO MONGODB SERVER
var db = mongoose.connection;
db.on('error', console.error);
db.once('open', function(){
    // CONNECTED TO MONGODB SERVER
    console.log("Connected to mongod server");
    PriceInfo.DBname.count({},function(err, count){
		if(err) console.log(err);
		console.log('PriceInfo : ' + count);
    });
    RecipeBasics.DBname.count({},function(err, count){
		if(err) console.log(err);
		console.log('Basics : ' + count);
    });
	RecipeMaterial.DBname.count({},function(err, count){
		if(err) console.log(err);
		console.log('Meterial : ' + count);
    });
	RecipeProcess.DBname.count({},function(err, count){
		if(err) console.log(err);
		console.log('Process : ' + count);
	});
	Notice.DBname.remove({}, function(err, output){
		if(err) {
			console.log('error: database remove failure'); 
			return;
		}
		console.log('db remove success');
		var newNotice = new Notice.DBname({
			NOTICE_TITLE: noticeconfig.NOTICE_TITLE1,
			NOTICE_IMG: noticeconfig.NOTICE_IMG1,
			NOTICE_WRITER: noticeconfig.NOTICE_WRITER,
			NOTICE_CONTENTS: noticeconfig.NOTICE_CONTENTS1
		});
		newNotice.save(function(err){
			if(err){
				console.error(err);
				return;
			}
			//console.log('db save success');
		});
	});	
});

mongoose.connect(config.dburi, { useNewUrlParser: true });

app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
   extended: true
}));

//var server = app.listen(8080, function(){
// console.log("Express server has started on port 8080");
//});
var domains = new Array();
domains.push(config.domain);

require('greenlock-express').create({
	version: 'draft-11', // 버전2
	configDir: '~/let',
	store: require('greenlock-store-fs'),
	server: 'https://acme-v02.api.letsencrypt.org/directory',  
 	//server: 'https://acme-staging-v02.api.letsencrypt.org/directory',
  	approveDomains: domains,
	email: config.email,
	agreeTos: true,
  	renewWithin: 81 * 24 * 60 * 60 * 1000,
  	renewBy: 80 * 24 * 60 * 60 * 1000,
	app: app
}).listen(80, 443);

var DBClass = require('./class/DBClass');
var PriceInfo = new DBClass(require('./models/priceinfo'));
var RecipeBasics = new DBClass(require('./models/recipe_basic'));
var RecipeMaterial = new DBClass(require('./models/recipe_material'));
var RecipeProcess = new DBClass(require('./models/recipe_process'));
var TodaySpecialPrice = new DBClass(require('./models/today_sprecial_price'));
var UserData = new DBClass(require('./models/userdata'));
var UserBasket = new DBClass(require('./models/userbasket'));
var Notice = new DBClass(require('./models/notice'));
var TodayPriceInfo = new DBClass('');

var router = require('./router/router')(app, request,config, RecipeBasics, RecipeMaterial, RecipeProcess, TodaySpecialPrice, Notice, fs, UserData, UserBasket);

var ServiceKey = config.ServiceKey;

//MakeDBForPriceInfo();
//setInterval(MakeDBForPriceInfo, 2629800000);

// Get today priceinfomation
CallGetTodayPriceInfo()
setInterval(CallGetTodayPriceInfo, 86400000);

// Test for server
//MakeTodaySpecialPrice();
//MakeDBForRecipeBasics();


function CallGetTodayPriceInfo(){
	TodaySpecialPrice.DBname.remove(function(err, output){
		if(err) {
			console.log('error: database remove failure'); 
			return;
		}
		console.log('db remove success');
		GetTodayPriceInfo();
	});
}

function GetTodayPriceInfo(){
	var tempdate = new Date();
	var date = new Date(tempdate.getFullYear(),tempdate.getMonth(), tempdate.getDate() - 1);
	var category_code = 100;
	var diff = 0;
	console.log("today: " + tempdate.getFullYear() + '.' + (tempdate.getMonth()+1) + '.' + tempdate.getDate() +', start GetTodayPriceInfo()');
	RequestaFewDaysAgo(date, category_code, new Array(), new Array(), diff)
		.then(function(jsonStr){
			//성공
			var j;
			for(j = 0; j < jsonStr.length; j++){
				if(jsonStr[j].length == 0){
					var k;
					for(k = 0; k < jsonStr.length; k++){
						if(jsonStr[k].length == 0)
							continue;
						var r;
						for(r = 0; r < jsonStr[k].length; r++)
							jsonStr[j].push(jsonStr[k][r]);
						break;
					}
				}
			}
			// for문 돌려서 length 체크, 다르면 큰 배열에서 작은배열 검색 후 없는거 삭제
		 	var k;
			for(k = 0; k < jsonStr[0].length; k++){
				if(jsonStr[0][k].item_name == jsonStr[1][k].item_name && jsonStr[0][k].kind_name == jsonStr[1][k].kind_name &&
					jsonStr[0][k].item_name == jsonStr[2][k].item_name && jsonStr[0][k].kind_name == jsonStr[2][k].kind_name &&
					jsonStr[0][k].item_name == jsonStr[3][k].item_name && jsonStr[0][k].kind_name == jsonStr[3][k].kind_name &&
					jsonStr[0][k].item_name == jsonStr[4][k].item_name && jsonStr[0][k].kind_name == jsonStr[4][k].kind_name){

						if(jsonStr[0][k].dpr1 == '-' || jsonStr[0][k].dpr6 == '-' || jsonStr[0][k].dpr7 == '-' ||
							jsonStr[1][k].dpr1 == '-' || jsonStr[1][k].dpr6 == '-' || jsonStr[1][k].dpr7 == '-' ||
							jsonStr[2][k].dpr1 == '-' || jsonStr[2][k].dpr6 == '-' || jsonStr[2][k].dpr7 == '-' ||
							jsonStr[3][k].dpr1 == '-' || jsonStr[3][k].dpr6 == '-' || jsonStr[3][k].dpr7 == '-' ||
							jsonStr[4][k].dpr1 == '-' || jsonStr[4][k].dpr6 == '-' || jsonStr[4][k].dpr7 == '-' ||
							jsonStr[0][k].item_name == '포도' || jsonStr[0][k].item_name == '오렌지' ||
							/수입/.test(jsonStr[0][k].kind_name) || /중국/.test(jsonStr[0][k].kind_name) || /인도/.test(jsonStr[0][k].kind_name)){
								jsonStr[0].splice(k, 1);
								jsonStr[1].splice(k, 1);
								jsonStr[2].splice(k, 1);
								jsonStr[3].splice(k, 1);
								jsonStr[4].splice(k, 1);
								k--;
								continue;
						}
						// 우선순위 정해줄것
						if(jsonStr[0][k].CommonYearReduction > 5 && jsonStr[0][k].YearReduction > 5 && 
							jsonStr[1][k].CommonYearReduction > 5 && jsonStr[1][k].YearReduction > 5 &&
							jsonStr[2][k].CommonYearReduction > 5 && jsonStr[2][k].YearReduction > 5 && 
							jsonStr[3][k].CommonYearReduction > 5 && jsonStr[3][k].YearReduction > 5 &&
							jsonStr[4][k].CommonYearReduction > 5 && jsonStr[4][k].YearReduction > 5){
								jsonStr[0][k].Severity = 1;
						}
						else if(jsonStr[0][k].CommonYearReduction > 5 && jsonStr[0][k].YearReduction > 5 && 
							jsonStr[1][k].CommonYearReduction > 5 && jsonStr[1][k].YearReduction > 5 &&
							jsonStr[2][k].CommonYearReduction > 5 && jsonStr[2][k].YearReduction > 5 && 
							jsonStr[3][k].CommonYearReduction > 5 && jsonStr[3][k].YearReduction > 5){
								jsonStr[0][k].Severity = 2;
						}
						else if(jsonStr[0][k].CommonYearReduction > 5 && jsonStr[0][k].YearReduction > 5 && 
							jsonStr[1][k].CommonYearReduction > 5 && jsonStr[1][k].YearReduction > 5 &&
							jsonStr[2][k].CommonYearReduction > 5 && jsonStr[2][k].YearReduction > 5){
								jsonStr[0][k].Severity = 3;
						}  
						else if(jsonStr[0][k].CommonYearReduction > 5 && jsonStr[0][k].YearReduction > 5 && 
							jsonStr[1][k].CommonYearReduction > 5 && jsonStr[1][k].YearReduction > 5){
								jsonStr[0][k].Severity = 4;
						}
						else if(jsonStr[0][k].CommonYearReduction > 5 && jsonStr[0][k].YearReduction > 5){
								jsonStr[0][k].Severity = 5;
						}
						else{
							jsonStr[0][k].Severity = 6;
						}
						if(jsonStr[0][k].item_name == '피마늘')
							continue;
							
						if(jsonStr[0][k].item_name == '깐마늘(국산)')
							jsonStr[0][k].item_name = '마늘'

						var newTodaySpecialPrice = new TodaySpecialPrice.DBname({
							PRDLST_NAME: jsonStr[0][k].item_name,
							SPCIES_NAME: jsonStr[0][k].kind_name,
							CommonYearReduction: jsonStr[0][k].CommonYearReduction,
							YearReduction: jsonStr[0][k].YearReduction,
							Severity : jsonStr[0][k].Severity
						});
				
						newTodaySpecialPrice.save(function(err){
							if(err){
								console.error(err);
								return;
							}
							//console.log('db save success');
						});
				}
				else{
					//이름이 다를때
					var k1;
					var minIdx = 0;
					for(k1 = 1; k1 < jsonStr.length; k1++){
						if(jsonStr[minIdx].length > jsonStr[k1].length){
							minIdx = k1;
						}
					}
					
					// minIdx보다 길면 k번째 아이템 삭제
					for(k1 = 0; k1 < jsonStr.length; k1++){
						if(k1 == minIdx)
							continue;
						if(jsonStr[k1].length > jsonStr[minIdx].length){
							jsonStr[k1].splice(k, 1);
						}
					}
					k--;
				}
			}
		console.log("today: " + tempdate.getFullYear() + '.' + (tempdate.getMonth()+1) + '.' + tempdate.getDate() +', end GetTodayPriceInfo()');
		}, function(){
			//실패
		});
}

var RequestaFewDaysAgo = async function(date, category_code, jsonStr, tempArr, diff){
	return new Promise(async function(resolve, reject){
		var newDate = date;
		await RequestaFewDaysAgoPromise(date, category_code, tempArr)
			.then(function(tempArr2){
				//성공
				if(category_code != 400)
					category_code += 100;
				else{
					jsonStr.push(tempArr);
					tempArr = new Array();
					category_code = 100;
					diff++;
					newDate = new Date(date.getFullYear(),date.getMonth(), date.getDate() - 1);
				}
				if(diff == 5){
					resolve(jsonStr);
					return;
				}
				RequestaFewDaysAgo(newDate,category_code, jsonStr, tempArr, diff)
					.then(function(jsonStr){
						resolve(jsonStr);
					}, function(){
						//실패
					});
				return;
			}, function(errorlog){
				//실패
				console.log("Get dailyPriceByCategoryList fail: weekend");
				jsonStr.push(new Array());
				diff++;
				newDate = new Date(date.getFullYear(),date.getMonth(), date.getDate() - 1);
				if(diff == 5){
					resolve(jsonStr);
					return;
				}
				RequestaFewDaysAgo(newDate,category_code, jsonStr, tempArr, diff)
					.then(function(jsonStr){
						resolve(jsonStr);
					}, function(){
						//실패
					});
				return;
			});
	});
}

var RequestaFewDaysAgoPromise =  function(date, category_code, tempArr){
	return new Promise(function(resolve, reject){
		var week = new Array('Sun', 'Mon', 'Tue', 'Wen', 'Thr', 'Fri', 'Sat');
		var tempweek = week[date.getDay()];
		if(tempweek == 'Sun'){
			reject(0);
			return;
		}
		else if(tempweek == 'Sat'){
			reject(0);
			return;
		}
		
		var today = String(date.getFullYear()) +'-' + (date.getMonth() + 1 < 10 ? '0' + String(date.getMonth() + 1) : String(date.getMonth() + 1)) 
			+ '-' + (date.getDate() < 10 ? '0' + String(date.getDate()) : String(date.getDate()));
		var url = 'http://www.kamis.or.kr/service/price/xml.do';
		request({
			url: url,
			method: 'GET',
			qs:{
				action: "dailyPriceByCategoryList",
				p_cert_key: ServiceKey,
				p_cert_id: "lolhi",
				p_returntype: "json",
				p_product_cls_code: "02",
				p_item_category_code: category_code,
				p_regday: today,
				p_convert_kg_yn: "N"
			}
		}, function (error, response, body) {
			if(error){
				console.log('GetTodayPriceInfo request module error : ' + error);
				return;
			}
			
			var jsondata = JSON.parse(body);
	
			jsondata = jsondata.data.item;
			var length = Object.keys(jsondata).length;
	
			for(TodayPriceInfo.setJ(0); TodayPriceInfo.getJ() < length; TodayPriceInfo.setJ(TodayPriceInfo.getJ() + 1)){
				if(jsondata[TodayPriceInfo.getJ()].dpr1 == '-')
					jsondata[TodayPriceInfo.getJ()].dpr1 = jsondata[TodayPriceInfo.getJ()].dpr2;
				jsondata[TodayPriceInfo.getJ()].CommonYearReduction = (Number(jsondata[TodayPriceInfo.getJ()].dpr7.replace(",","")) - Number(jsondata[TodayPriceInfo.getJ()].dpr1.replace(",",""))) / Number(jsondata[TodayPriceInfo.getJ()].dpr7.replace(",","")) * 100;
				jsondata[TodayPriceInfo.getJ()].YearReduction = (Number(jsondata[TodayPriceInfo.getJ()].dpr6.replace(",","")) - Number(jsondata[TodayPriceInfo.getJ()].dpr1.replace(",",""))) / Number(jsondata[TodayPriceInfo.getJ()].dpr6.replace(",","")) * 100;
	
				var i;
				for(i = 0; i < tempArr.length; i++){
					if(jsondata[TodayPriceInfo.getJ()].item_name == tempArr[i].item_name && jsondata[TodayPriceInfo.getJ()].kind_name == tempArr[i].kind_name){
						if(jsondata[TodayPriceInfo.getJ()].rank == '중품'){
							tempArr.splice(i, 1);
							tempArr.push(jsondata[TodayPriceInfo.getJ()]);
						}
						break;
					}
				}
				if((i == tempArr.length || tempArr.length == 0) && jsondata[TodayPriceInfo.getJ()].rank == '중품')
					tempArr.push(jsondata[TodayPriceInfo.getJ()]);
			}
			resolve(tempArr);
		});

	});
}

function MakeDBForRecipeBasics(){
	var url = 'http://211.237.50.150:7080/openapi/' + ServiceKey + '/json/Grid_20150827000000000226_1/'+ RecipeBasics.getStartIdx() + '/' + RecipeBasics.getEndIdx() + '/';
	
	request({
        url: url,
		method: 'GET',
    }, function (error, response, body) {
		var jsondata = JSON.parse(body);

		if(RecipeBasics.getTotalCount() == -1001 || RecipeBasics.getTotalCount() == -1002 ){
			if(RecipeBasics.getTotalCount() == -1002 ){
				RecipeBasics.DBname.remove({}, function(err, output){
					if(err) console.log('error: database remove failure'); return;
			
						/* ( SINCE DELETE OPERATION IS IDEMPOTENT, NO NEED TO SPECIFY )
						if(!output.result.n) return res.status(404).json({ error: "book not found" });
						res.json({ message: "book deleted" });
						*/
			
						console.log('db remove success');
				});
			}
			RecipeBasics.setTotalCount(jsondata.Grid_20150827000000000226_1.totalCnt);
		}

		jsondata = jsondata.Grid_20150827000000000226_1.row;
		var length = Object.keys(jsondata).length;

		console.log('RecipeBasic i_0 : ' + RecipeBasics.getStartIdx());
		console.log('RecipeBasic totalouCnt : ' + RecipeBasics.getTotalCount());
		console.log('RecipeBasic length : ' + length);
		var tempArr = new Array();
		for(RecipeBasics.setJ(0); RecipeBasics.getJ() < length; RecipeBasics.setJ(RecipeBasics.getJ() + 1)){
			var newRecipeBasic = new RecipeBasics.DBname({
				RECIPE_ID:      jsondata[RecipeBasics.getJ()].RECIPE_ID,        // 레시피 아이디
    			RECIPE_NM_KO:   jsondata[RecipeBasics.getJ()].RECIPE_NM_KO,     // 레시피 명
    			SUMRY:          jsondata[RecipeBasics.getJ()].SUMRY,            // 요리 요약
    			NATION_CODE:    jsondata[RecipeBasics.getJ()].NATION_CODE,      // 유형 코드
    			NATION_NM:      jsondata[RecipeBasics.getJ()].NATION_NM,        // 유형분류(한식...)
    			TY_NM:          jsondata[RecipeBasics.getJ()].TY_NM,           	// 음식 분류(밥,찌개..)
    			COOKING_TIME:   jsondata[RecipeBasics.getJ()].COOKING_TIME,     // 조리시간
    			CALORIE:        jsondata[RecipeBasics.getJ()].CALORIE,          // 칼로리
    			QNT:            jsondata[RecipeBasics.getJ()].QNT,           	// 분량(4인분)
    			LEVEL_NM:       jsondata[RecipeBasics.getJ()].LEVEL_NM,         // 난이도
    			IRDNT_CODE:     jsondata[RecipeBasics.getJ()].IRDNT_CODE,       // 재료별 분류(곡류..)
    			PC_NM:          jsondata[RecipeBasics.getJ()].PC_NM,            // 가격별 분류(5000원...)
				IMG_URL:        jsondata[RecipeBasics.getJ()].IMG_URL,          // 대표이미지 URL
				COMMENT:		tempArr
			});

			newRecipeBasic.save(function(err){
				if(err){
					console.error(err);
					return;
				}
				//console.log('db save success');
			});
		}
		RecipeBasics.setTotalCount(RecipeBasics.getTotalCount() - 1000);
		RecipeBasics.setStartIdx(RecipeBasics.getStartIdx() + 1000);
		RecipeBasics.setEndIdx(RecipeBasics.getEndIdx() + 1000);
		RecipeBasics.setDebugSum(length);

		if(RecipeBasics.getTotalCount() <= 0){
			console.log('make RecipeBasicsdb finish.');
			MakeDBForRecipeMaterial();
			return;
		}
		MakeDBForRecipeBasics();
	});
}

function MakeDBForRecipeMaterial(){
	var url = 'http://211.237.50.150:7080/openapi/' + ServiceKey + '/json/Grid_20150827000000000227_1/'+ RecipeMaterial.getStartIdx() + '/' + RecipeMaterial.getEndIdx() + '/';
	
	request({
        url: url,
		method: 'GET',
    }, function (error, response, body) {
		var jsondata = JSON.parse(body);

		if(RecipeMaterial.getTotalCount() == -1001 || RecipeMaterial.getTotalCount() == -1002 ){
			if(RecipeMaterial.getTotalCount() == -1002 ){
				RecipeMaterial.DBname.remove({}, function(err, output){
					if(err) console.log('error: database remove failure'); return;
			
						/* ( SINCE DELETE OPERATION IS IDEMPOTENT, NO NEED TO SPECIFY )
						if(!output.result.n) return res.status(404).json({ error: "book not found" });
						res.json({ message: "book deleted" });
						*/
			
						console.log('db remove success');
				});
			}
			RecipeMaterial.setTotalCount(jsondata.Grid_20150827000000000227_1.totalCnt);
		}

		jsondata = jsondata.Grid_20150827000000000227_1.row;
		var length = Object.keys(jsondata).length;

		console.log('RecipeMaterial i_0 : ' + RecipeMaterial.getStartIdx());
		console.log('RecipeMaterial totalouCnt : ' + RecipeMaterial.getTotalCount());
		console.log('RecipeMaterial length : ' + length);
		for(RecipeMaterial.setJ(0); RecipeMaterial.getJ() < length; RecipeMaterial.setJ(RecipeMaterial.getJ() + 1)){
			var newRecipeMaterial = new RecipeMaterial.DBname({
				RECIPE_ID:      jsondata[RecipeMaterial.getJ()].RECIPE_ID,        // 레시피 아이디
    			IRDNT_SN:       jsondata[RecipeMaterial.getJ()].IRDNT_SN,         // 재료 순번
    			IRDNT_NM:       jsondata[RecipeMaterial.getJ()].IRDNT_NM,         // 재료명
    			IRDNT_CPCTY:    jsondata[RecipeMaterial.getJ()].IRDNT_CPCTY,      // 재료용량
    			IRDNT_TY_NM:    jsondata[RecipeMaterial.getJ()].IRDNT_TY_NM,      // 재료타입명
			});

			newRecipeMaterial.save(function(err){
				if(err){
					console.error(err);
					return;
				}
				//console.log('db save success');
			});
		}
		RecipeMaterial.setTotalCount(RecipeMaterial.getTotalCount() - 1000);
		RecipeMaterial.setStartIdx(RecipeMaterial.getStartIdx() + 1000);
		RecipeMaterial.setEndIdx(RecipeMaterial.getEndIdx() + 1000);
		RecipeMaterial.setDebugSum(length);

		if(RecipeMaterial.getTotalCount() <= 0){
			console.log('make RecipeMaterialdb finish.');
			MakeDBForRecipeProcess();
			return;
		}
		MakeDBForRecipeMaterial();
	});
}


function MakeDBForRecipeProcess(){
	var url = 'http://211.237.50.150:7080/openapi/' + ServiceKey + '/json/Grid_20150827000000000228_1/'+ RecipeProcess.getStartIdx() + '/' + RecipeProcess.getEndIdx() + '/';
	
	request({
        url: url,
		method: 'GET',
    }, function (error, response, body) {
		var jsondata = JSON.parse(body);

		if(RecipeProcess.getTotalCount() == -1001 || RecipeProcess.getTotalCount() == -1002 ){
			if(RecipeProcess.getTotalCount() == -1002 ){
				RecipeProcess.DBname.remove({}, function(err, output){
					if(err) console.log('error: database remove failure'); return;
			
						/* ( SINCE DELETE OPERATION IS IDEMPOTENT, NO NEED TO SPECIFY )
						if(!output.result.n) return res.status(404).json({ error: "book not found" });
						res.json({ message: "book deleted" });
						*/
			
						console.log('db remove success');
				});
			}
			RecipeProcess.setTotalCount(jsondata.Grid_20150827000000000228_1.totalCnt);
		}

		jsondata = jsondata.Grid_20150827000000000228_1.row;
		var length = Object.keys(jsondata).length;

		console.log('RecipeProcess i_0 : ' + RecipeProcess.getStartIdx());
		console.log('RecipeProcess totalouCnt : ' + RecipeProcess.getTotalCount());
		console.log('RecipeProcess length : ' + length);
		for(RecipeProcess.setJ(0); RecipeProcess.getJ() < length; RecipeProcess.setJ(RecipeProcess.getJ() + 1)){
			var newRecipeProcess = new RecipeProcess.DBname({
				RECIPE_ID:      		jsondata[RecipeProcess.getJ()].RECIPE_ID,        		// 레시피 아이디
    			COOKING_NO:             jsondata[RecipeProcess.getJ()].COOKING_NO,     			// 요리 순서
    			COOKING_DC:             jsondata[RecipeProcess.getJ()].COOKING_DC,     			// 요리 설명
    			STRE_STEP_IMAGE_URL:    jsondata[RecipeProcess.getJ()].STRE_STEP_IMAGE_URL,     // 과정 이미지 URL
    			STEP_TIP:               jsondata[RecipeProcess.getJ()].STEP_TIP      			// 과정팁
			});

			newRecipeProcess.save(function(err){
				if(err){
					console.error(err);
					return;
				}
				//console.log('db save success');
			});
		}
		RecipeProcess.setTotalCount(RecipeProcess.getTotalCount() - 1000);
		RecipeProcess.setStartIdx(RecipeProcess.getStartIdx() + 1000);
		RecipeProcess.setEndIdx(RecipeProcess.getEndIdx() + 1000);
		RecipeProcess.setDebugSum(length);

		if(RecipeProcess.getTotalCount() <= 0){
			console.log('make RecipeProcessdb finish.');
			console.log('all db make finish');
			return;
		}
		MakeDBForRecipeProcess();
	});
}
