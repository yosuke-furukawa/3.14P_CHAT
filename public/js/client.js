var socket;
if (location.hostname === "localhost") {
    socket = io.connect('http://localhost:1337');
} else if(location.hostname === "3-14p.c.node-ninja.com") {
    socket = io.connect('http://3-14p.c.node-ninja.com');
}
location.hash = "";

function showStatus(message) {
    $("#status")
    .text(message)
    .animate({
        top: "40px"
    },1000)
    .animate({
        top: "30px"
    },500)
    .delay(2000)
    .animate({
        top: "-100px"
    }).click(function () {
        $("#status").stop(true,false)
        .animate({
            top: "-100px"
        });
    });
}

socket.on('connect', function(data) {  //接続したら
    $("#cover").fadeIn();
    function enter(){
        var name = $("#entertext").val();
        if (name !== "") {
            socket.emit("enter", {
                name: name
            });
            $("#cover").fadeOut();
        }else{
            $("#enterform p").css("color","red");
        }
        socket.on('login', function(data) {
            showStatus(data.username + "がログインしたお");
            $("#userlist")
            .append('<a href="#' + data.username +'">' + data.username +"さん</a><br>");
        });
        socket.on("logout", function(data){
            showStatus(data.username + "がログアウトしたお");
        });
    }
    $("#enterform button").click(enter);
    
    $("#message").keypress(function (e){
        if ((e.which && e.which === 13) ||
            (e.keyCode && e.keyCode === 13)) {
            var msg = $("#message").val();
            if(msg !=="" || msg !== "\n") {
                socket.emit('message', {
                    username: location.hash.replace("#",""),
                    message: msg
                });
                var date = new Date();
                $('<div class="chatnaiyou"></div>')
                .html( "<span class='userid'>自分</span>"
                    + "<span class='date'>" + Math.round(date.getTime() / 1000) +"</span>"
                    + "<div class='message'>" + msg +"</span>")
                .prependTo('#chatlist');
            }
            $("#message").val("");
        }
    });
    $("#entertext").keypress(function(e){
        if ((e.which && e.which === 13) ||
            (e.keyCode && e.keyCode === 13)) {
            enter();
            return false;
        } else {
            return true;
        }
    });
    socket.on('message', function(data) {
        $('<div class="chatnaiyou"></div>')
        .html( "<span class='userid'>" + data.username +"</span>"
            + "<span class='date'>" + data.date +"</span>"
            + "<div class='message'>" + data.message +"</span>")
        .prependTo('#chatlist');
        var audio = new Audio();
        audio.src = "http://taira-komori.jpn.org/sfxr/sfxrse/01pickup/coin01.mp3";
        audio.play();
    });
    socket.on('list', function(data) {
        for (d in data) {
            $("#userlist")
            .append('<a href="#' + data[d] +'">' + data[d] +"さん</a><br>");
        }
    });
});

