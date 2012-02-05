var requestHandlers = require('./requestHandlers');

function addRoutes(app) {
    app.get('/', requestHandlers.index);
    app.get('/history', requestHandlers.history);
    app.post('/getHistory/:year/:month/:day', requestHandlers.getHistory);
    app.get('/ui', requestHandlers.ui);
}

exports.addRoutes = addRoutes;
