const router = require('express').Router()
const mongoose = require('mongoose')
const Festival = require('../models/Festival.model')
const User = require('../models/User.model')
const isLoggedOut = require("../middleware/isLoggedOut");
const isLoggedIn = require("../middleware/isLoggedIn");
const { userInfo } = require('os');
const fileUploader = require('../config/cloudinary.config')

router.get('/festivals/create',(req,res)=>{
    res.render('festivals/new-festival-form')
})

router.post('/festivals/create', fileUploader.single('imageURL'),(req,res)=>{
    const {name,startDate,endDate,country, city, address,currency,minPrice,maxPrice,website,mustKnow,genre} = req.body
    Festival.create({name, imageURL: req.file.path, startDate, endDate, location: {city, country, address}, currency, minPrice,maxPrice, website, mustKnow,genre })
    .then((createdFestival)=>{  
        console.log('Created festival is: ', createdFestival)
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

// router.get('/festivals/:festivalId', (req,res)=>{
//     console.log('Req.params is:', req.params)

//     Festival.findOne({_id: req.params.festivalId})
//     .then((festivalDetails)=>{
//         console.log(festivalDetails)
//         res.render('festivals/festival-details', festivalDetails)
//     })
//     .catch(err=>console.log('Error getting the festival detail is:', err))
//   })

  router.get('/festivals/:festivalId', (req,res)=>{
    console.log('Req.params is:', req.params)
    let isIncludingFav;

    User.findById(req.session.currentUser._id)
    .then((userFromDB)=>{
        console.log('User from DB Festivals is', userFromDB.festivals)
        for (let i=0; i< userFromDB.festivals.length; i++) {
            if (userFromDB.festivals.length == 0) {
                isIncludingFav = false
                return;
            }
            else if (userFromDB.festivals[i] == req.params.festivalId) {
                isIncludingFav = true;
                return;
            }
        }
        console.log('Does it include Fav?:', isIncludingFav)
    })
    .then(()=>{
        Festival.findOne({_id: req.params.festivalId})
        .then((festivalDetails)=>{
            console.log(festivalDetails)
            res.render('festivals/festival-details', {festivalDetails, isIncludingFav})
    })
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

router.post('/festivals/:id/edit', fileUploader.single('imageURL'), (req,res)=>{

    const {name,existingImage,startDate,endDate,country, city, address,currency,minPrice,maxPrice,website,mustKnow,genre} = req.body

    let imageURL;
    if (req.file) {
      imageURL = req.file.path;
    } else {
      imageURL = existingImage;
    }

    Festival.findByIdAndUpdate(req.params.id, {name, imageURL, startDate, endDate, location: {city, country, address}, currency, minPrice,maxPrice,website,mustKnow,genre})
    .then((festivalToUpdate)=>{
        res.redirect(`/festivals/${festivalToUpdate._id}`)
    })
    .catch(err=>console.log('Editing error is:', err))
})

router.get('/festivals/:id/fav/', (req, res)=>{
    
        User.findById(req.session.currentUser._id)
        .then(userToUpdate=>{
            console.log('User to Update is', userToUpdate)
            userToUpdate.festivals.push(req.params.id)
            User.create(userToUpdate)
        })
    .then(()=>{
        res.redirect(`/festivals/${req.params.id}`)

    })
    .catch(err=> console.log('An error occured while adding to fav:', err))
})

router.get('/festivals/:id/unfav/', (req, res)=>{
    
        User.findById(req.session.currentUser._id)
        .then(userToUpdate=>{
            console.log('User to Update is', userToUpdate)
            userToUpdate.festivals.pull(req.params.id)
            User.create(userToUpdate)
        })
    .then(()=>{
        res.redirect(`/festivals/${req.params.id}`)
    })
    .catch(err=> console.log('An error occured while removing from fav:', err))
})
module.exports = router