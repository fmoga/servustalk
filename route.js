var requestHandlers = require('./requestHandlers');

function addRoutes(app) {
    app.get('/', requestHandlers.index);
}

exports.addRoutes = addRoutes;
