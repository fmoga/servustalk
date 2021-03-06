var requestHandlers = require('./requestHandlers');

function addRoutes(app) {
    app.get('/login', requestHandlers.login);
    app.get('/', requestHandlers.index);
    app.get('/history', requestHandlers.history);
    app.get('/memegeist', requestHandlers.memegeist);
    app.get('/top', requestHandlers.topMessages);
    app.get('/beta', requestHandlers.beta);
    app.get('/map', requestHandlers.map);
    app.get('/distinctCheckins', requestHandlers.distinctCheckins);
    app.get('/whitelist', requestHandlers.whitelist);
    app.get('/accept/:userid', requestHandlers.acceptUser);
    // http://northisup.com/blog/a-new-sith-or-revenge-of-the-hope-mirror/
    // this article is so good, I think it should be hardcoded in the code.
    // I wish I could commit this with a killer feature so nobody reverts it.
    // R2D2
    app.get('/ban/:userid', requestHandlers.banUser);
    app.get('/access', requestHandlers.access);
    app.get('/pay', requestHandlers.pay);
    app.post('/vote', requestHandlers.vote);
    app.post('/getMessages/:timestamp', requestHandlers.getMessages);
    app.get('/getMessages/:timestamp', requestHandlers.getMessages);
    app.post('/getMemes/:timestamp', requestHandlers.getMemes);
    app.get('/getMemes/:timestamp', requestHandlers.getMemes);
    app.get('/loadMemes', requestHandlers.loadMemes);
    app.get('/getTopMessages/:timestamp', requestHandlers.getTopMessages);
    app.post('/getTopMessages/:timestamp', requestHandlers.getTopMessages);
}

function setRealtimeEngine(engine) {
  requestHandlers.setRealtimeEngine(engine);
}

exports.addRoutes = addRoutes;
exports.setRealtimeEngine = setRealtimeEngine
