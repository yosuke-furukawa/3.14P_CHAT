/**
 * Module dependencies.
 */

var express = require('express')
, routes = require('./routes/main')
, user = require('./routes/user')
, http = require('http')
, path = require('path');

var app = express();

app.configure(function(){
    app.set('port', process.env.listenport || 1337);
    app.set('views', __dirname + '/views');
    app.set('view engine', 'ejs');
    app.use(express.favicon());
    app.use(express.logger('dev'));
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express.cookieParser());
    app.use(express.session({ 
        secret: 'chat' 
    }));
    app.use(express.session({
        secret: "chat"
    }));
    app.use(app.router);
    app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
    app.use(express.errorHandler());
});

app.get('/', routes.index);
app.get('/users', user.list);

server = http.createServer(app); // add
//http.createServer(app).listen(app.get('port'), function(){ // del
server.listen(app.get('port'), function(){ //add
    console.log("Express server listening on port " + app.get('port'));
});

// add start
var socketIO = require('socket.io');
var io = socketIO.listen(server, {
    'log level': 2
});
var _userid = 0;

io.sockets.on('connection', function(socket) {
    //  _userid ++;
    socket.on('enter', function(data) {
        socket.handshake.username = data.name;
        socket.broadcast.emit('login', {
            username: socket.handshake.username
        });
    });
    socket.on('message', function(data) {
        console.log("message");
        socket.broadcast.emit('message', {
            username: socket.handshake.username ,
            value: data.value
        });
    });

    socket.on('disconnect', function(){
        socket.broadcast.emit('logout', {
            username: socket.handshake.username
        });
        socket.handshake.username = "";
    });
});
// add end
