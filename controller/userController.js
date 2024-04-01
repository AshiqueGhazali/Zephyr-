const User = require("../model/userModel")
const otpModel = require("../model/otpModel")
const bcrypt = require("bcrypt")
const nodemailer = require('nodemailer')
const mailgen = require("mailgen")

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
        const loggedInUser = req.session.user;
        res.render('home',{ user: loggedInUser })
    } catch (error) {
        console.log(error.message);
    }
}
const loadShop = async (req,res)=>{
    try {
        res.render('shop')
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
const otpLoad= async(req,res)=>{
    try {
        res.render('otp')
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
            console.log("no user");
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
        const userData = await User.findOne({email:email}).select('+is_verified')

        if(userData){
            const passwordMatch = await bcrypt.compare(password,userData.password)
            if(passwordMatch){
                if(userData.is_verified == false){
                    res.render('login');
                }else{
                    req.session.user = userData;
                    req.session.userId  = userData._id
                    res.redirect('/home')
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


module.exports={
    loadHome,
    loadShop,
    loginLoad,
    registerLoad,
    otpLoad,
    insertUser,
    ResendOtp,
    verifyOtp,
    verifyLogin
    
}