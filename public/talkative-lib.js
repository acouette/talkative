String.prototype.hashCode = function(){
	var hash = 0, i, char;
	if (this.length == 0) return hash;
	for (i = 0; i < this.length; i++) {
		char = this.charCodeAt(i);
		hash = ((hash<<5)-hash)+char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
};

$(function () {



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

      //underscore templating
      _.templateSettings.escape = /\{\{(.*?)\}\}/g;
      var menuTemplate = _.template( $("#menu-template").html());
      var tabTemplate = _.template( $("#tab-template").html());
      var chatTemplate = _.template( $("#chat-template").html());



      var socket = io.connect('http://localhost:3000');

      
      socket.on('presence', function (data) {

      	var id = data.from.hashCode();

      	if(!document.getElementById('menu'+id)){

      		var menuItem = menuTemplate({id: id, from: data.from});
      		var elem$ = $(menuItem);
      		elem$.click(function() {
      			createChat(socket, data);
      		});

      		$('#contact-list').append(elem$);
      		$('#contact-list').show();
      	}

      });

      socket.on('message', function (data) {
      	createChat(socket, data);
      	var id = data.from.hashCode();
      	$('#textarea-'+id).val($('#textarea-'+id).val() + '\n'+data.from+' : '+data.body);
      });
      
  });