const Category = require("../models/category");

exports.getCategoryById = (req, res, next, id) => {
  Category.findById(id).exec((err, cate) => {
    if (err) {
      return res.status(400).json({ error: "category not found in db" });
    }
    req.category = cate;
    next();
  });
};

exports.createCategory = (req, res) => {
  const category = new Category(req.body);
  category.save((err, category) => {
    if (err) {
      console.log(err);
      return res.status(400).json({ error: "not able to save category" });
    }
    return res.json({ category });
  });
};

exports.getCategory = (req, res) => {
  if (!req.category) {
    return res.status(404).json({ error: "category not found" });
  }
  return res.json(req.category);
};

exports.getAllCategory = (req, res) => {
  Category.find().exec((err, categories) => {
    if (err) {
      return res.status(400).json({ error: "no category find" });
    }
    res.json(categories);
  });
};

exports.updateCategory = (req, res) => {
  const category = req.category;
  if (!category) {
    return res.status(404).json({ error: "No category found" });
  }
  category.name = req.body.name;
  category.save((err, updatedCategory) => {
    if (err) {
      console.log(err);
      
      return res.status(400).json({ error: "cannot update category" });
    }
    res.json(updatedCategory);
  });
};

exports.removeCategory = (req, res) => {
  const category = req.category;
  if (!category) {
    return res.status(404).json({ error: "Category not available!" });
  }
  category.remove((err, category) => {
    if (err) {
      console.log(err);
      return res.status(400).json({ error: "failed to delete category" });
    }
    res.json({
      category,
    });
  });
};
