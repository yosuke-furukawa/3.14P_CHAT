exports.index = function(req, res){
    if (req.session.userid) {
        res.render('chat', {
            title: 'socket.io'
        });
    } else {
        res.render('login',{userid: req.session.userid});
    }
    
};
exports.login = function (req, res) {
    req.session.userid = req.body.userid;
    res.redirect("back");
    console.log(req.session);
};
exports.debug = function(req, res){
    res.send("session.userid: " + req.session.userid + "<br>");
};