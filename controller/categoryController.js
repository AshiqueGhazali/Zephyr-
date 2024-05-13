const { name } = require('ejs');
const Category = require('../model/categoryModel')
const mongoose = require('mongoose');


const categoryPageLoad = async (req, res, next) => {
    try {
        const currentPage = parseInt(req.query.page) || 1
        const categoriesPerPage = 8;
        const skip = (currentPage - 1) * categoriesPerPage;

        const categories = await Category.find().skip(skip).limit(categoriesPerPage)

        const totalCategories = await Category.countDocuments()
        const totalPages = Math.ceil(totalCategories / categoriesPerPage)

        res.render('categoryManagement', { categories, currentPage, totalPages });
    } catch (error) {
        console.log(error.message);
        next(error)
    }
}

const addCategoryPageLoad = async (req, res, next) => {
    try {
        res.render('addCategory')
    } catch (error) {
        console.log(error.message);
        next(error)
    }
}

const addCategory = async (req, res, next) => {
    try {
        const { category, description, isAvailable } = req.body
        const image = req.file

        if (category[0] == ' ' || description[0] == ' '|| !image) {
            // res.render('addCategory', { message: "please enter category detailes" })
            return res.status(403).json({ message: "please enter category detailes!!" });
        }

        const categoryName = category.toLowerCase()
        const CategoryData = await Category.findOne({ name: categoryName })

        if (CategoryData) {
            // res.render('addCategory', { message: "This category is alredy added" })
            // return;
            return res.status(403).json({ message: "This category is alredy added!!" });

        }
        const imagePath = image ? image.filename : ''

        const newCategory = new Category({
            name: categoryName,
            description: description,
            status: !!isAvailable,
            imageUrl: imagePath
        })

        await newCategory.save()
        // res.redirect('/admin/categoryManagement')
        res.status(200).json({success:true})
    } catch (error) {
        console.log(error.message);
        next(error)
    }
}
const searchCategory = async (req, res, next) => {
    try {
        const currentPage = parseInt(req.query.page) || 1
        const categoriesPerPage = 8;
        const skip = (currentPage - 1) * categoriesPerPage;

        const totalCategories = await Category.countDocuments()
        const totalPages = Math.ceil(totalCategories / categoriesPerPage)


        let categories = []
        if (req.query.search) {
            categories = await Category.find({ name: { $regex: req.query.search, $options: 'i' } }).skip(skip).limit(categoriesPerPage)
        } else {
            categories = await Category.find({}).skip(skip).limit(categoriesPerPage)
        }
        res.render('categoryManagement', { categories: categories, currentPage, totalPages })
    } catch (error) {
        console.log(error.message);
        next(error)
    }
}

const softDeleteCategory = async (req, res, next) => {
    try {
        const id = req.query.id;
        if (id) {
            await Category.findByIdAndUpdate({ _id: id }, {
                isDeleted: true,
            })
            return res.redirect('/admin/categoryManagement')
        }
    } catch (error) {
        console.log(error.message);
        next(error)
    }
}

const editCategoryLoad = async (req, res, next) => {
    try {
        const id = req.query.id
        const category = await Category.findOne({ _id: id })

        if (category) {
            res.render('editCategory', { category: category })
        } else {
            res.redirect('/admin/categoryManagement')
        }
    } catch (error) {
        console.log(error.message);
        next(error)
    }
}
const editCategory = async (req, res, next) => {
    try {
        const { id, category, description, isAvailable } = req.body
        const objectId = new mongoose.Types.ObjectId(req.body.id);


        const categoryName = category.toLowerCase()

        const isCategory = await Category.aggregate([{ $match: { _id: { $ne: objectId }, name: categoryName } }])

        if (isCategory.length > 0) {
            return res.status(403).json({ message: "This category is alredy added!!" });

        }

        if (category[0] == ' ' || description[0] == ' ' || !description) {
            return res.status(403).json({ message: "please enter category detailes!!" });
 
        }
        const image = req.file
        let imagePath = ''

        if (image) {
            imagePath = image.filename;
        } else {
            const existingBanner = await Category.findById(id);
            imagePath = existingBanner.bannerImage;
        }

        const categoryData = await Category.findByIdAndUpdate({ _id: id }, {
            $set: {
                name: category,
                description: description,
                status: !!isAvailable,
                imageUrl: imagePath
            }
        })


        return res.status(200).json({success:true})

    } catch (error) {
        console.log(error.message);
        next(error)
    }
}

const restoreCategory = async (req, res, next) => {
    try {
        const id = req.query.id;
        if (id) {
            await Category.findByIdAndUpdate({ _id: id }, {
                isDeleted: false,
            })
            return res.redirect('/admin/categoryManagement')
        }
    } catch (error) {
        console.log(error.message);
        next(error)
    }
}



module.exports = {
    categoryPageLoad,
    addCategoryPageLoad,
    addCategory,
    searchCategory,
    softDeleteCategory,
    editCategoryLoad,
    editCategory,
    restoreCategory,

}