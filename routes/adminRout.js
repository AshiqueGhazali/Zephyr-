const express = require('express')
const session = require('express-session')
const admin_Route = express() 


const adminController = require('../controller/adminController')

admin_Route.use(session({
    secret: process.env.AUTH_SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
}))

admin_Route.set('view engine', 'ejs');
admin_Route.set('views', './view/admin')

admin_Route.use(express.json())
admin_Route.use(express.urlencoded({extended:true}))


module.exports= admin_Route


admin_Route.get('/login',adminController.loginLoad)
admin_Route.post('/login', adminController.verifyLogin)
admin_Route.get('/dashboard',adminController.loadHome)
admin_Route.get('/userManagement',adminController.loadUserManagement)
admin_Route.get('/searchUser',adminController.searchUser)
admin_Route.get('/blockUser/:id', adminController.blockUser)
admin_Route.get('/unBlockUser/:id',adminController.unBlockUser)

