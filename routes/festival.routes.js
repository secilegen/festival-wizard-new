const router = require('express').Router()
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const Festival = require('../models/Festival.model')
const saltRounds = 10

router.get('/festivals/create',(req,res)=>{
    Festival.find()
    .then(result=>{
        console.log(result)
        res.render('festivals/new-festival-form',{result})

    })
})

router.post('/festivals/create',(req,res)=>{
    console.log(req.body)
    const {name,imageURL,startDate,endDate,country,city,address,currency,minPrice,maxPrice,websiteURL,mustKnow,genre} = req.body
    location = {
        country,
        city,
        address
    }
    console.log(location)    
    res.redirect('/festivals/list')
})


router.get('/festivals/list',(req,res)=>{
    Festival.find()
    // .populate('author_id')
    .then((result)=>{
        console.log(result)
        res.render('festivals/all-festivals',{result})
    })
})


module.exports = router