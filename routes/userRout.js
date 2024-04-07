const express = require("express")
const session = require("express-session")
const user_route = express()

// google authhh
const {OAuth2Client} = require('google-auth-library');
const CLIENT_ID = '741679351395-pmrtpgsp9g21mql2b8bbrr4edc1gon3d.apps.googleusercontent.com'
const client = new OAuth2Client(CLIENT_ID);

// middleware for session handling
const userAuth = require('../middleware/userAuth');

user_route.use(session({
  secret: process.env.AUTH_SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
}));

// for google auth
const passport = require('passport')
const passportSetup = require('../middleware/passport-setup')

user_route.use(passport.initialize())
user_route.use(passport.session())


const userController = require("../controller/userController")


user_route.set('view engine', 'ejs')
user_route.set('views', './view/user')

user_route.use(express.json())
user_route.use(express.urlencoded({ extended: true }))



user_route.get("/", userController.loadHome)
user_route.get("/home", userController.loadHome)
user_route.get("/shop", userController.loadShop)
user_route.get("/login",userAuth.isLogout, userController.loginLoad)
user_route.get("/register",userAuth.isLogout, userController.registerLoad)
user_route.post("/register", userController.insertUser)
user_route.get("/resendOTP",userAuth.isLogout, userController.ResendOtp)
user_route.post("/otpVerify", userController.verifyOtp)
user_route.post("/verifyLogin",userAuth.isLogout, userController.verifyLogin)
user_route.get('/logout',userAuth.loginCheck,userController.userLogout)
user_route.get('/singleProduct',userController.singleProductLoad)
user_route.post('/reviewSubmit',userController.saveReview)

user_route.get('/google',passport.authenticate('google',{scope:['profile','email']}))
user_route.get('/google/callback',passport.authenticate('google',{failureRedirect:'/login'}),userController.googleAuth)




user_route.get('/profileDetails', userAuth.isLogin, userController.userProfileLoad)


module.exports = user_route