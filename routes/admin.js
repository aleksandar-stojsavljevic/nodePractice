const express = require("express");
const adminController = require("../controllers/admin");
const multer = require("../midllewares/multer");
const isAuth = require("../midllewares/isLoggedIn");
const router = express.Router();
const { body } = require("express-validator");

router.get("/add-product", isAuth, adminController.getAddProduct);

router.post(
  "/add-product",
  multer.send,
  [
    body("name", "Product name must be min 3 letters long.")
      .isString()
      .isLength({ min: 3 })
      .trim(),
    body("price", "Price must be valid number.").isFloat(),
    body("description", "Description must be between 5 and 400 letters long.")
      .isLength({ min: 5, max: 400 })
      .trim(),
  ],
  isAuth,
  adminController.postAddProduct
);

router.get("/edit-product/:productId", isAuth, adminController.getEditProduct);

router.post(
  "/edit-product",
  multer.send,
  [
    body("name", "Product name must be min 3 letters long.")
      .isString()
      // .notEmpty()
      .isLength({ min: 3 })
      .trim(),
    body("price", "Price must be valid number.").isFloat(),
    body("description", "Description must be between 5 and 400 letters long.")
      .isLength({ min: 5, max: 400 })
      .trim(),
  ],
  isAuth,
  adminController.postEditProduct
);

router.post("/delete", isAuth, adminController.deleteProduct);

router.get("/products", isAuth, adminController.getProducts);

module.exports = router;
