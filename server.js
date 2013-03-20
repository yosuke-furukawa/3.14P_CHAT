//3.14P_CHAT/server.js
/**
 * Module dependencies.
 */

var express = require('express'),
    routes = require('./routes/main'),
    user = require('./routes/user'),
    http = require('http'),
    path = require('path');
var sessionStore = new express.session.MemoryStore(),
    connect = require('connect'),
    Session = connect.middleware.session.Session;

var app = express();

app.configure(function() {
    app.set('views', __dirname + '/views');
    app.set('view engine', 'ejs');
    app.set('secretKey', 'mySecret');
    app.set('cookieSessionKey', 'sid');
    app.use(express.favicon());
    app.use(express.logger('dev'));
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express.cookieParser(app.get('secretKey')));
    app.use(express.session({
        key: app.get('cookieSessionKey'),
        store: sessionStore
    }));
    app.use(app.router);
    app.use(express.static(path.join(__dirname, 'public')));
});
app.configure("production", function() {
    app.set('port', process.env.PORT || 80);
});

app.configure('development', function() {
    app.set('port', process.env.listenport || 1337);
    app.use(express.errorHandler());
});

app.get('/', routes.index);
app.post('/login', routes.login);
app.get("/debug", routes.debug)

server = http.createServer(app); // add
//http.createServer(app).listen(app.get('port'), function(){ // del
server.listen(app.get('port'), function() { //add
    console.log("Express server listening on port " + app.get('port'));
});

// Socket.IO スタート
var socketIO = require('socket.io');
var io = socketIO.listen(server, {
    'log level': 2
});
var _userid = 0,
    sessionlist = new Array(),
    userList = new Array();

io.set('authorization', function(handshakeData, callback) {
    if (handshakeData.headers.cookie) {
        //cookieを取得
        var cookie = require('cookie').parse(decodeURIComponent(handshakeData.headers.cookie));
        //cookie中の署名済みの値を元に戻す
        cookie = connect.utils.parseSignedCookies(cookie, app.get('secretKey'));
        //cookieからexpressのセッションIDを取得する
        var sessionID = cookie[app.get('cookieSessionKey')];

        // セッションデータをストレージから取得
        sessionStore.get(sessionID, function(err, session) {
            if (err) {
                //セッションが取得できなかったら
                console.dir(err);
                callback(err.message, false);
            } else if (!session) {
                console.log('session not found');
                callback('session not found', false);
            } else {
                console.log("authorization success");

                // socket.ioからもセッションを参照できるようにする
                handshakeData.cookie = cookie;
                handshakeData.sessionID = sessionID;
                handshakeData.sessionStore = sessionStore;
                handshakeData.session = new Session(handshakeData, session);

                callback(null, true);
            }
        });
    } else {
        //cookieが見つからなかった時
        return callback('cookie not found', false);
    }
});

io.sockets.on('connection', function(socket) {
    console.log(socket.handshake.session);
    var intervalID = setInterval(function() {
        // 一度セッションを再読み込み
        socket.handshake.session.reload(function() {
            // lastAccess と maxAge を更新
            socket.handshake.session.touch().save();
        });
    }, 1000 * 60);

    io.sockets.socket(socket.id).emit("list", userList);
    socket.broadcast.emit('login', {
        userid: socket.handshake.session.userid
    });
    sessionlist[socket.handshake.session.userid] = socket.id;
    userList.push(socket.handshake.session.userid)

    socket.on('message', function(data) {
        var date = new Date();
        console.log("message");
        io.sockets.socket(sessionlist[data.userid]).emit('message', {
            userid: socket.handshake.session.userid,
            message: data.message,
            date: Math.round((new Date()).getTime() / 1000)
        });
    });

    socket.on('editing', function(data) {
        io.sockets.socket(sessionlist[data.userid]).emit('editing', {
            userid: socket.handshake.session.userid,
            message: data.message
        });
    });

    socket.on('disconnect', function() {
        socket.broadcast.emit('logout', {
            userid: socket.handshake.session.userid
        });
        delete sessionlist[socket.handshake.session.userid];
        var len = userList.length - 1;
        var i;
        for (i = len; i >= 0; i--) {
            if (userList[i] == socket.handshake.session.userid) {
                userList.splice(i, 1);
            }
        }
        clearInterval(intervalID);
    });
});
// add end