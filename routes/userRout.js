const express = require("express")
const session = require("express-session")
const user_route = express()

const userController = require("../controller/userController")

user_route.use(session({
    secret: process.env.AUTH_SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
  }));


user_route.set('view engine', 'ejs')
user_route.set('views','./view/user')

user_route.use(express.json())
user_route.use(express.urlencoded({extended:true}))

user_route.get("/",userController.loadHome) 
user_route.get("/home",userController.loadHome)
user_route.get("/shop",userController.loadShop)
user_route.get("/login",userController.loginLoad)
user_route.get("/register",userController.registerLoad)
user_route.post("/register",userController.insertUser)
user_route.get("/otp",userController.otpLoad)
user_route.get("/resendOTP",userController.ResendOtp)
user_route.post("/otpVerify",userController.verifyOtp)
user_route.post("/verifyLogin",userController.verifyLogin)


module.exports=user_route