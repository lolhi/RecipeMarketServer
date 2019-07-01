module.exports = function(app, PriceInfo,  RecipeBasics, RecipeMaterial, RecipeProcess, TodaySpecialPrice){
    app.get('/',function(req,res){
        TodaySpecialPrice.DBname.find({}, function(err, tpi){
            if(err)
                return res.status(500).send({error: 'database failure'});
            res.json(tpi);
        });
    });
}