var express = require("express");
var path = require("path");
var bodyParser = require("body-parser");

var router = require("./app/routes/routes");
var cors = require("cors");
var app = express();

app.set("views", path.join(__dirname, "app/views"));
app.use(
  cors({
    origin: "*",
  })
);
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/", router);

app.listen(3000, function () {
  console.log("SellPhone app is listening on port 3000!");
});
