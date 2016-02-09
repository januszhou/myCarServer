/**
 * Created by zhou1 on 2/8/2016.
 */
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

// set up a mongoose model and pass it using module.exports
module.exports = mongoose.model('Location', new Schema({
    _userId: Schema.Types.ObjectId,
    lat: String,
    lng: String,
    parkingStart: { type: Date },
    parkingFloor: String,
    parkingSpot: String,
    address: String,
    snapshot: String,
    updatedAt: { type: Date }
}));