const Wiki = require("./models").Wiki;
const User = require("./models").User;
const Collaborator = require("./models").Collaborator;
const Authorizer = require("../policies/wiki");

module.exports = {

  getAllWikis(callback){
    let result = {};
    return Wiki.all()
    .then((wikis) => {
      result['wikis'] = wikis;
      callback(null, result);
    })
    .catch((err) => {
      callback(err);
    })
  },
  addWiki(newWiki, callback){
     return Wiki.create(newWiki)
     .then((wiki) => {
       callback(null, wiki);
     })
     .catch((err) => {
       callback(err);
     })
   },
   getWiki(id, callback) {
    let result = {};
    return Wiki.findById(id)
      .then((wiki) => {
        if (!wiki) {
          callback(404);
        } else {
          result["wiki"] = wiki;
          Collaborator.scope({ method: ["collaboratorsFor", id] }).all()
            .then((collaborators) => {
              result["collaborators"] = collaborators;
              callback(null, result);
            })
        }
      })
      .catch((err) => {
        callback(err);
      })
   },
   deleteWiki(req, callback){
     return Wiki.findById(req.params.id)
     .then((wiki) => {
       const authorized = new Authorizer(req.user, wiki).destroy();
       if(authorized) {
         wiki.destroy()
         .then((res) => {
           callback(null, wiki);
         });
       } else {
         req.flash("notice", "You are not authorized to do that.")
         callback(401);
       }
     })
     .catch((err) => {
       callback(err);
     });
   },
   updateWiki(id, updatedWiki, callback){
     return Wiki.findById(id)
     .then((wiki) => {
       if(!wiki){
         return callback("Wiki not found");
       }
         wiki.update(updatedWiki, {
           fields: Object.keys(updatedWiki)
         })
         .then(() => {
           callback(null, wiki);
         })
         .catch((err) => {
           callback(err);
         });
     });
   },
   makePrivate(id){
     return Wiki.all()
     .then((wikis) => {
       wikis.forEach((wiki) => {
         if (wiki.userId == id && wiki.private == true){
         wiki.update({
           private: false
         })
        }
       })
     })
     .catch(err => {
       console.log(err);
     })
   }

}
