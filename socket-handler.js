const jwt = require("jsonwebtoken");
const { io } = require("socket.io-client");
const redis = require("redis");
const axios = require("axios");

const instrumentData = require("./tokenToScrip.json");

const stockPricesCache = {};

const client = redis.createClient({
  port: 6379,
  host: "127.0.0.1",
});

const emitFunction = async (stock, socket, stockData) => {
  await socket.to(stock).emit(stockData);
};

const config = {
  headers: {
    "Content-Type": "application/json",
    "X-CSRFToken":
      "kkgthZHIFyWLvJ3xOQcxMVy5xIGxRX6VOmV3vXZxF5Mm5BAbUojGOJCMygaoAnej",
  },
};

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

  socket.on("sub", (stockList) => {
    if (stockList.length > 0) {
      stockList.forEach((stock) => {
        console.log(stock);
        socket.join(stock);
      });
    }
    console.log(socket.rooms);
  });

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
