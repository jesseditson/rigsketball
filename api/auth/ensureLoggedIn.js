var basicAuth = require('basic-auth');

var auth = function (req, res, next) {
  function unauthorized(res) {
    res.set('WWW-Authenticate', 'Basic realm=Authorization Required');
    return res.send(401);
  };

  var user = basicAuth(req);

  if (!user || !user.name || !user.pass) {
    return unauthorized(res);
  };

  if (user.name === process.env.AUTH_USER || 'test' && user.pass === process.env.AUTH_PASSWORD || 'test') {
    return next();
  } else {
    return unauthorized(res);
  };
};

module.exports = auth

// module.exports = function(req,res,next){
//   if(req.user) return next();
//   res.redirect('/');
// };
