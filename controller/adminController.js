const User = require('../model/userModel')
const Products = require('../model/productModel')
const Category = require('../model/categoryModel')
const Orders = require('../model/orderModel')

const loginLoad = async(req,res)=>{
    try {
        res.render('login')
    } catch (error) {
        console.log(error.message);
    }
}

const verifyLogin = async(req,res)=>{
    try {
        const isUser = req.body ;
        const username = process.env.AUTH_ADMIN_NAME ;
        const password = process.env.AUTH_ADMIN_PASSWORD ;

        if(isUser.username==username ){
            if(isUser.password==password){
                req.session.admin = { username: isUser.username }
                const userCount = await User.find().count()
                const productCount = await Products.find().count()
                const categoryCount = await Category.find().count()
                const orderCount = await Orders.find().count()
                res.render('dashboard',{userCount,productCount,categoryCount,orderCount})
            }else{
                return res.render('login',{message:"Please enter a valid User Name and Password"})
            }
        }else{
            return res.render('login',{message:"Please enter a valid User Name and Password"})
        }
        
    } catch (error) {
        console.log(error.message);
    }
}

const loadHome = async(req,res)=>{
    try {
        const userCount = await User.find().count()
        const productCount = await Products.find().count()
        const categoryCount = await Category.find().count()
        const orderCount = await Orders.find().count()

        res.render('dashboard',{userCount,productCount,categoryCount,orderCount})
    } catch (error) {
        console.log(error.message);
    }
}
const loadUserManagement = async(req,res)=>{
    try {
        const currentPage = parseInt(req.query.page)
        const userPerPage = 10
        const skip =(currentPage-1)*userPerPage ;

        const users = await User.find().skip(skip).limit(userPerPage)

        const totalProduct = await User.countDocuments()
        const totalPages = Math.ceil(totalProduct/userPerPage)

        res.render('userManagement',{users,currentPage,totalPages})

    } catch (error) {
        console.log(error.message);
    }
}

const searchUser = async(req,res)=>{
    try {
        let users = [];
        const currentPage = parseInt(req.query.page)
        const userPerPage = 10
        const skip =(currentPage-1)*userPerPage ;

        const totalProduct = await User.countDocuments()
        const totalPages = Math.ceil(totalProduct/userPerPage)


        if(req.query.search){
            
            users = await User.find({Fname:{$regex:req.query.search,$options: 'i'}}).skip(skip).limit(userPerPage)
        }else{
            users = await User.find().skip(skip).limit(userPerPage)
        }
        res.render('userManagement',{users:users,currentPage,totalPages})
    } catch (error) {
        console.log(error.message);
    }
}


const blockAndUnblockUser = async(req,res)=>{
    try {
        const id = req.query.id;
        const userData = await User.findById({_id:id})
        userData.is_block = !userData.is_block 
        await userData.save()

        if (userData.is_block) {
            delete req.session.userId;
        }
        
        let message = userData.is_block ? "User Blocked successfully" : "User Unblocked successfully";

        res.status(200).json({message})

    } catch (error) {
        console.log(error.message);
    }
}

const logout = async (req,res)=>{
    try {
        req.session.destroy()
        res.redirect('/admin/login')
    } catch (error) {
        console.log(error.message);
    }
}
module.exports={
    loginLoad,
    verifyLogin,
    loadHome,
    loadUserManagement,
    searchUser,
    logout,
    blockAndUnblockUser
}