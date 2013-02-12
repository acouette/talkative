var talkative = require("../lib/talkative.js");

exports.index = function(req, res){
  res.render('signin.html', { title: 'talkative' });
};

exports.signin = function(req, res){

	talkative.signin(req.body.email,req.body.pwd, function(err) {
		if(err){
			res.redirect('/?error='+err);
		}else{
			if(req.session == undefined){
				throw Error("session could not be retrieved. Is redis started?");
			}
			req.session._id = req.body.email;
			res.redirect('/chatroom');
		}
	});
};