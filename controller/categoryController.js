const Category = require('../model/categoryModel')

const categoryPageLoad = async(req,res)=>{
    try {
        const currentPage = parseInt(req.query.page) || 1 
        const categoriesPerPage = 8;
        const skip = (currentPage - 1) * categoriesPerPage ;

        const categories = await Category.find().skip(skip).limit(categoriesPerPage)

        const totalCategories = await Category.countDocuments()
        const totalPages = Math.ceil(totalCategories / categoriesPerPage)

        res.render('categoryManagement', { categories, currentPage, totalPages });
    } catch (error) {
        console.log(error.message);
    }
} 

const addCategoryPageLoad = async(req,res)=>{
    try {
        res.render('addCategory')
    } catch (error) {
        console.log(error.message);
    }
}

const addCategory = async(req,res)=>{
    try {
        const {category, description, isAvailable}=req.body

        if(category==''||description==''){
            res.render('addCategory',{message:"please enter category detailes"})
            return;
        }

        const categoryName = category.toLowerCase() 
        const CategoryData = await Category.findOne({name:categoryName})
        if(CategoryData){
            res.render('addCategory',{message:"This category is alredy added"})
            return;
        } 

        const image = req.file
        const imagePath = image?image.filename :'' 

        const newCategory = new Category({
            name:categoryName,
            description:description,
            status:!!isAvailable,
            imageUrl:imagePath
        })

        await newCategory.save()
        res.redirect('/admin/categoryManagement')
    } catch (error) {
        console.log(error.message);
    }
}
const searchCategory = async(req,res)=>{
    try {
        let categories = []
        if(req.query.search){
            categories = await Category.find({name:{$regex:req.query.search,$options: 'i'}})
        }else{
            categories= await Category.find({})
        }
        res.render('categoryManagement',{categories:categories})
    } catch (error) {
        console.log(error.message);
    }
}

const softDeleteCategory = async(req,res)=>{
    try {
        const id= req.query.id;
        if(id){
            await Category.findByIdAndUpdate({_id:id},{
                isDeleted: true,
            })
            return res.redirect('/admin/categoryManagement')
        }
    } catch (error) {
        console.log(error.message);
    }
}

const editCategoryLoad = async(req,res)=>{
    try {
        const id = req.query.id
        const category=await Category.findOne({_id:id})

        if(category){
            res.render('editCategory',{category:category})
        }else{
            res.redirect('/admin/categoryManagement')
        }
    } catch (error) {
        console.log(error.message);
    }
}
const editCategory =async(req,res)=>{
    try {
        const {category,description,isAvailable}=req.body

        if(category==''||description==''){
            res.render('addCategory',{message:"please enter category detailes"})
            return;
        }
        // console.log(req.body);
        const image = req.file
        const imagePath = image?image.filename :''
        
        const categoryData = await Category.findByIdAndUpdate({_id:req.body.id},{$set:{
            name:category,
            description:description,      
            status:!!isAvailable,
            imageUrl:imagePath
        }})
        res.redirect('/admin/categoryManagement')

        
    } catch (error) {
        console.log(error.message);
    }
}

const restoreCategory =async(req,res)=>{
    try {
        const id= req.query.id;
        if(id){
            await Category.findByIdAndUpdate({_id:id},{
                isDeleted: false,
            })
            return res.redirect('/admin/categoryManagement')
        }
    } catch (error) {
        console.log(error.message);
    }
}

const deleteCategory = async(req,res)=>{
    try {
        const id= req.query.id;
        if(id){
            await Category.deleteOne({_id:id})
            return res.redirect('/admin/categoryManagement')
        }
    } catch (error) {
        console.log(error.message);
    }
}


module.exports ={
    categoryPageLoad,
    addCategoryPageLoad,
    addCategory,
    searchCategory,
    softDeleteCategory,
    editCategoryLoad,
    editCategory,
    restoreCategory,
    deleteCategory,
    
}