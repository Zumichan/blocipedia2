const User = require("./models").User;
const bcrypt = require("bcryptjs");
const sgMail = require('@sendgrid/mail');

module.exports = {

  createUser(newUser, callback){
    const salt = bcrypt.genSaltSync();
    const hashedPassword = bcrypt.hashSync(newUser.password, salt);
    return User.create({
      username: newUser.username,
      email: newUser.email,
      password: hashedPassword
    })
    .then((user) => {
      sgMail.setApiKey(process.env.SENDGRID_API_KEY);
      const msg = {
        to: newUser.email,
        from: 'info@blocipedia.com',
        subject: 'Welcome to blocipedia',
        text: 'Thank you for signing up - start sharing your knowledge with other members in the community!',
        html: '<strong>Let the fun begin!</strong>',
      };
      //console.log(msg); to see if the msg object looks good in the terminal
      sgMail.send(msg);
      callback(null, user);
    })
    .catch((err) => {
      callback(err);
    })
  },
  getUser(id, callback){
    return User.findById(id)
    .then((user)=>{
      callback(null, user);
    })
    .catch((err)=>{
      callback(err);
    })
  },
  changeRole(user){
    User.findOne({
      where: {email: user.email}
    })
    .then((user)=>{
      if(user.role == "standard"){
        user.update({
          role: "premium"
        })
      } else if (user.role == "premium"){
        user.update({
          role: "standard"
        })
      }
    })
  }

}
