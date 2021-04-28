const jwt = require("jsonwebtoken");
const { io } = require("socket.io-client");
const redis = require("redis");
const axios = require("axios");
require("dotenv").config();

const instrumentData = require("./tokenToScrip.json"); //key value data for mapping market code to stock name

const stockPricesCache = {}; // cache for updating stock data in database every 2 mins 

const client = redis.createClient({
  port: 6379,
  host: "127.0.0.1",
});

// const emitFunction = async (stock, socket, stockData) => {
//   await socket.to(stock).emit(stockData);
// };

const config = {
  headers: {
    "Content-Type": "application/json",
    "X-CSRFToken": `${process.env.CSRF_TOKEN}`,
  },
};

//post api call which bulk update the stock prices every 2 mins
const postStocksCall = async () => {
  await axios
    .put(
      "http://localhost:8000/api/stock/stockupdate/",
      stockPricesCache,
      config
    )
    .then(() => {
      console.log("time");
    })
    .catch((err) => {
      console.log(err);
    });
};

setInterval(postStocksCall, 120000);

//initial authentication
module.exports = (socket) => {
  socket.on("auth", (credentials) => {
    jwt.verify(credentials, "asdf", (err, decoded) => {
      if (err) {
        console.log(err);
        socket.disconnect();
      }
      socket.join(decoded.user);
      socket.user = decoded.user;
      if ("admin" in decoded) {
        socket.admin = admin;
      }
    });
    console.log(socket.rooms);
  });

  //user subscribing to stocks in the provided list
  socket.on("sub", (stockList) => {
    if (stockList.length > 0) {
      stockList.forEach((stock) => {
        console.log(stock);
        socket.join(stock);
      });
    }
    console.log(socket.rooms);
  });

  //user unsubscribing from stocks in the provided list
  socket.on("unsub", (stockList) => {
    if (stockList.length > 0) {
      console.log(stockList);
      stockList.forEach((stock) => {
        console.log(stock);
        socket.leave(stock);
      });
    }
    console.log(socket.rooms);
  });

  //server receiving stock data from single source and broadcasting to users in the specific stock rooms
  socket.on("stock-server", (stocks) => {
    stocks.forEach((stock) => {
      if (
        instrumentData[stock["instrument_token"].toString()] !== "NIFTY" &&
        instrumentData[stock["instrument_token"].toString()] !== "SENSEX"
      ) {
        stockPricesCache[
          instrumentData[stock["instrument_token"].toString()]
        ] = {
          ltp: stock.last_price,
          change: stock.change,
        };
      }
      socket
        .to(instrumentData[stock["instrument_token"].toString()])
        .emit("stock-client", {
          ...stock,
          ins: instrumentData[stock["instrument_token"].toString()],
        });
    });
  });
};
