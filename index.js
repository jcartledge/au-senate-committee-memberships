const models = require('./models');
const http = require('http');
const PORT = 8081;

models.initModels().then(startServer);

function startServer () {
  http.createServer(handleRequest).listen(PORT, _ => {
    console.log('Server listening on: http://localhost:%s', PORT);
  });
}

function handleRequest (request, response) {
  response.write('<h1>Senate committees</h1>');
  response.write('<ul>');
  models.Committee.findAll({include: [models.Member]}).then(committees => {
    committees.forEach(committee => {
      response.write('<li><h2>' + committee.name + '</h2></li>');
      response.write('<ul>');
      committee.members.forEach(member => {
        response.write('<li>' + member.name + ' [' + member.membership.office + ']</li>');
      });
      response.write('</ul>');
    });
    response.write('</ul>');
  }).finally(_ => { response.end(); });
}
