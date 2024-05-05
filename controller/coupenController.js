const Coupen = require('../model/coupenModel')
const Order = require('../model/orderModel')
const orderModel = require('../model/categoryModel')
const User = require('../model/userModel')


const coupenManagementLoad = async(req,res)=>{
    try {
        const coupens = await Coupen.find()
        res.render('coupenManagement',{coupens:coupens})
    } catch (error) {
        console.log(error.message);
    }
}

const addCoupenLoad = async(req,res)=>{
    try {
        res.render('addCoupen')
    } catch (error) {
        console.log(error.message);
    }
}

const addCoupen = async(req,res)=>{
    try {
        const {coupenCode,discountPercentage,expiredDate,minPurchaseAmt,maxRedimabelAmount}=req.body

        
        const isExist = await Coupen.findOne({coupenCode:coupenCode})
        if(isExist){
            return res.render('addCoupen',{message:"This CODE is already exist, please enter another one"})
        }
        
        
        const coupen = new Coupen({
            coupenCode : coupenCode,
            discountPercentage : discountPercentage,
            expiredDate : expiredDate,
            minPurchaseAmt : minPurchaseAmt,
            maxRedimabelAmount : maxRedimabelAmount
        })

        await coupen.save()
        res.redirect('/admin/coupenManagement')

    } catch (error) {
        console.log(error.message);
    }
}

const coupenStatusChange = async(req,res)=>{
    try {
        const id = req.query.coupenId;
        const coupen = await Coupen.findById({_id:id})
        coupen.status = !coupen.status 
        await coupen.save()

        let message = coupen.status ? "Coupen Activated successfully" : "Coupen Inactivated successfully";

        res.status(200).json({message})

    } catch (error) {
        console.log(error.message);
    }
}

const listCoupensInUserSide = async(req,res)=>{
    try {
        const user = await User.findById({_id:req.session.userId})
        const coupons = await Coupen.find({status:true})
        res.render('coupons',{user,coupons})
    } catch (error) {
        console.log(error.message);
    }
}

const applyCoupon = async(req,res)=>{
    try {
        const {couponCode, totalAmount}= req.body
        const data=await Coupen.findOne({status:true,coupenCode:couponCode})

        if(data !==null && data.minPurchaseAmt > totalAmount ){
            res.status(400).json({message:`This coupon is only valid for Purchases Over ${data.minPurchaseAmt}`})
        }else if(data !==null){
            req.session.coupen = data.discountPercentage;
            req.session.coupenId = data._id
            res.status(200).json({success:true})
        }else{
            res.status(400).json({message:"coupen code is incorrect!"})
        }
    } catch (error) {
        console.log(error.message);
    }
}

const removeCoupen = async(req,res)=>{
    try {

        if(req.session.coupen && req.session.coupenId ){
            delete req.session.coupen
            delete req.session.coupenId
            res.status(200).json({success:true})
        }else{
            res.status(400).json({message:"You did't Applied Any coupen.!"})
        }
        
        
    } catch (error) {
        console.log(error.message);
    }
}
module.exports = {
    coupenManagementLoad,
    addCoupenLoad,
    addCoupen,
    coupenStatusChange,
    listCoupensInUserSide,
    applyCoupon,
    removeCoupen
}