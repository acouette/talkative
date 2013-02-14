function hashCode (str){
	var hash = 0, i, char;
	if (str.length == 0) return hash;
	for (i = 0; i < str.length; i++) {
		char = str.charCodeAt(i);
		hash = ((hash<<5)-hash)+char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
};

var createChat = function(socket, data){
	var id = data.from.hashCode();
	if(!document.getElementById(id)){

		var data = {
			id: id,
			from: data.from
		};

		$('#myTabMenu').append(tabTemplate(data));
		$('#myTabContent').append(chatTemplate(data));
		$('#myTabContent').show();
		$('#myTabMenu a:last').tab('show');
	}

	var sendMsg = function(){
		return sendMsg(socket, $('#input-'+id), data.from, $('#textarea-'+id));
	}

	$('#send-'+id).click(function() {
		sendMsg(socket, $('#input-'+id), data.from, $('#textarea-'+id));
	});

	$('#input-'+id).keydown(function(event) {
		if (event.which == 13) {
			sendMsg(socket, $('#input-'+id), data.from, $('#textarea-'+id));
		}
	});
};



function sendMsg (socket, input$, to, textarea$) {
	var msgBody = input$.val();
	if(msgBody){
		socket.emit('message', {to: to, body: msgBody});
		textarea$.val(textarea$.val() + '\nme: '+msgBody);
		input$.val('');
	}
}
