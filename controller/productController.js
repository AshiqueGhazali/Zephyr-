const Products = require('../model/productModel')
const Category =require('../model/categoryModel')
const fs = require('fs')
const path = require('path')
const sharp =require('sharp')

const productsLoad = async(req,res)=>{
    try {

        const currentPage = parseInt(req.query.page)
        const productPerPage = 10
        const skip =(currentPage-1)*productPerPage ;

        const product = await Products.find().skip(skip).limit(productPerPage)

        const totalProduct = await Products.countDocuments()
        const totalPages = Math.ceil(totalProduct/productPerPage)

        res.render('productManagement',{product,currentPage,totalPages})
    } catch (error) {
        console.log(error.message);
    }
}

const addProductLoad = async(req,res)=>{
    try {
        const category = await Category.find()
        res.render('addProduct',{category:category})
    } catch (error) {
        console.log(error.message);
    }
}

const addProduct = async(req,res)=>{
    try {

        const product = new Products({
            productName:req.body.productName,
            brand:req.body.brandName,
            model:req.body.model,
            category:req.body.category,
            price:req.body.mrp,
            discountPrice:req.body.discountPrice,
            discount:req.body.discount,
            dialColor:req.body.dialColor,
            strapColor:req.body.strapColor,
            inStock:req.body.inStock,
            description:req.body.description,
            image:[]
        })

        await Promise.all(req.files.map(async (file) => {
            const imagePath = `/categoryImg/new${file.filename}`; 
            await sharp(file.path)
                .resize(200, 200) 
                .toFile(`./public/assets/${imagePath}`); 
            product.image.push(imagePath); 
        }));
         
        await product.save()

        res.redirect('/admin/productManagement')
    } catch (error) {
        console.log(error.message)
    }
}

const searchProduct = async(req,res)=>{
    try {
        let productData = []

        if( req.query.search){
            productData = await Products.find({productName:{$regex:req.query.search,$options: 'i'}})
        }else{
            productData = await Products.find()
        }
        res.render('productManagement',{product:productData})
    } catch (error) {
        console.log(error.message);
    }
}

const unlistProduct = async(req,res)=>{
    try {
        const id = req.query.id

        if(id){
            await Products.findByIdAndUpdate({_id:id},{
                isDeleted:true
            })

            return res.redirect('/admin/productManagement')
        }
        
    } catch (error) {
        console.log(error.message);
    }
}

const restoreProduct = async(req,res)=>{
    try {
        const id = req.query.id
        if(id){
            await Products.findByIdAndUpdate({_id:id},{
                isDeleted:false
            })

            return res.redirect('/admin/productManagement')
        }
    } catch (error) {
        console.log(error.message);
    }
}

const deleteProduct = async(req,res)=>{
    try {
        const id= req.query.id

        if(id){
            await Products.deleteOne({_id:id})
            return res.redirect('/admin/productManagement')

        }
        
    } catch (error) {
        console.log(error.message);
    }
}

const editProductLoad = async(req,res)=>{
    try { 

        const id = req.query.id
        const product = await Products.findOne({_id:id})
        const category = await Category.find()
        if(product){
            res.render('editProduct',{product:product,category:category})
        }else{
            res.redirect('/admin/productManagement')
        }
        
    } catch (error) {
        console.log(error.message);
    }
}

const deleteImage = async(req,res)=>{
    try {
        const id = req.query.id
        const image = req.query.img
        if(image){
            await Products.findByIdAndUpdate({_id:id},{$pull:{image:image}})
            return res.redirect('/admin/editProduct')
        }
    } catch (error) {
        console.log(error.message);
    }
}

const editProduct = async(req,res)=>{
    try {
        
        const files = req.files
  
        const imagePaths = []; 
        for (const file of files) {
            const imagePath = `/categoryImg/new${file.filename}`;
            // console.log(imagePath);

            await sharp(file.path)
                .resize(200, 200)
                .toFile(`./public/assets/${imagePath}`);

            imagePaths.push(imagePath);
        }

        const update = await Products.findByIdAndUpdate({_id:req.body.id},{$set:{
            productName:req.body.productName,
            brand:req.body.brandName,
            model:req.body.model,
            category:req.body.category,
            price:req.body.mrp,
            discountPrice:req.body.discountPrice,
            discount:req.body.discount,
            dialColor:req.body.dialColor,
            strapColor:req.body.strapColor,
            inStock:req.body.inStock,
            description:req.body.description
        }})

        if(files.length==0){
            return res.redirect('/admin/productManagement')
        }

        await Products.updateOne({_id: req.body.id}, {$push:{image:{$each:imagePaths}}});
        res.redirect('/admin/productManagement')

    } catch (error) {
        console.log(error.message);
    }
}

module.exports={
    productsLoad,
    addProductLoad,
    addProduct,
    searchProduct,
    unlistProduct,
    restoreProduct,
    deleteProduct,
    editProductLoad,
    deleteImage,
    editProduct
}