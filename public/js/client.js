var socket = io.connect('http://localhost:1337');
socket.on('connect', function(data) {
    $("#enter").fadeIn();
    $("#enterform button").click(function(){
        socket.emit("enter", {
            name:$("#entertext").val()
        });
        $("#enter").fadeOut();
    });
    
    $("#chatform button").click(function (){
        var msg = $("#message").val();
        if(msg !=="") {
            socket.emit('message', {
                value: msg
            });
            $("#receiveMsg").prepend("自分:" + msg + "<br>\n");
        }
        $("#message").val("");
    });

});

socket.on('message', function(data) {
    $("#receiveMsg").prepend(data.username + ":" + data.value + "<br>\n");
});