const User = require('../model/userModel')

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
                res.render('dashboard')
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
        res.render('dashboard')
    } catch (error) {
        console.log(error.message);
    }
}
const loadUserManagement = async(req,res)=>{
    try {
        const userData= await User.find({})
        res.render('userManagement',{users:userData})
    } catch (error) {
        console.log(error.message);
    }
}

const searchUser = async(req,res)=>{
    try {
        let users = [];
        if(req.query.search){
            
            users = await User.find({Fname:{$regex:req.query.search,$options: 'i'}})
        }else{
            users = await User.find()
        }
        res.render('userManagement',{users:users})
    } catch (error) {
        console.log(error.message);
    }
}

const blockUser = async(req,res)=>{
    try {
        const id = req.params.id
        if(id){
            await User.updateOne({_id:id},{$set:{is_block:true}})
            delete req.session.userId
            return res.redirect('/admin/userManagement')
        }
    } catch (error) {
        console.log(error.message);
    }
}

const unBlockUser = async(req,res)=>{
    try {
        const id = req.params.id;
        if(id){
            await User.updateOne({_id:id},{$set:{is_block:false}})
            return res.redirect('/admin/userManagement')
        }
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
    blockUser,
    unBlockUser,
    logout
}