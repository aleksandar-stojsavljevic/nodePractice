const Product = require("../model/product");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const User = require("../model/user");

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
    .then((products) => {
      res.render("home", { title: "Home", prods: products });
    })
    .catch((err) => {
      console.log("Error in get Home ", err);
    });
};

exports.getProductDetails = (req, res, next) => {
  const prodId = req.params.productId;
  Product.findById(prodId)
    .then((product) => {
      console.log(product);
      res.render("product-details", { product: product });
    })
    .catch((err) => {
      console.log("Error in getProductDetails ", err);
    });
};
exports.postSignUp = (req, res, next) => {
  const username = req.body.loginUsername;
  const password = req.body.loginPassword;
  const passwordConfirm = req.body.loginPasswordConfirm;
  // console.log(username);
  // console.log(password);
  // console.log(passwordConfirm);
  User.findOne({ username: username })
    .then((user) => {
      if (!user) {
        if (password == passwordConfirm) {
          const hashedPass = bcrypt.hashSync(password, 8);
          const user = new User({
            username: username,
            password: hashedPass,
          });
          user.save();
          res.redirect("/login");
          const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
              user: "aleksandarstojsavljevic@gmail.com",
              pass: "nikolatesla",
            },
            tls: {
              rejectUnauthorized: false,
            },
          });
          const mailOptions = {
            from: "aleksandarstojsavljevic@gmail.com",
            to: "sven.wath@yahoo.com",
            subject: "Thank you for joining",
            text: "You can log now with your credentials",
          };
          transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
              console.log(error);
            } else {
              console.log("Email sent: " + info.response);
            }
          });
        } else {
          console.log("Passwords didn't match!!! ");
          res.redirect("/signup");
        }
      } else {
        console.log(`User with username ${username} already exist.`);
      }
    })
    .catch((err) => {
      console.log("Error in finding user ", err);
    });
};
