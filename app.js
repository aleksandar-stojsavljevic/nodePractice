const express = require("express");
const path = require("path");
const exphbs = require("express-handlebars");
const app = express();

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");

// app.set("views", path.join(__dirname, "views"));

app.engine(
  "hbs",
  exphbs({
    layoutsDir: "views/layouts/",
    defaultLayout: "main-layout",
    extname: "hbs",
  })
);

app.engine("handlebars", exphbs());
app.set("view engine", "hbs");

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.use("/", shopRoutes);
app.use("/admin", adminRoutes);

app.use(function (req, res) {
  res.status(404).render("404");
});

app.listen(3000, console.log("App listen on port 3000"));
