var jQuery = require('jquery');

var config = {}

config.server = {
  ip: process.env.SERVUS_IP || "0.0.0.0",
  port: process.env.PORT || process.env.SERVUS_PORT || 8000
}

config.mongo = {
  url: process.env.SERVUS_MONGO_URL || 'mongo://127.0.0.1:27017/ubuntalk',
  clear_interval: 60 * 30 // clear expired sessions from mongo each 30 min
}

config.app = {
  google_client_id: "368935632446-m7rjl3k9e8of0soj8bkckpreaotqg38o.apps.googleusercontent.com",
  google_client_secret: "7o7oEG3y-zy-AJ7EHWXROwpP",
  history_size: 20,
  sio: {
    log_level: 1,
    transports: ['websocket', 'xhr-polling']
  },
  calendar: 'https://www.google.com/calendar/render?cid=<GOOGLE_CALENDAR_ID>',
  defaultTitle: 'UbunTalk - chat for humans (and dancers)',
  supported_languages: ['ro', 'en', 'pirate'],
  language: 'en'
}

try {
  my_config = require('./my_config');
  jQuery.extend(true, config, my_config);
  console.log('Using user config found.');
} catch(err) {
  console.log('No user config found.');
}

module.exports = config
