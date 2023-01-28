const router = require('express').Router()
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const User = require('../models/User.model')
const isLoggedOut = require("../middleware/isLoggedOut");
const isLoggedIn = require("../middleware/isLoggedIn");
const saltRounds = 10

router.get('/sign-up', isLoggedOut, (req,res)=>{
    console.log('Rendering done')
    // data = {userInSession: req.session.currentUser}
    res.render('auth/sign-up')
    
})

router.post('/sign-up', isLoggedOut, (req,res)=>{
    console.log(req.body)
    const {email, password} = req.body

    bcrypt.genSalt(saltRounds)
    .then((salt)=>{
        console.log("Result of salt", salt)
        return bcrypt.hash(password, salt)
    })
    .then(hashedPassword =>{
        console.log('Hashed password is:', hashedPassword)
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
    console.log('Session:', req.session)
    console.log(req.body)
    const {email, password} = req.body

    if(!email || !password){
        res.render('auth/login', {errorMessage: 'Please enter an email or password'})
        return
    }

    User.findOne({email})
    .then(user=>{
        console.log(user)
        if(!user){
            res.render('auth/login', {errorMessage: 'User not found. Please sign up'})
        }
        else if(bcrypt.compareSync(password, user.passwordHash)){
            req.session.currentUser = user
            res.redirect('/profile')
        }
        else {
            res.render('auth/login', {errorMessage: 'Incorrect password'})
        }
    })
    .catch(err=>console.log('Authentication error is', err))
})

router.get('/profile', isLoggedIn, (req,res)=>{
    let data = {userInfo: req.session.currentUser}
    res.render('user/profile', data)
    console.log('User info is:', req.session.currentUser)
})

router.post('/logout', isLoggedIn, (req,res,next)=>{
    req.session.destroy(err => {
        if (err) next(err);
        res.redirect('/login');
    });
})

module.exports = router