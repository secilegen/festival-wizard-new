const express = require('express');
const Festival = require('../models/Festival.model');
const router = express.Router();

/* GET home page */
router.get("/", (req, res, next) => {
  let mostPopular
  let festivalsByDate
  Festival.find().limit(6).sort({favorited: -1})
  .then(result=>{
    mostPopular = result
  })
  .then(()=>{
    Festival.find().limit(6).sort({createdAt: -1})
    .then(result=>{
      festivalsByDate = result
    })
    .then(()=>{
    console.log('Most popular are:', mostPopular)
    console.log('Sorted by date:', festivalsByDate)
    res.render("index", {mostPopular, festivalsByDate});

    })


  })
});

module.exports = router;
