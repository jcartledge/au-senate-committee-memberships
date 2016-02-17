const Xray = require('x-ray');
const x = Xray();
const Sequelize = require('sequelize');
const db = new Sequelize('sqlite://data.sqlite', {
  pool: {maxIdleTime: 20000}
});

// Define models.
const Committee = db.define('committee', {
  name: {type: Sequelize.STRING},
  url: {type: Sequelize.STRING}
});

const Member = db.define('member', {
  name: {type: Sequelize.STRING}
});

var Membership = db.define('membership', {
  office: {type: Sequelize.STRING}
});

// Create tables and associations.
Member.sync({force: true}).then(_ => {
  Committee.sync({force: true}).then(_ => {
    Member.belongsToMany(Committee, {through: Membership});
    Committee.belongsToMany(Member, {through: Membership});
    Membership.sync({force: true}).then(scrapeCommittees);
  });
});

const committeesURL = 'http://www.aph.gov.au/Parliamentary_Business/Committees/';
const senateCommitteesSel = '#MainContentPlaceHolder_main_0_content_0_ctl02_ctl02_ctl01_ctl00_LinksList_divColumn li';

function scrapeCommittees () {
  x(committeesURL, senateCommitteesSel, [{
    url: 'a@href',
    name: 'a'
  }])((err, committeeResults) => {
    if (err) throw err;
    committeeResults.forEach(committeeResult => {
      Committee.create(committeeResult).then(scrapeMembers);
    });
  });
}

function scrapeMembers (committee) {
  x(committee.url + '/Committee_Membership', '.search-filter-results li', [{
    office: 'h3',
    name: '.title'
  }])((err, memberResults) => {
    if (err) throw err;
    memberResults.forEach(memberResult => {
      Member.findCreateFind({
        where: {name: memberResult.name}
      }).spread(member => {
        committee.addMember(member, {office: memberResult.office});
      });
    });
  });
}
