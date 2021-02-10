const Product = require("../model/product");
const fs = require("fs");
const { validationResult } = require("express-validator");

exports.getAddProduct = (req, res, next) => {
  res.render("add-Product", {
    title: "Add product",
    loggedIn: req.session.isLoggedIn,
  });
};

exports.postAddProduct = (req, res, next) => {
  console.log(req.body);

  const name = req.body.name;
  const image = req.file;
  const price = req.body.price;
  const desc = req.body.description;

  const errors = validationResult(req);
  console.log("errors", errors.errors);
  if (!errors.isEmpty()) {
    return res.status(422).render("add-product", {
      title: "Add product",
      loggedIn: req.session.isLoggedIn,
      errorMessage: errors.array()[0].msg,
      errorName: () => {
        if (errors.array()[0].param == "name") {
          return (errorName = true);
        }
        return false;
      },
      errorPrice: () => {
        if (errors.array()[0].param == "price") {
          return (errorPrice = true);
        }
        return false;
      },
      errorDesc: () => {
        if (errors.array()[0].param == "desc") {
          return (errorDesc = true);
        }
        return false;
      },
      isError: true,
      product: {
        name: name,
        price: price,
        description: desc,
      },
      // validationErrors: errors.array(),
    });
  }

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
        loggedIn: req.session.isLoggedIn,
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
      res.render("edit-product", {
        title: "Edit Product",
        product: product,
        loggedIn: req.session.isLoggedIn,
      });
    })
    .catch((err) => {
      console.log("Error in getEditProduct ", err);
    });
};

exports.postEditProduct = (req, res, next) => {
  const prodId = req.body.productId;
  const updatedName = req.body.name;
  let updatedImage = req.file;
  const updatedPrice = req.body.price;
  const updatedDescription = req.body.description;

  const errors = validationResult(req);

  console.log("errors", errors.errors);
  if (!errors.isEmpty()) {
    return res.status(422).render("edit-product", {
      title: "Edit product",
      loggedIn: req.session.isLoggedIn,
      errorMessage: errors.array()[0].msg,
      errorName: () => {
        if (errors.array()[0].param == "name") {
          return (errorName = true);
        }
        return false;
      },
      errorPrice: () => {
        if (errors.array()[0].param == "price") {
          return (errorPrice = true);
        }
        return false;
      },
      errorDesc: () => {
        if (errors.array()[0].param == "description") {
          return (errorDesc = true);
        }
        return false;
      },
      product: {
        _id: prodId,
        name: req.body.name,
        price: req.body.price,
        description: req.body.description,
      },
      // validationErrors: errors.array(),
    });
  }
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
