const router = require('express').Router()
const mongoose = require('mongoose')
const { reset } = require('nodemon')
const { rawListeners } = require('../app')
const app = require('../app')
const Festival = require('../models/Festival.model')

const countries = require("../utils/countries")

router.get('/festivals/create',(req,res)=>{
    res.render('festivals/new-festival-form', {countries})
})

router.post('/festivals/create',(req,res)=>{
    function checkInput(req) {

        if (!req.body.name) {
            message = "You must enter a name for your Festival"
            errorType="error"
        }
        else if (!req.body.startDate && !req.body.endDate) {   // if there is an end date but no start date, code below sets start date to end date
             message = "You must enter a Start Date"
             errorType="error"
        }       
        else if (!req.body.country) {     // theoretically impossible because of Dropdown menu?
            message = "You must select a country"
            errorType="error"
        }
        else if (!req.body.city) {
            message = "You must enter a city"
            errorType="error"
        }
        else if (!req.body.website) {
            message = "You must enter a website"
            errorType="error"
        }
    
        else if (req.body.minPrice && !req.body.maxPrice){
            message = "Maximum Price has been set to " + req.body.minPrice
            errorType = "warning"
            req.body.maxPrice = req.body.minPrice
        }
        else if (!req.body.minPrice && req.body.maxPrice){
            message = "Minimum Price has been set to " + req.body.maxPrice
            errorType = "warning"
            req.body.minPrice = req.body.maxPrice
        }
        else if (Number(req.body.minPrice) > Number(req.body.maxPrice)) {
            message = "Maximum Price cannot be lower than Minimum. Max price has been set to " + req.body.minPrice
            errorType = "warning"
            req.body.maxPrice = req.body.minPrice
        }
        
        else if (req.body.startDate && !req.body.endDate) {
            message = "End Date has been set to " + req.body.startDate
            errorType = "warning"
            req.body.endDate = req.body.startDate
        }
        
        else if (!req.body.startDate && req.body.endDate) {
            message = "Start Date has been set to " + req.body.endDate
            errorType = "warning"
            req.body.startDate = req.body.endDate
        }
        else if (req.body.startDate > req.body.endDate) {
            message = "End Date cannot be before the Start Date. End Date has been set to " + req.body.startDate
            errorType = "warning"
            req.body.endDate = req.body.startDate
        }

        return {countries, errorMessage: message, errorType, oldData: req.body} 
    }

    const inputChecked = checkInput(req)

    if (inputChecked.errorMessage) {
        inputChecked.oldData = req.body
        console.log("inputChecked.oldDate: ", inputChecked.oldData)
        return res.render("festivals/new-festival-form", inputChecked)
    }
    
    else {

        const {name,imageURL,startDate,endDate,country, city, address,currency,minPrice,maxPrice,website,mustKnow,genre} = req.body
    
        Festival.create({name:name, imageURL: imageURL, startDate: startDate, endDate:endDate, location: {city:city, country:country, address:address}, currency: currency, minPrice: minPrice,maxPrice: maxPrice,website: website,mustKnow: mustKnow,genre:genre })
        .then((createdFestival)=>{  
            res.redirect('/festivals/list')
            // res.redirect(`/festivals/${createdFestival._id}`)
        })
        .catch(err=> console.log('An error occured creating the festival:', err))     

    }
})


router.get('/festivals/list',(req,res)=>{
    Festival.find()
    .then((allFestivals)=>{
        res.render('festivals/all-festivals',{allFestivals})
    })
    .catch(err=>console.log('Error occured retrieving all festivals:', err))
})

router.get('/festivals/:festivalId', (req,res)=>{
    Festival.findById(req.params.festivalId)
    .then((festivalDetails)=>{
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

// include similar tests as in create Festival?

    Festival.findById(req.params.id)
    .then((festivalToEdit)=>{
        let countryLeft = countries.filter(country => country === festivalToEdit.location.country)
        console.log(countryLeft)
        res.render('festivals/edit-festival', {festivalToEdit, countryLeft})
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