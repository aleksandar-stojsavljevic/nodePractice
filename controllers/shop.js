const Product = require("../model/product");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const User = require("../model/user");
const Cart = require("../model/cart");
var crypto = require("crypto");
const { validationResult } = require("express-validator");

exports.getSignup = (req, res, next) => {
  res.render("signup", { title: "Sign Up", loggedIn: req.session.isLoggedIn });
};

exports.getLogin = (req, res, next) => {
  res.render("login", { title: "Login", loggedIn: req.session.isLoggedIn });
};

exports.getCart = (req, res, next) => {
  const userId = req.session.user._id;
  Cart.findOne({ userId: userId })
    .then((cartItem) => {
      if (!cartItem) {
        res.render("cart", {
          title: "Cart",
          loggedIn: req.session.isLoggedIn,
          message: "No items in the cart",
          emptyCart: true,
        });
      } else {
        res.render("cart", {
          title: "Cart",
          loggedIn: req.session.isLoggedIn,
          cartItems: cartItem.cartItems,
          total: cartItem.totalPrice,
          prodName: cartItem.cartItems.name,
          emptyCart: false,
        });
      }
    })
    .catch((err) => {
      console.log("Error in getCart ", err);
    });
};

exports.postCart = (req, res, next) => {
  if (req.session.isLoggedIn) {
    const prodId = req.body.cartProduct;

    let price;
    Product.findById(prodId)
      .then((prod) => {
        (price = prod.price), (prodName = prod.name);
      })
      .catch((err) => {
        console.log("Error in finding product ", err);
      });

    const userId = req.session.user._id;

    Cart.findOne({ userId: userId })
      .then((cartItem) => {
        if (!cartItem) {
          const cart = new Cart({
            userId: userId,
            cartItems: {
              productId: prodId,
              quantity: 1,
              price: price,
              name: prodName,
            },
            totalPrice: price,
          });
          cart.save();
        } else {
          const itemIndex = cartItem.cartItems.findIndex((cp) => {
            return cp.productId == prodId;
          });

          let updatedCartItem = [...cartItem.cartItems];

          if (itemIndex == -1) {
            Cart.updateOne(
              { userId: userId },
              {
                $push: {
                  cartItems: {
                    productId: prodId,
                    quantity: 1,
                    price: price,
                    name: prodName,
                  },
                },
              },

              function (err, result) {
                if (err) {
                  console.log(err);
                } else {
                  console.log(result);
                }
              }
            );
          } else {
            const currentQua = updatedCartItem[itemIndex].quantity;
            const newQua = currentQua + 1;
            Cart.updateOne(
              {
                "cartItems.productId": prodId,
              },
              {
                $set: {
                  "cartItems.$.quantity": newQua,
                },
              },

              function (err, result) {
                if (err) {
                  console.log(err);
                } else {
                  console.log(result);
                }
              }
            );
          }
          let total = 0;
          Cart.find({ userId: userId })
            .then((cart) => {
              const cartItem = cart[0].cartItems;
              for (let i = 0; i < cartItem.length; i++) {
                total += cartItem[i].price * cartItem[i].quantity;
              }

              Cart.updateOne(
                {
                  "cartItems.productId": prodId,
                },
                {
                  $set: {
                    totalPrice: total,
                  },
                },

                function (err, result) {
                  if (err) {
                    console.log(err);
                  } else {
                    console.log(result);
                  }
                }
              );
            })
            .catch((err) => {
              console.log(err);
            });
        }
        res.redirect("/cart");
      })
      .catch((err) => {
        console.log(err);
      });
  } else {
    console.log("Please log in to make a purchase");
    res.redirect("/");
  }
};

exports.postCartDelete = (req, res, next) => {
  const prodId = req.body.productId;
  const userId = req.session.user._id;
  console.log(userId);
  console.log("tu sam", prodId);
  let totalPrice = 0;
  let productPrice = 0;
  let newTotal = 0;

  Cart.findOne({ userId: userId })
    .then((cartItem) => {
      totalPrice = cartItem.totalPrice;

      return totalPrice;
    })
    .then((totalPrice) => {
      Cart.findOne({ "cartItems.productId": prodId })
        .then((product) => {
          console.log("product ", product);
          let price = 0;
          let quantity = 0;
          product.cartItems.forEach((element) => {
            if (element.productId == prodId) {
              price = element.price;
              quantity = element.quantity;
            }
          });
          productPrice = price * quantity;
          newTotal = totalPrice - productPrice;
          console.log("izracunao new Total: " + newTotal);
          return newTotal;
        })
        .then((newTotal) => {
          console.log("new Total: " + newTotal);
          Cart.updateOne(
            { userId: userId },
            { $set: { totalPrice: newTotal } }
          ).then((result) => {
            console.log(result);
          });
        });
    })

    .then(() => {
      Cart.updateOne(
        { userId: userId },
        { $pull: { cartItems: { productId: prodId } } }
      ).then((result) => {
        console.log(result);
      });
    })
    .catch((err) => {
      console.log(err);
    });

  res.redirect("/cart");
};

exports.getHome = (req, res, next) => {
  let page = parseInt(req.query.page);
  const perPage = 2;
  Product.countDocuments()
    .then((count) => {
      let numberOfPages = Math.ceil(count / perPage);
      return numberOfPages;
    })
    .then((numberOfPages) => {
      console.log("Koliko stranica ", numberOfPages);
      console.log("page ", page);
      Product.find()
        .skip((page - 1) * perPage)
        .limit(perPage)
        .then((products) => {
          res.render("home", {
            title: "Home",
            prods: products,
            loggedIn: req.session.isLoggedIn,
            page: page,
            prevLink: page - 1,
            nextLink: page + 1,
            numberOfPagesPrev: () => {
              if (page != 1) {
                return true;
              }
              return false;
            },
            numberOfPagesNext: () => {
              if (page != numberOfPages) {
                return true;
              }
              return false;
            },
            numberOfPages: numberOfPages,
            previousPage: () => {
              if (page > 1) {
                return true;
              }
              return false;
            },
            nextPage: () => {
              if (page < numberOfPages) {
                return true;
              }
              return false;
            },
          });
        });
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
      res.render("product-details", {
        product: product,
        loggedIn: req.session.isLoggedIn,
      });
    })
    .catch((err) => {
      console.log("Error in getProductDetails ", err);
    });
};
exports.postSignUp = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const passwordConfirm = req.body.confirmPassword;
  const errors = validationResult(req);
  console.log("errors", errors.errors);
  if (!errors.isEmpty()) {
    return res.status(422).render("signup", {
      title: "Sign Up",
      errorMessage: errors.array()[0].msg,
      errorEmail: () => {
        if (errors.array()[0].param == "email") {
          return (errorEmail = true);
        }
        return false;
      },
      errorPassword: () => {
        if (errors.array()[0].param == "password") {
          return (errorPassword = true);
        }
        return false;
      },
      errorPasswordConfirm: () => {
        if (errors.array()[0].param == "passwordConfirm") {
          return (errorPasswordConfirm = true);
        }
        return false;
      },
      isError: true,
      email: email,
      password: password,
      passwordConfirm: passwordConfirm,
      // validationErrors: errors.array(),
    });
  }
  User.findOne({ email: email })
    .then((user) => {
      if (!user) {
        if (password == passwordConfirm) {
          bcrypt.hash(password, 8, (err, hash) => {
            if (err) {
              console.log("Error in hashing password ", err);
            }
            const user = new User({
              email: email,
              password: hash,
            });
            user.save();
            res.redirect("/login");
          });

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
            to: email,
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
        console.log(`User with username ${email} already exist.`);
      }
    })
    .catch((err) => {
      console.log("Error in finding user ", err);
    });
};
exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const errors = validationResult(req);
  console.log("errors", errors.errors);
  if (!errors.isEmpty()) {
    return res.status(422).render("login", {
      title: "Login",
      errorMessage: errors.array()[0].msg,
      errorEmail: () => {
        if (errors.array()[0].param == "email") {
          return (errorEmail = true);
        }
        return false;
      },
      errorPassword: () => {
        if (errors.array()[0].param == "password") {
          return (errorPassword = true);
        }
        return false;
      },
      errorPasswordConfirm: () => {
        if (errors.array()[0].param == "passwordConfirm") {
          return (errorPasswordConfirm = true);
        }
        return false;
      },
      isError: true,
      email: email,
      password: password,
    });
  }
  User.findOne({ email: email })
    .then((user) => {
      bcrypt.compare(password, user.password).then((result) => {
        if (result) {
          req.session.isLoggedIn = true;
          req.session.user = user;
          req.session.save((err) => {
            if (err) {
              console.log(err);
            }
          });

          console.log("User successfully logged in.");
          res.redirect("/");
        } else {
          console.log("Wrong username or password");
          res.redirect("/login");
        }
      });
    })
    .catch((err) => {
      console.log("Error in postLogin ", err);
    });
};
exports.getLogout = (req, res, next) => {
  req.session.destroy((err) => {
    if (err) {
      console.log(err);
    }
    res.clearCookie("connect.sid");
    res.redirect("/");
  });
  console.log("You successfully logged out");
};
exports.getNewPassword = (req, res, next) => {
  res.render("new-password", {
    title: "New password",
  });
};

exports.postNewPassword = (req, res, next) => {
  const email = req.body.email;
  const errors = validationResult(req);
  console.log("errors", errors.errors);
  if (!errors.isEmpty()) {
    return res.status(422).render("new-password", {
      title: "New password",
      errorMessage: errors.array()[0].msg,
      errorEmail: () => {
        if (errors.array()[0].param == "email") {
          return (errorEmail = true);
        }
        return false;
      },
      isError: true,
      email: email,
    });
  }
  User.findOne({ email: email })
    .then((user) => {
      if (!user) {
        res.render("new-password", {
          errorMessage: `No user with address ${email}`,
        });
      } else {
        const newPass = crypto.randomBytes(12).toString("hex");
        bcrypt.hash(newPass, 8, (err, hash) => {
          if (err) {
            console.log("Error in hashing password ", err);
          }
          console.log("newPass", newPass);
          User.updateOne({ email: email }, { $set: { password: hash } }).then(
            () => {
              res.redirect("/login");
            }
          );
        });
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
          to: email,
          subject: "New password ",
          text: `Your new password is ${newPass}`,
        };
        transporter.sendMail(mailOptions, function (error, info) {
          if (error) {
            console.log(error);
          } else {
            console.log("Email sent: " + info.response);
          }
        });
      }
    })
    .catch((err) => {
      console.log("Error in postNewPassword ", err);
    });
};
