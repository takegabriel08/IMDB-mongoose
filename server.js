const express = require("express");
const requestify = require("requestify");
const mongoose = require("mongoose")
require('dotenv/config')
const users = require('./models/User')

// Request to imdb api
const url = `https://caching.graphql.imdb.com/?operationName=comingSoonMovieQuery&variables=%7B%22movieReleasingOnOrAfter%22%3A%222022-10-26%22%2C%22movieViewerLocation%22%3A%7B%22latLong%22%3A%7B%22lat%22%3A%2245.63%22%2C%22long%22%3A%2225.58%22%7D%2C%22radiusInMeters%22%3A80467%7D%2C%22regionOverride%22%3A%22GB%22%7D&extensions=%7B%22persistedQuery%22%3A%7B%22sha256Hash%22%3A%2285a63f89df9b1368af9cbbd5a03ececaf2b34a175dd653119e1cd09c9cfda637%22%2C%22version%22%3A1%7D%7D`;
const options = {
  headers: {
    "content-type": "application/json",
    "x-amzn-sessionid": "147-0895637-7720454",
  },
};
requestify.get(url, options).then(function (response) {
  let data = response.getBody();
  // console.log(data);
});

const app = express();

app.use(express.static("public"));
app.use(express.json({ limit: "1mb" }));

mongoose.connect(process.env.MONGO_URL, () => {
  console.log('connected to DB!')
  const portNumber = 3000;
  app.listen(process.env.PORT || portNumber, () =>
    console.log(`Listening at ${portNumber}`)
  );
})

const db = mongoose.connection;

app.get("/imdb", (request, response) => {
  console.log("GET /IMDB from client side");

  requestify.get(url, options).then(function (res) {
    response.json(res.getBody());

    // const data = request.body;
    // const timestamp = Date.now();
    // data.timestamp = timestamp;
    // database.insert(data);
  });
});

app.post("/register", (req, res) => {
  console.log("POST /register from client side");
  try {
    const reqData = req.body;
    reqData.time = Date.now().toString();
    reqData.favList = [];
    console.log("post body", req.body);
    users.find({ email: req.body.email }, (err, data) => {
      console.log("Here is the data ", data, data.length);
      console.log("request data: ", reqData);
      if (data.length < 1) {
        console.log("Inserting data to users.db");
        // users.insert(reqData);
        db.collection('users').insertOne(reqData);
        res.json({
          status: 200,
          message: "Registration successful",
        });
      } else {
        console.log("Returning error response to client!");
        res.json({
          status: 403,
          message: "User already exists in DB",
        });
      }
    });
  } catch (error) {
    console.log(error);
  }
});

app.post("/favList", (req, res) => {
  console.log("POST /favList from client side");
  console.log(req.body);
  // users.loadDatabase();
  users.find({ email: req.body.user }, (err, data) => {
    console.log(data);
    var constcurrentFavList = data[0].favList;
    if (constcurrentFavList.length == 0) {
      res.json({
        message: "Fav list is empty",
      });
    } else {
      res.json({
        message: "Fav list fetch success",
        list: constcurrentFavList,
      });
    }
  });
});

app.post("/fav", async (req, res) => {
  console.log("POST /fav from client side");
  console.log(req.body);
  const reqData = req.body;

  // users.loadDatabase();
  users.find({ email: reqData.user }, (err, data) => {
    console.log(data);
    var isItemIncluded =
      data[0].favList.indexOf(reqData.savedItem) === -1 ? false : true;
    currentFavList = data[0].favList;
    if (isItemIncluded) {
      res.json({
        message: "Item already exists in the user's favList",
      });
    } else {
      res.json({
        message: "Item was successfully added to favList",
        item: reqData.savedItem,
      });
    }
  });

  users.update(
    { email: reqData.user },
    { $addToSet: { favList: reqData.savedItem } },
    { multi: false, upsert: false },
    (err, numReplaced, upsert) => {
      if (err) console.log("Error: ", err);
      if (numReplaced) console.log("numReplaced: ", numReplaced);
      if (upsert) console.log("upsert: ", upsert);
    }
  );
  // users.loadDatabase();
});

app.post("/deleteItem", async (req, res) => {
  console.log("POST /deleteItem from client side");
  console.log(req.body);
  // users.loadDatabase();
  users.find({ email: req.body.user }, async (err, data) => {
    const favList = data[0].favList;
    const itemToDelete = favList.filter((el) => el.includes(req.body.delete));
    users.update(
      { email: req.body.user },
      { $pull: { favList: itemToDelete[0] } },
      {},
      function () { }
    );
    res.json({
      status: 200,
      message: "Item deleted",
    });
  });
  // users.loadDatabase();
});

app.post("/login", (req, res) => {
  console.log("POST /login from client side");
  const reqData = req.body;

  try {
    users.find({ email: reqData.email }, (err, data) => {
      if (data.length == 0) {
        res.json({
          status: 404,
          message: "User does not exist",
        });
        res.end();
        return;
      }
      if (reqData.password == data[0]?.password) {
        res.json({
          status: 200,
          message: "Authentication successful",
          user: data[0],
        });
      } else {
        res.json({
          status: 401,
          message: "Password incorrect",
        });
      }
    });
  } catch (error) {
    console.log(error);
    res.json({
      status: 500,
      message: error,
    });
  }
});
