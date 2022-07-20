var mongoose = require('./db');
const e = require("express");
var ObjectId = require('mongodb').ObjectID;
var PhoneSchema = new mongoose.Schema({
    title: String,
    brand:String,
    image:String,
    stock:Number,
    seller:String,
    price:Number,
    reviews:[{
        reviewer:String,
        rating:Number,
        comment:String,
    }],
    disabled:String,

},{
    versionKey: false
});

PhoneSchema.statics.fivePhonesSoldOutSoon =  async function(callback){

    return await this.find({stock:{ $gt: 0 },  disabled: null})
        .sort({stock:1})
        .limit(5).lean()
        .exec(callback)
}

PhoneSchema.statics.fivePhonesBestSeller = async function (callback) {
    var filter = { "reviews.1": { "$exists": true }, disabled: null };
    return await this.aggregate([
        {$match: filter},
        {$addFields: {average: {$avg: '$reviews.rating'}}},])
        .sort({average:-1})
        .limit(5)
        .exec(callback);
}

PhoneSchema.statics.searchPhone = function(searchTitle,callback){
    return  this.find({title: { "$regex": searchTitle, "$options": "i" }}).lean()
        .exec(callback)
}

PhoneSchema.statics.addComment = function(phoneId,reviewer,rating,comment){
    this.findOne({ _id : phoneId }, function(err,phone) {
        phone.reviews.push({reviewer: reviewer, rating: rating, comment: comment});
        phone.save();
    });
    return "success"
}

PhoneSchema.statics.findUserphone = function(sellerid, callback){
    return this.find({'seller': sellerid}, {image: 0, reviews: 0})
    .exec(callback)
}

PhoneSchema.statics.findPhoneComment = function(sellerid, callback){
    return this.find({'seller': sellerid}, {title:1,reviews:1})
    .exec(callback)
}

PhoneSchema.statics.SetDisable = function(sellerid, id, callback){
    return this.updateOne({'seller': sellerid, '_id': ObjectId(id)}, {$set: {disabled:""}})
    .exec(callback)
}

PhoneSchema.statics.UnsetDisable = function(sellerid, id, callback){
    return this.updateOne({'seller': sellerid, '_id': ObjectId(id)}, {$unset: {disabled:""}})
    .exec(callback)
}

PhoneSchema.statics.AddNewItemDisable = function(title, brand, image, stock, findsellerid, price, disablevalue){
    return this.create({title: title, brand: brand, image: image, stock: stock, seller: findsellerid, price: price, disabled: disablevalue});
}
PhoneSchema.statics.Addnewphone = function(title, brand, image, stock, findsellerid, price){
    return this.create({title: title, brand: brand, image: image, stock: stock, seller: findsellerid, price: price});
}

PhoneSchema.statics.Removephone = function(id, callback){
    return this.deleteOne({_id: ObjectId(id)}).exec(callback);
}

PhoneSchema.statics.ChangeStock = function(title, price, quantity, callback){
    return this.updateOne({'title': title, 'price': price}, {$set: {stock: quantity}})
    .exec(callback)
}

var Phone = mongoose.model('Phone', PhoneSchema, 'phone');

Phone.find({}, function (err, phones) {
    for(var i=0;i<phones.length;i++){
        phones[i].image = phones[i].brand+".jpeg";
        phones[i].save(function (err) {
            if(err) {
                console.log('Update phone image error!');
            }
        });
    }

});

module.exports = Phone
