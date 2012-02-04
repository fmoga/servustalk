var requestHandlers = require('./requestHandlers');

function addRoutes(app) {
    app.get('/', requestHandlers.index);
    app.get('/history', requestHandlers.history);
}

exports.addRoutes = addRoutes;
