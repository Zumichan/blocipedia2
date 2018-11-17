const userQueries = require("../db/queries.users.js");
const passport = require("passport");
const secretKey = process.env.STRIPE_SECRET_KEY;
const stripe = require('stripe')(secretKey);
const User = require("../db/models/").User;

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
   show(req, res, next) {
     userQueries.getUser(req.params.id, (err, user) => {
       if(err || user === undefined){
         req.flash("notice", "Error: No user found with that ID.");
         res.redirect("/");
       } else {
         res.render("users/show", {user});
       }
     });
   },
   upgradeForm(req, res, next){
     userQueries.getUser(req.params.id, (err, user) => {
            if(err || user === undefined){
                req.flash("notice", "No user found with that ID.");
                res.render("/");
            } else {
                res.render("users/upgrade", {user});
            }
        });
   },
   upgrade(req, res, next){
     const token = req.body.stripeToken;
     const email = req.body.stripeEmail;
       User.findOne({
         where: {email: email}
       })
       .then((user) => {
         if(user){
           const charge = stripe.charges.create({
             amount: 1500,
             currency: 'usd',
             description: 'Upgrade to premium',
             source: token,
           })
           .then((result) => {
             if(result){
               userQueries.changeRole(user);
                 req.flash("notice", "You've been upgraded to Premium!");
                 res.redirect("/");
             } else {
                 req.flash("notice", "Upgrade unsuccessful.");
                 res.redirect("users/show", {user});
             }
            })
          }
       })
     },
     downgradeForm(req, res, next){
       userQueries.getUser(req.params.id, (err, user) => {
            if(err || user === undefined){
                req.flash("notice", "No user found with that ID.");
                res.redirect("/");
            } else {
                res.render("users/downgrade", {user});
           }
        });
     },
     downgrade(req, res, next) {
       userQueries.getUser(req.params.id, (err, user) => {
         if (err || user === undefined) {
           req.flash("notice", "Downgrade unsuccessful.");
           res.redirect("users/show", {user});
         } else {
           userQueries.changeRole(user);
           req.flash("notice", "You've been downgraded to Standard!");
           res.redirect("/");
         }
       });
     }
  }
