//3.14P_CHAT/
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
app.configure("production",function(){
    app.set('port', process.env.PORT || 80);
});

app.configure('development', function(){
    app.set('port', process.env.listenport || 1337);
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
var _userid = 0
,sessionlist = new Array()
,userList = new Array();

io.sockets.on('connection', function(socket) {
    socket.on('enter', function(data) {
        var name = data.name;
        socket.handshake.username = name;
        io.sockets.socket(socket.id).emit("list" ,userList);
        socket.broadcast.emit('login', {
            username: socket.handshake.username
        });
        sessionlist[name] = socket.id;
        userList.push(name)
    });
    socket.on('message', function(data) {
        var date = new Date();
        console.log("message");
        io.sockets.socket(sessionlist[data.username]).emit('message', {
            username: socket.handshake.username ,
            message: data.message,
            date: Math.round((new Date()).getTime() / 1000)
        });
    });

    socket.on('disconnect', function(){
        socket.broadcast.emit('logout', {
            username: socket.handshake.username
        });
        delete sessionlist[socket.handshake.username];
        var len = userList.length - 1;
        var i;
        for(i = len; i >= 0; i--){
            if(userList[i] == socket.handshake.username){
                userList.splice(i,1);
            }
        }
        socket.handshake.username = "";
    });
});
// add end