//jQuery UI--------------------------------------
var tabTitle = $( "#tab_title" ),
tabContent = $( "#tab_content" ),
tabTemplate = "<li><a href='#{href}'>#{label}</a> <span class='ui-icon ui-icon-close' role='presentation'>Remove Tab</span></li>",
tabCounter = 2;


var tabs = $( "#tabs" ).tabs()

// actual addTab function: adds new tab using the input from the form above
function addTab(param) {
    param = param?param:{
        userid:""
    }
    var label = param.userid || "anonymous" + tabCounter,
    id = "tabs-" + tabCounter,
    li = $( tabTemplate.replace( /#\{href\}/g, "#" + id ).replace( /#\{label\}/g, label ) ),
    tabContentHtml = '<div id="chat">'+
    '<textarea id="message" placeholder="メッセージを入力"></textarea>'+
    '<button id="send">メッセージを送信</button>'+
    '<div id="chatlist"></div>'+
    "</div>",
    sameFlag = false,
    returnobj;
    //if ($("#tabs").find( ".ui-tabs-nav li:contains('" + label + "')" ).length == 0) {
    tabs.find( ".ui-tabs-nav li a" ).each(function () {
        if ($(this).text() === label) {
            sameFlag = true;
            return false;
        }
    });
    if (sameFlag === false) {
        tabs.find( ".ui-tabs-nav" ).append( li );
        tabs.append( "<div id='" + id + "'><p>" + tabContentHtml + "</p></div>" );
        tabs.tabs( "refresh" );
        tabCounter++;
        tabs.find( ".ui-tabs-nav li a" ).each(function () {
            if ($(this).text() === label) {
                returnObj = this
                return false;
            }
        });
        return returnObj;
    }
}

// close icon: removing the tab on click
tabs.delegate( "span.ui-icon-close", "click", function() {
    var panelId = $( this ).closest( "li" ).remove().attr( "aria-controls" );
    $( "#" + panelId ).remove();
    tabs.tabs( "refresh" );
});

tabs.bind( "keyup", function( event ) {
    if ( event.altKey && event.keyCode === $.ui.keyCode.BACKSPACE ) {
        var panelId = tabs.find( ".ui-tabs-active" ).remove().attr( "aria-controls" );
        $( "#" + panelId ).remove();
        tabs.tabs( "refresh" );
    }
});

//socket.io----------------------------------

var socket;
if (location.hostname === "localhost") {
    socket = io.connect('http://localhost:8080', {"sync disconnect on unload": true});
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
    var msg = $("#tabs div[aria-hidden='false'] #chat #message").val();
    if(msg !="" || msg != "\n" || msg != "\r" 
        || msg != "\r\n" || msg != "\n\r") {
        socket.emit('message', {
            userid: $("#tabs ul li[aria-selected='true'] a").html(),
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
        //$('#userlist li a:contains("' + data.userid + '")').remove();
        $('#userlist li a').each(function () {
            if (($(this).text()) === data.userid + "さん") {
                $(this).remove()
            }
        });
    });
    
    $(document).on("click","#send", function () {
        sendMessage();
    });
    
    $(document).on("keypress","#tabs #message", function (e){
        if ((e.which && e.which === 13) ||
            (e.keyCode && e.keyCode === 13)) {
            sendMessage();
        }else{
        /*socket.emit("editing",{
                userid: location.hash.replace("#",""),
                message: $("#message").val()
            });*/
        }
    });
    var audio = new Audio();
    audio.src = "http://taira-komori.jpn.org/sfxr/sfxrse/01pickup/coin01.mp3";
    socket.on('message', function(data) {
        var panel;
        $('#tabs ul li[role="tab"] a').each(function () {
            if (($(this).text()) === data.userid) {
                panel = $(this).parent()
            }
        });
        if (typeof panel === "undefined") {
            panel = $(addTab({
                userid: data.userid
            })).parent();
        }
        var panelid = panel.attr("aria-controls");
        $('<div class="chatnaiyou"></div>')
        .html( "<span class='userid'>" + data.userid +"</span>"
            + "<span class='date'>" + data.date +"</span>"
            + "<div class='message'>" + textFormat(data.message) +"</span>")
        .prependTo('#tabs #' + panelid + ' #chatlist');
        for (var i = 0; i < 3; i++) {
            panel.css({
                backgroundColor: "#ff9900"
            });
            setTimeout(function (parameters) {
                panel.css({
                    backgroundColor: ""
                })
            },2000);
        }
        audio.play();
        delete panel;
    });
    socket.on('list', function(data) {
        for (d in data) {
            $("#userlist")
            .append('<li><a href="#' + data[d] +'">' + data[d] +"さん</a></li>");
        }
        
    });
    $(document).on("click","#userlist a", function (e) {
        e.preventDefault();
        addTab({
            userid: $(this).attr("href").replace("#", "")
        });
    });

});

socket.on("error", function (err) {
    showStatus("エラー　エラー情報は、コンソールに入ってるお");
    console.log(err);
});

socket.on('reconnect_failed', function () {
    location.reload();
    console.log("reconnect_failed")
});
socket.on('reconnecting', function () {
    location.reload()
    console.log("reconnecting")
});
socket.on('connect_failed', function () {
    location.reload();
    console.log("connect_failed")
});
