const router = require('express').Router()
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const User = require('../models/User.model')
const isLoggedOut = require("../middleware/isLoggedOut");
const isLoggedIn = require("../middleware/isLoggedIn");
const saltRounds = 10

router.get('/sign-up', isLoggedOut, (req,res)=>{
    res.render('auth/sign-up') 
})

router.post('/sign-up', isLoggedOut, (req,res)=>{
    const {email, password} = req.body

    bcrypt.genSalt(saltRounds)
    .then((salt)=>{
        return bcrypt.hash(password, salt)
    })
    .then(hashedPassword =>{
        return User.create({
            email: email,
            passwordHash: hashedPassword
        })

    })
    .then(()=>{
        res.redirect('/login')
    })
    .catch(err=> console.log('Sign-up error is:', err))

})

router.get('/login', isLoggedOut, (req,res)=>{
    res.render('auth/login')
})

router.post('/login', isLoggedOut, (req,res)=>{
    const {email, password} = req.body

    if(!email || !password){
        res.render('auth/login', {errorMessage: 'Please enter an email or password'})
        return
    }

    User.findOne({email})
    .then(user=>{
        if(!user){
            res.render('auth/login', {errorMessage: 'User not found. Please sign up'})
        }
        else if(bcrypt.compareSync(password, user.passwordHash)){
            req.session.currentUser = user.toObject()
            delete req.session.currentUser.passwordHash
            res.redirect('/profile')
            // console.log("email: ", req.body.email, "password: ", req.body.password)
        }
        else {
            res.render('auth/login', {errorMessage: 'Incorrect password'})
        }
    })
    .catch(err=>console.log('Authentication error is', err))
})

router.get('/profile', isLoggedIn, (req,res)=>{
    User.findById(req.session.currentUser._id)
    .populate('festivals')
    .then((profileInfo)=>{
        console.log('Profile Info is:', profileInfo)
        res.render('user/profile', profileInfo)     
    })
   
})

router.post('/logout', isLoggedIn, (req,res,next)=>{
    req.session.destroy(err => {
        if (err) next(err);
        res.redirect('/login');
    });
})






module.exports = router