const express = require("express");
const app = express();
const appConfig = require("./config/main-config.js");
const routeConfig = require("./config/route-config.js");
const bodyParser = require("body-parser");

appConfig.init(app, express);
routeConfig.init(app);
app.use(bodyParser.json());

module.exports = app;
