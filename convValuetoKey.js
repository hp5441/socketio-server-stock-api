const instrumentData = require("./csvtojson.json");
const fs = require("fs");

const tempData = {};
Object.keys(instrumentData).map((val) => {
  tempData[instrumentData[val]] = val;
});

fs.writeFile("tokenToScrip.json", JSON.stringify(tempData), (err) => {
  if (err) console.log(err);
});
