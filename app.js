const express = require("express");
const path = require("path");
const fs = require("fs");
const exphbs = require("express-handlebars");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);

const MONGO_URI =
  "mongodb://localhost:27017/practice?readPreference=primary&appname=MongoDB%20Compass%20Community&ssl=false";

const app = express();

var store = new MongoDBStore({
  uri: MONGO_URI,
  collection: "sessions",
});

// Catch errors
store.on("error", (err) => {
  console.log("Error in session store ", err);
});

app.use(
  session({
    secret: "This is a secret",
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
    },
    store: store,
    // Boilerplate options, see:
    // * https://www.npmjs.com/package/express-session#resave
    // * https://www.npmjs.com/package/express-session#saveuninitialized
    resave: false,
    saveUninitialized: false,
  })
);

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");

app.engine(
  "hbs",
  exphbs({
    layoutsDir: "views/layouts/",
    defaultLayout: "main-layout",
    extname: "hbs",
    runtimeOptions: {
      allowProtoPropertiesByDefault: true,
      allowProtoMethodsByDefault: true,
    },
  })
);

app.engine("handlebars", exphbs());
app.set("view engine", "hbs");
app.use("/images", express.static(path.join(__dirname, "images")));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.use("/", shopRoutes);
app.use("/admin", adminRoutes);

app.use(function (req, res) {
  res.status(404).render("404", { loggedIn: req.session.isLoggedIn });
});
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
mongoose.connection.on("error", (err) => {
  console.log("err", err);
});
mongoose.connection.on("connected", (err, res) => {
  console.log("mongoose is connected");
});
app.listen(3000, () => {
  console.log("App listen on port 3000");
});
