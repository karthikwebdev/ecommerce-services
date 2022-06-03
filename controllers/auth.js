const User = require("../models/user");
const { check, validationResult } = require("express-validator");
var jwt = require("jsonwebtoken");
var expressJwt = require("express-jwt");

exports.signup = (req, res) => {
  const errors = validationResult(req);
  let errmsgs = [];
  errors.array().forEach((error) => {
    errmsgs.push({
      msg: error.msg,
    });
  });
  if (!errors.isEmpty()) {
    return res.status(422).json({ errmsgs });
  }
  const user = new User(req.body);
  user.save((err, user) => {
    if (err) {
      if (err.code === 11000) {
        return res.status(400).json({ err: "User already exists" });
      }
      return res.status(400).json({ err: "Not able to save User" });
    }
    res.json(user);
  });
};

exports.signin = (req, res) => {
  const { email, password } = req.body;
  const errors = validationResult(req);
  let errmsgs = [];
  errors.array().forEach((error) => {
    errmsgs.push({
      msg: error.msg,
      param: error.param,
    });
  });
  if (!errors.isEmpty()) {
    return res.status(422).json({ errmsgs });
  }
  User.findOne({ email }, (err, user) => {
    if (err || !user) {
      return res.status(400).json({ err: "user email doesn't exists" });
    }
    if (!user.authenticate(password)) {
      return res.status(401).json({ err: "email and password don't match" });
    }
    //create token
    const token = jwt.sign({ _id: user._id }, process.env.SECRET);
    //put token into cookie
    res.cookie("token", token, { expire: new Date() + 9999 });
    //send response to frontend
    const { _id, name, email, role } = user;
    return res.json({ token, user: { _id, name, email, role } });
  });
};

exports.signout = (req, res) => {
  res.clearCookie("token");
  res.json({ message: "user signout successfully" });
};

//protected routes
exports.isSignedIn = expressJwt({
  secret: process.env.SECRET,
  userProperty: "auth",
  algorithms: ["HS256"],
});

//custom middlewares
exports.isAuthenticated = (req, res, next) => {
  // req.profile._id == req.auth._id only use double equal as they are not equal
  let checker = req.profile && req.auth && req.profile._id == req.auth._id;
  if (!checker) {
    return res.status(403).json({ err: "ACCESS DENIED not athenticated" });
  }
  next();
};

exports.isAdmin = (req, res, next) => {
  if (req.profile.role === 0) {
    return res.status(403).json({
      error: "you are not admin, ACCESS DENIED",
    });
  }
  next();
};
