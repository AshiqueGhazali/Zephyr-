const Banners = require('../model/bannerModel')


const bannerManagemntLoad = async (req, res, next) => {
    try {
        const currentPage = parseInt(req.query.page)
        const bannerPerPage = 5
        const skip = (currentPage - 1) * bannerPerPage;

        const product = await Banners.find().skip(skip).limit(bannerPerPage)

        const totalProduct = await Banners.countDocuments()
        const totalPages = Math.ceil(totalProduct / bannerPerPage)

        const banners = await Banners.find()
        res.render('bannerManagement', { banners,currentPage, totalPages })

    } catch (error) {
        console.log(error.message);
        next(error)
    }
}

const addBannerPageLoad = async (req, res, next) => {
    try {
        res.render('addBanner')
    } catch (error) {
        console.log(error.message);
        next(error);
    }
}

const addBanner = async (req, res, next) => {
    try {
        const { head, subHead } = req.body
        const image = req.file

        if (!image || !head || !subHead) {
            return res.status(400).json({ message: "All fields are required." });
        }
        const imagePath = image ? image.filename : ''
        const banner = new Banners({
            head: head,
            subHead: subHead,
            bannerImage: imagePath
        })

        await banner.save()
        res.status(200).json({ success: true })
    } catch (error) {
        console.log(error.message);
        next(error);
    }
}

const listAndUnlistBanner = async (req, res, next) => {
    try {
        const id = req.query.bannerId

        const banner = await Banners.findById({ _id: id })
        banner.status = !banner.status
        await banner.save()


        let message = banner.status ? "Banner Unlisted successfully" : "Banner Listed successfully";

        res.status(200).json({ message })

    } catch (error) {
        console.log(error.message);
        next(error)
    }
}

const deleteBanner = async (req, res, next) => {
    try {
        const bannerId = req.query.bannerId

        await Banners.findByIdAndDelete(bannerId);


        res.status(200).json({ message: "Banner Deleted Successfully" })

    } catch (error) {
        console.log(error.message);
        next(error)
    }
}

const editBannerLoad = async (req, res, next) => {
    try {
        const bannerId = req.query.bannerId
        const banner = await Banners.findById(bannerId)

        res.render('editBanner', { banner })
    } catch (error) {
        console.log(error.message);
        next(error)
    }
}

const editBanner = async (req, res, next) => {
    try {
        const { bannerId, head, subHead } = req.body
        const image = req.file

        if (!head || !subHead) {
            return res.status(400).json({ message: "All fields are required." });
        }
        let imagePath = '';

        if (image) {
            imagePath = image.filename;
        } else {
            const existingBanner = await Banners.findById(bannerId);
            imagePath = existingBanner.bannerImage;
        }
        
        
        const banner = await Banners.findByIdAndUpdate({ _id: bannerId }, {
            $set: {
                head: head,
                subHead: subHead,
                bannerImage: imagePath
            }
        })

        res.status(200).json({ success: true })
    } catch (error) {
        console.log(error.message);
        next(error)
    }
}
module.exports = {
    bannerManagemntLoad,
    addBannerPageLoad,
    addBanner,
    listAndUnlistBanner,
    deleteBanner,
    editBannerLoad,
    editBanner
}