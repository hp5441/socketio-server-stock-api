require("dotenv").config();
const axios = require("axios");
var SHA256 = require("crypto-js/sha256");
const CryptoJS = require("crypto-js");
require("dotenv").config();

const api_key = process.env.API_KEY;
const request_token = process.env.REQUEST_TOKEN;
const secret = process.env.API_SECRET;

//axios.post(`https://kite.zerodha.com/connect/login?v=3&api_key=${api_key}`)

function generateAccessToken() {
  var lengthKite = api_key + request_token + secret;
  var hashSHA256 = SHA256(lengthKite).toString(CryptoJS.enc.Hex);

  const requestBody =
    "api_key=" +
    api_key +
    "&" +
    "request_token=" +
    request_token +
    "&" +
    "checksum=" +
    hashSHA256;

  const config = {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  };

  axios
    .post("https://api.kite.trade/session/token", requestBody, config)
    .then((res) => {
      var resp = res.data;
      console.log(resp);

      access_token = resp.data.access_token;
      return access_token;
    })
    .then((res) => {
      process.env.ACCESS_TOKEN = res;
    })
    .catch((err) => console.log("error ", err.request.data));
}

module.exports = generateAccessToken;
