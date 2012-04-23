var jQuery = require('jquery');

var config = {}

config.server = {
  port: 8080
}

config.mongo = {
  db: "ubuntalk"
}

config.app = {
  google_client_id: "GOOGLE_CLIENT_ID",
  google_client_secret: "GOOGLE_CLIENT_SECRET",
  history_size: 20,
  sio: {
    log_level: 1,
    transports: ['websocket', 'xhr-polling']
  },
  calendar: 'https://www.google.com/calendar/render?cid=<GOOGLE_CALENDAR_ID>',
  defaultTitle: 'UbunTalk - chat for humans (and dancers)'
}

try {
  my_config = require('./my_config');
  jQuery.extend(true, config, my_config);
  console.log('Using user config found.');
} catch(err) {
  console.log('No user config found.');
}

module.exports = config
