const User = require('../model/userModel')
const Products = require('../model/productModel')
const Category = require('../model/categoryModel')
const Orders = require('../model/orderModel')

const PDFDocument = require('pdfkit');
const PDFTable = require('pdfkit-table')

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
                res.redirect('/admin/dashboard')
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
        const orderCount = await Orders.find().count()
        const result = await Orders.aggregate([{$match:{orderStatus:"completed"}},{$group:{_id:null,  totalSales: { $sum: "$totalAmount" }}}])
        const totalSales = result[0].totalSales

        const salesReport = await Orders.find()

        res.render('dashboard',{userCount,productCount,orderCount,totalSales,salesReport})
    } catch (error) {
        console.log(error.message);
    }
}


const salesReport = async(req,res)=>{
    try {
        const { interval } = req.query;
        const { startDate, endDate } = req.query;

        let salesReport;
        if (interval === 'daily') {
            salesReport = await Orders.find({
                orderDate: {
                    $gte: new Date(new Date().setHours(0,0,0,0)),
                    $lt: new Date(new Date().setHours(23,59,59,999))
                }
            });
            
        } else if (interval === 'weekly') {
            const startDate = new Date();
            const endDate = new Date(startDate.getTime() - 7 * 24 * 60 * 60 * 1000);
            salesReport = await Orders.find({
                orderDate: {
                    $gte: endDate,
                    $lt: startDate
                }
            });
        } else if (interval === 'yearly') {
            const yearStart = new Date(new Date().getFullYear(), 0, 1);
            const yearEnd = new Date(new Date().getFullYear() + 1, 0, 0);
            salesReport = await Orders.find({
                orderDate: {
                    $gte: yearStart,
                    $lt: yearEnd
                }
            });
        }else if(startDate && endDate){
            salesReport = await Orders.find({
                orderDate: {
                    $gte: startDate,
                    $lte: endDate
                }
            });
        } else {
            salesReport = await Orders.find();
        }
        
        res.json({salesReport });

    } catch (error) {
        console.log(error.message);
        res.status(500).send('Server Error');
    }
}

const downloadPdf= async(req,res)=>{
    try {
        
    } catch (error) {
        
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
    blockAndUnblockUser,
    salesReport
}