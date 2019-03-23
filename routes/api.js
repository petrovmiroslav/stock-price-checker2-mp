/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

var expect = require('chai').expect;
var StockHandler = require('../controllers/stockHandler.js');

module.exports = function (app) {
  
  var stockPrices = new StockHandler();

  app.route('/api/stock-prices')
    .get(function (req, res){
      const stock = req.query.stock;
      const like = req.query.like;
      const IP = ()=>{
        try {return req.headers["x-forwarded-for"].split(",")[0]}
          catch(e) {
            try {return req.connection.remoteAddress}
              catch(e) {return "00.00.00.00"}
          }
      };
      const resDataOne = {
        stock: false,
        price: false,
        likes: false
      };
      const resDataPair = {
        one: {
          price: false,
          likes: false
        },
        two: {
          price: false,
          likes: false
        }
      };
      function syncOne(type, data) {
        if (type == "price") {
          resDataOne.price = data.price;
        } if(type == "likes") {
            resDataOne.likes = data.likes;
          };
        
        if (resDataOne.price && resDataOne.likes) {
          resDataOne.stock = stock.toUpperCase();
          res.json({"stockData": resDataOne});
        }
      };
      function syncPair(type, data) {
        if (type == "price") {
          if(data.stock == stock[0]){
             resDataPair.one.price = data.price;
          } else {
              resDataPair.two.price = data.price;
            }
        } if(type == "likes") {
            if(data.stock == stock[0]){
               resDataPair.one.likes = data.likes;
            } else {
                resDataPair.two.likes = data.likes;
              }
          };
        
        if (resDataPair.one.price && resDataPair.two.price && resDataPair.one.likes && resDataPair.two.likes) {
          res.json({"stockData": [{"stock": stock[0].toUpperCase(),"price": resDataPair.one.price,"rel_likes": resDataPair.one.likes-resDataPair.two.likes},{"stock": stock[1].toUpperCase(),"price": resDataPair.two.price,"rel_likes": resDataPair.two.likes-resDataPair.one.likes}]});
        }
      };
      if (typeof stock ==="object") {
        stockPrices.getData(stock[0], syncPair);
        stockPrices.loadLikes(stock[0], like, IP, syncPair); 
        stockPrices.getData(stock[1], syncPair);
        stockPrices.loadLikes(stock[1], like, IP, syncPair);
      } else {
        stockPrices.getData(stock, syncOne);
        stockPrices.loadLikes(stock, like, IP, syncOne);
      }
      
    });
    
};
