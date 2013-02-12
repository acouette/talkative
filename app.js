
/**
 * Module dependencies.
 */

var express = require('express')
  , signin = require('./routes/signin')
  , chatroom = require('./routes/chatroom')
  , http = require('http')
  , talkative = require('./lib/talkative');

var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set("view options", {layout: false});
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.cookieParser());
  app.use(express.session({secret: 'secret', store: talkative.getSessionStore() }));
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname, '/public'));
  // make a custom html template
  app.engine('html', require('ejs').renderFile);
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/', signin.index);
app.post('/signin', signin.signin);


app.get('/chatroom', chatroom.welcome);

var server = http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});

var io = require('socket.io').listen(server);

talkative.configureSocket(io);