const User = require("../model/userModel")
const Products = require('../model/productModel')
const Category = require('../model/categoryModel')
const Review = require('../model/userReviewModel')
const Cart = require('../model/cartModel')
const Wishlist = require('../model/wishlistModel')
const { default: mongoose, model } = require("mongoose");

// user Cart Management ################## 

const cartLoad = async (req,res)=>{
    try {
        const userId = req.session.userId
        const userData = await User.findById({_id:userId})
        const userCart = await Cart.aggregate([
            {$match:{userId:new mongoose.Types.ObjectId(userId)}},
            {$unwind:'$cartItems'},
            {$lookup:{
                from:'products',
                localField: "cartItems.productId",
                foreignField: "_id",
                as: "productDetails",
            }}
        ])

        
        
        const totalPriceResult = await Cart.aggregate([
            { $match: { userId: new mongoose.Types.ObjectId(userId) } },
            { $unwind: '$cartItems' },
            { $lookup: {
                from: 'products',
                localField: 'cartItems.productId',
                foreignField: '_id',
                as: 'productDetails'
            } },
            { $unwind: '$productDetails' },
            { $project: {
                _id: 0,
                totalPrice: { $multiply: ['$productDetails.discountPrice', '$cartItems.quantity'] }
            } },
            { $group: {
                _id: null,
                totalPrice: { $sum: '$totalPrice' }
            } }
        ]);
        
        const totalPrice = totalPriceResult.length > 0 ? totalPriceResult[0].totalPrice : 0;
        

        
        if (userCart.length === 0) {
            return res.render('cart', {user: userData, userCart: [], message: 'Your cart is empty.'});
        }

        res.render('cart', {user: userData, userCart: userCart,totalPrice});
    } catch (error) {
        console.log(error.message);
    }
}

const addToCart = async(req,res)=>{
    try {
        const productId = req.query.productId
        const userId = req.session.userId

        if(typeof userId == 'undefined'){
            return res.status(401).json({ redirectUrl: '/login' });
        }

        let cart = await Cart.findOne({ userId: userId });
        if (!cart) {
            cart = new Cart({
                userId: userId,
                cartItems: [{ productId: productId }]
            });
        } else {
            const existingItem = cart.cartItems.find(item => item.productId.equals(productId));
            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                cart.cartItems.push({ productId: productId });
            }
        }
        await cart.save()
        res.status(200).json({message:"addedd to cart"})

    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: "Failed to add to cart" });

    }
}

const removeFromCart = async (req,res)=>{
    try {
        const userID = req.session.userId;
        const productId = req.query.productId;

        const cartData = await Cart.findOne({ userId: userID });
        const index = cartData.cartItems.findIndex((value) => {
        return value.productId.toString() === productId;
        });

        cartData.cartItems.splice(index, 1);
        await cartData.save();
        res.redirect("/cart");
    } catch (error) {
        console.log(error.message);
    }
}

const updateQuantity = async(req,res)=>{
    try {
        const userId = req.session.userId;
        const productId = req.query.productId;
        const change = parseInt(req.query.change);

        let cart = await Cart.findOne({ userId: userId });

        const index = cart.cartItems.findIndex(item => item.productId.equals(productId));

        if (index !== -1) {
            cart.cartItems[index].quantity += change;
            
            if (cart.cartItems[index].quantity <= 0) {
                cart.cartItems.splice(index, 1);
            }
        }

        await cart.save();
        res.sendStatus(200)

    } catch (error) {
        console.log(error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
}

// user Cart Management ################## 

const wishlistLoad = async(req,res)=>{
    try {
        const userId = req.session.userId
        const userData = await User.findById({_id:userId})

        const userWishlist = await Wishlist.aggregate([
            { $match: { userId: new mongoose.Types.ObjectId(userId) } },
            {$unwind:'$wishlistItems'},
            {
                $lookup: {
                    from: "products",
                    localField: "wishlistItems",
                    foreignField: "_id",
                    as: "productDetails"

                }
            },
            {
                $project: {
                    productDetails: 1
                }
            }
        ])

        if (userWishlist.length === 0) {
            return res.render('wishlist', {user: userData, userWishlist: [], message: 'Your Wishlist is empty.'});
        }
        
        res.render('wishlist',{user:userData,userWishlist:userWishlist})
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ error: 'Internal server error' });

    }
}

const addTowishlist = async(req,res)=>{
    try {
        const productId = req.query.productId
        const userId = req.session.userId

        if(typeof userId == 'undefined'){
            return res.status(401).json({ redirectUrl: '/login' });
        }

        let wishlist = await Wishlist.findOne({userId:userId})
        if (!wishlist) {
            wishlist = new Wishlist({
                userId: userId,
                wishlistItems: productId
            });
            await wishlist.save()
            res.status(200).json({message:"addedd to Wishlist"})
        } else {
            const index = wishlist.wishlistItems.indexOf(productId);
            if (index > -1) {
                wishlist.wishlistItems.splice(index, 1);
                await wishlist.save();
                return res.status(200).json({ message: "Product removed from wishlist" });
            } else {
                wishlist.wishlistItems.push(productId);
                await wishlist.save();
                return res.status(200).json({ message: "Product added to wishlist" });
            }
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
}

const removeFromWishlist = async (req,res)=>{
    try {
        const userID = req.session.userId;
        const productId = req.query.productId;

        const wishlist = await Wishlist.findOne({ userId: userID }); 
        const index = wishlist.wishlistItems.findIndex((value) => {
        return value.toString() === productId;
        });

        wishlist.wishlistItems.splice(index, 1);
        await wishlist.save();
        res.redirect("/wishlist");
    } catch (error) {
        console.log(error.message);
    }
}

module.exports ={
    cartLoad,
    addToCart,
    removeFromCart,
    updateQuantity,
    wishlistLoad,
    addTowishlist,
    removeFromWishlist
}