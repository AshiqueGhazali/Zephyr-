const bcrypt = require("bcrypt")
const nodemailer = require('nodemailer')
const mailgen = require("mailgen")

// requiring models
const otpModel = require("../model/otpModel")
const User = require("../model/userModel")
const Products = require('../model/productModel')
const Category = require('../model/categoryModel')
const Review = require('../model/userReviewModel')
const Address = require('../model/addressModel')
const Cart = require('../model/cartModel')
const { default: mongoose } = require("mongoose");
// const { sanitizeFilter } = require("mongoose")

// otp verification function
const otpGenrator = ()=>{
    return `${Math.floor(100000 + Math.random() * 900000)}`;
}

const sendOtp = async(req,res)=>{
    const otp = otpGenrator();

    const transporter = nodemailer.createTransport({
        service:"gmail",
        auth: {
            user: process.env.AUTH_EMAIL,
            pass: process.env.AUTH_PASSWORD,
          },
    })

    const mailGenerator = new mailgen({
        theme: "default",
        product: {
          name: "Zephyr",
          link: "https://mailgen.js/",
        },
    })

    const response = {
        body:{
            name:req.session.user,
            intro:"your OTP for Zephyr verification is",
            table:{
                data:[{
                    OTP : otp
                }]
            },
            outro:"Looking forward to doing more business",
        }
    }

    const mail = mailGenerator.generate(response)

    const message = {
        from:process.env.AUTH_EMAIL,
        to:req.session.user,
        subject:"Zephyr OTP Verification",
        html:mail
    }

    try{
        const newOtp = new otpModel({
            email:req.session.user,
            otp:otp,
            createdAt:Date.now(),
            expiresAt:Date.now()+30000
        })

        const data =await newOtp.save()
        req.session.otpId=data._id
        await transporter.sendMail(message);
    }catch(error){
        console.log(error.message);
        
    }

   
}

// resend otp 
const resendOtpGenrator = ()=>{
    return `${Math.floor(100000 + Math.random() * 900000)}`;
}

const resendOtp = async(req,res)=>{
    const otp = resendOtpGenrator();

    const transporter = nodemailer.createTransport({
        service:"gmail",
        auth: {
            user: process.env.AUTH_EMAIL,
            pass: process.env.AUTH_PASSWORD,
          },
    })

    const mailGenerator = new mailgen({
        theme: "default",
        product: {
          name: "Zephyr",
          link: "https://mailgen.js/",
        },
    })

    const response = {
        body:{
            name:req.session.user,
            intro:"your OTP for Zephyr verification is",
            table:{
                data:[{
                    OTP : otp
                }]
            },
            outro:"Looking forward to doing more business",
        }
    }

    const mail = mailGenerator.generate(response)

    const message = {
        from:process.env.AUTH_EMAIL,
        to:req.session.user,
        subject:"Zephyr OTP Verification",
        html:mail
    }

    try{
        const newOtp = new otpModel({
            email:req.session.user,
            otp:otp,
            createdAt:Date.now(),
            expiresAt:Date.now()+30000
        })

        const data =await newOtp.save()

        req.session.otpId=data._id
        await transporter.sendMail(message);
    }catch(error){
        console.log(error.message);
    }

   
}


const securePassword = async (password)=>{
   try {
     const passwordHash = await bcrypt.hash(password, 10)
     return passwordHash;
   
   } catch (error) {
      console.log(error.message);
      
   }
}

const loadHome = async (req,res)=>{
    try {
        let userId = req.session.userId ? req.session.userId : '';
        const productData = await Products.find({isDeleted:false}).sort({ createdAt: -1 })
        const categoryData = await Category.find({isDeleted:false})
        if(req.session.userId){
            const userData = await User.findById({_id:userId });
            res.render('home',{user:userData,products:productData,category:categoryData})
        }
        else{
            res.render('home',{products:productData,category:categoryData})
        }
    } catch (error) {
        console.log(error.message);
    }
}
const loadShop = async (req,res)=>{
    try {
        let userId = req.session.userId

         // pagination setting
         const currentPage = parseInt(req.query.page)
         const productPerPage = 28
         const skip =(currentPage-1)*productPerPage ;
 
         const totalProduct = await User.countDocuments()
         const totalPages = Math.ceil(totalProduct/productPerPage)
         //pagination end


        const productData = await Products.find({isDeleted:false}).skip(skip).limit(productPerPage)
        const categoryData = await Category.find({isDeleted:false})
        const color = await Products.distinct('strapColor')
        const Brand = await Products.distinct('brand')

        if(req.session.userId){
            const userData = await User.findById({_id:userId})
            res.render('shop',{user:userData,products:productData,category:categoryData,color:color,brand:Brand,currentPage,totalPages})
        }else{
            res.render('shop',{products:productData,category:categoryData,color:color,brand:Brand,currentPage,totalPages})
        }

    } catch (error) {
        console.log(error.message);
    }
}
const loginLoad= async (req,res)=>{
    try {
        res.render('login')
    } catch (error) {
        console.log(error.message);
    }
}
const registerLoad= async(req,res)=>{
    try {
        res.render('registration')
    } catch (error) {
        console.log(error.message);
    }
}
const insertUser = async (req,res)=>{
    try {
        if(req.body.email){
            const isExistingUser= await User.findOne({email:req.body.email})
            if(isExistingUser){
                return res.render('registration',{message:"this email is already taken, please try with another email"})
            }
        }

        const spassword =await securePassword(req.body.password)
        const user = new User({
            Fname:req.body.firstName,
            Lname:req.body.lastName,
            username:req.body.firstName,
            email:req.body.email,
            password:spassword,
            is_Verified:false,
            is_is_Admin:false

        })
       
        req.session.userData = user
        req.session.user=req.body.email
        const userEmail = req.session.user

        await sendOtp(req,res)
        res.render('otp', { userEmail });
      

    } catch (error) {
        console.log(error.message);
    }
}

const ResendOtp = async(req,res)=>{
    try {
        const userEmail = req.session.user

        await resendOtp(req,res)
        res.render('otp',{ userEmail });
    } catch (error) {
        console.log(error.message);
    }
}

const verifyOtp = async (req,res)=>{
    try {
        const userEmail = req.session.user
        if(!req.body){
            res.status(400).render('otp',{userEmail, message:"please Enter otp"})
        }
        const otpUserData = await otpModel.findOne({_id:req.session.otpId})
        const otpUser =otpUserData.otp
        const otp = parseFloat(req.body.otp.join(""))


        if(otp==otpUser){
            const userData = req.session.userData
            userData.is_Verified = true
            await User.create(userData)

            res.render('login')
        }else{
            res.status(400).render('otp',{userEmail,message:"Incorrect OTP"})
        }
    } catch (error) {
        console.log(error.message);
    }
}

const verifyLogin  = async (req,res)=>{
    try {
        const email  = req.body.email
        const password = req.body.password
        const userData = await User.findOne({email:email})

        if(userData){
            const passwordMatch = await bcrypt.compare(password,userData.password)
            if(passwordMatch){
                    if(userData.is_block==false){
                        req.session.userId  = userData._id

                        res.redirect('/home')
                    }else{
                        res.render('login',{message:"Your Account is Blocked"})
                    }
            }else{
                res.render('login',{message:"user email and password incorrect"})
            }
        }else{
            res.render('login',{message:"user email and password incorrect"})
        }

    } catch (error) {
        console.log(error.message)
}
}

const userLogout = async(req,res)=>{
    try {
        req.session.destroy();
        res.redirect('/home')
    } catch (error) {
        
    }
}

const singleProductLoad = async(req,res)=>{
    try {
        const id =  req.query.id
        const productData = await Products.findOne({_id:id})
        const reviews = await Review.find({produtId:id})

        if(req.session.userId){
            const userData = await User.findById({_id:req.session.userId})
            res.render('singleProduct',{user:userData,product:productData,review:reviews})
        }else{
            res.render('singleProduct',{product:productData,review:reviews})
        }
           
    } catch (error) {
        console.log(error.message);
    }
}


const saveReview = async(req,res)=>{
    try {
        
        const review = new Review({
            Name:req.body.name,
            Email:req.body.email,
            phone:req.body.number,
            Message:req.body.message,
            produtId:req.body.id
        })
        await review.save()
        res.redirect('/shop')

    } catch (error) {
        console.log(error.message);
    }
}

const googleAuth = async(req,res)=>{
    try {
        res.redirect('/home',)
        
    } catch (error) {
        console.log(error.message);
    }
}

// user Address Profile ##################

const userProfileLoad =async(req,res)=>{
    try {
        const id = req.query.id
        const userData = await User.findById({_id:id})
       
        res.render('userProfileDetails',{user:userData})
    } catch (error) {
        console.log(error.message);
    }
}

const updateProfileLoad = async(req,res)=>{
    try {
        // const id = req.query.id
        let userId = req.session.userId

        const userData = await User.findById({_id:userId})
        res.render('updateProfile',{user:userData})
    } catch (error) {
        console.log(error.message);
    }
}

const updateProfile = async (req,res)=>{
    try {
        const userData = await User.findByIdAndUpdate({_id:req.body.id},{$set:{
            Fname:req.body.firstName,
            Lname:req.body.lastName,
            username:req.body.username,
            email:req.body.email,
            phone:req.body.phone
        }})

        // redirect to /profileDetails page , but got some error  
        res.redirect('/home')

    } catch (error) {
        console.log(error.message);
    }
}

// user Address Management ##################

const addressManagementLoad = async (req,res)=>{
    try {
        let userId = req.session.userId

        const userData = await User.findById({_id:userId})
        const address = await Address.find({user_id:userId})

        res.render('addressManagement',{user:userData,address:address})
    } catch (error) {
        console.log(error.message);
    }
}

const saveAddress = async(req,res)=>{
    try {
        const id = req.session.userId
        const userAddress = new Address({
            user_id : id,
            Name : req.body.Name,
            Mobile : req.body.phone,
            PIN : req.body.pincode,
            Locality : req.body.locality,
            address : req.body.address,
            city : req.body.city,
            state : req.body.state,
            landmark : req.body.landmark,
            alternatePhone : req.body.phone2,
            is_Home : !!req.body.home,
            is_Work : !!req.body.work,
        })

        await userAddress.save()
        res.redirect('/addressManagement')

    } catch (error) {
        console.log(error.message);
    }
}

const editAddress = async (req,res)=>{
    try {
        const id = req.session.userId
        const edit = await Address.updateOne({user_id:id},{$set:{
            Name : req.body.Name,
            Mobile : req.body.phone,
            PIN : req.body.pincode,
            Locality : req.body.locality,
            address : req.body.address,
            city : req.body.city,
            state : req.body.state,
            landmark : req.body.landmark,
            alternatePhone : req.body.phone2,
            is_Home : !!req.body.home,
            is_Work : !!req.body.work,
        }})

        res.redirect('/addressManagement')
    } catch (error) {
        console.log(error.message);
    }
}

const deleteAddress = async (req,res)=>{
    try {
        const id = req.query.id
        if(id){
            await Address.deleteOne({_id:id})
            return res.redirect('/addressManagement')
        }
    } catch (error) {
        console.log(error.message);
    }
}

// user Cart Management ################## 

const cartLoad = async (req,res)=>{
    try {
        const userId = req.session.userId
        const userData = await User.findById({_id:userId})
        const userCart = await Cart.aggregate([
            {$match:{userId:new mongoose.Types.ObjectId(userId)}},
            {$unwind:'$cartItems'},
            {$lookup:{
                from:'products',
                localField: "cartItems.productId",
                foreignField: "_id",
                as: "productDetails",
            }}
        ])

        // total
        
        const totalPriceResult = await Cart.aggregate([
            { $match: { userId: new mongoose.Types.ObjectId(userId) } },
            { $unwind: '$cartItems' },
            { $lookup: {
                from: 'products',
                localField: 'cartItems.productId',
                foreignField: '_id',
                as: 'productDetails'
            } },
            { $unwind: '$productDetails' },
            { $project: {
                _id: 0,
                totalPrice: { $multiply: ['$productDetails.discountPrice', '$cartItems.quantity'] }
            } },
            { $group: {
                _id: null,
                totalPrice: { $sum: '$totalPrice' }
            } }
        ]);
        
        const totalPrice = totalPriceResult.length > 0 ? totalPriceResult[0].totalPrice : 0;
        
        // total

        
        if (userCart.length === 0) {
            return res.render('cart', {user: userData, userCart: [], message: 'Your cart is empty.'});
        }

        res.render('cart', {user: userData, userCart: userCart,totalPrice});
    } catch (error) {
        console.log(error.message);
    }
}

const addToCart = async(req,res)=>{
    try {
        const productId = req.query.productId
        const userId = req.session.userId

        if(typeof userId == 'undefined'){
            return res.redirect('/login')
        }

        let cart = await Cart.findOne({ userId: userId });
        if (!cart) {
            cart = new Cart({
                userId: userId,
                cartItems: [{ productId: productId }]
            });
        } else {
            const existingItem = cart.cartItems.find(item => item.productId.equals(productId));
            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                cart.cartItems.push({ productId: productId });
            }
        }
        await cart.save()
        res.redirect('/cart')

    } catch (error) {
        console.log(error.message);
    }
}

const removeFromCart = async (req,res)=>{
    try {
        const userID = req.session.userId;
        const productId = req.query.productId;

        const cartData = await Cart.findOne({ userId: userID });
        const index = cartData.cartItems.findIndex((value) => {
        return value.productId.toString() === productId;
        });

        cartData.cartItems.splice(index, 1);
        await cartData.save();
        res.redirect("/cart");
    } catch (error) {
        console.log(error.message);
    }
}

const updateQuantity = async(req,res)=>{
    try {
        const userId = req.session.userId;
        const productId = req.query.productId;
        const change = parseInt(req.query.change);

        let cart = await Cart.findOne({ userId: userId });

        const index = cart.cartItems.findIndex(item => item.productId.equals(productId));

        if (index !== -1) {
            cart.cartItems[index].quantity += change;
            
            if (cart.cartItems[index].quantity <= 0) {
                cart.cartItems.splice(index, 1);
            }
        }

        await cart.save();
        res.sendStatus(200)

    } catch (error) {
        console.log(error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
}





const filterByPrice = async (req, res) => {
    try {
        const sortBy = req.query.sortBy; 

        // pagination setting
        const currentPage = parseInt(req.query.page)
        const productPerPage = 28
        const skip =(currentPage-1)*productPerPage ;

        const totalProduct = await User.countDocuments()
        const totalPages = Math.ceil(totalProduct/productPerPage)
        //pagination end

        let userId = req.session.userId
        const categoryData = await Category.find({isDeleted:false})
        const color = await Products.distinct('strapColor')
        const Brand = await Products.distinct('brand')

        // sorting
        let products;
        switch (sortBy) {
            case 'lowToHigh':
                products = await Products.find({ isDeleted: false }).sort({ discountPrice: 1 }).skip(skip).limit(productPerPage)
                break;
            case 'highToLow':
                products = await Products.find({ isDeleted: false }).sort({ discountPrice: -1 }).skip(skip).limit(productPerPage)
                break;
            case 'newestFirst':
                products = await Products.find({isDeleted:false}).sort({ createdAt: -1 }).skip(skip).limit(productPerPage)
            default:
                products = await Products.find({ isDeleted: false }).sort({ discountPrice: -1 }).skip(skip).limit(productPerPage)
        }

        if(req.session.userId){
            const userData = await User.findById({_id:userId})
            res.render('shop',{user:userData,products:products,category:categoryData,color:color,brand:Brand,currentPage,totalPages})
        }else{
            res.render('shop',{products:products,category:categoryData,color:color,brand:Brand,currentPage,totalPages})
        }

    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal Server Error");
    }
}

const filterByCategory = async (req, res) => {
    try {

        let userId = req.session.userId

        // pagination setting
        const currentPage = parseInt(req.query.page)
        const productPerPage = 28
        const skip =(currentPage-1)*productPerPage ;

        const totalProduct = await User.countDocuments()
        const totalPages = Math.ceil(totalProduct/productPerPage)
        //pagination end

        const categoryData = await Category.find({isDeleted:false})
        const color = await Products.distinct('strapColor')
        const Brand = await Products.distinct('brand')

        const sortBy = req.query.sortBy; 

        let products = await Products.find({isDeleted: false }).skip(skip).limit(productPerPage)

        if(sortBy!='allProduct'){
            products = await Products.find({ category: sortBy, isDeleted: false }).skip(skip).limit(productPerPage)
        }

        if(req.session.userId){
            const userData = await User.findById({_id:userId})
            res.render('shop',{user:userData,products:products,category:categoryData,color:color,brand:Brand,currentPage,totalPages})
        }else{
            res.render('shop',{products:products,category:categoryData,color:color,brand:Brand,currentPage,totalPages})
        }

    } catch (error) {
        console.log(error.message);
    }
}

const filterByColor = async (req, res) => {
    try {

        let userId = req.session.userId

        // pagination setting
        const currentPage = parseInt(req.query.page)
        const productPerPage = 28
        const skip =(currentPage-1)*productPerPage ;

        const totalProduct = await User.countDocuments()
        const totalPages = Math.ceil(totalProduct/productPerPage)
        //pagination end

        const categoryData = await Category.find({isDeleted:false})
        const color = await Products.distinct('strapColor')
        const Brand = await Products.distinct('brand')

        const sortBy = req.query.sortBy; 

        let products = await Products.find({isDeleted: false }).skip(skip).limit(productPerPage)

        if(sortBy!='allProduct'){
            products = await Products.find({ strapColor: sortBy, isDeleted: false }).skip(skip).limit(productPerPage)
        }

        if(req.session.userId){
            const userData = await User.findById({_id:userId})
            res.render('shop',{user:userData,products:products,category:categoryData,color:color,brand:Brand,currentPage,totalPages})
        }else{
            res.render('shop',{products:products,category:categoryData,color:color,brand:Brand,currentPage,totalPages})
        }

    } catch (error) {
        console.log(error.message);
    }
}

const filterByBrand = async (req, res) => {
    try {

        let userId = req.session.userId

        // pagination setting
        const currentPage = parseInt(req.query.page)
        const productPerPage = 28
        const skip =(currentPage-1)*productPerPage ;

        const totalProduct = await User.countDocuments()
        const totalPages = Math.ceil(totalProduct/productPerPage)
        //pagination end

        const categoryData = await Category.find({isDeleted:false})
        const color = await Products.distinct('strapColor')
        const Brand = await Products.distinct('brand')

        const sortBy = req.query.sortBy; 

        let products = await Products.find({isDeleted: false }).skip(skip).limit(productPerPage)

        if(sortBy!='allProduct'){
            products = await Products.find({ brand: sortBy, isDeleted: false }).skip(skip).limit(productPerPage)
        }

        if(req.session.userId){
            const userData = await User.findById({_id:userId})
            res.render('shop',{user:userData,products:products,category:categoryData,color:color,brand:Brand,currentPage,totalPages})
        }else{
            res.render('shop',{products:products,category:categoryData,color:color,brand:Brand,currentPage,totalPages})
        }

    } catch (error) {
        console.log(error.message);
    }
}


// checkout and order

const ordersPageLoad = async(req,res)=>{
    try {
        const id = req.session.userId
        const userData = await User.findById({_id:id})

        res.render('orders',{user:userData})
    } catch (error) {
        console.log(error.message);
    }
}

const checkoutPageLoad = async(req,res)=>{
    try {
        res.render('checkout')
    } catch (error) {
        console.log(error.message);
    }
}


module.exports={
    loadHome,
    loadShop,
    loginLoad,
    registerLoad,
    insertUser,
    ResendOtp,
    verifyOtp,
    verifyLogin,
    userLogout,
    userProfileLoad,
    singleProductLoad,
    saveReview,
    googleAuth,
    updateProfileLoad,
    updateProfile,
    addressManagementLoad,
    saveAddress,
    editAddress,
    deleteAddress,
    cartLoad,
    addToCart,
    removeFromCart,
    updateQuantity,
    filterByPrice,
    filterByCategory,
    filterByColor,
    filterByBrand,
    ordersPageLoad,
    checkoutPageLoad

}