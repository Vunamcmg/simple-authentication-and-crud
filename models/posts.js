var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var postSchema = new Schema({
    body: {type: String, require: true},
    comment: [{
        body:String,
        date:Date}],
    date: {type: Date, default: Date.now},
    public: {type: Boolean, default:true},
    meta: {
        vote: Number
    },
    user: {type: Schema.Types.ObjectId, ref: 'User', require: true},
    category: String,
    like: Number
});

postSchema.pre('save',function(next){
    if (!this.date) this.date = new Date;
    next();
});


module.exports = mongoose.model('Post', postSchema);