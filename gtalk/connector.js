var xmpp = require("node-xmpp");



exports.getXmppClient = function(jid, pwd, callback) {

	console.log("building connector for jid ["+jid+"]");


	var cl = new xmpp.Client({ jid: jid, password: pwd });

	cl.on('online', function() {
			cl.send(new xmpp.Element('presence', { }).
				c('show').t('chat').up().
				c('status').t('Happily echoing your <message/> stanzas')
			);
			cl.incomingMessageQueue = [];
			cl.incomingPresenceQueue = [];
			console.info("Connected to server jid : "+jid);
			callback(null,cl);
		});
	cl.on('error', function(e) {
		console.error('error',e);
		callback(e);
	});


	cl.on('stanza', function(stanza) {
		console.info("incoming stanza :\n"+stanza);
		if (stanza.is('message') && stanza.attrs.type !== 'error') {
			console.log(stanza);
			cl.incomingMessageQueue.push({
				from: stanza.attrs.from.split('/')[0],
				body: stanza.getChild('body').getText()
			});
		}
		else if (stanza.is('presence') && stanza.attrs.type !== 'error') {
			cl.incomingPresenceQueue.push({
				from: stanza.attrs.from.split('/')[0]
			});
		}
		if(cl.notify) {
			cl.notify(jid);
		}
	});

	cl.sendMessage = function(data){
		this.send(new xmpp.Message({ type: 'chat', to: data.to }).c('body').t(data.body));
	};
};

	