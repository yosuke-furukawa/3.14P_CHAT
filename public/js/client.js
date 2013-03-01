var socket = io.connect('http://localhost:1337');
socket.on('connect', function(data) {  //接続したら
    $("#cover").fadeIn();
    function enter(){
        
        socket.emit("enter", {
            name:$("#entertext").val()
        });
        $("#cover").fadeOut();
    }
    $("#enterform button").click(enter);
    
    $("#message").keypress(function (e){
        if ((e.which && e.which === 13) ||
            (e.keyCode && e.keyCode === 13)) {
            var msg = $("#message").val();
            if(msg !=="") {
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
    socket.on('login', function(data) {
        //(ry
    });
    socket.on('list', function(data) {
        for(var i=1;i<data.length;i++){
            $('<a href="#' + i +">" + i +"番目の人</a>" )
            .appendTo("#userlist");
        }
    });
});

