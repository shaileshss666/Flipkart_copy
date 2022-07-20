var mongoose = require("./db");
var md5 = require("md5");
const res = require("express/lib/response");
const { normalize } = require("path");
var ObjectId = require("mongodb").ObjectID;
var UserSchema = new mongoose.Schema(
  {
    firstname: String,
    lastname: String,
    email: String,
    password: String,
    email_verified: String,
    token: String,
  },
  {
    versionKey: false,
  }
);

UserSchema.statics.findTitleLatestRev = function (title, callback) {
  return this.find({ title: title })
    .sort({ timestamp: -1 })
    .limit(1)
    .exec(callback);
};

UserSchema.statics.signIn = function (email, password, callback) {
  return this.find({ email: email, password: password, email_verified: "Yes" })
    .limit(1)
    .exec(callback);
};

UserSchema.statics.signUp1 = function (
  firstname,
  lastname,
  email,
  password,
  callback
) {
  var udata = new User({
    firstname: firstname,
    lastname: lastname,
    email: email,
    password: password,
    email_verified: "No",
  });
  udata.save();
  return this.find({ email: email }).limit(1).exec(callback);
};

UserSchema.statics.isExist = function (email, callback) {
  return this.find({ email: email }).limit(1).exec(callback);
};

UserSchema.statics.findUserIdbyEmail = function (email, password, callback) {
  return this.find({ email: email, password: password }).exec(callback);
};

UserSchema.statics.findPasswordbyId = function (id, callback) {
  return this.find({ _id: ObjectId(id) }, { _id: 0, password: 1 }).exec(
    callback
  );
};

UserSchema.statics.findUserbyId = function (id, callback) {
  return this.find({ _id: ObjectId(id) }, { _id: 0, password: 0 }).exec(
    callback
  );
};

UserSchema.statics.findUserNameById = function (id) {
  return this.findById(id).select({ firstname: 1, lastname: 1 });
};

UserSchema.statics.UpdateUserInfo = function (
  id,
  fname,
  lname,
  email,
  callback
) {
  return this.updateOne(
    { _id: ObjectId(id) },
    { $set: { firstname: fname, lastname: lname, email: email } }
  ).exec(callback);
};

UserSchema.statics.UpdateUserPassword = function (id, password, callback) {
  return this.updateOne(
    { _id: ObjectId(id) },
    { $set: { password: password } }
  ).exec(callback);
};

var User = mongoose.model("User", UserSchema, "user");

User.updateMany(
  {},
  { $set: { email_verified: "Yes" } },
  function (err, result) {
    if (err) {
      console.log("Update error!");
    } else {
      console.log(result);
    }
  }
);

module.exports = User;
