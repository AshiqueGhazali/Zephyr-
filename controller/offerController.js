const Products = require('../model/productModel')
const Category = require('../model/categoryModel')
const Offer = require('../model/offerModel')

const offerManagementLoad = async (req, res) => {
    try {
        const offers = await Offer.find()
        res.render('offerManagement', { offers })
    } catch (error) {
        console.log(error.message);
    }
}

const addOfferLoad = async (req, res, next) => {
    try {

        const categorys = await Category.find({ isDeleted: false })
        const products = await Products.find({ isDeleted: false })

        res.render('addOffer', { categorys, products })
    } catch (error) {
        console.log(error.message);
        next(error)
    }
}

const addOffer = async (req, res, next) => {
    try {
        const { offer, offerType, Pname, category, expiredate, discount, maxRedimabelAmount } = req.body

        const categorys = await Category.find({ isDeleted: false })
        const products = await Products.find({ isDeleted: false })

        if (offerType == '') {
            return res.render('addOffer', { categorys, products, message: "please select any offer Type" })
        }

        let newOffer = new Offer({
            offer: offer,
            offerType: offerType,
            expiredate: expiredate,
            discount: discount,
            maxRedimabelAmount: maxRedimabelAmount
        })

        if (offerType === 'Product Offer') {
            newOffer.Pname = Pname
            await newOffer.save()
            const offerId = newOffer._id
            const product = await Products.findOneAndUpdate({ productName: Pname }, { $push: { offer: offerId } })
        } else if (offerType === 'Category Offer') {
            newOffer.category = category
            await newOffer.save()

            const offerId = newOffer._id
            const product = await Products.updateMany({ category: category }, { $push: { offer: offerId } })
        }


        res.redirect('/admin/offerManagement')



    } catch (error) {
        console.log(error.message);
        next(error)
    }
}

const offerStatusChange = async (req, res, next) => {
    try {
        const id = req.query.offerId;
        const offer = await Offer.findById({ _id: id })
        offer.status = !offer.status
        await offer.save()

        if (offer.status) {
            const product = await Products.updateMany({ $or: [{ category: offer.category }, { productName: offer.Pname }] }, { $push: { offer: id } })
        } else {
            const product = await Products.updateMany({ $or: [{ category: offer.category }, { productName: offer.Pname }] }, { $pull: { offer: id } })
        }

        let message = offer.status ? "Offer Activated successfully" : "Offer Inactivated successfully";

        res.status(200).json({ message })
    } catch (error) {
        console.log(error.message);
        next(error)
    }
}
module.exports = {
    offerManagementLoad,
    addOfferLoad,
    addOffer,
    offerStatusChange
}