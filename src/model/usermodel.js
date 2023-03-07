const mongoose =  require("mongoose");

const userSch = mongoose.Schema({
    username:{type:String},
    email:{type:String,unique:true},
    password:{type:String}
})

const UserModel = mongoose.model("users",userSch);

module.exports = UserModel;