const wikiQueries = require("../db/queries.wikis.js");
const Authorizer = require("../policies/wiki");
const markdown = require("markdown").markdown;
const userQueries = require("../db/queries.users.js");

module.exports = {
  index(req, res, next){
    wikiQueries.getAllWikis((err, wikis) => {
      if(err){
        res.redirect(500, "static/index");
      } else {
        userQueries.getAllUsers((err, result) => {
          let users = result['users'];
          res.render("wikis/index", {wikis, users});
        });
      }
    })
  },
  new(req, res, next){
    const authorized = new Authorizer(req.user).new();
    if(authorized) {
      res.render("wikis/new");
    } else {
      req.flash("notice", "You are not authorized to do that.");
      res.redirect("/wikis");
    }
  },
  private(req,res,next){
    wikiQueries.getAllWikis((err,result) => {
      let wikis = result['wikis']
      if(err){
        res.redirect(500, 'static/index');
      } else {
        res.render('wikis/private', {wikis})
      }
    })
  },
  create(req, res, next){
     const authorized = new Authorizer(req.user).create();
     if(authorized) {
       let newWiki = {
         title: req.body.title,
         body: req.body.body,
         private: req.body.private,
         userId: req.user.id
       };
       wikiQueries.addWiki(newWiki, (err, wiki) => {
         if(err){
           res.redirect(500, "/wikis/new");
         } else {
           res.redirect(303, `/wikis/${wiki.id}`);
         }
       });
     } else {
       req.flash("notice", "You are not authorized to do that.");
       res.redirect("/wikis");
     }
  },
  show(req, res, next){
    wikiQueries.getWiki(req.params.id, (err, result) => {

      if(err || result.wiki == null){
        res.redirect(404, "/");
      } else {
        wiki = result["wiki"];
        collaborators = result["collaborators"];
        wiki.body = markdown.toHTML(wiki.body);
        res.render("wikis/show", {wiki});
      }
    });
   },
   destroy(req, res, next){
     wikiQueries.deleteWiki(req, (err, wiki) => {
       if(err){
         res.redirect(err, `/wikis/${req.params.id}`)
       } else {
         res.redirect(303, "/wikis")
       }
     });
   },
   edit(req, res, next){
    wikiQueries.getWiki(req.params.id, (err, result) => {
      if(err || wiki == null){
        res.redirect(404, "/");
      } else {
        wiki = result["wiki"];
        collaborators = result["collaborators"];
        const authorized = new Authorizer(req.user, wiki, collaborators).edit();
        if(authorized){
          res.render("wikis/edit", {wiki, collaborators});
        } else {
          req.flash("Error: You are not authorized to do that.")
          res.redirect(`/wikis/${req.params.id}`)
        }
      }
    });
   },
   update(req, res, next){
     wikiQueries.updateWiki(req.params.id, req.body, (err, wiki) => {
       if(err || wiki == null){
         res.redirect(401, `/wikis/${req.params.id}/edit`);
       } else {
         res.redirect(`/wikis/${req.params.id}`);
       }
     });
   }
}
