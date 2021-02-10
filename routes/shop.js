const express = require("express");
const shopController = require("../controllers/shop");
const isAuth = require("../midllewares/isLoggedIn");
const router = express.Router();
const { body } = require("express-validator");
const User = require("../model/user");

router.get("/signup", shopController.getSignup);

router.get("/login", shopController.getLogin);

router.get("/cart", shopController.getCart);

router.post("/cart", shopController.postCart);

router.post("/cart-delete", shopController.postCartDelete);

router.get("/product-details/:productId", shopController.getProductDetails);

router.post(
  "/signup",
  [
    body("email", "Not valid email address.")
      .isEmail()
      .custom((value, { req }) => {
        return User.findOne({ email: value }).then((userDoc) => {
          if (userDoc) {
            return Promise.reject(
              "E-Mail exists already, please pick a different one."
            );
          }
        });
      })
      .normalizeEmail(),
    body(
      "password",
      "Please enter a password with only numbers and text and at least 4 characters."
    )
      .isLength({ min: 4 })
      .isAlphanumeric()
      .trim(),
    body("confirmPassword")
      .trim()
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error("Passwords have to match!");
        }
        return true;
      }),
  ],
  shopController.postSignUp
);

router.post(
  "/login",
  [
    body("email", "Not valid email address.").isEmail().normalizeEmail().trim(),
    body("password", "Password not valid.")
      .isLength({ min: 4 })
      .isAlphanumeric()
      .trim(),
  ],
  shopController.postLogin
);

router.get("/logout", shopController.getLogout);

router.get("/", shopController.getHome);

router.get(
  "/new-password",

  shopController.getNewPassword
);

router.post(
  "/new-password",
  [body("email", "Not valid email address.").isEmail().normalizeEmail().trim()],
  shopController.postNewPassword
);

module.exports = router;
