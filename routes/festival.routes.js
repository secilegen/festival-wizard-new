const router = require('express').Router()
const mongoose = require('mongoose')
const Festival = require('../models/Festival.model')

router.get('/festivals/create',(req,res)=>{
    res.render('festivals/new-festival-form')
})

router.post('/festivals/create',(req,res)=>{

    if (req.body.minPrice && !req.body.maxPrice){
        console.log("Maximum Price has been set to ", req.body.minPrice)
        req.body.maxPrice = req.body.minPrice
    }
    else if (!req.body.minPrice && !req.body.minPrice){
        console.log("Minimum Price has been set to ", req.body.maxPrice)
        req.body.minPrice = req.body.maxPrice
    }
    else if (Number(req.body.minPrice) > Number(req.body.maxPrice)) {
        console.log("Maximum price must be greater than or equal to minimum price")
        console.log("Maximum price has been set to ", req.body.minPrice)
        req.body.maxPrice = req.body.minPrice
    }

    if (req.body.startDate && !req.body.endDate) {
        console.log("End Date has been set to ", req.body.startDate)
        req.body.endDate = req.body.startDate
    }
    else if (!req.body.startDate && req.body.endDate) {
        console.log("Start Date has been set to ", req.body.endDate)
        req.body.startDate = req.body.endDate
    }
    else if (req.body.startDate > req.body.endDate) {
        console.log("Start Date must not be after the End Date")
        console.log("Start Date has been set to ", req.body.endDate)
        req.body.startDate = req.body.endDate
    }


    const {name,imageURL,startDate,endDate,country, city, address,currency,minPrice,maxPrice,website,mustKnow,genre} = req.body

    Festival.create({name:name, imageURL: imageURL, startDate: startDate, endDate:endDate, location: {city:city, country:country, address:address}, currency: currency, minPrice: minPrice,maxPrice: maxPrice,website: website,mustKnow: mustKnow,genre:genre })
    .then((createdFestival)=>{  
        res.redirect('/festivals/list')
        // res.redirect(`/festivals/${createdFestival._id}`)
    })
    .catch(err=> console.log('An error occured creating the festival:', err)) 
})


router.get('/festivals/list',(req,res)=>{
    Festival.find()
    .then((allFestivals)=>{
        res.render('festivals/all-festivals',{allFestivals})
    })
    .catch(err=>console.log('Error occured retrieving all festivals:', err))
})

router.get('/festivals/:festivalId', (req,res)=>{
    console.log('Req.params is:', req.params)
    Festival.findById(req.params.festivalId)
    .then((festivalDetails)=>{
        console.log(festivalDetails)
        res.render('festivals/festival-detail', festivalDetails)
    })
    .catch(err=>console.log('Error getting the festival detail is:', err))
})

router.get('/delete-festival/:id', (req, res)=>{
    const festivalId = req.params.id
    Festival.findByIdAndDelete(festivalId)
    .then((festivalToDelete)=>{
        res.redirect('/festivals/list')
    })
    .catch(err=> console.log('Delete error is', err))
})

router.get('/festivals/:id/edit/', (req,res)=>{
    Festival.findById(req.params.id)
    .then((festivalToEdit)=>{
        res.render('festivals/edit-festival', festivalToEdit)
    })
    .catch(err=>console.log('Error occured retrieving the data to edit festival:', err))
})

router.post('/festivals/:id/edit', (req,res)=>{

    const {name,imageURL,startDate,endDate,country, city, address,currency,minPrice,maxPrice,website,mustKnow,genre} = req.body
    Festival.findByIdAndUpdate(req.params.id, {name:name, imageURL: imageURL, startDate: startDate, endDate:endDate, location: {city:city, country:country, address:address}, currency: currency, minPrice: minPrice,maxPrice: maxPrice,website: website,mustKnow: mustKnow,genre:genre })
    .then((festivalToUpdate)=>{
        res.redirect(`/festivals/${festivalToUpdate._id}`)
    })
    .catch(err=>console.log('Editing error is:', err))
})

module.exports = router