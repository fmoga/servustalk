var persistency = require('./persistency');

function index(req, res) {
    res.render('index');
}

function history(req, res) {
    data = {};
    persistency.getMessages(function(err, value) {
        if (err) {
            console.warn('Error getting messages: ' + err, err.stack);
        } else {
            data.messages = value;
            res.render('history', {layout: false, locals: data});
        }
    });
}

exports.index = index
exports.history = history
