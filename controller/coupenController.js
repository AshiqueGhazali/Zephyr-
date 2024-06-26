const Coupen = require('../model/coupenModel')
const Order = require('../model/orderModel')
const orderModel = require('../model/categoryModel')
const User = require('../model/userModel')


const coupenManagementLoad = async (req, res, next) => {
    try {
        // const coupens = await Coupen.find()

        const currentPage = parseInt(req.query.page)
        const couponPerPage = 10
        const skip = (currentPage - 1) * couponPerPage;

        const coupens = await Coupen.find().skip(skip).limit(couponPerPage)

        const totalProduct = await Coupen.countDocuments()
        const totalPages = Math.ceil(totalProduct / couponPerPage)

        res.render('coupenManagement', { coupens: coupens , currentPage, totalPages })
    } catch (error) {
        console.log(error.message);
        next(error)
    }
}

const addCoupenLoad = async (req, res, next) => {
    try {
        res.render('addCoupen')
    } catch (error) {
        console.log(error.message);
        next(error)
    }
}

const addCoupen = async (req, res, next) => {
    try {
        const { coupenCode, discountPercentage, expiredDate, minPurchaseAmt, maxRedimabelAmount } = req.body


        const isExist = await Coupen.findOne({ coupenCode: coupenCode })
        if (isExist) {
            return res.status(403).json({ message: "This CODE is already exist, please enter another one" })
        } else if (coupenCode[0] == ' ') {
            return res.status(403).json({ message: "Enter Proper Coupen Code" })

        }


        const coupen = new Coupen({
            coupenCode: coupenCode,
            discountPercentage: discountPercentage,
            expiredDate: expiredDate,
            minPurchaseAmt: minPurchaseAmt,
            maxRedimabelAmount: maxRedimabelAmount
        })

        await coupen.save()
        res.status(200).json({ success: true })

    } catch (error) {
        console.log(error.message);
        next(error)
    }
}

const coupenStatusChange = async (req, res, next) => {
    try {
        const id = req.query.coupenId;
        const coupen = await Coupen.findById({ _id: id })
        coupen.status = !coupen.status
        await coupen.save()

        let message = coupen.status ? "Coupen Activated successfully" : "Coupen Inactivated successfully";

        res.status(200).json({ message })

    } catch (error) {
        console.log(error.message);
        next(error)
    }
}

const listCoupensInUserSide = async (req, res, next) => {
    try {
        const user = await User.findById({ _id: req.session.userId })
        const coupons = await Coupen.find({ status: true })
        res.render('coupons', { user, coupons })
    } catch (error) {
        console.log(error.message);
        next(error)
    }
}

const applyCoupon = async (req, res, next) => {
    try {
        const { couponCode, totalAmount } = req.body
        const data = await Coupen.findOne({ status: true, coupenCode: couponCode })

        if (data !== null && data.minPurchaseAmt > totalAmount) {
            res.status(400).json({ message: `This coupon is only valid for Purchases Over ${data.minPurchaseAmt}` })
        } else if (data !== null) {
            req.session.coupen = data.discountPercentage;
            req.session.coupenId = data._id
            res.status(200).json({ success: true })
        } else {
            res.status(400).json({ message: "coupen code is incorrect!" })
        }
    } catch (error) {
        console.log(error.message);
        next(error)
    }
}

const removeCoupen = async (req, res, next) => {
    try {

        if (req.session.coupen && req.session.coupenId) {
            delete req.session.coupen
            delete req.session.coupenId
            res.status(200).json({ success: true })
        } else {
            res.status(400).json({ message: "You did't Applied Any coupen.!" })
        }


    } catch (error) {
        console.log(error.message);
        next(error);
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