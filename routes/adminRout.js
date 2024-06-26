const express = require('express')
const session = require('express-session')
const admin_Route = express()

// Importing Controllers....
const adminController = require('../controller/adminController')
const categoryController = require('../controller/categoryController')
const upload = require('../middleware/multer')
const productController = require('../controller/productController')
const orderController = require('../controller/orderController')
const coupenController = require('../controller/coupenController')
const offerController = require('../controller/offerController')
const bannerController = require('../controller/bannerController')

// importing auth
const adminAuth = require('../middleware/adminAuth')


admin_Route.set('views', './view/admin')

module.exports = admin_Route

// admin Routes
admin_Route.get('/login', adminAuth.isLogout, adminController.loginLoad)
admin_Route.post('/login', adminController.verifyLogin)
admin_Route.get('/dashboard', adminAuth.isLogin, adminController.loadHome)
admin_Route.get('/orderStatuses', adminAuth.isLogin, adminController.orderStatuses)
admin_Route.get('/logout', adminController.logout)

admin_Route.get('/salesReport', adminAuth.isLogin, adminController.salesReport)
admin_Route.post('/downloadExcel', adminAuth.isLogin, adminController.downloadExcel)


// user Management Routes
admin_Route.get('/userManagement', adminAuth.isLogin, adminController.loadUserManagement)
admin_Route.get('/searchUser', adminAuth.isLogin, adminController.searchUser)
admin_Route.get('/blockAndUnblockUser', adminAuth.isLogin, adminController.blockAndUnblockUser)

// category Management Routes
admin_Route.get('/categoryManagement', adminAuth.isLogin, categoryController.categoryPageLoad)
admin_Route.get('/addCategory', adminAuth.isLogin, categoryController.addCategoryPageLoad)
admin_Route.post('/addCategory', adminAuth.isLogin, upload.upload.single('categoryImage'), categoryController.addCategory)
admin_Route.get('/searchCategory', adminAuth.isLogin, categoryController.searchCategory)
admin_Route.get('/softDeleteCategory', adminAuth.isLogin, categoryController.softDeleteCategory)
admin_Route.get('/editCategory', adminAuth.isLogin, categoryController.editCategoryLoad)
admin_Route.post('/editCategory', adminAuth.isLogin, upload.upload.single('categoryImage'), categoryController.editCategory)
admin_Route.get('/restoreCategory', adminAuth.isLogin, categoryController.restoreCategory)


// product Management Routes
admin_Route.get('/productManagement', adminAuth.isLogin, productController.productsLoad)
admin_Route.get('/addProduct', adminAuth.isLogin, productController.addProductLoad)
admin_Route.post('/addProduct', adminAuth.isLogin, upload.Upload, productController.addProduct)
admin_Route.get('/searchProduct', adminAuth.isLogin, productController.searchProduct)
admin_Route.get('/listAndUnlistProduct', adminAuth.isLogin, productController.listAndUnlistProduct)
admin_Route.get('/editProduct', adminAuth.isLogin, productController.editProductLoad)
admin_Route.get('/removeProductImage', adminAuth.isLogin, productController.deleteImage)
admin_Route.post('/editProduct', adminAuth.isLogin, upload.Upload, productController.editProduct)


// order Management Routes
admin_Route.get('/orderManagement', adminAuth.isLogin, orderController.orderManagementLoad)
admin_Route.patch('/updateOrderStatus', adminAuth.isLogin, orderController.updateOrderStatus)
admin_Route.get('/orderDetails', adminAuth.isLogin, orderController.ordelDetailsForAdmin)
admin_Route.get('/adminCancelOrder', adminAuth.isLogin, orderController.cancellOrder)
admin_Route.get('/approveReturn', adminAuth.isLogin, orderController.approveReturn)


// coupen Management Routes
admin_Route.get('/coupenManagement', adminAuth.isLogin, coupenController.coupenManagementLoad)
admin_Route.get('/addCoupen', adminAuth.isLogin, coupenController.addCoupenLoad)
admin_Route.post('/addCoupon', adminAuth.isLogin, coupenController.addCoupen)
admin_Route.get('/coupenStatusChange', adminAuth.isLogin, coupenController.coupenStatusChange)

// offer Management Rotes
admin_Route.get('/offerManagement', adminAuth.isLogin, offerController.offerManagementLoad)
admin_Route.get('/addOffer', adminAuth.isLogin, offerController.addOfferLoad)
admin_Route.post('/addOffer', adminAuth.isLogin, offerController.addOffer)
admin_Route.get('/offerStatusChange', adminAuth.isLogin, offerController.offerStatusChange)


// Banner Management Routes
admin_Route.get('/bannerManagement', adminAuth.isLogin, bannerController.bannerManagemntLoad)
admin_Route.get('/addBanner', adminAuth.isLogin, bannerController.addBannerPageLoad)
admin_Route.post('/addBanner', adminAuth.isLogin, upload.upload.single('bannerImage'), bannerController.addBanner)
admin_Route.get('/listAndUnlistBanner', adminAuth.isLogin, bannerController.listAndUnlistBanner)
admin_Route.delete('/deleteBanner', adminAuth.isLogin, bannerController.deleteBanner)
admin_Route.get('/editBanner', adminAuth.isLogin, bannerController.editBannerLoad)
admin_Route.post('/editBanner', adminAuth.isLogin, upload.upload.single('bannerImage'), bannerController.editBanner)

