const Product = require("../models/product");
const formidable = require("formidable");
const _ = require("lodash");
const fs = require("fs"); //file system

exports.getProductById = (req, res, next, id) => {
  Product.findById(id)
    .populate("category")
    .exec((err, product) => {
      if (err) {
        return res.status(400).json({ err: "product not found" });
      }
      req.product = product;
      next();
    });
};

exports.createProduct = (req, res) => {
  let form = new formidable.IncomingForm();
  form.keepExtensions = true;

  form.parse(req, (err, fields, file) => {
    if (err) {
      return res.status(400).json({ error: "problem with image" });
    }
    const { price, name, description, category, stock } = fields;

    if (!name || !description || !price || !category || !stock) {
      return res.status(400).json({ error: "please include all fields" });
    }

    let product = new Product(fields);
    // handle file
    if (file.photo) {
      if (file.photo.size > 3000000) {
        return res.status(400).json({ error: "file size too big" });
      }
      product.photo.data = fs.readFileSync(file.photo.path);
      product.photo.contentType = file.photo.type;
    }

    //save file to database
    product.save((err, product) => {
      if (err) {
        res.status(400).json({ error: "error while saving product" });
      }
      res.json(product);
    });
  });
};

exports.getProduct = (req, res) => {
  req.product.photo = undefined;
  return res.json(req.product);
};

//middleware
exports.photo = (req, res, next) => {
  if (req.product.photo.data) {
    res.set("content-type", req.product.photo.contentType);
    return res.send(req.product.photo.data);
  }
  next();
};

exports.deleteProduct = (req, res) => {
  let product = req.product;
  product.remove((err, deletedProduct) => {
    if (err) {
      return res.status(400).json({ error: "failed to delete product" });
    }
    res.json({ message: "deleted successfully", deletedProduct });
  });
};

exports.updateProduct = (req, res) => {
  let form = new formidable.IncomingForm();
  form.keepExtensions = true;

  form.parse(req, (err, fields, file) => {
    if (err) {
      return res.status(400).json({ error: "problem with image" });
    }

    let product = req.product;
    product = _.extend(product, fields);
    // handle file
    if (file.photo) {
      if (file.photo.size > 3000000) {
        return res.status(400).json({ error: "file size too big" });
      }
      product.photo.data = fs.readFileSync(file.photo.path);
      product.photo.contentType = file.photo.type;
    }

    //save file to database
    product.save((err, product) => {
      if (err) {
        return res.status(400).json({ error: "error while updating product" });
      }
      res.json(product);
    });
  });
};

//product listing
exports.getAllProducts = (req, res) => {
  let sortBy = req.query.sortBy ? req.query.sortBy : "name";
  let order = req.query.order ? req.query.order : -1;
  Product.find()
    .select("-photo")
    .populate("category")
    .sort([[sortBy, order]])
    .exec((err, products) => {
      if (err) {
        return res.status().json({ error: "No product Found" });
      }
      res.json(products);
    });
};

//refer https://mongoosejs.com/docs/api.html#model_Model.bulkWrite
exports.updateStock = (req, res, next) => {
  let myOperations = req.body.products.map((prod) => {
    return {
      updateOne: {
        filter: { _id: prod.product },
        update: { $inc: { stock: -prod.quantity, sold: +prod.quantity } },
      },
    };
  });
  Product.bulkWrite(myOperations, {}, (err, products) => {
    if (err) {
      return res.status(400).json({ error: "bulk operation failed" });
    }
    next();
  });
};

exports.getAllUniqueCategories = (req, res) => {
  Product.distinct("category", {}, (err, category) => {
    if (err) {
      return res.status(400).json({ error: "no categories found" });
    }
    res.json(category);
  });
};
