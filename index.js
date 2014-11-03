var express = require('express')
var app = express(),
	twilio = require('twilio');

var client = require('twilio')('AC3f8bb9312dc542b543b50bd06ec23dce', 'e1e8451d762b0f10c048c4b34aec0dd8');

var mongo = require('mongodb');

var mongoose = require('mongoose');

var Schema = mongoose.Schema;

//bodyParser = require('body-parser');

var mongoUri = process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || 'mongodb://localhost/myauto';


var MessageSchema = new Schema({
	text: String
});

// define an Message model with this mongoose instance
var Message = mongoose.model('Message', MessageSchema);

mongoose.connect(mongoUri, function(err, db) {
	if (err) {
	  throw err;
	}
	return console.log('Successfully connected to MyAuto MongoDB.');
});


//app.use(bodyParser());


app.set('port', (process.env.PORT || 5000))
app.use(express.static(__dirname + '/public'))

app.get('/', function(req, res) {



  var msg = new Message({
  	text: 'slash / hit'
  });

  msg.save()

  res.send('Hello World!');

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

});

app.post('/message', function (req, res) {

  var msg = new Message({
  	text: 'text received'
  });

  console.log('HAHAHAHAHHAHAA');

  console.log(req.body, req.params);

  msg.save();

  // send the xml crap
});

app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'));
})
