const axios = require("axios");
const FileSystem = require("fs");
const Papa = require("papaparse");

function csvJSON(tempcsv) {
  var lines = tempcsv.split("\n");

  var result = [];

  // NOTE: If your columns contain commas in their values, you'll need
  // to deal with those before doing the next step
  // (you might convert them to &&& or something, then covert them back later)
  // jsfiddle showing the issue https://jsfiddle.net/
  var headers = lines[0].split(",");

  for (var i = 1; i < lines.length; i++) {
    var obj = {};
    var currentline = lines[i].split(",");

    for (var j = 0; j < headers.length; j++) {
      obj[headers[j]] = currentline[j];
    }

    result.push(obj);
  }

  //return result; //JavaScript object
  return JSON.stringify(result); //JSON
}

let tempObject = {};
axios
  .get("https://api.kite.trade/instruments", null, {
    headers: {
      "X-Kite-Version": "3",
      Authorization: "token api_key:57pwvF9CITyrK1euZzqV0CoiXwyfY4oD",
    },
  })
  .then((res) => {
    Papa.parse(res.data).data.forEach((val) => {
        tempObject[val[2]] = val
    });
  })
  .then(() => {
    FileSystem.writeFile("file.json", JSON.stringify(tempObject), (err) => {
      // In case of a error throw err.
      if (err) throw err;
    });
  });
