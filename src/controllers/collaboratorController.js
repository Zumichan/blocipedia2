const collaboratorQueries = require("../db/queries.collaborators.js");
const Authorizer = require("../policies/application");
const wikiQueries = require("../db/queries.wikis.js");

module.exports = {

  create(req, res, next){
    collaboratorQueries.createCollaborator(req, (err, collaborator) => {
         if(err){
           res.flash("notice", "This collaborator already exists.");
         } else {
           res.redirect(303, `/wikis/${req.params.wikiId}/collaborators`);
         }
    });
  },
  show(req, res, next){
    wikiQueries.getWiki(req.params.wikiId, (err, result) => {
      wiki = result["wiki"];
      collaborators = result["collaborators"];

      if(err || wiki == null){
        res.redirect(404, "/");
      } else {
        const authorized = new Authorizer(req.user, wiki, collaborators).edit();
        if(authorized){
          res.render("collaborators/show", {wiki,collaborators});
        } else {
          req.flash("notice", "You are not authorized to do that.");
          res.redirect(`/wikis/${req.params.wikiId}`)
        }
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
    wikiQueries.getWiki(req.params.id, (err, wiki) => {
      if(err || wiki == null){
        res.redirect(404, "/");
      } else {
        const authorized = new Authorizer(req.user, wiki).edit();
        if(authorized){
          res.render("wikis/edit", {wiki});
        } else {
          req.flash("Error: You are not authorized to do that.")
          res.redirect(`/wikis/${req.params.id}`)
        }
      }
    });
   },
   update(req, res, next){
     wikiQueries.updateWiki(req, req.body, (err, wiki) => {
       if(err || wiki == null){
         res.redirect(401, `/wikis/${req.params.id}/edit`);
       } else {
         res.redirect(`/wikis/${req.params.id}`);
       }
     });
   }
}
