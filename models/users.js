var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var bcrypt = require('bcryptjs');


var UserSchema = new Schema({
    username:{type: String, required: true,unique: true  },
    password:{type: String, required: true},
    email:String,
    firstname:String,
    lastname: String,
    info: [{
        story: String,
        address: String,
        project: String,
    }],
    createAt : Date,
    avata: String,
    coverImage:String,
    post: [{type: Schema.Types.ObjectId, ref: 'Post'}],
});


UserSchema.pre('save',function(next){
    var user = this;
    if (!this.createAt) this.createAt = new Date;
    bcrypt.genSalt(10, function(err, salt) {
        if (err) return next(err);
        bcrypt.hash(user.password, salt, function(err, hash) {
            user.password = hash;
            next();
        });
    });
});

UserSchema.methods.compare = function(pw) {
  return bcrypt.compareSync(pw, this.password);
};


module.exports = mongoose.model('User', UserSchema);