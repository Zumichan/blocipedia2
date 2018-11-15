const userQueries = require("../db/queries.users.js");
const passport = require("passport");

module.exports = {
  signUp(req, res, next){
    res.render("users/sign_up");
  },
  create(req, res, next){
     let newUser = {
       username: req.body.username,
       email: req.body.email,
       password: req.body.password,
       passwordConfirmation: req.body.passwordConfirmation
     };
     userQueries.createUser(newUser, (err, user) => {
       if(err){
         req.flash("notice", "Error: This email address is already registered.");
         res.redirect("/users/sign_up");
       } else {
         passport.authenticate("local")(req, res, () => {
           //console.log("notice", "Welcome to Blocipedia! You've successfully signed up.");
           req.flash("notice", "Welcome to Blocipedia! You've successfully signed up.");
           res.redirect("/");
         })
       }
     });
   },
   signInForm(req, res, next){
     res.render("users/sign_in");
   },
   signIn(req, res, next){
     passport.authenticate("local", function(err, user, info){
       if(err){
         next(err);
       }
       if(!user){
         req.flash("notice", "Error: The email or password you entered is incorrect.")
         res.redirect("/users/sign_in");
       }
       req.logIn(user,function(err){
         if(err){
           next(err);
         }
         req.flash("notice", "You've successfully signed in!");
         res.redirect("/");
       });
     })(req, res, next);
    },
    signOut(req, res, next){
      req.logout();
      req.flash("notice", "You've successfully signed out!");
      res.redirect("/");
    },

}
