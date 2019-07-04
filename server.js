var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var request = require('request');
var mongoose = require('mongoose');
var config = require('./config');

// CONNECT TO MONGODB SERVER
var db = mongoose.connection;
db.on('error', console.error);
db.once('open', function(){
    // CONNECTED TO MONGODB SERVER
<<<<<<< Updated upstream
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
=======
	console.log("Connected to mongod server");
>>>>>>> Stashed changes
});

mongoose.connect(config.dburi);

app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());

var server = app.listen(8080, function(){
  console.log("Express server has started on port 3000");
})

var DBClass = require('./class/DBClass');
var PriceInfo = new DBClass(require('./models/priceinfo'));
var RecipeBasics = new DBClass(require('./models/recipe_basic'));
var RecipeMaterial = new DBClass(require('./models/recipe_material'));
var RecipeProcess = new DBClass(require('./models/recipe_process'));
var TodaySpecialPrice = new DBClass(require('./models/today_sprecial_price'));
var TodayPriceInfo = new DBClass('');

var router = require('./router/router')(app, RecipeBasics, RecipeMaterial, RecipeProcess, TodaySpecialPrice);

var ServiceKey = config.ServiceKey;

// MakeDBForPriceInfo
var dayday = 1;
var endYear = 2019;

//MakeDBForPriceInfo();

// Get today priceinfomation
var yesterday = '20190627';
var jsonStr = new Array();
var temp = new Array();

GetTodayPriceInfo();
setInterval(GetTodayPriceInfo, 86400000);

// Test for server
//MakeTodaySpecialPrice();
//MakeDBForRecipeBasics();

function GetTodayPriceInfo(){
	var url = 'http://211.237.50.150:7080/openapi/' + ServiceKey + '/json/Grid_20141119000000000012_1/'+ TodayPriceInfo.getStartIdx() + '/' + TodayPriceInfo.getEndIdx() + '/';

	var week = new Array('Sun', 'Mon', 'Tue', 'Wen', 'Thr', 'Fri', 'Sat');
	var tempdate = new Date();
	var date = new Date(tempdate.getFullYear(),tempdate.getMonth(), tempdate.getDate() - 3);
	var tempweek = week[date.getDay()];
	if(tempweek == 'Sun')
		date = new Date(tempdate.getFullYear(),tempdate.getMonth(), tempdate.getDate() - 4);
	var today = String(date.getFullYear()) + (date.getMonth() + 1 < 10 ? '0' + String(date.getMonth() + 1) : String(date.getMonth() + 1)) 
	+ (date.getDate() < 10 ? '0' + String(date.getDate()) : String(date.getDate()));

	request({
        url: url,
		method: 'GET',
		qs:{
			AUCNG_DE: today
		}
    }, function (error, response, body) {
		if(error){
			console.log('GetTodayPriceInfo request module error : ' + err);
			return;
		}

		if(yesterday == today)
			return;
		
		var jsondata = JSON.parse(body);

		if(TodayPriceInfo.getTotalCount() == -1002 ){
			jsonStr = new Array();
			TodayPriceInfo.setTotalCount(jsondata.Grid_20141119000000000012_1.totalCnt);  	
		}

		jsondata = jsondata.Grid_20141119000000000012_1.row;
		var length = Object.keys(jsondata).length;

		console.log('TodayPriceInfo i_0 : ' + TodayPriceInfo.getStartIdx());
		console.log('TodayPriceInfo totalouCnt : ' +TodayPriceInfo.getTotalCount());
		console.log('TodayPriceInfo length : ' + length);

		for(TodayPriceInfo.setJ(0); TodayPriceInfo.getJ() < length; TodayPriceInfo.setJ(TodayPriceInfo.getJ() + 1))
			temp.push(jsondata[TodayPriceInfo.getJ()]);

		TodayPriceInfo.setTotalCount(TodayPriceInfo.getTotalCount() - 1000);
		TodayPriceInfo.setStartIdx(TodayPriceInfo.getStartIdx() + 1000);
		TodayPriceInfo.setEndIdx(TodayPriceInfo.getEndIdx() + 1000);
		TodayPriceInfo.setDebugSum(length);

		if(TodayPriceInfo.getTotalCount() <= 0){
			console.log('-------------------TodayPriceInfo SUM : ' + TodayPriceInfo.getDebugSum());
			
			var r,c;
			
			for(r = 0; r < temp.length - 2; r++){
				var temp2 = new Array();
				var k;
				var flag1 = 0
				for(k = 0; k < jsonStr.length; k++){
					if(jsonStr[k].PRDLST_NM == temp[r].PRDLST_NM && jsonStr[k].SPCIES_NM == temp[r].SPCIES_NM){
						flag1 = 1;
						break;
					}
				}
				if(flag1 == 1)
						continue;
				temp2.push(temp[r]);
				for(c = r + 1; c < temp.length; c++){
					if(temp[r].PRDLST_NM == temp[c].PRDLST_NM && temp[r].SPCIES_NM == temp[c].SPCIES_NM){
						temp2.push(temp[c]);
					}
				}

				temp2.sort(function (a, b) { 
					return a.DELNGBUNDLE_QY < b.DELNGBUNDLE_QY ? -1 : a.DELNGBUNDLE_QY > b.DELNGBUNDLE_QY ? 1 : 0;  
				});
				var median = parseInt(temp2.length/2)
				var cnt = 0;
				var sum = 0;
				var avg = 0;

				var idx;
				for(idx = 0; idx < temp2.length; idx++){
					if(temp2[median].DELNGBUNDLE_QY == temp2[idx].DELNGBUNDLE_QY){
						sum += temp2[idx].AVRG_AMT / (temp2[idx].DELNGBUNDLE_QY * 10);
						cnt++;
					}
				}
				avg = sum / cnt;
				temp2[median].AVRG_AMT = avg;
				var obj = new Object();
				obj.PRDLST_NM = temp2[median].PRDLST_NM;
				obj.SPCIES_NM = temp2[median].SPCIES_NM;
				obj.SPCIES_CD = temp2[median].SPCIES_CD;
				obj.WEIGHT_VAL = temp2[median].DELNGBUNDLE_QY;
				obj.AVGPRICE = avg;

				jsonStr.push(obj);
			}
			TodayPriceInfo.setTotalCount(-1002);
			TodayPriceInfo.setStartIdx(1);
			TodayPriceInfo.setEndIdx(1000);
			yesterday = today;
			MakeTodaySpecialPrice();
			return;
		}	
		GetTodayPriceInfo();
	});
}

function MakeTodaySpecialPrice(){
	console.log('db save start!');
	//디비 지우기
	TodaySpecialPrice.DBname.remove({}, function(err, output){
		if(err) console.log('error: database remove failure'); return;

			/* ( SINCE DELETE OPERATION IS IDEMPOTENT, NO NEED TO SPECIFY )
			if(!output.result.n) return res.status(404).json({ error: "book not found" });
			res.json({ message: "book deleted" });
			*/

			console.log('db remove success');
	});
	var i;
	for(i = 0; i < jsonStr.length; i++){
		var searchPrdlstName = jsonStr[i].PRDLST_NM;
		var searchSpcieName = jsonStr[i].SPCIES_NM;
		var searchWeight = jsonStr[i].WEIGHT_VAL;
		PriceInfo.DBname.find({
			PRDLST_NAME: searchPrdlstName,
			SPCIES_NAME: searchSpcieName,
			WEIGHT_VAL: searchWeight
		}, function(err, pi){
			if(err){
				console.log(err); 
				return;
			}
			if(pi.length != 0){
				var median = parseInt(pi.length / 2);
				var cnt = 0;
				var sum = 0;
				var avg = 0;

				for(TodaySpecialPrice.setJ(0); TodaySpecialPrice.getJ() < pi.length; TodaySpecialPrice.setJ(TodaySpecialPrice.getJ() + 1)){
					sum += pi[TodaySpecialPrice.getJ()].AVGPRICE / (pi[TodaySpecialPrice.getJ()].WEIGHT_VAL * 10);
					cnt++;
				}
				avg = sum / cnt;
				
				var r;
				for(r = 0; r < jsonStr.length; r++){
					if(jsonStr[r].PRDLST_NM == pi[median].PRDLST_NAME && jsonStr[r].SPCIES_NM == pi[median].SPCIES_NAME){
						if(avg -  jsonStr[r].AVGPRICE > 0){
							var newTodaySpecialPrice = new TodaySpecialPrice.DBname({
								PRDLST_NAME: jsonStr[r].PRDLST_NM,
								SPCIES_NAME: jsonStr[r].SPCIES_NM,
								SPCIES_CODE: jsonStr[r].SPCIES_CD,
								AVGPRICE: jsonStr[r].AVRG_AMT
							});
					
							newTodaySpecialPrice.save(function(err){
								if(err){
									console.error(err);
									return;
								}
								//console.log('db save success');
							});
						}
						break;
					}
				}
			}
		});
	}
}

function MakeDBForPriceInfo(){
	let date = new Date(2018,0,dayday);
	var url = 'http://211.237.50.150:7080/openapi/' + ServiceKey + '/json/Grid_20141119000000000012_1/'+ PriceInfo.getStartIdx() + '/' + PriceInfo.getEndIdx() + '/';
	var startday = String(date.getFullYear()) + (date.getMonth() + 1 < 10 ? '0' + String(date.getMonth() + 1) : String(date.getMonth() + 1)) 
					+ (date.getDate() < 10 ? '0' + String(date.getDate()) : String(date.getDate()));

	if(endYear == date.getFullYear()){
		console.log('make PriceInfodb finish.');
		MakeDBForRecipeBasics();
		return;
	}

    request({
        url: url,
		method: 'GET',
		qs:{
			AUCNG_DE: startday
		}
    }, function (error, response, body) {
		var jsondata = JSON.parse(body);

		if(PriceInfo.getTotalCount() == -1001 || PriceInfo.getTotalCount() == -1002 ){
			if(PriceInfo.getTotalCount() == -1002 ){
				PriceInfo.DBname.remove({}, function(err, output){
					if(err) console.log('error: database remove failure'); return;
			
						/* ( SINCE DELETE OPERATION IS IDEMPOTENT, NO NEED TO SPECIFY )
						if(!output.result.n) return res.status(404).json({ error: "book not found" });
						res.json({ message: "book deleted" });
						*/
			
						console.log('db remove success');
				});
			}
			PriceInfo.setTotalCount(jsondata.Grid_20141119000000000012_1.totalCnt);  	
		}

		jsondata = jsondata.Grid_20141119000000000012_1.row;
		var length = Object.keys(jsondata).length;

		console.log('PriceInfo i_0 : ' + PriceInfo.getStartIdx());
		console.log('PriceInfo totalouCnt : ' +PriceInfo.getTotalCount());
		console.log('PriceInfo length : ' + length);
		for(PriceInfo.setJ(0); PriceInfo.getJ() < length; PriceInfo.setJ(PriceInfo.getJ() + 1)){
			var newPriceInfo = new PriceInfo.DBname({
				DATE: jsondata[PriceInfo.getJ()].AUCNG_DE,
				PRDLST_NAME: jsondata[PriceInfo.getJ()].PRDLST_NM,
				SPCIES_NAME: jsondata[PriceInfo.getJ()].SPCIES_NM,
				SPCIES_CODE: jsondata[PriceInfo.getJ()].SPCIES_CD,
				WEIGHT_VAL: jsondata[PriceInfo.getJ()].DELNGBUNDLE_QY,
				WEIGHT_UNIT: jsondata[PriceInfo.getJ()].STNDRD,
				AVGPRICE: jsondata[PriceInfo.getJ()].AVRG_AMT
			});

			newPriceInfo.save(function(err){
				if(err){
					console.error(err);
					return;
				}
				//console.log('db save success');
			});
		}
		PriceInfo.setTotalCount(PriceInfo.getTotalCount() - 1000);
		PriceInfo.setStartIdx(PriceInfo.getStartIdx() + 1000);
		PriceInfo.setEndIdx(PriceInfo.getEndIdx() + 1000);
		PriceInfo.setDebugSum(length);

		if(PriceInfo.getTotalCount() <= 0){
			console.log('-------------------PriceInfo SUM : ' + PriceInfo.getDebugSum());
			
			console.log('---------end Date : ' + startday + '--------');
			
			PriceInfo.setTotalCount(-1001);
			PriceInfo.setStartIdx(1);
			PriceInfo.setEndIdx(1000);
			dayday += 1;
		}	
		MakeDBForPriceInfo();
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


