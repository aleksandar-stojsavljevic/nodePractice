module.exports = (req, res, next) => {
  if (req.session.user.email != "admin@admin.com") {
    return res.redirect("/");
  }
  next();
};
