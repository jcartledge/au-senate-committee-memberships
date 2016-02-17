const Sequelize = require('sequelize');
const db = new Sequelize('sqlite://data.sqlite');

// Define models.
const Committee = db.define('committee', {
  name: {type: Sequelize.STRING},
  url: {type: Sequelize.STRING}
});

const Member = db.define('member', {
  name: {type: Sequelize.STRING}
});

const Membership = db.define('membership', {
  office: {type: Sequelize.STRING}
});

// Create tables and associations.
function initModels (options) {
  return Member.sync(options).then(_ => {
    return Committee.sync(options).then(_ => {
      Member.belongsToMany(Committee, {through: Membership});
      Committee.belongsToMany(Member, {through: Membership});
      return Membership.sync(options);
    });
  });
}

module.exports = {
  Committee: Committee,
  Member: Member,
  Membership: Membership,
  initModels: initModels
};
