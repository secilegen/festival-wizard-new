const adminMail = "admin@admin.com"
const adminPassword = "1234"

module.exports = (req, res, next) => {
    console.log("******", "email: ", req.body.email, "password: ", req.body.password, adminMail, adminPassword)
    if ((req.body.email === adminMail) && (req.body.password === adminPassword)) {
      console.log("email: ", req.body.email, "password: ", req.body.password)
      return res.redirect("/login");
    }
    else {
        console.log("ADMIN ", "email: ", req.body.email, "password: ", req.body.password)        
        next();
    }
  
  };
  
