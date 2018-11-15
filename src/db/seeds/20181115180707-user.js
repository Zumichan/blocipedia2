'use strict';

const faker = require("faker");
const bcrypt = require("bcryptjs");
const saltRounds = 10;
const myPlainTextPassword = 's0/\p4$$w0rD';
const someOtherPlaintextPassword = 'not_bacon';
const salt = bcrypt.genSaltSync(saltRounds);
const hashedPassword = bcrypt.hashSync(myPlainTextPassword, salt);

let users = [];

for(let i = 1 ; i <= 15 ; i++){
 users.push({
   username: faker.internet.userName(),
   email: faker.internet.email(),
   password: hashedPassword,
   role: "standard",
   createdAt: new Date(),
   updatedAt: new Date(),
 });
}

/* This approach throws a validation error. Maybe because either
the username length or password doesn't meet the minimum length.

let users = [];

for(let i = 1 ; i <= 15 ; i++){
 users.push({
   username: faker.hacker.noun(),
   email: faker.internet.email(),
   password:faker.hacker.noun(),
   role: "standard",
   createdAt: new Date(),
   updatedAt: new Date(),
 });
}
*/

/*This works, but passwords are not stored as hash in the DB.
let users = [];

for(let i = 1 ; i <= 15 ; i++){
 users.push({
   username: faker.hacker.noun() + faker.hacker.noun(),
   email: faker.internet.email(),
   password:faker.hacker.noun() + faker.hacker.noun(),
   role: "standard",
   createdAt: new Date(),
   updatedAt: new Date(),
 });
}
*/

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert("Users", users, {});
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete("Users", null, {});
  }
};
