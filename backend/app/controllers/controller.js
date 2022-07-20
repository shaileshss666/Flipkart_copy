var express = require("express");
var nodemailer = require("nodemailer");
var md5 = require("md5");
var Phone = require("../models/phone");
var User = require("../models/user");
var RESPONSE = require("../models/helper/response");
const url = require("url");
const jwt = require("jsonwebtoken");
const { header } = require("express/lib/response");
const { json } = require("body-parser");
var userid;

module.exports.fivePhonesSoldOutSoon = function (req, res) {
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Access-Control-Allow-Origin", "*");

  var phone;
  Phone.fivePhonesSoldOutSoon(async function (err, result) {
    if (err) {
      console.log("Cannot find 5 five Phones Sold Out Soon!");
      phone = "Cannot find 5 five Phones Sold Out Soon!";
    } else {
      phone = result;
      await Promise.all(phone.map((p) => User.findUserNameById(p.seller))).then(
        (results) => {
          for (var i = 0; i < phone.length; i++) {
            phone[i].seller = results[i];
          }
        }
      );
      for await (var p of phone) {
        await Promise.all(
          p.reviews.map((review) => User.findUserNameById(review.reviewer))
        ).then((results) => {
          for (var i = 0; i < p.reviews.length; i++) {
            p.reviews[i].reviewer = results[i];
          }
        });
      }
    }
    console.log(phone);
    await res.end(JSON.stringify(phone));
  });
};

module.exports.fivePhonesBestSeller = function (req, res) {
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Access-Control-Allow-Origin", "*");

  var phone;
  Phone.fivePhonesBestSeller(async function (err, result) {
    if (err) {
      console.log("Cannot find 5 highest rating phones!");
      phone = "Cannot find 5 highest rating phones!";
    } else {
      phone = result;
      await Promise.all(phone.map((p) => User.findUserNameById(p.seller))).then(
        (results) => {
          for (var i = 0; i < phone.length; i++) {
            phone[i].seller = results[i];
          }
        }
      );
      for await (const p of phone) {
        await Promise.all(
          p.reviews.map((review) => User.findUserNameById(review.reviewer))
        ).then((results) => {
          for (var i = 0; i < p.reviews.length; i++) {
            p.reviews[i].reviewer = results[i];
          }
        });
      }
    }
    console.log(phone);
    await res.end(JSON.stringify(phone));
  });
};

module.exports.searchPhones = function (req, res) {
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Access-Control-Allow-Origin", "*");
  var title = req.query.title;
  var phone;
  Phone.searchPhone(title, async function (err, result) {
    if (err) {
      console.log("Cannot find the phone");
      phone = "Cannot find the phone";
    } else {
      phone = result;
      await Promise.all(phone.map((p) => User.findUserNameById(p.seller))).then(
        (results) => {
          for (var i = 0; i < phone.length; i++) {
            phone[i].seller = results[i];
          }
        }
      );
      for await (const p of phone) {
        await Promise.all(
          p.reviews.map((review) => User.findUserNameById(review.reviewer))
        ).then((results) => {
          for (var i = 0; i < p.reviews.length; i++) {
            p.reviews[i].reviewer = results[i];
          }
        });
      }
    }
    console.log(phone);
    await res.end(JSON.stringify(phone));
  });
};

module.exports.postComment = async function (req, res) {
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Access-Control-Allow-Origin", "*");
  var phoneId = req.body.phoneId;
  var reviewer = req.body.reviewer;
  var rating = req.body.rating;
  var comment = req.body.comment;
  if (Phone.addComment(phoneId, reviewer, rating, comment) == "success") {
    return RESPONSE.success(res, "success");
  } else {
    return res.end("error");
  }
};

module.exports.updateUser = async function (req, res) {
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Access-Control-Allow-Origin", "*");
  var email = req.query.email;
  await User.updateOne(
    {
      email: email,
    },
    { email_verified: "Yes" },
    { upsert: true }
  );
  return RESPONSE.success(res, "email verified successfully", email);
};

module.exports.signIn = async function (req, res) {
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Access-Control-Allow-Origin", "*");
  var email = req.body.email;
  var password = md5(req.body.password);
  let jwtSecretKey = process.env.JWT_KEY;
  var user;
  User.signIn(email, password, async function (err, result) {
    if (result && result == "") {
      return RESPONSE.error(
        res,
        " user not found with this email/password",

        result
      );
    } else {
      if (result && result != "" && result[0].email_verified == "Yes") {
        token = jwt.sign(
          {
            email: result[0].email,
            firstname: result[0].firstname,
            lastname: result[0].lastname,
          },
          "jwtSecretKey",
          { expiresIn: "1h" }
        );
        await User.updateOne(
          {
            email: email,
          },
          { token: token },
          { upsert: true }
        );

        return RESPONSE.success(
          res,
          " You have logged in successfully",
          result
        );
      } else {
        return RESPONSE.error(res, " user not verified", result);
      }
    }
  });
};

module.exports.signUp = async function (req, res) {
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Access-Control-Allow-Origin", "*");

  var firstname = req.body.firstname;
  var lastname = req.body.lastname;
  var email = req.body.email;
  var password = md5(req.body.password);
  var user;

  user = await User.isExist(email);

  if (user == "") {
    User.signUp1(firstname, lastname, email, password, function (err, result) {
      if (result.length > 0) {
        return RESPONSE.error(res, "user already exist ", result);
      } else {
        sendVerifyEmail(email, firstname);
        return RESPONSE.success(
          res,
          " You have registered successfully",
          result
        );
      }
    });
  } else {
    return RESPONSE.error(res, "user already exist ", "");
  }
};

async function sendVerifyEmail(email, firstname) {
  var transporter = nodemailer.createTransport({
    service: "gmail",
    host: "ssl://smtp.gmail.com",
    port: 465,
    secure: false,
    pool: true,
    auth: {
      user: "remudalife2900@gmail.com",
      pass: "Remudalife@2900",
    },
  });

  var mailOptions = {
    from: "remudalife2900@gmail.com",
    to: email,
    subject: "Regarding email verification",

    text: "",
    html: `<p>please click below linK to verify you email </p>
    <a
    href="http://localhost:3000/updateuser?email=${email}" style="color: #17abab;" target="_blank"> http://localhost:3000/updateuser?email=${email}</a>`,
    content: [
      {
        type: "text",
        value: "html",
      },
    ],
  };

  try {
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("Email sent: " + info.response);
      }
    });
  } catch (e) {
    console.log(e);
  }
  return true;
}

module.exports.resetpassword = async function (req, res) {
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Access-Control-Allow-Origin", "*");
  var email = req.body.email;
  var password = req.body.password;

  var user = await User.isExist(email);

  if (user && user != "") {
    await User.updateOne(
      {
        email: email,
      },
      { password: md5(password) },
      { upsert: true }
    );
    var json = { email: email };
    return RESPONSE.success(res, "password updated successfully", json);
  } else {
    return RESPONSE.error(
      res,
      " user not found with this email id",

      user
    );
  }
};

module.exports.forgetpasstomail = async function (req, res) {
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Access-Control-Allow-Origin", "*");

  var email = req.query.email;

  var user = await User.isExist(email);

  if (user && user != "") {
    sendForgetEmail(email);
    return RESPONSE.success(
      res,
      " email sent to this email to reset password  ",
      user
    );
  } else {
    return RESPONSE.error(
      res,
      " user not found with this email id",

      user
    );
  }

  async function sendForgetEmail(email) {
    var transporter = nodemailer.createTransport({
      service: "gmail",
      host: "ssl://smtp.gmail.com",
      port: 465,
      secure: false,
      pool: true,
      auth: {
        user: "remudalife2900@gmail.com",
        pass: "Remudalife@2900",
      },
    });

    var mailOptions = {
      from: "remudalife2900@gmail.com",
      to: email,
      subject: "Regarding forget password",

      text: "",
      html: `<p>please click below link to reset password </p>
      <a
      href="http://localhost:8080/newpassword?email=${email}" style="color: #17abab;" target="_blank"> http://localhost:8080/newpassword?email=${email}</a>`,
      content: [
        {
          type: "text",
          value: "html",
        },
      ],
    };

    try {
      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log(error);
        } else {
          console.log("Email sent: " + info.response);
        }
      });
    } catch (e) {
      console.log(e);
    }
    return true;
  }
};

module.exports.saveInfo = async function (req, res) {
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Access-Control-Allow-Origin", "*");

  var email = req.body.email;
  var password = md5(req.body.password);

  User.findUserIdbyEmail(email, password, function (err, result) {
    if (err) {
      console.log("no such user");
    } else {
      console.log(result);
    }
    res.end(JSON.stringify(result));
  });
};

module.exports.changeStock = function (req, res) {
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Access-Control-Allow-Origin", "*");

  const queryObject = url.parse(req.url, true).query;

  var title = queryObject.title;
  var price = queryObject.price;
  var quantity = queryObject.quantity;

  Phone.ChangeStock(title, price, quantity, function (err, result) {
    if (err) {
      console.log("err");
    } else {
      console.log(result);
    }
    res.end(JSON.stringify(result));
  });
};

module.exports.showEdit = function (req, res) {
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Access-Control-Allow-Origin", "*");
  const queryObject = url.parse(req.url, true).query;
  var id = queryObject.id;
  var user;
  User.findUserbyId(id, function (err, result) {
    if (err) {
      console.log("no such user");
    } else {
      user = result;
      console.log(result);
    }
    res.end(JSON.stringify(user));
  });
};

module.exports.checkEmail = function (req, res) {
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Access-Control-Allow-Origin", "*");
  var email = req.body.email;
  var id = req.body.id;
  var savedemail;

  User.findUserbyId(id, function (err, result) {
    if (err) {
      console.log(err);
    } else {
      console.log(result);
      savedemail = result[0].email;

      User.isExist(email, function(err, result){
        if(err){
          console.log(err);
        }else{
          console.log(result);
          if(email == savedemail){
            res.end(JSON.stringify("OK"));
          }else{
            if(result == ""){
              res.end(JSON.stringify("OK"));
            }else{

              res.end(JSON.stringify("No"));
            }
          }
        }
      });
    }
  });
};

module.exports.showManage = function (req, res) {
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Access-Control-Allow-Origin", "*");
  const queryObject = url.parse(req.url, true).query;
  var findsellerid = queryObject.sellerid;
  var phone;
  Phone.findUserphone(findsellerid, function (err, result) {
    if (err) {
      console.log("do not have phone list");
    } else {
      phone = result;
      console.log(result);
    }
    res.end(JSON.stringify(phone));
  });
};

module.exports.checkEditpassword = function (req, res) {
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Access-Control-Allow-Origin", "*");
  var password = req.body.password;
  var email = req.body.email;
  var savedemail;
  var savedpassword;
  var message;
  var check;
  var id = req.body.id;

  User.findUserbyId(id, function (err, result) {
    if (err) {
      console.log(err);
    } else {
      savedemail = result[0].email;
      console.log(savedemail);
      User.isExist(email, function (err, result) {
        if (err) {
          console.log(err);
        } else {
          console.log(result);
          if (email == savedemail || result == "") {
            message = "OK";
            User.findPasswordbyId(id, function (err, result) {
              if (err) {
                console.log("no such user");
              } else {
                savedpassword = result[0].password;
                if (savedpassword == md5(password)) {
                  check = "Right password";
                  res.end(JSON.stringify(check));
                } else {
                  check = "Wrong password";
                  res.end(JSON.stringify(check));
                }
              }
            });
          } else {
            message = "No";
            res.end(JSON.stringify(message));
          }
        }
      });
    }
  });
};

module.exports.saveEditinfo = function (req, res) {
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Access-Control-Allow-Origin", "*");
  fname = req.body.fname;
  lname = req.body.lname;
  email = req.body.email;

  var id = req.body.id;
  User.UpdateUserInfo(id, fname, lname, email, function (err, result) {
    if (err) {
      console.log("no such user");
    } else {
      console.log(result);
    }
  });
};

module.exports.showChangepassword = function (req, res) {
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Access-Control-Allow-Origin", "*");
  var oldpassword = md5(req.body.oldpassword);

  var savedpassword;
  var id = req.body.id;

  User.findPasswordbyId(id, function (err, result) {
    if (err) {
      console.log("no such user");
    } else {
      console.log(result);
      savedpassword = result[0].password;
      if (savedpassword == oldpassword) {
        var check = "Right password";
        res.end(check);
      } else {
        var check = "Wrong password";
        res.end(check);
      }
    }
  });
};

module.exports.showChangecomplete = function (req, res) {
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Access-Control-Allow-Origin", "*");
  var newpassword = md5(req.body.newpassword);

  var id = req.body.id;
  User.UpdateUserPassword(id, newpassword, function (err, result) {
    if (err) {
      console.log("no such user");
    } else {
      console.log(result);
    }
  });
};

module.exports.Disable = function (req, res) {
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Access-Control-Allow-Origin", "*");

  var title = req.body.title;
  var brand = req.body.brand;
  var image = req.body.image;
  var stock = req.body.stock;
  var price = req.body.price;

  var findsellerid = req.body.sellerid;
  var disablevalue;
  disablevalue = "";
  Phone.AddNewItemDisable(
    title,
    brand,
    image,
    stock,
    findsellerid,
    price,
    disablevalue
  );
  res.end(JSON.stringify("Save to database id " + findsellerid));
};

module.exports.Able = function (req, res) {
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Access-Control-Allow-Origin", "*");
  var title = req.body.title;
  var brand = req.body.brand;
  var image = req.body.image;
  var stock = req.body.stock;
  var price = req.body.price;

  var findsellerid = req.body.sellerid;
  Phone.Addnewphone(title, brand, image, stock, findsellerid, price);
  res.end(JSON.stringify("Save to database id " + findsellerid));
};

module.exports.showComment = function (req, res) {
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Access-Control-Allow-Origin", "*");
  const queryObject = url.parse(req.url, true).query;
  var findsellerid = queryObject.sellerid;
  var review;
  Phone.findPhoneComment(findsellerid, function (err, result) {
    if (err) {
      console.log("no review");
    } else {
      review = result;
      console.log(review);
    }
    res.end(JSON.stringify(review));
  });
};

module.exports.saveDisable = function (req, res) {
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Access-Control-Allow-Origin", "*");

  const queryObject = url.parse(req.url, true).query;

  var sellerid = queryObject.seller;
  var disable = queryObject.disable;
  var id = queryObject.id;

  if (disable == "1") {
    Phone.SetDisable(sellerid, id, function (err, result) {
      if (err) {
        console.log(err);
      } else {
        console.log(result);
      }
    });
    res.send("Database Updated to seller " + sellerid);
  } else {
    Phone.UnsetDisable(sellerid, id, function (err, result) {
      if (err) {
        console.log(err);
      } else {
        console.log(result);
      }
    });
    res.send("Database Updated to seller " + sellerid);
  }
};

module.exports.removePhone = function (req, res) {
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Access-Control-Allow-Origin", "*");

  const queryObject = url.parse(req.url, true).query;
  var id = queryObject.id;

  Phone.Removephone(id, function (err, result) {
    if (err) {
      console.log("no such phone");
    } else {
      console.log(result);
    }
    res.end(JSON.stringify(result));
  });
};

module.exports.signout = function (req, res) {
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Access-Control-Allow-Origin", "*");

  res.end(JSON.stringify("Signout Complete"));
};
