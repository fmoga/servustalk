var forever = require('forever');

var child = new (forever.Monitor)('app.js', {
  max: 10,
  silent: true,
  outFile: 'ubuntalk.log'
});

child.start();
