/*
*
*
*       Complete the handler logic below
*       
*       
*/
var https = require("https");
var MongoClient = require('mongodb');
const CONNECTION_STRING = process.env.DB;
const CONNECT_MONGODB = (done)=>{
  MongoClient.connect(CONNECTION_STRING, function(err, db) {
    db.s.databaseName = "Advanced-Node";

    if(err) {
          console.log('Database error: ' + err);
      } else {
          console.log('Successful database connection');
        done(db);
      }

  });
};


function StockHandler() {
  
  this.getData = function(stock, callback) {
    https.get('https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol='+stock+'&datatype=json&interval=5min&apikey='+process.env.API_KEY
        , (resPrice) => {
          let output = '';
          resPrice.on('data', (d) => {
             output += d;
          });
          resPrice.on('end', (d) => {
            var json = JSON.parse(output);
            try{
              const result = json[Object.keys(json)[1]][Object.keys(json[Object.keys(json)[1]])[0]];
              const price = result[Object.keys(result)[3]];
              if(+price){
                callback("price", {stock: stock,
                                   price: (price *100000) / 100000});
              } else {
                  callback("price", {stock: stock,
                                   price: price});
                }
            } catch(e) {
                callback("price", {stock: stock,
                                   price: "API StockPrice Error"});
              }
            
          });

        }).on('error', (e) => {
        console.error(e);
        return "Error";
      });
  };
  
  this.loadLikes = function(stock, like, IP, callback) {
        CONNECT_MONGODB((db)=>{
            db.collection("Nasdaq-Stock").findOne({ticker: stock.toUpperCase()}, (err, data)=>{
              if(err) {
                return console.log(err);
              }
              if(like === "true"){
                if(data.likes.indexOf(IP)<0){
                   data.likes.push(IP);
                    db.collection("Nasdaq-Stock").save( data );
                }
              }
              callback("likes", {stock: stock,
                                 likes: data.likes.length});
            });
        });
  };
  
}

module.exports = StockHandler;
