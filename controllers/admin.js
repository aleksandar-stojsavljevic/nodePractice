const Product = require("../model/product");
const fs = require("fs");

exports.getAddProduct = (req, res, next) => {
  res.render("add-Product", { title: "Add product" });
};

exports.postAddProduct = (req, res, next) => {
  console.log(req.body);

  const name = req.body.productName;
  const image = req.file;
  const price = req.body.productPrice;
  const desc = req.body.productDesc;
  let imageUrl;
  if (!image) {
    imageUrl = "../images/no-image.png";
  } else {
    imageUrl = image.path;
  }
  const product = new Product({
    name: name,
    imagePath: imageUrl,
    price: price,
    description: desc,
  });

  product
    .save()
    .then((result) => {
      console.log("Product saved");
      res.redirect("/admin/products");
    })
    .catch((err) => {
      console.log("Error in postAddProduct ", err);
    });
};

exports.getProducts = (req, res, next) => {
  Product.find()
    .then((products) => {
      res.render("products", {
        title: "Products",
        prods: products,
      });
    })
    .catch((err) => {
      console.log("Error in getProducts ", err);
    });
};

exports.getEditProduct = (req, res, next) => {
  const prodId = req.params.productId;
  Product.findById(prodId)
    .then((product) => {
      res.render("edit-product", { title: "Edit Product", product: product });
    })
    .catch((err) => {
      console.log("Error in getEditProduct ", err);
    });
};

exports.postEditProduct = (req, res, next) => {
  const prodId = req.body.productId;
  const updatedName = req.body.productName;
  let updatedImage = req.file;
  const updatedPrice = req.body.productPrice;
  const updatedDescription = req.body.productDesc;
  Product.findById(prodId)
    .then((product) => {
      let oldImage = product.imagePath;
      if (!updatedImage) {
        product.name = updatedName;
        product.price = updatedPrice;
        product.description = updatedDescription;
        product.save();
      } else {
        let imagePath = updatedImage.path;
        product.name = updatedName;
        product.imagePath = imagePath;
        product.price = updatedPrice;
        product.description = updatedDescription;
        product.save();
        if (oldImage != "../images/no-image.png") {
          fs.unlink(oldImage, (err) => {
            if (err) {
              console.log("Error in postEdit Product deleting file ", err);
              return;
            }
          });
        }
      }
    })
    .catch((err) => {
      console.log("Error in postEditProduct ", err);
    });
  res.redirect("products");
};

exports.deleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findById(prodId)
    .then((product) => {
      fs.unlink(product.imagePath, (err) => {
        if (err) {
          console.log("Error in deleting file ", err);
          return;
        }
      });
      return Product.deleteOne({ _id: prodId });
    })
    .then(() => {
      res.redirect("products");
    })
    .catch((err) => {
      console.log("Error in deleteProduct " + err);
    });
};
