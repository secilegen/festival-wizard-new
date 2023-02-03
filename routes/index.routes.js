const express = require('express');
const Festival = require('../models/Festival.model');
const router = express.Router();

/* GET home page */
router.get("/", (req, res, next) => {
  res.render("index");
});

module.exports = router;
