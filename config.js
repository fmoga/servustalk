var jQuery = require('jquery');

var config = {}

config.server = {
    port: 8000
}

config.mongo = {
    db: "ubuntalk"
}

config.app = {
    google_client_id: "596685303616.apps.googleusercontent.com",
    google_client_secret: "1lHPftfPbfQi-Ft9vJaml2sA",
    history_size: 20,
    sio: {
        log_level: 3,
        transports: ['xhr-polling', 'jsonp-polling']
    }
}

config.defaultTitle = {
  text: 'UbunTalk - chat for humans (and dancers)',
  user: 'UbunTalk'
}

try {
    my_config = require('./my_config');
    jQuery.extend(true, config, my_config);
    console.log('Using user config found.');
} catch(err) {
    console.log('No user config found.');
}

module.exports = config
