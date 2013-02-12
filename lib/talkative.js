var gtalk = require("./connector")
  , cookie = require('cookie')
  , express = require('express')
  , RedisStore = require('connect-redis')(express);

var activeSessions = {};

var sessionStore = new RedisStore();

module.exports = {

	signin: function(jid, pwd, callback) {

		if(activeSessions[jid]){
			delete activeSessions[jid];
		}

		gtalk.getXmppClient(jid, pwd, function(err, xmppConnector) {
			if(err) {callback(err); return;}
			activeSessions[jid] = { 
				connector: xmppConnector
			};
			callback();
		});
	},

	configureSocket: function(io) {
		io.configure(function (){
			io.set("transports", ["xhr-polling"]); 
  			io.set("polling duration", 10); 
  			
			io.set('authorization', function (handshakeData, callback) {
				if (handshakeData.headers.cookie) {
					handshakeData.cookie = cookie.parse(decodeURIComponent(handshakeData.headers.cookie));
					handshakeData.sessionID = handshakeData.cookie['connect.sid'].substring(2, 26);
					console.log("on authaurization session: "+handshakeData.sessionID);
					sessionStore.get(handshakeData.sessionID, function (err, session) {
						if (err || !session) {
							console.error('handshake error : '+err);
							return callback(null, false);
						} else {
							console.log('handshake success : ',session);
							handshakeData.session = session;
							return callback(null, true);
						}
					});
				}
				else {
					return callback(null, false);
				}
			});
			
			io.sockets.on('connection', function (socket) {

				var jid = socket.handshake.session._id;
				console.log("socket connection of "+jid);

				if(activeSessions[jid] == undefined){
					throw new Error("session could not be found in activeSessions for jid ["+jid+"]");
				}

				var sessionData = activeSessions[jid];
				sessionData.socket = socket;
				sessionData.connector.notify = notify;
				sessionData.connector.notify(jid);
				socket.on('message',function(data) {
					sessionData.connector.sendMessage(data);
				});
				socket.on('disconnect', function () {
					delete activeSessions[jid];
				});

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
	console.log("notify incoming for : "+jid);
	var sessionData = activeSessions[jid];
	sessionData.connector.incomingMessageQueue.forEach(function(message) {
		onReceiveMessage(jid,message);
	});
	sessionData.connector.incomingMessageQueue = [];

	sessionData.connector.incomingPresenceQueue.forEach(function(presence) {
		onReceivePresence(jid,presence);
	});
	sessionData.connector.incomingPresenceQueue = [];
};
