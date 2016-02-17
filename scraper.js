const Xray = require('x-ray');
const x = Xray();

const models = require('./models');
models.initModels().then(scrapeCommittees);

const committeesURL = 'http://www.aph.gov.au/Parliamentary_Business/Committees/';
const senateCommitteesSel = '#MainContentPlaceHolder_main_0_content_0_ctl02_ctl02_ctl01_ctl00_LinksList_divColumn li';

function trimmed (obj) {
  return Object.keys(obj).reduce((acc, key) => {
    acc[key] = acc[key].trim();
    return acc;
  }, obj);
}

function scrapeCommittees () {
  x(committeesURL, senateCommitteesSel, [{
    url: 'a@href',
    name: 'a'
  }])((err, committeeResults) => {
    if (err) throw err;
    committeeResults.map(trimmed).forEach(committeeResult => {
      models.Committee.create(committeeResult).then(scrapeMembers);
    });
  });
}

function scrapeMembers (committee) {
  x(committee.url + '/Committee_Membership', '.search-filter-results li', [{
    office: 'h3',
    name: '.title'
  }])((err, memberResults) => {
    if (err) throw err;
    memberResults.map(trimmed).forEach(memberResult => {
      models.Member.findCreateFind({
        where: {name: memberResult.name}
      }).spread(member => {
        committee.addMember(member, {office: memberResult.office});
      });
    });
  });
}
