var persistency = require('./persistency'),
    date_utils = require('date-utils');

function index(req, res) {
    res.render('index');
}

function history(req, res) {
    res.render('history');
}

function getHistory(req, res) {
    year = parseInt(req.params.year);
    month = parseInt(req.params.month);
    day = parseInt(req.params.day);
    if (isNaN(day) || isNaN(month) || isNaN(year)) {
        res.render('404');
        return;
    }

    if (!Date.validateDay(day, year, month)) {
        res.render('404');
        return;
    }

    lower_date = new Date(year, month, day, 0, 0, 0, 0);
    upper_date = lower_date.clone();
    upper_date.addDays(1);

    data = {};
    persistency.getMessages(lower_date, upper_date, function(err, messages) {
        if (err) {
            console.warn('Error getting messages: ' + err, err.stack);
            res.render('404');
        } else {
            persistency.getUsers(function(err, users) {
                if (err) {
                    console.warn('Error getting users: ' + err, err.stack);
                    res.render('404');
                } else {
                    // Maps user_id -> user
                    users_by_id = {};
                    for (idx in users) {
                        users[idx]._id = undefined;
                        users_by_id[users[idx].id] = users[idx];
                    }

                    // message.user contains id, but we need a user object
                    for (idx in messages) {
                        messages[idx]._id = undefined;
                        messages[idx].user = users_by_id[messages[idx].user];
                    }

                    data.messages = messages;
                    res.contentType('json');
                    res.send(data);
                }
            });
        }
    });
}

exports.index = index
exports.history = history
exports.getHistory = getHistory
