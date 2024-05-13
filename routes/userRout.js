const express = require("express")
const session = require("express-session")
const user_route = express()
// const errorMiddleware = require('../middleware/errorHandlingMiddleware.js')


// google authhh
const {OAuth2Client} = require('google-auth-library');
const CLIENT_ID = process.env.GOOGLE_CLINT_ID
const client = new OAuth2Client(CLIENT_ID);

// middleware for session handling
const userAuth = require('../middleware/userAuth');



// for google auth
const passport = require('passport')
const passportSetup = require('../middleware/passport-setup')

user_route.use(passport.initialize())
user_route.use(passport.session())



const userController = require("../controller/userController")
const orderContoller = require("../controller/orderController")
const cartAndWishlistController = require("../controller/cartAndWishlistController")
const coupenController = require('../controller/coupenController')

user_route.set('views', './view/user')


user_route.get("/", userController.loadHome)
user_route.get("/home", userController.loadHome)
user_route.get("/shop", userController.loadShop)
user_route.get("/login",userAuth.isLogout, userController.loginLoad)
user_route.get("/register",userAuth.isLogout, userController.registerLoad)
user_route.post("/register", userController.insertUser)
user_route.get("/resendOTP",userAuth.isLogout, userController.ResendOtp)
user_route.post("/otpVerify", userController.verifyOtp)
user_route.post("/verifyLogin",userAuth.isLogout, userController.verifyLogin)

// forgot password and reset
user_route.get("/forgotPassword",userAuth.isLogout,userController.forgotPasswordPage)
user_route.post("/verifyEmail",userController.verifyEmail)
user_route.post("/forgotOtpVerify",userController.forgotOtpVerify)
user_route.post('/resetPassword',userController.resetPassword)

user_route.get('/logout',userAuth.loginCheck,userController.userLogout)
user_route.get('/singleProduct',userController.singleProductLoad)
user_route.post('/reviewSubmit',userController.saveReview)

user_route.get('/google',passport.authenticate('google',{scope:['profile','email']}))
user_route.get('/google/callback',passport.authenticate('google',{failureRedirect:'/login'}),userController.googleAuth)



// user profile Management 
user_route.get('/profileDetails', userAuth.isLogin, userController.userProfileLoad)
user_route.post('/updateProfile',userAuth.isLogin,userController.updateProfile)
user_route.post('/changePassword',userAuth.isLogin,userController.changePassword)

// user Address Management
user_route.get('/addressManagement', userAuth.isLogin, userController.addressManagementLoad)
user_route.post('/addAddress',userAuth.isLogin,userController.saveAddress)
user_route.post('/editAddress',userAuth.isLogin,userController.editAddress)
user_route.get('/deleteAddress',userAuth.isLogin,userController.deleteAddress)

// user Cart Management
user_route.get('/cart',userAuth.isLogin, cartAndWishlistController.cartLoad)
user_route.get('/addTocart',cartAndWishlistController.addToCart)
user_route.get('/removeFromCart',userAuth.isLogin,cartAndWishlistController.removeFromCart)
user_route.post('/updateQuantity',userAuth.isLogin,cartAndWishlistController.updateQuantity)

// Product Filters , sort & search
user_route.get('/filterByPrice',userController.filterByPrice)
user_route.get('/filterByCategory',userController.filterByCategory)
user_route.get('/filterByColor',userController.filterByColor)
user_route.get('/filterByBrand',userController.filterByBrand)
user_route.get('/searchProduct',userController.searchProduct)

// checkout , order and Wallet
user_route.get('/checkout',userAuth.isLogin,orderContoller.checkoutPageLoad)
user_route.get('/orders', userAuth.isLogin,orderContoller.ordersPageLoad)
user_route.post('/createOrder',userAuth.isLogin,orderContoller.createOrder)
user_route.post('/verifyPayment', userAuth.isLogin,orderContoller.verifyPayment);
user_route.post('/getPaymentDetails', userAuth.isLogin,orderContoller.getPaymentDetails)
user_route.get('/wallet',userAuth.isLogin,orderContoller.walletLoad)
user_route.post('/downloadInvoice',userAuth.isLogin, orderContoller.downloadInvoice)

user_route.get('/orderDetails',userAuth.isLogin,orderContoller.orderDetailsLoad)
user_route.get('/cancelOrder',userAuth.isLogin,orderContoller.cancellOrder)
user_route.post('/returnOrder',userAuth.isLogin,orderContoller.requestForReturn)

// wishlist management
user_route.get('/wishlist',userAuth.isLogin, cartAndWishlistController.wishlistLoad)
user_route.get('/addToWishlist',cartAndWishlistController.addTowishlist)
user_route.get('/removeFromWishlist',userAuth.isLogin,cartAndWishlistController.removeFromWishlist)

// coupen Management 
user_route.get('/coupens',userAuth.isLogin,coupenController.listCoupensInUserSide)
user_route.post('/applyCoupon',userAuth.isLogin,coupenController.applyCoupon)
user_route.get('/removeCoupen',userAuth.isLogin,coupenController.removeCoupen)



module.exports = user_route