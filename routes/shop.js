const express = require("express");
const shopController = require("../controllers/shop");
const router = express.Router();

router.get("/signup", shopController.getSignup);

router.get("/login", shopController.getLogin);

router.get("/cart", shopController.getCart);

router.get("/", shopController.getHome);

module.exports = router;
