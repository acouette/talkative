exports.welcome = function(req, res){
	if(req.session._id)
  		res.render('chatroom.html', { title: 'talkative' });
  	else
  		res.redirect('/');
};
