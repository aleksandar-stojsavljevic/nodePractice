exports.getSignup = (req, res, next) => {
  res.render("signup", {});
};

exports.getLogin = (req, res, next) => {
  res.render("login", {});
};

exports.getCart = (req, res, next) => {
  res.render("cart", {});
};

exports.getHome = (req, res, next) => {
  res.render("home", {});
};
