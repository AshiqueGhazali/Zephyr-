const express = require('express')
const session = require('express-session')
const admin_Route = express() 

// Importing Controllers....
const adminController = require('../controller/adminController')
const categoryController = require('../controller/categoryController')
const upload = require('../middleware/multer')
const productController = require('../controller/productController')
const orderController = require('../controller/orderController')

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
admin_Route.get('/blockAndUnblockUser',adminAuth.isLogin,adminController.blockAndUnblockUser)

// category Management Routes
admin_Route.get('/categoryManagement',adminAuth.isLogin,categoryController.categoryPageLoad)
admin_Route.get('/addCategory',adminAuth.isLogin,categoryController.addCategoryPageLoad)
admin_Route.post('/addCategory', adminAuth.isLogin,upload.single('categoryImage'),categoryController.addCategory)
admin_Route.get('/searchCategory',adminAuth.isLogin,categoryController.searchCategory)
admin_Route.get('/softDeleteCategory',adminAuth.isLogin,categoryController.softDeleteCategory)
admin_Route.get('/editCategory',adminAuth.isLogin,categoryController.editCategoryLoad)
admin_Route.post('/editCategory',adminAuth.isLogin ,upload.single('categoryImage'),categoryController.editCategory)
admin_Route.get('/restoreCategory',adminAuth.isLogin,categoryController.restoreCategory)


// product Management Routes
admin_Route.get('/productManagement',adminAuth.isLogin,productController.productsLoad)
admin_Route.get('/addProduct', adminAuth.isLogin,productController.addProductLoad)
admin_Route.post('/addProduct', adminAuth.isLogin,upload.array('productImage'),productController.addProduct)
admin_Route.get('/searchProduct',adminAuth.isLogin,productController.searchProduct)
admin_Route.get('/listAndUnlistProduct',adminAuth.isLogin,productController.listAndUnlistProduct)
admin_Route.get('/editProduct',adminAuth.isLogin,productController.editProductLoad)
admin_Route.get('/deleteImage',adminAuth.isLogin,productController.deleteImage)
admin_Route.post('/editProduct', adminAuth.isLogin,upload.array('productImage'),productController.editProduct)

// order Management Routes
admin_Route.get('/orderManagement',adminAuth.isLogin,orderController.orderManagementLoad)
admin_Route.patch('/updateOrderStatus',adminAuth.isLogin,orderController.updateOrderStatus)
admin_Route.get('/orderDetails',adminAuth.isLogin,orderController.ordelDetailsForAdmin)
admin_Route.get('/adminCancelOrder',adminAuth.isLogin,orderController.cancellOrder)




admin_Route.get('*',function(req,res){
    res.redirect('/admin')
})