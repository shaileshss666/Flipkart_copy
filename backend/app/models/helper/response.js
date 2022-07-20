module.exports.success = function (res, message = null, data = null) {
  res.setHeader("Access-Control-Allow-Origin", "*");

  var response = {};
  response.success = true;
  response.message = message;
  response.data = data;
  return res.send(response);
};

module.exports.error = function (res, message) {
  var response = {};
  response.success = false;
  response.message = message;

  return res.send(response);
};
