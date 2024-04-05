const express = require('express')
const session = require('express-session')
const admin_Route = express() 

// Importing Controllers....
const adminController = require('../controller/adminController')
const categoryController = require('../controller/categoryController')
const upload = require('../controller/multer')
const productController = require('../controller/productController')

// importing auth
const adminAuth = require('../middleware/adminAuth')

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

// admin Routes
admin_Route.get('/login',adminAuth.isLogout ,adminController.loginLoad)
admin_Route.post('/login', adminController.verifyLogin)
admin_Route.get('/dashboard',adminAuth.isLogin,adminController.loadHome)
admin_Route.get('/logout',adminController.logout)

// user Management Routes
admin_Route.get('/userManagement',adminAuth.isLogin,adminController.loadUserManagement)
admin_Route.get('/searchUser',adminAuth.isLogin,adminController.searchUser)
admin_Route.get('/blockUser/:id',adminAuth.isLogin, adminController.blockUser)
admin_Route.get('/unBlockUser/:id',adminAuth.isLogin,adminController.unBlockUser)

// category Management Routes
admin_Route.get('/categoryManagement',adminAuth.isLogin,categoryController.categoryPageLoad)
admin_Route.get('/addCategory',adminAuth.isLogin,categoryController.addCategoryPageLoad)
admin_Route.post('/addCategory',upload.single('categoryImage'),categoryController.addCategory)
admin_Route.get('/searchCategory',adminAuth.isLogin,categoryController.searchCategory)
admin_Route.get('/softDeleteCategory',adminAuth.isLogin,categoryController.softDeleteCategory)
admin_Route.get('/editCategory',adminAuth.isLogin,categoryController.editCategoryLoad)
admin_Route.post('/editCategory',upload.single('categoryImage'),categoryController.editCategory)
admin_Route.get('/restoreCategory',adminAuth.isLogin,categoryController.restoreCategory)
admin_Route.get('/deleteCategory',adminAuth.isLogin,categoryController.deleteCategory)

// product Management Routes
admin_Route.get('/productManagement',adminAuth.isLogin,productController.productsLoad)
admin_Route.get('/addProduct', adminAuth.isLogin,productController.addProductLoad)
admin_Route.post('/addProduct',upload.array('productImage'),productController.addProduct)
admin_Route.get('/searchProduct',adminAuth.isLogin,productController.searchProduct)
admin_Route.get('/unlistProduct',adminAuth.isLogin,productController.unlistProduct)
admin_Route.get('/listProduct',adminAuth.isLogin,productController.restoreProduct)
admin_Route.get('/deleteProduct',adminAuth.isLogin,productController.deleteProduct)
admin_Route.get('/editProduct',adminAuth.isLogin,productController.editProductLoad)
admin_Route.get('/deleteImage',adminAuth.isLogin,productController.deleteImage)
admin_Route.post('/editProduct',upload.array('productImage'),productController.editProduct)

admin_Route.get('*',function(req,res){
    res.redirect('/admin')
})