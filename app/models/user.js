/**
 * Created by zhou1 on 2/7/2016.
 */
// get an instance of mongoose and mongoose.Schema
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

//Schema.pre('save', function(next){
//    now = new Date();
//    this.updated_at = now;
//    if (!this.created_at ) {
//        this.created_at = now;
//    }
//    next();
//});

// Methods definition
//LocationSchema.methods.testFunc = function testFunc(params, callback) {
//    //implementation code goes here
//};

// Class definition
//LocationSchema.statics.findByName = function (name, cb) {
//    this.find({ name: new RegExp(name, 'i') }, cb);
//};

// set up a mongoose model and pass it using module.exports
module.exports = mongoose.model('User', new Schema({
    email: String,
    password: String,
    UUID: String,
    device_token: String,
    updatedAt: { type: Date }
}));
