const Collaborator = require("./models").Collaborator;
const Wiki = require("./models").Wiki;
const User = require("./models").User;
const Authorizer = require("../policies/application");

module.exports = {
  add(req, callback) {
    User.findOne({
      where: {
        username: req.body.collaborator
      }
    })
    .then((user) => {
      if(!user) {
        return callback("User does not exist")
      }
      Collaborator.findOne({
        where: {
          userId: user.id,
          wikiId: req.params.wikiId
        }
      })
      .then((collaborator) => {
        if (collaborator) {
          return callback('This user is already a collaborator on this wiki.')
        }
        let newCollaborator = {
          userId: user.id,
          wikiId: req.params.wikiId
        };
        return Collaborator.create(newCollaborator)
        .then((collaborator) => {
          callback(null, collaborator);
        })
        .catch((err) => {
          callback(err, null);
        })
      })
    })
  },
  remove(req, callback) {
    let userId = req.body.collaborator;
    let wikiId = req.params.wikiId;

    const authorized = new Authorizer(req.user, wiki, userId).destroy();
      if (authorized) {
        Collaborator.destroy({
          where: {
            userId: userId,
            wikiId: wikiId
          }
        })
        .then((deletedRecordsCount) => {
          callback(null, deletedRecordsCount);
        })
        .catch((err) => {
          callback(err);
        });
      } else {
        req.flash("notice", "You are not authorized to do that.")
        callback(401);
      }
   }

}
