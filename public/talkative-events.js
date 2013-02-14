$(function () {

	var socket = io.connect(location.host);

	socket.on('presence', function (data) {
		
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
		var id = hashCode(data.from);
		$('#textarea-'+id).val($('#textarea-'+id).val() + '\n'+data.from+' : '+data.body);
	});

});