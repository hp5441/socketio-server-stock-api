const io = require("socket.io-client");
const jwt = require("jsonwebtoken");
const WebSocket = require("ws");
const axios = require("axios");
var SHA256 = require("crypto-js/sha256");
const CryptoJS = require("crypto-js");
require("dotenv").config();
import { generateAccessToken } from "./generate-access-token";
const instrumentData = require("./csvtojson.json");
const screenedData = require("./newCleanScreenerData.json");

//Script used to send stock-prices from third party service to socketio server

const socket = io("http://localhost:7000", { transports: ["websocket"] });
var KiteTicker = require("kiteconnect").KiteTicker;

const accessToken = generateAccessToken();

var ticker = new KiteTicker({
  api_key: process.env.API_KEY,
  access_token: accessToken,
});

ticker.connect();
console.log("hmm");
ticker.on("ticks", onTicks);
ticker.on("connect", subscribe);

function onTicks(ticks) {
  socket.emit("stock-server", ticks);
}

function subscribe() {
  console.log("connected");
  //var items = Object.values(instrumentData).map((val) => parseInt(val));
  const items = Object.keys(screenedData).map((scrip) => {
    return parseInt(instrumentData[scrip]);
  });
  ticker.subscribe([256265, 265].concat(items));
  ticker.setMode(ticker.modeFull, [256265, 265].concat(items));
}

// for (let i = 0; i <= 100; i++) {
//   ((i) => {
//     setTimeout((i) => {
//       socket.emit("stock-server", {
//         MBLINFRA: {
//           scrip: "MBLINFRA",
//           ltp: Math.round(Math.random() * 100, 2),
//           change: Math.round(Math.random() * 100, 2),
//           changePercent: Math.round(Math.random() * 100, 2),
//         },
//       });
//       console.log({
//         MBLINFRA: {
//           scrip: "MBLINFRA",
//           ltp: Math.round(Math.random() * 100, 2),
//           change: Math.round(Math.random() * 100, 2),
//           changePercent: Math.round(Math.random() * 100, 2),
//         },
//       });
//     }, i * 500);
//   })(i);
// }
