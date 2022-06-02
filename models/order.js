const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const ProductSchema = new mongoose.Schema({
  product: {
    type: ObjectId,
    ref: "Product",
  },
  name: String,
  quantity: Number,
  price: Number,
});

const OrderSchema = new mongoose.Schema(
  {
    products: [ProductSchema],
    amount: { type: Number },
    address: String,
    status: {
      type: String,
      default: "recieved",
      enum: ["cancelled", "delivered", "shipped", "processing", "recieved"],
    },
    user: {
      type: ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", OrderSchema);

module.exports = Order;
