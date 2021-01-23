const Product = require("../model/product");

exports.getSignup = (req, res, next) => {
  res.render("signup", { title: "Sign Up" });
};

exports.getLogin = (req, res, next) => {
  res.render("login", { title: "Login" });
};

exports.getCart = (req, res, next) => {
  res.render("cart", { title: "Cart" });
};

exports.getHome = (req, res, next) => {
  Product.find()
    .then((result) => {
      res.render("home", { title: "Home", prods: result });
    })
    .catch((err) => {
      console.log("Error in get Home ", err);
    });
};
