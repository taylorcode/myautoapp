var express = require('express')

var app = express();

var twilio = require('twilio');

var client = require('twilio')('AC3f8bb9312dc542b543b50bd06ec23dce', 'e1e8451d762b0f10c048c4b34aec0dd8');

var mongo = require('mongodb');

var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var ObjectId = Schema.Types.ObjectId;

var bodyParser = require('body-parser');

var mongoUri = process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || 'mongodb://localhost/myauto';

var server = require('http').Server(app);

var io = require('socket.io')(server);

var extend = require('mongoose-schema-extend');


var passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy;

passport.use(new LocalStrategy(

  function(username, password, done) {

    User.findOne({ username: username }, function (err, user) {

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

app.use(express.static(__dirname + '/public'))

app.get('/food', function(req, res){
  res.send({
  	test: 'food'
  });
});


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


var UserSchema = new Schema({
	firstName: String,
	lastName: String,
	phone: String/*,
	discriminatorKey: '_type'*/
});

var User = mongoose.model('User', UserSchema);

var RepresentativeSchema = UserSchema.extend({
	_company: {
		type: ObjectId,
		ref: 'Company'
	}
});

var Representative = mongoose.model('Representative', RepresentativeSchema);

var CompanySchema = new Schema({
	name: String,
	phone: String
});

var Company = mongoose.model('Company', CompanySchema);

var MessageSchema = new Schema({
	text: String,
	_user: {
		type: ObjectId,
		ref: 'User'
	},
	_representative: {
		type: ObjectId,
		ref: 'Representative'
	}
});

var Message = mongoose.model('Message', MessageSchema);

/* TEST MAKING REP
var testRep = new Representative({
	firstName: 'Taylor',
	lastName: 'McIntyre',
	phone: '+19163475297'
});


/// logic crap

testRep.save();
*/
/* Test user
var testUser = new User({
	firstName: 'Taylor',
	lastName: 'McIntyre',
	phone: '+19162252910'
});


/// logic crap

testUser.save();
*/

app.get('/representative/:id/messages', function (req, res, next) {

	// NOTE should we check if there is a representative?

	Message.find({_representative: req.params.id}, function (err, messages) {
		if(err) return next(err);
		// NOTE can this be an empty array?
		if(!messages) return console.log('no messages found');

		res.send(messages);

	});

});

// send a message from a user to representative (save the message)
app.post('/messages', function (req, res) {

/*
2014-11-03T03:41:07.271656+00:00 app[web.1]: { ToCountry: 'US',
2014-11-03T03:41:07.271674+00:00 app[web.1]:   FromCountry: 'US',
2014-11-03T03:41:07.271676+00:00 app[web.1]:   To: '+19163475297',
2014-11-03T03:41:07.271677+00:00 app[web.1]:   ToZip: '',
2014-11-03T03:41:07.271679+00:00 app[web.1]:   MessageSid: 'SM4d717dbc058687a3759486409f7686c5',
2014-11-03T03:41:07.271680+00:00 app[web.1]:   AccountSid: 'AC3f8bb9312dc542b543b50bd06ec23dce',
2014-11-03T03:41:07.271681+00:00 app[web.1]:   From: '+19162252910',
2014-11-03T03:41:07.271683+00:00 app[web.1]:   ApiVersion: '2010-04-01' } {}
2014-11-03T03:41:07.271661+00:00 app[web.1]:   SmsMessageSid: 'SM4d717dbc058687a3759486409f7686c5',
2014-11-03T03:41:07.271659+00:00 app[web.1]:   ToState: 'CA',
2014-11-03T03:41:07.271662+00:00 app[web.1]:   NumMedia: '0',
2014-11-03T03:41:07.271664+00:00 app[web.1]:   ToCity: '',
2014-11-03T03:41:07.271665+00:00 app[web.1]:   FromZip: '95628',
2014-11-03T03:41:07.271667+00:00 app[web.1]:   SmsSid: 'SM4d717dbc058687a3759486409f7686c5',
2014-11-03T03:41:07.271670+00:00 app[web.1]:   SmsStatus: 'received',
2014-11-03T03:41:07.271672+00:00 app[web.1]:   FromCity: 'FAIR OAKS',
2014-11-03T03:41:07.271673+00:00 app[web.1]:   Body: 'Ugh'
*/

  // var msg = new Message({
  // 	text: 'text received XXXXXX'
  // });

  console.log('RESPONSE FROM TWILIO:');

  console.log(req.body, req.params);

  var data = req.body;

  // USE promise chain
  User.findOne({phone: data.From}).exec(function (err, user) {

  	if(!user) {
  		console.log('NO USER FOUND');
  		return
  	}

  	if(err) return;

	  // look up the representative
	  // NOTE findone, although it should be unique!
	  Representative.findOne({phone: data.To}).exec(function (err, rep) {

	  	if(!rep) {
	  		console.log('NO REP FOUND');
	  		return
	  	}

	  	// NOTE IF ERR RETURN NO REP OR SOMETHING - see what happens when you have invalid phone
	  	console.log('here he is', rep._id);

	  	// representative found, valid message, store it
	  	var newMessage = new Message({
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



  // msg.save();

  // send the xml crap
});


app.post('/messages/user', function (req, res, next) {

	var data = req.body;

	User.findById(data._user, function (err, user) {

		console.log('found the user', user);

		// get the representatives number (although this should be stored anyway for the current rep or something)
		Representative.findById(data._representative, function (err, rep) {
			console.log('found the rep', rep);


			// crate the message, have an API for sending a created message (maybe a method of the message schema)

		  	// representative found, valid message, store it
		  	var newMessage = new Message({
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



/*


app.get('/', function(req, res) {

  var msg = new Message({
  	text: 'slash / hit'
  });

  msg.save()

  //res.send('Hello World!');

	 //// get a single message by its Sid
	// client.messages('SM4d717dbc058687a3759486409f7686c5').get(function(err, message) {
 //    	res.send(message);
	// });

	//// get all messages for this account
	// client.messages.list(function(err, data) {
	// 	res.send(data);
	//     // data.messages.forEach(function(message) {
	//     // });
	// });



	//Send an SMS text message
	// client.sendMessage({

	//     to:'+19162252910', // Any number Twilio can deliver to
	//     from: '+19163475297', // A number you bought from Twilio and can use for outbound communication
	//     body: 'word to ur mother.' // body of the SMS message

	// }, function(err, responseData) { //this function is executed when a response is received from Twilio

	//     if (!err) { // "err" is an error received during the request, if any

	//         // "responseData" is a JavaScript object containing data received from Twilio.
	//         // A sample response from sending an SMS message is here (click "JSON" to see how the data appears in JavaScript):
	//         // http://www.twilio.com/docs/api/rest/sending-sms#example-1

	//         console.log(responseData.from); // outputs "+14506667788"
	//         console.log(responseData.body); // outputs "word to your mother."

	//     }
	// });

});
*/





// send message to a specific number, from a specific number



/*
var MessageSchema = new Schema({
	text: String,
	_representative: {
		type: ObjectId,
		ref: 'Representative'
	},
	_user: {
		type: ObjectId,
		ref: 'User'
	}
});

var Message = mongoose.model('Message', MessageSchema);

Should a company have a number or a representative


client pulls messages for a specific myauto representative by ID, if the representative doesn't have a number, go to the company

app.get('representative/messages', function(req, res) {
	
	Message.find({})

});

// get messages between user and a representative
app.get('/messages', function (req, res) {
	req.params.representative_id
	req.params.user_id


	Message.find({_user: req.params.user_id, _representative: req.params.representative_id})
	.then(function (messages) {
		console.log(messages);
	});

});

// send a message to a user from a representative

app.post('/messages', function (req, res) {
	req.params.representative_id
	req.params.user_id


	Message.find({_user: req.params.user_id, _representative: req.params.representative_id})
	.then(function (messages) {
		console.log(messages);
	});

});







*/
	//Send an SMS text message
	/*client.sendMessage({

	    to:'+19162252910', // Any number Twilio can deliver to
	    from: '+19163475297', // A number you bought from Twilio and can use for outbound communication
	    body: 'word to ur mother.' // body of the SMS message

	}, function(err, responseData) { //this function is executed when a response is received from Twilio

	    if (!err) { // "err" is an error received during the request, if any

	        // "responseData" is a JavaScript object containing data received from Twilio.
	        // A sample response from sending an SMS message is here (click "JSON" to see how the data appears in JavaScript):
	        // http://www.twilio.com/docs/api/rest/sending-sms#example-1

	        console.log(responseData.from); // outputs "+14506667788"
	        console.log(responseData.body); // outputs "word to your mother."

	    }
	});*/




server.listen(3000, function(){
  console.log('listening on *:3000');
});

// app.listen(app.get('port'), function() {
//   console.log("Node app is running at localhost:" + app.get('port'));
// })
