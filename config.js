var jQuery = require('jquery');

var config = {}

config.server = {
    port: 80
}

config.mongo = {
    db: "ubuntalk"
}

config.app = {
    google_client_id: "596685303616.apps.googleusercontent.com",
    google_client_secret: "jzmnVYcNNZBAcVjjDe0T-q8k",
    history_size: 20,
    sio: {
        log_level: 1,
        transports: ['xhr-polling', 'jsonp-polling']
    }
}

try {
    my_config = require('./my_config');
    jQuery.extend(true, config, my_config);
    console.log('Using user config found.');
} catch(err) {
    console.log('No user config found.');
}

module.exports = config
