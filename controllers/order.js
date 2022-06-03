const Order = require("../models/order");

exports.getOrderById = (req, res, next, id) => {
  Order.findById(id)
    .populate("products.product", "name price")
    .exec((err, order) => {
      if (err) {
        return res.status(400).json({ error: "no order found in db " });
      }
      req.order = order;
      next();
    });
};

exports.createOrder = (req, res) => {
  req.body.user = req.profile;

  req.body.products = req.body.products.map(
    ({ product: productId, quantity }) => {
      let product = req.products.find((product) =>
        product._id.equals(productId)
      );
      return {
        product: productId,
        name: product.name,
        quantity: quantity,
        price: product.price,
      };
    }
  );

  const order = new Order(req.body);

  order.save((err, order) => {
    if (err) {
      return res.status(400).json({ error: "failed to save order" });
    }
    res.json(order);
  });
};

exports.getAllOrders = (req, res) => {
  Order.find()
    .populate("user", "_id name")
    .exec((err, order) => {
      if (err) {
        return res.status(400).json({ error: "no orders found" });
      }
      res.json(order);
    });
};

exports.getOrderstatus = (req, res) => {
  res.json(Order.schema.path("status").enumValues);
};

exports.updateStatus = (req, res) => {
  Order.updateOne(
    { _id: req.params.orderId },
    { $set: { status: req.body.status } },
    (err, order) => {
      if (err) {
        return res.status(400).json({ error: "error updating Status" });
      }
      res.json({ message: "Updated successfully!" });
    }
  );
};
