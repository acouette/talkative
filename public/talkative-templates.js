//underscore templating
_.templateSettings.escape = /\{\{(.*?)\}\}/g;
var menuTemplate = _.template( $("#menu-template").html())
	,tabTemplate = _.template( $("#tab-template").html())
	,chatTemplate = _.template( $("#chat-template").html());