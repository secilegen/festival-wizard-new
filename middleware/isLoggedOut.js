module.exports = (req, res, next) => {
    if (req.session.currentUser) {
      return res.redirect("/profile");
      // Maybe add a message here to say they need to log in?
    }
    next();
  };
  