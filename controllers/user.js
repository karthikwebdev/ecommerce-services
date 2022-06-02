const User = require("../models/user");
const Order = require("../models/order");
const Product = require("../models/product");

exports.getUserById = (req, res, next, id) => {
  User.findById(id).exec((err, user) => {
    if (err || !user) {
      return res.status(400).json({
        error: "no user was found in db",
      });
    }
    req.profile = user;
    next();
  });
};

exports.getUser = (req, res) => {
  req.profile.salt = undefined;
  req.profile.encry_password = undefined;
  return res.json(req.profile);
};

exports.updateUser = (req, res) => {
  User.findByIdAndUpdate(
    { _id: req.profile._id },
    { $set: req.body },
    { new: true, useFindAndModify: false },
    (err, user) => {
      if (err) {
        return res.status(400).json({
          error: "you are not authorized to update",
        });
      }
      user.salt = undefined;
      user.encry_password = undefined;
      res.json(user);
    }
  );
};

exports.userPurchaseList = (req, res) => {
  Order.find({ user: req.profile._id })
    .populate("user", "_id name")
    .exec((err, order) => {
      if (err) {
        return res.status(400).json({
          error: "No order in this account",
        });
      }
      return res.json(order);
    });
};

exports.pushOrderInPurchaseList = async (req, res, next) => {
  let purchases = [];

  let productIds = req.body.products;
  const products = await Product.find({ _id: { $in: productIds } }).lean();

  for (let i = 0; i < req.body.products.length; i++) {
    const productId = req.body.products[i]._id;
    const quantity = req.body.products[i].quantity;
    let product = products.find((product) => product._id.equals(productId));
    if (product) {
      purchases.push({
        product: product._id,
        name: product.name,
        description: product.description,
        quantity,
        amount: quantity * product.price,
      });
    }
  }

  //store in db
  User.findByIdAndUpdate(
    { _id: req.profile._id },
    { $push: { purchases } },
    { new: true },
    (err, purchases) => {
      if (err) {
        return res.status(400).json({ error: "unable to save purchases" });
      }
      next();
    }
  );
};
