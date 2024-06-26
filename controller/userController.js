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
const Offer = require('../model/offerModel')
const Banner = require('../model/bannerModel')
const { default: mongoose } = require("mongoose");
const { json } = require("express")
// const { sanitizeFilter } = require("mongoose")

// otp verification function
const otpGenrator = () => {
    return `${Math.floor(100000 + Math.random() * 900000)}`;
}

const sendOtp = async (req, res) => {
    const otp = otpGenrator();

    const transporter = nodemailer.createTransport({
        service: "gmail",
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
        body: {
            name: req.session.user,
            intro: "your OTP for Zephyr verification is",
            table: {
                data: [{
                    OTP: otp
                }]
            },
            outro: "Looking forward to doing more business",
        }
    }

    const mail = mailGenerator.generate(response)

    const message = {
        from: process.env.AUTH_EMAIL,
        to: req.session.user,
        subject: "Zephyr OTP Verification",
        html: mail
    }

    try {
        const newOtp = new otpModel({
            email: req.session.user,
            otp: otp,
            createdAt: Date.now(),
            expiresAt: Date.now() + 30000
        })

        const data = await newOtp.save()
        req.session.otpId = data._id
        await transporter.sendMail(message);
    } catch (error) {
        console.log(error.message);

    }


}

// resend otp 
const resendOtpGenrator = () => {
    return `${Math.floor(100000 + Math.random() * 900000)}`;
}

const resendOtp = async (req, res) => {
    const otp = resendOtpGenrator();

    const transporter = nodemailer.createTransport({
        service: "gmail",
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
        body: {
            name: req.session.user,
            intro: "your OTP for Zephyr verification is",
            table: {
                data: [{
                    OTP: otp
                }]
            },
            outro: "Looking forward to doing more business",
        }
    }

    const mail = mailGenerator.generate(response)

    const message = {
        from: process.env.AUTH_EMAIL,
        to: req.session.user,
        subject: "Zephyr OTP Verification",
        html: mail
    }

    try {
        const newOtp = new otpModel({
            email: req.session.user,
            otp: otp,
            createdAt: Date.now(),
            expiresAt: Date.now() + 30000
        })

        const data = await newOtp.save()

        req.session.otpId = data._id
        await transporter.sendMail(message);
    } catch (error) {
        console.log(error.message);
    }


}

// forgot password OTP

const forgotPasswordOtp = async (req, res) => {
    const otp = otpGenrator();

    const transporter = nodemailer.createTransport({
        service: "gmail",
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
        body: {
            name: req.session.forgotUser,
            intro: "your OTP for Zephyr verification is",
            table: {
                data: [{
                    OTP: otp
                }]
            },
            outro: "Looking forward to doing more business",
        }
    }

    const mail = mailGenerator.generate(response)

    const message = {
        from: process.env.AUTH_EMAIL,
        to: req.session.forgotUser,
        subject: "Zephyr OTP Verification",
        html: mail
    }

    try {
        const newOtp = new otpModel({
            email: req.session.forgotUser,
            otp: otp,
            createdAt: Date.now(),
            expiresAt: Date.now() + 30000
        })

        const data = await newOtp.save()
        req.session.forgotOtpId = data._id
        await transporter.sendMail(message);

    } catch (error) {
        console.log(error.message);

    }


}


const securePassword = async (password) => {
    try {
        const passwordHash = await bcrypt.hash(password, 10)
        return passwordHash;

    } catch (error) {
        console.log(error.message);

    }
}

const loadHome = async (req, res) => {
    try {
        let userId = req.session.userId ? req.session.userId : '';
        const productData = await Products.find({ isDeleted: false }).sort({ createdAt: -1 })
        const categoryData = await Category.find({ isDeleted: false })
        const banners = await Banner.find({ status: true })
        if (req.session.userId) {
            const userData = await User.findById({ _id: userId });
            res.render('home', { user: userData, products: productData, category: categoryData, banners })
        }
        else {
            res.render('home', { products: productData, category: categoryData, banners })
        }
    } catch (error) {
        console.log(error.message);
    }
}
const loadShop = async (req, res) => {
    try {
        let userId = req.session.userId

        const currentPage = parseInt(req.query.page)
        const productPerPage = 28
        const skip = (currentPage - 1) * productPerPage;
        ``
        const totalProduct = await User.countDocuments()
        const totalPages = Math.ceil(totalProduct / productPerPage)


        const productData = await Products.find({ isDeleted: false }).skip(skip).limit(productPerPage)
        const categoryData = await Category.find({ isDeleted: false })
        const color = await Products.distinct('strapColor')
        const Brand = await Products.distinct('brand')
        const allProduct = await Products.find({ isDeleted: false })


        if (req.session.userId) {
            const userData = await User.findById({ _id: userId })
            res.render('shop', { user: userData, products: productData, category: categoryData, color: color, brand: Brand, currentPage, totalPages, allProduct })
        } else {
            res.render('shop', { products: productData, category: categoryData, color: color, brand: Brand, currentPage, totalPages, allProduct })
        }

    } catch (error) {
        console.log(error.message);
    }
}

// login and Registration
const loginLoad = async (req, res) => {
    try {
        res.render('login')
    } catch (error) {
        console.log(error.message);
    }
}
const registerLoad = async (req, res) => {
    try {
        res.render('registration')
    } catch (error) {
        console.log(error.message);
    }
}
const insertUser = async (req, res, next) => {
    try {
        if (req.body.email) {
            const isExistingUser = await User.findOne({ email: req.body.email })
            if (isExistingUser) {
                return res.render('registration', { message: "this email is already taken, please try with another email" })
            }
        }

        const spassword = await securePassword(req.body.password)
        const user = new User({
            Fname: req.body.firstName,
            Lname: req.body.lastName,
            username: req.body.firstName,
            email: req.body.email,
            password: spassword,
            is_Verified: false,
            is_is_Admin: false

        })

        req.session.userData = user
        req.session.user = req.body.email
        const userEmail = req.session.user

        await sendOtp(req, res)
        res.render('otp', { userEmail });


    } catch (error) {
        console.log(error.message);
        next(error)
    }
}

const ResendOtp = async (req, res) => {
    try {
        const userEmail = req.session.user

        await resendOtp(req, res)
        res.render('otp', { userEmail });
    } catch (error) {
        console.log(error.message);
    }
}

const verifyOtp = async (req, res, next) => {
    try {
        const userEmail = req.session.user
        if (!req.body) {
            res.status(400).render('otp', { userEmail, message: "please Enter otp" })
        }
        const otpUserData = await otpModel.findOne({ _id: req.session.otpId })
        const otpUser = otpUserData.otp
        const otp = parseFloat(req.body.otp.join(""))


        if (otp == otpUser) {
            const userData = req.session.userData
            userData.is_Verified = true
            await User.create(userData)

            res.render('login')
        } else {
            res.status(400).render('otp', { userEmail, message: "Incorrect OTP" })
        }
    } catch (error) {
        console.log(error.message);
        next(error)
    }
}

const verifyLogin = async (req, res, next) => {
    try {
        const { email, password } = req.body
        const userData = await User.findOne({ email: email })

        if (userData) {
            const passwordMatch = await bcrypt.compare(password, userData.password)
            if (passwordMatch) {
                if (userData.is_block == false) {
                    req.session.userId = userData._id

                    res.redirect('/home')
                } else {
                    res.render('login', { message: "Your Account is Blocked" })
                }
            } else {
                res.render('login', { message: "user email and password incorrect" })
            }
        } else {
            res.render('login', { message: "user email and password incorrect" })
        }

    } catch (error) {
        console.log(error.message)
        next(error)
    }
}

// forgot password

const forgotPasswordPage = async (req, res, next) => {
    try {
        res.render('forgotPassword')
    } catch (error) {
        console.log(error.message);
        next(error)
    }
}

const verifyEmail = async (req, res, next) => {
    try {
        const email = req.body.email;
        const isUser = await User.findOne({ email: email })

        if (!req.body) {
            return res.render('forgotPassword', { message: "Enter Email" })
        }
        if (!isUser) {
            return res.render('forgotPassword', { message: "Sorry, Your Email not found. Please try again with other Email." })
        }

        req.session.forgotUserId = isUser._id
        req.session.forgotUser = req.body.email

        forgotPasswordOtp(req, res);
        res.render('forgotOtp', { userEmail: email });

    } catch (error) {
        console.log(error.message);
        next(error)
    }
}

const forgotOtpVerify = async (req, res) => {
    try {

        const userEmail = req.session.forgotUser;

        if (!req.body || !req.body.otp) {
            return res.status(400).render('forgotOtp', { userEmail:userEmail, message: "Please enter OTP" });
        }


        const otpUserData = await otpModel.findOne({ email: userEmail });
        if (!otpUserData) {
            return res.status(404).render('forgotOtp', { userEmail:userEmail, message: "OTP session expired or invalid. Please try again." });
        }

        const otpUser = otpUserData.otp;
        const otp = parseFloat(req.body.otp.join(""));


        if (otp === otpUser) {
            res.render('resetPassword');
        } else {
            res.status(400).render('forgotOtp', { userEmail, message: "Incorrect OTP" });
        }
    } catch (error) {
        console.log(error.message);
    }
}

const resetPassword = async (req, res, next) => {
    try {
        const userId = req.session.forgotUserId
        const { newPassword, cnfmPassword } = req.body


        if (newPassword != cnfmPassword) {
            return res.status(403), json({ message: "Password dosn't Match" })
        }

        const spassword = await securePassword(newPassword)
        const updatePassword = await User.findByIdAndUpdate({ _id: userId }, { $set: { password: spassword } })
        res.status(200).json({ success: true })
    } catch (error) {
        console.log(error.message);
        next(error)
    }
}

const userLogout = async (req, res, next) => {
    try {
        req.session.destroy();
        res.redirect('/home')
    } catch (error) {
        next(error)
    }
}

const singleProductLoad = async (req, res, next) => {
    try {
        const id = req.query.id
        const productData = await Products.findOne({ _id: id, isDeleted: false })
        const reviews = await Review.find({ produtId: id })
        let price = productData.discountPrice
        let offer = null;

        if (productData.offer.length > 0) {
            const offerIndex = productData.offer.length - 1
            const offerId = productData.offer[offerIndex]

            offer = await Offer.findById(offerId)
            price = price - (price * offer.discount) / 100

            if (price > offer.maxRedimabelAmount) {
                price = offer.maxRedimabelAmount
            }
        }

        if (req.session.userId) {
            const userData = await User.findById({ _id: req.session.userId })
            res.render('singleProduct', { user: userData, product: productData, review: reviews, price, offer })
        } else {
            res.render('singleProduct', { product: productData, review: reviews, price, offer })
        }

    } catch (error) {
        console.log(error.message);
        next(error)
    }
}


const saveReview = async (req, res, next) => {
    try {

        const review = new Review({
            Name: req.body.name,
            Email: req.body.email,
            phone: req.body.number,
            Message: req.body.message,
            produtId: req.body.id
        })
        await review.save()
        res.redirect('/shop')

    } catch (error) {
        console.log(error.message);
        next(error)
    }
}

// google authentication
const googleAuth = async (req, res) => {
    try {
        const { email, given_name, family_name, sub } = req.user;

        let user = await User.findOne({ email: email });

        if (user) {
            if (!user.googleId) {
                user.googleId = sub;
                user.is_Verified = true;
                await user.save();
            }
        } else {
            user = new User({
                Fname: given_name,
                Lname: family_name,
                username: email.split('@')[0],
                email: email,
                phone: '',
                googleId: sub,
                is_Verified: true
            });

            await user.save();
        }
        req.session.userId = user._id

        res.redirect('/home');

    } catch (error) {
        console.error(error);
        res.status(500).send('An error occurred during Google authentication');
    }
};

// user Address Profile ##################

const userProfileLoad = async (req, res, next) => {
    try {
        let userId = req.session.userId
        const userData = await User.findById({ _id: userId })

        res.render('userProfileDetails', { user: userData })
    } catch (error) {
        console.log(error.message);
        next(error)
    }
}


const updateProfile = async (req, res, next) => {
    try {
        const userId = req.session.userId;
        const userData = await User.findByIdAndUpdate(
            { _id: userId },
            {
                $set: {
                    Fname: req.body.firstName,
                    Lname: req.body.lastName,
                    username: req.body.username,
                    phone: req.body.phone
                }
            },
            { new: true }
        );
        res.status(200).json({ message: "Profile updated successfully" });
    } catch (error) {
        console.error(error);
        next(error)
    }
}


const changePassword = async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.session.userId;


        const user = await User.findById(userId);

        const passwordIsValid = await bcrypt.compare(currentPassword, user.password);
        if (!passwordIsValid) {
            return res.status(403).json({ message: "Current password is incorrect." });
        }

        const hashedPassword = await securePassword(newPassword)
        await User.updateOne({ _id: userId }, { $set: { password: hashedPassword } });

        res.status(200).json({ message: "Password successfully updated." });
    } catch (error) {
        console.log(error);
        next(error)
    }
}

// user Address Management ##################

const addressManagementLoad = async (req, res, next) => {
    try {
        let userId = req.session.userId

        const userData = await User.findById({ _id: userId })
        const address = await Address.find({ user_id: userId })

        res.render('addressManagement', { user: userData, address: address })
    } catch (error) {
        console.log(error.message);
        next(error)
    }
}

const saveAddress = async (req, res) => {
    try {
        const id = req.session.userId
        const user = await User.findById(id)
        const email = user.email

        if (!req.body.is_Home && !req.body.is_Work) {
            return res.status(403).json({ message: "please select address type" })
        }

        let userAddress = new Address(req.body)
        userAddress.user_id = id
        userAddress.email = email

        await userAddress.save()
        // res.redirect('/addressManagement')
        res.status(200).json({ success: true });

    } catch (error) {
        console.log(error.message);
    }
}

const editAddress = async (req, res, next) => {
    try {
        const id = req.session.userId;
        const edit = await Address.updateOne({ user_id: id }, { $set: req.body });

        // res.json({ message: "Address updated successfully!" });
        res.status(200).json({ success: true })
    } catch (error) {
        console.error(error.message);
        next(error);
    }
}



const deleteAddress = async (req, res) => {
    try {
        const id = req.query.id
        if (id) {
            await Address.deleteOne({ _id: id })
            return res.redirect('/addressManagement')
        }
    } catch (error) {
        console.log(error.message);
    }
}

// sort and filter

const filterByPrice = async (req, res, next) => {
    try {
        const sortBy = req.query.sortBy;

        // pagination setting
        const currentPage = parseInt(req.query.page)
        const productPerPage = 28
        const skip = (currentPage - 1) * productPerPage;

        const totalProduct = await User.countDocuments()
        const totalPages = Math.ceil(totalProduct / productPerPage)
        //pagination end

        let userId = req.session.userId
        const categoryData = await Category.find({ isDeleted: false })
        const color = await Products.distinct('strapColor')
        const Brand = await Products.distinct('brand')
        const allProduct = await Products.find({ isDeleted: false })


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
                products = await Products.find({ isDeleted: false }).sort({ createdAt: -1 }).skip(skip).limit(productPerPage)
            default:
                products = await Products.find({ isDeleted: false }).sort({ discountPrice: -1 }).skip(skip).limit(productPerPage)
        }

        if (req.session.userId) {
            const userData = await User.findById({ _id: userId })
            res.render('shop', { user: userData, products: products, category: categoryData, color: color, brand: Brand, currentPage, totalPages, allProduct })
        } else {
            res.render('shop', { products: products, category: categoryData, color: color, brand: Brand, currentPage, totalPages, allProduct })
        }

    } catch (error) {
        console.log(error.message);
        next(error)
    }
}

const filterByCategory = async (req, res, next) => {
    try {

        let userId = req.session.userId

        // pagination setting
        const currentPage = parseInt(req.query.page)
        const productPerPage = 28
        const skip = (currentPage - 1) * productPerPage;

        const totalProduct = await User.countDocuments()
        const totalPages = Math.ceil(totalProduct / productPerPage)
        //pagination end

        const categoryData = await Category.find({ isDeleted: false })
        const color = await Products.distinct('strapColor')
        const Brand = await Products.distinct('brand')
        const allProduct = await Products.find({ isDeleted: false })


        const sortBy = req.query.sortBy;

        let products = await Products.find({ isDeleted: false }).skip(skip).limit(productPerPage)

        if (sortBy != 'allProduct') {
            products = await Products.find({ category: sortBy, isDeleted: false }).skip(skip).limit(productPerPage)
        }

        if (req.session.userId) {
            const userData = await User.findById({ _id: userId })
            res.render('shop', { user: userData, products: products, category: categoryData, color: color, brand: Brand, currentPage, totalPages, allProduct })
        } else {
            res.render('shop', { products: products, category: categoryData, color: color, brand: Brand, currentPage, totalPages, allProduct })
        }

    } catch (error) {
        console.log(error.message);
        next(error)
    }
}

const filterByColor = async (req, res, next) => {
    try {

        let userId = req.session.userId

        // pagination setting
        const currentPage = parseInt(req.query.page)
        const productPerPage = 28
        const skip = (currentPage - 1) * productPerPage;

        const totalProduct = await User.countDocuments()
        const totalPages = Math.ceil(totalProduct / productPerPage)
        //pagination end

        const categoryData = await Category.find({ isDeleted: false })
        const color = await Products.distinct('strapColor')
        const Brand = await Products.distinct('brand')
        const allProduct = await Products.find({ isDeleted: false })


        const sortBy = req.query.sortBy;

        let products = await Products.find({ isDeleted: false }).skip(skip).limit(productPerPage)

        if (sortBy != 'allProduct') {
            products = await Products.find({ strapColor: sortBy, isDeleted: false }).skip(skip).limit(productPerPage)
        }

        if (req.session.userId) {
            const userData = await User.findById({ _id: userId })
            res.render('shop', { user: userData, products: products, category: categoryData, color: color, brand: Brand, currentPage, totalPages, allProduct })
        } else {
            res.render('shop', { products: products, category: categoryData, color: color, brand: Brand, currentPage, totalPages, allProduct })
        }

    } catch (error) {
        console.log(error.message);
        next(error)
    }
}

const filterByBrand = async (req, res, next) => {
    try {

        let userId = req.session.userId

        // pagination setting
        const currentPage = parseInt(req.query.page)
        const productPerPage = 28
        const skip = (currentPage - 1) * productPerPage;

        const totalProduct = await User.countDocuments()
        const totalPages = Math.ceil(totalProduct / productPerPage)
        //pagination end

        const categoryData = await Category.find({ isDeleted: false })
        const color = await Products.distinct('strapColor')
        const Brand = await Products.distinct('brand')
        const allProduct = await Products.find({ isDeleted: false })



        const sortBy = req.query.sortBy;

        let products = await Products.find({ isDeleted: false }).skip(skip).limit(productPerPage)

        if (sortBy != 'allProduct') {
            products = await Products.find({ brand: sortBy, isDeleted: false }).skip(skip).limit(productPerPage)
        }

        if (req.session.userId) {
            const userData = await User.findById({ _id: userId })
            res.render('shop', { user: userData, products: products, category: categoryData, color: color, brand: Brand, currentPage, totalPages, allProduct })
        } else {
            res.render('shop', { products: products, category: categoryData, color: color, brand: Brand, currentPage, totalPages, allProduct })
        }

    } catch (error) {
        console.log(error.message);
        next(error)
    }
}

// search Product 
const searchProduct = async (req, res) => {
    try {
        let userId = req.session.userId
        let userData = null
        if (userId) {
            userData = await User.findById({ _id: userId })
        }

        // pagination setting
        const currentPage = parseInt(req.query.page)
        const productPerPage = 28
        const skip = (currentPage - 1) * productPerPage;

        const totalProduct = await User.countDocuments()
        const totalPages = Math.ceil(totalProduct / productPerPage)
        //pagination end


        let productData = []
        const categoryData = await Category.find({ isDeleted: false })
        const color = await Products.distinct('strapColor')
        const Brand = await Products.distinct('brand')
        const allProduct = await Products.find({ isDeleted: false })

        if (req.query.search) {
            productData = await Products.find({
                $and: [
                    { isDeleted: false },
                    {
                        $or: [
                            { productName: { $regex: req.query.search, $options: 'i' } },
                            { category: { $regex: req.query.search, $options: 'i' } },
                            { brand: { $regex: req.query.search, $options: 'i' } }
                        ]
                    }
                ]
            }).skip(skip).limit(productPerPage);
            res.render('shop', { user: userData, products: productData, category: categoryData, color: color, brand: Brand, currentPage, totalPages, allProduct })
        } else {
            res.render('shop', { user: userData, products: productData, category: categoryData, color: color, brand: Brand, currentPage, totalPages, allProduct })

        }

    } catch (error) {
        console.log(error.message);
    }
}


const productFilter = async (req, res, next) => {
    try {
        const price = req.query.sortByPrice
        const category = req.query.sortByCategory
        const color = req.query.sortByColor
        const brand = req.query.sortByBrand

        let query = { isDeleted: false };
        let sort;

        if (price !== 'allPrice') {
            switch (price) {
                case 'lowToHigh':
                    sort = { discountPrice: 1 };
                    break;
                case 'highToLow':
                    sort = { discountPrice: -1 };
                    break;
                case 'newestFirst':
                    sort = { createdAt: -1 };
                    break;
                default:
                    sort = { discountPrice: -1 }
            }
        }

        if (category !== 'allCategories') {
            query = { ...query, category: category };
        }

        if (color !== 'allColors') {
            query = { ...query, strapColor: color };
        }

        if (brand !== 'allBrands') {
            query = { ...query, brand: brand };
        }

        const products = await Products.find(query).sort(sort)
        res.status(200).json({ products });

    } catch (error) {
        console.log(error.message);
        next(error)
    }
}



module.exports = {
    loadHome,
    loadShop,
    loginLoad,
    registerLoad,
    insertUser,
    ResendOtp,
    verifyOtp,
    verifyLogin,
    forgotPasswordPage,
    verifyEmail,
    forgotOtpVerify,
    resetPassword,
    userLogout,
    userProfileLoad,
    singleProductLoad,
    saveReview,
    googleAuth,
    updateProfile,
    addressManagementLoad,
    saveAddress,
    editAddress,
    deleteAddress,
    changePassword,
    filterByPrice,
    filterByCategory,
    filterByColor,
    filterByBrand,
    searchProduct,
    productFilter

}