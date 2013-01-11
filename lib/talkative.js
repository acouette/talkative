var gtalk = require("../gtalk/connector")
  , cookie = require('cookie')
  , express = require('express')
  , MemoryStore = express.session.MemoryStore;

var activeSessions = [];

var sessionStore = new MemoryStore();

module.exports = {

	signin: function(jid, pwd, callback) {
		if(activeSessions[jid]){
			callback();
		}else{
			gtalk.getXmppClient(jid, pwd, function(err, xmppConnector) {
				if(err) {callback(err); return;}
				activeSessions[jid] = new Session(jid, xmppConnector);
				callback();
			});
		}
	},

	configureSocket: function(io) {
		io.configure(function (){
			io.set('authorization', function (handshakeData, callback) {
				if (handshakeData.headers.cookie) {
					handshakeData.cookie = cookie.parse(decodeURIComponent(handshakeData.headers.cookie));
					handshakeData.sessionID = handshakeData.cookie['connect.sid'].substring(2, 26);
					console.log(handshakeData.sessionID);
					sessionStore.get(handshakeData.sessionID, function (err, session) {
						if (err || !session) {
							console.error('error : '+err);
							return callback(null, false);
						} else {
							handshakeData.session = session;
							io.sockets.on('connection', function (socket) {

								//configure socket behaviour on receive connection
								if(!activeSessions[session._id].socket){
									console.log("init socket for : "+ session._id);
									activeSessions[session._id].socket = socket;
									activeSessions[session._id].connector.notify = notify;
									activeSessions[session._id].connector.notify(session._id);
									socket.on('message',function(data) {
										activeSessions[session._id].connector.sendMessage(data);
									});
									socket.on('disconnect', function () {
										activeSessions[session._id] = undefined;
										activeSessions = activeSessions.filter(function(a){return a != undefined;});
										console.log("hehe "+activeSessions);
									});
								}
							});
							return callback(null, true);
						}
					});
				}
				else {
					return callback(null, false);
				}
			});
			
		});
	},
	getSessionStore: function() {
		return sessionStore;
	}

}

function onReceiveMessage (jid, message) {
	activeSessions[jid].socket.emit('message',message);
}

function onReceivePresence (jid, presence) {
	activeSessions[jid].socket.emit('presence',presence);
}


function notify (jid) {
	console.log("notify incoming Message for : "+jid);
	activeSessions[jid].connector.incomingMessageQueue.forEach(function(message) {
		onReceiveMessage(jid,message);
	});
	activeSessions[jid].connector.incomingMessageQueue = [];

	activeSessions[jid].connector.incomingPresenceQueue.forEach(function(presence) {
		onReceivePresence(jid,presence);
	});
	activeSessions[jid].connector.incomingPresenceQueue = [];
};


function Session(jid, connector, socket){
	this.jid= jid;
	this.connector= connector;
	this.socket= socket;
};

