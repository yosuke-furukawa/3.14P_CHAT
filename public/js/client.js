var socket;
if (location.hostname === "localhost") {
    socket = io.connect('http://localhost:1337');
} else {
    socket = io.connect('http://3-14p.c.node-ninja.com');
}
location.hash = "";

function showStatus(message) {
    $("#status")
    .stop(true,false)
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

function sendMessage(parameters) {
    var msg = $("#message").val();
    if(msg !="" || msg != "\n") {
        socket.emit('message', {
            userid: location.hash.replace("#",""),
            message: msg
        });
        var date = new Date();
        $('<div class="chatnaiyou"></div>')
        .html( "<span class='userid'>自分</span>"
            + "<span class='date'>" + date.getTime() +"</span>"
            + "<div class='message'>" + textFormat(msg) +"</span>")
        .prependTo('#chatlist');
    }
    $("#message").val("");
}

function textFormat(text) {
    return text.replace(/ /g, "&nbsp;").replace(/\r\n|\n|\r/g, "<br>");
}

socket.on('connect', function(data) {  //接続したら
    socket.on('login', function(data) {
        showStatus(data.userid + "がログインしたお");
        $("#userlist")
        .append('<li><a href="#' + data.userid +'">' + data.userid +"さん</a></li>");
    });
    socket.on("logout", function(data){
        showStatus(data.userid + "がログアウトしたお");
        $("#userlist").each(function() {
            if ($(this).find("li a").html() === data.userid + "さん") {
                console.log($(this).find("li").remove());
            }
        });
    });
    
    $("#send").click(sendMessage)
    
    $("#message").keypress(function (e){
        if ((e.which && e.which === 13) ||
            (e.keyCode && e.keyCode === 13)) {
            sendMessage();
        }else{
            socket.emit("editing",{
                userid: location.hash.replace("#",""),
                message: $("#message").val()
            });
        }
    });
    var audio = new Audio();
    audio.src = "http://taira-komori.jpn.org/sfxr/sfxrse/01pickup/coin01.mp3";
    socket.on('message', function(data) {
        $('<div class="chatnaiyou"></div>')
        .html( "<span class='userid'>" + data.userid +"</span>"
            + "<span class='date'>" + data.date +"</span>"
            + "<div class='message'>" + textFormat(data.message) +"</span>")
        .prependTo('#chatlist');
        
        audio.play();
    });
    socket.on('list', function(data) {
        for (d in data) {
            $("#userlist")
            .append('<li><a href="#' + data[d] +'">' + data[d] +"さん</a></li>");
        }
    });
    socket.on("reload", function(data){
        //location.reload();
    });

});

socket.on("error", function (err) {
    showStatus("エラー　エラー情報は、コンソールに入ってるお");
    console.log(err);
    location.reload()
});

