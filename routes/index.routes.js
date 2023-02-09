const express = require('express');
const Festival = require('../models/Festival.model');
const router = express.Router();

/* GET home page */
router.get("/", (req, res, next) => {
  let mostPopular
  let festivalsByDate
  Festival.find().sort({favorited: -1})
  .then(result=>{
    mostPopular = result
  })
  .then(()=>{
    Festival.find().sort({createdAt: -1})
    .then(result=>{
      festivalsByDate = result
    })
    .then(()=>{
      res.render("index", {mostPopular, festivalsByDate});
    })
  })
});

module.exports = router;
