var express = require("express");
var controller = require("../controllers/controller");
var router = express.Router();

router.get("/updateuser", controller.updateUser);
router.get("/forgetpasstomail", controller.forgetpasstomail);

router.get("/home/five_phones_sold_out_soon", controller.fivePhonesSoldOutSoon);
router.get("/home/five_phones_best_seller", controller.fivePhonesBestSeller);
router.get("/home/search_phone", controller.searchPhones);
router.post("/home/post_comment", controller.postComment);

router.post("/resetpassword", controller.resetpassword);
router.post("/signin", controller.signIn);
router.post("/signup", controller.signUp);
router.post("/sendinfo", controller.saveInfo);

router.get("/signout", controller.signout);


router.get('/changestock', controller.changeStock);

router.post('/changepassword', controller.showChangepassword);
router.post('/changecomplete', controller.showChangecomplete);

router.post('/checkeditpassword', controller.checkEditpassword);
router.get('/displayeditinfo', controller.showEdit);
router.post('/saveeditinfo', controller.saveEditinfo);
router.post('/checkemail', controller.checkEmail);


router.post("/changepassword", controller.showChangepassword);
router.post("/changecomplete", controller.showChangecomplete);

router.post("/checkeditpassword", controller.checkEditpassword);
router.get("/displayeditinfo", controller.showEdit);
router.post("/saveeditinfo", controller.saveEditinfo);

router.get("/showphonelist", controller.showManage);
router.get("/savedisabled", controller.saveDisable);
router.get("/removephone", controller.removePhone);

router.get("/getreview", controller.showComment);

router.post("/disable", controller.Disable);
router.post("/able", controller.Able);

module.exports = router;
