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
        const category = await Category.find({isDeleted:false})
        res.render('addProduct',{category:category})
    } catch (error) {
        console.log(error.message);
    }
}


const addProduct = async(req,res)=>{
    try {

        const images = []

        const bodyImages =req.files
        images.push(bodyImages.productImage1[0].filename);
        images.push(bodyImages.productImage2[0].filename);
        images.push(bodyImages.productImage3[0].filename);
        images.push(bodyImages.productImage4[0].filename);
        
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
            image:images
        })
         
        await product.save()

        res.redirect('/admin/productManagement')
    } catch (error) {
        console.log(error.message)
    }
}


const searchProduct = async(req,res)=>{
    try {
        let productData = []

        const currentPage = parseInt(req.query.page)
        const productPerPage = 10
        const skip =(currentPage-1)*productPerPage ;

        const totalProduct = await Products.countDocuments()
        const totalPages = Math.ceil(totalProduct/productPerPage)

        if( req.query.search){
            productData = await Products.find({productName:{$regex:req.query.search,$options: 'i'}}).skip(skip).limit(productPerPage)
        }else{
            productData = await Products.find().skip(skip).limit(productPerPage)
        }
        res.render('productManagement',{product:productData,currentPage,totalPages})
    } catch (error) {
        console.log(error.message);
    }
}


const listAndUnlistProduct  = async(req,res)=>{
    try {
        const id = req.query.id

        const productData = await Products.findById({_id:id})
        productData.isDeleted = !productData.isDeleted 
        await productData.save()

        
        let message = productData.isDeleted ? "Product Unlisted successfully" : "Product Listed successfully";

        res.status(200).json({message})
        
    } catch (error) {
        console.log(error.message);
    }
}


const editProductLoad = async(req,res)=>{
    try { 

        const id = req.query.id
        const product = await Products.findOne({_id:id})
        const category = await Category.find({isDeleted:false})
        if(product){
            res.render('editProduct',{product:product,category:category})
        }else{
            res.redirect('/admin/productManagement')
        }
        
    } catch (error) {
        console.log(error.message);
    }
}

const deleteImage = async(req, res) => {
    try {
        const { productId, imageIndex } = req.body;
        const product = await Products.findById(productId);
        if (product && product.image && product.image.length > imageIndex) {
            product.image.splice(imageIndex, 1);
            await product.save(); 
            res.status(200).send({ message: 'Image removed successfully' });
        } else {
            res.status(404).send({ message: 'Product or image not found' });
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).send({ message: 'Server error' });
    }
}

// const editProduct = async(req,res)=>{
//     try {
        
//         const files = req.files
  
//         const imagePaths = []; 
//         for (const file of files) {
//             const imagePath = `/categoryImage/new${file.filename}`;
//             await sharp(file.path)
//                 .resize(200, 200)
//                 .toFile(`./public/assets/${imagePath}`);

//             imagePaths.push(imagePath);
//         }

//         const update = await Products.findByIdAndUpdate({_id:req.body.id},{$set:{
//             productName:req.body.productName,
//             brand:req.body.brandName,
//             model:req.body.model,
//             category:req.body.category,
//             price:req.body.mrp,
//             discountPrice:req.body.discountPrice,
//             discount:req.body.discount,
//             dialColor:req.body.dialColor,
//             strapColor:req.body.strapColor,
//             inStock:req.body.inStock,
//             description:req.body.description
//         }})

//         if(files.length==0){
//             return res.redirect('/admin/productManagement')
//         }

//         await Products.updateOne({_id: req.body.id}, {$push:{image:{$each:imagePaths}}});
//         res.redirect('/admin/productManagement')

//     } catch (error) {
//         console.log(error.message);
//     }
// }
const editProduct = async (req, res) => {
    try {
        // Retrieve the product from the database first
        const product = await Products.findById(req.body.id);
        if (!product) {
            return res.status(404).send('Product not found.');
        }

        // Setup arrays to handle the incoming images
        let images = [];

        // Handling new images and replacing old ones
        if (req.files) {
            const bodyImages = req.files;
            const fields = ['productImage1', 'productImage2', 'productImage3', 'productImage4'];
            fields.forEach((field, index) => {
                if (bodyImages[field] && bodyImages[field][0]) {
                    // Replace the old image with the new one in the images array
                    images[index] = bodyImages[field][0].filename;
                } else if (product.image[index]) {
                    // Retain the old image if no new image was uploaded for this index
                    images[index] = product.image[index];
                }
            });
        }

        // Update product details
        const update = await Products.findByIdAndUpdate(req.body.id, {
            productName: req.body.productName,
            brand: req.body.brandName,
            model: req.body.model,
            category: req.body.category,
            price: req.body.mrp,
            discountPrice: req.body.discountPrice,
            discount: req.body.discount,
            dialColor: req.body.dialColor,
            strapColor: req.body.strapColor,
            inStock: req.body.inStock,
            description: req.body.description,
            image: images  // Replace entire image array
        });

        res.redirect('/admin/productManagement');

    } catch (error) {
        console.log(error.message);
        res.status(500).send('Server Error');
    }
};


module.exports={
    productsLoad,
    addProductLoad,
    addProduct,
    searchProduct,
    listAndUnlistProduct,
    editProductLoad,
    deleteImage,
    editProduct
}