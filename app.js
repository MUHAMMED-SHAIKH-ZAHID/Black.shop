const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const connection = require("./config/connection");
const userRouter = require("./routes/user");
const adminRouter = require("./routes/admin");
const hbs = require("express-handlebars");
const session = require("express-session");
const MongodbSession = require("connect-mongodb-session")(session);
const fileupload = require("express-fileupload");
const { trusted } = require("mongoose");
//const fileUpload = require('express-fileupload');

var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");
app.engine(
  "hbs",
  hbs.engine({
    extname: "hbs",
    defaultLayout: "layout",
    layoutsDir: __dirname + "/views/layout/",
    partialsDir: __dirname + "/views/partials/",
    helpers: {
      total: (qty, price) => {
        return qty * price;
      },
      subtotal: function (arr) {
        let subtotal = 0;
        console.log(arr,'lrkjewlk')
        for (let i = 0; i < arr.length; i++) {
          subtotal = subtotal + arr[i].product.price * arr[i].quantity;
        }
        console.log(subtotal)
        return subtotal;
      },
      json: function (data) {
        return JSON.stringify(data);
      },
      spg: (arg1,arg2,options) => {
        return (arg1==arg2)?options.fn(this):options.inverse(this)
      },
      date: function (date) {
        let data = date + "";
        return data.slice(0, 16);
      },
      dateFormat: function (data) {
        var dateobj = new Date(data);

        var B = dateobj.toUTCString();

        return B.slice(5, 16);
      },
      inc1: function (data) {
        return data + 1;
      },
      eq: function (data, string) {
        if (data === string) return true;
        else return false;
      },
      slices: function (data) {
        let datas = data + "";
        return datas.slice(12, 20);
      },
      slice: function (data) {
        let datas = data + "";
        return datas.slice(0, 25);
      },
    },
  })
);

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

connection.connect();

const store = new MongodbSession({
  uri: connection.mongoURI,
  collection: "sessions",
});

const oneDay = 1000 * 60 * 60 * 24;
app.use(
  session({
    secret: "this is a secret key",
    resave: true,
    saveUninitialized: false,
    cookie: { maxAge: oneDay },
    store: store,
  })
);

//app.use(fileUpload())
app.use("/", userRouter);
app.use("/admin", adminRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
