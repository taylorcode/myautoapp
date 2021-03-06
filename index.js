var express = require('express')

var app = express();

var server = require('http').Server(app);

var twilio = require('twilio');

var client = require('twilio')('AC3f8bb9312dc542b543b50bd06ec23dce', 'e1e8451d762b0f10c048c4b34aec0dd8');

var mongo = require('mongodb');

var bodyParser = require('body-parser');

var mongoUri = process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || 'mongodb://localhost/myauto';

var io = require('socket.io')(server);

var models = require('./models/models.js');

var mongoose = require('mongoose');

var passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy;

passport.use(new LocalStrategy(

  function(username, password, done) {

    models.User.findOne({ username: username }, function (err, user) {

      if (err) { return done(err); }
      if (!user) {
        return done(null, false, { message: 'Incorrect username.' });
      }
      if (!user.validPassword(password)) {
        return done(null, false, { message: 'Incorrect password.' });
      }
      return done(null, user);
    });
  }
));

mongoose.connect(mongoUri, function(err, db) {
	if (err) {
	  throw err;
	}
	return console.log('Successfully connected to MyAuto MongoDB.');
});

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({
  extended: true
}));


app.set('port', (process.env.PORT || 5000))

app.use(express.static(__dirname + '/public'));

/*
io.on('connection', function(socket){
  console.log('a user connected');

  socket.on('join', function (roomDetails) {

  	// perform authentication of room

  	// if there is a rep, then connect to this room

  	socket.join(roomDetails._id);

  	console.log(roomDetails._id);

  	io.to(roomDetails._id).emit('fire client event', {data: 'cat food'});

  });

  socket.on('disconnect', function(){
    console.log('user disconnected');
  });

});


app.get('/representative/:id/messages', function (req, res, next) {

	// NOTE should we check if there is a representative?

	models.Message.find({_representative: req.params.id}, function (err, messages) {
		if(err) return next(err);
		// NOTE can this be an empty array?
		if(!messages) return console.log('no messages found');

		res.send(messages);

	});

});

// send a message from a user to representative (save the message)
app.post('/messages', function (req, res) {


  console.log('RESPONSE FROM TWILIO:');

  console.log(req.body, req.params);

  var data = req.body;

  // USE promise chain
  models.User.findOne({phone: data.From}).exec(function (err, user) {

  	if(!user) {
  		console.log('NO USER FOUND');
  		return
  	}

  	if(err) return;

	  // look up the representative
	  // NOTE findone, although it should be unique!
	  models.Representative.findOne({phone: data.To}).exec(function (err, rep) {

	  	if(!rep) {
	  		console.log('NO REP FOUND');
	  		return
	  	}

	  	// NOTE IF ERR RETURN NO REP OR SOMETHING - see what happens when you have invalid phone
	  	console.log('here he is', rep._id);

	  	// representative found, valid message, store it
	  	var newMessage = new models.Message({
	  		text: data.Body,
	  		_user: user._id,
	  		_representative: rep._id
	  	});

	  	console.log('new message', newMessage);

		newMessage.save();

	  	setTimeout(function () {
	  		console.log('timeout expired');
	  		io.to(rep._id).emit('message from customer', {data: data.Body});
	  	}, 3000);

	  });

  });

});


app.post('/messages/user', function (req, res, next) {

	var data = req.body;

	models.User.findById(data._user, function (err, user) {

		console.log('found the user', user);

		// get the representatives number (although this should be stored anyway for the current rep or something)
		models.Representative.findById(data._representative, function (err, rep) {
			console.log('found the rep', rep);


			// crate the message, have an API for sending a created message (maybe a method of the message schema)

		  	// representative found, valid message, store it
		  	var newMessage = new models.Message({
		  		text: data.text,
		  		_user: user._id,
		  		_representative: rep._id
		  	});

		  	console.log('new message created.', newMessage);

			newMessage.save();


			console.log('TWILIO MESSAGE ', {

			    to: user.phone,
			    from: rep.phone,
			    body: data.text

			}, 'THERE IT WAS');
			// if validation is successful

			client.sendMessage({

			    to: user.phone,
			    from: rep.phone,
			    body: data.text

			}, function(err, responseData) { //this function is executed when a response is received from Twilio

			    if (!err) { // "err" is an error received during the request, if any

			        // "responseData" is a JavaScript object containing data received from Twilio.
			        // A sample response from sending an SMS message is here (click "JSON" to see how the data appears in JavaScript):
			        // http://www.twilio.com/docs/api/rest/sending-sms#example-1

			        console.log(responseData.from); // outputs "+14506667788"
			        console.log(responseData.body); // outputs "word to your mother."

			        res.send(newMessage);

			    }
			});

		});

	});

});
*/

server.listen(app.get('port'), function(){
	console.log("Node app is running at localhost:" + app.get('port'));
});

// app.listen(app.get('port'), function() {
//   console.log("Node app is running at localhost:" + app.get('port'));
// })
