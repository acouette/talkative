var connector = require("../gtalk/connector.js");

exports.signin = function(req,res){
	connector.signin(req.body.email,req.body.pwd, function(err) {
		var response = {};
		if(err){
			response.code=500;
			response.message= err;
			res.send(response);
		}else{
			req.session._id = req.body.email;
			response.code=200;
			res.send(response);
		}
	});
	
}


exports.contacts = function(req,res) {
	connector.contacts(req.session._id ,function(err,result){
		var response = {};
		if(err){
			response.code=500;
		}else{
			response.code=200;
			response.contacts= result;
			res.send(response);
		}
	});
};