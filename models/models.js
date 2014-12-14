var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	ObjectId = Schema.Types.ObjectId,
	extend = require('mongoose-schema-extend');

var UserSchema = new Schema({
	firstName: String,
	lastName: String,
	phone: String/*,
	discriminatorKey: '_type'*/ // NOTE this should actually work
});

var RepresentativeSchema = UserSchema.extend({
	_company: {
		type: ObjectId,
		ref: 'Company'
	}
});

var CompanySchema = new Schema({
	name: String,
	phone: String
});

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

module.exports = {
	User: mongoose.model('User', UserSchema),
	Representative: mongoose.model('Representative', RepresentativeSchema),
	Company: mongoose.model('Company', CompanySchema),
	Message: mongoose.model('Message', MessageSchema)
}


