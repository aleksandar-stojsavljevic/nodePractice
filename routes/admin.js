const express = require("express");
const adminController = require("../controllers/admin");
const multer = require("../midllewares/multer");
const router = express.Router();

router.get("/add-product", adminController.getAddProduct);

router.post("/add-product", multer.send, adminController.postAddProduct);

router.get("/edit-product/:productId", adminController.getEditProduct);

router.post("/edit-product", multer.send, adminController.postEditProduct);

router.post("/delete", adminController.deleteProduct);

router.get("/products", adminController.getProducts);

module.exports = router;
