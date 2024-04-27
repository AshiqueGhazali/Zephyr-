const User = require("../model/userModel")
const Products = require('../model/productModel')
const Category = require('../model/categoryModel')
const Address = require('../model/addressModel')
const Cart = require('../model/cartModel')
const { default: mongoose } = require("mongoose");
const OrderModel = require('../model/orderModel')


const ordersPageLoad = async(req,res)=>{
    try {
        const id = req.session.userId
        const userData = await User.findById({_id:id})
        const orders = await OrderModel.find({userId:id}).sort({orderDate:-1 })

        res.render('orders',{user:userData,orders})
    } catch (error) {
        console.log(error.message);
    }
}

const checkoutPageLoad = async(req,res)=>{
    try {
        const id = req.session.userId
        const productid = req.query.productId

        const userData = await User.findById({_id:id})
        const userAddress = await Address.find({user_id:id})
        let productData =[];
        if(productid ){
            let product = await Products.findById(productid)

            product = product.toObject()
            product.productId = product._id
            productData.push(product)
            const totalPrice = product.discountPrice;

            req.session.product = productData
            req.session.totalAmount = totalPrice+60

            res.render('checkout',{user:userData,userAddress,productData,totalPrice})
        }else{
            const products = await Cart.aggregate([
                {$match:{userId: new mongoose.Types.ObjectId(id)}},
                {$unwind: '$cartItems'},
                {$lookup: {
                    from: 'products',
                    localField: "cartItems.productId",
                    foreignField: "_id",
                    as: "productDetails",
                }},
                {$project: {
                    product: {$arrayElemAt: ["$productDetails", 0]},
                    quantity: "$cartItems.quantity"
                }}
            ]);
        
            let totalPrice = 0;
            productData = products.map(item => {
                const extendedPrice = item.product.discountPrice * item.quantity;
                totalPrice += extendedPrice;
                return {
                    productId:item.product._id,
                    productName: item.product.productName,
                    discountPrice: item.product.discountPrice,
                    brand: item.product.brand,
                    price: item.product.price,
                    discount: item.product.discount,
                    dialColor: item.product.dialColor,
                    strapColor: item.product.strapColor,
                    image: item.product.image,
                    inStock: item.product.inStock,
                    quantity: item.quantity,
                    extendedPrice: extendedPrice
                };
            });

            req.session.product = productData
            req.session.totalAmount = totalPrice+60
            res.render('checkout',{user:userData,userAddress,productData,totalPrice})
        
        }
        
    } catch (error) {
        console.log(error.message);
    }
}


const confirmOrder = async (req, res) => {
    try {

        if (!req.session || !req.session.userId) {
            return res.status(403).json({ message: "User is not authenticated." })
        }

        const userId = req.session.userId
        const { addressId, paymentMethod } = req.body;

        const userData = await User.findById(userId)
        const UserAddress = await Address.findById({_id:addressId})
        const products = req.session.product
        for(let i=0 ; i<products.length;i++){
            if (products[i].inStock <= 0) {
                return res.status(403).json({ message: "Product is Out of Stock!!" })
            }
        }


        const order = new OrderModel({
            userId : userId,
            orderItems : req.session.product,
            paymentMethod : paymentMethod,
            address : UserAddress,
            totalAmount : req.session.totalAmount
        })

        

        await order.save()

        const orderId = order._id
        const data = await OrderModel.aggregate(
            [
            {
                '$match': {
                '_id': new mongoose.Types.ObjectId(orderId)
                }
            }
            ]
        )
        for (const product of data[0].orderItems) {

            const update = Number(product.quantity);
            await Products.findOneAndUpdate(
              { _id: product.productId },
              {
                $inc: { inStock: -update },
                $set: { popularProduct: true }  
            },
            )
        
          }

        res.redirect(`/orderDetails?orderId=${order._id}`)

        
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ success: false, message: "Server error" });
    }
};


const orderManagementLoad = async(req,res)=>{
    try {
        const currentPage = parseInt(req.query.page) || 1 
        const PerPage = 10;
        const skip = (currentPage - 1) * PerPage ;

        const orders = await OrderModel.find().skip(skip).limit(PerPage).sort({orderDate:-1 })

        const totalOrders = await OrderModel.countDocuments()
        const totalPages = Math.ceil(totalOrders / PerPage)

        res.render('orderManagement', { orders, currentPage, totalPages });
    } catch (error) {
        console.log(error.message);
    }
}

const orderDetailsLoad = async(req,res)=>{
    try {
        const orderId = req.query.orderId
        const userData = await User.findById(req.session.userId)

        const orders= await OrderModel.findById(orderId)
        res.render('orderDetails',{user:userData,orders});

    } catch (error) {
        console.log(error.message);
    }
}

const ordelDetailsForAdmin = async(req,res)=>{
    try {

        const orderId = req.query.orderId
        const orders = await OrderModel.findById(orderId)

        res.render('AdminOrderDetails',{orders})
        
    } catch (error) {
        console.error(error.message);
    }
}

const updateOrderStatus = async (req, res) => {
    try {
        const { orderId, newStatus } = req.body;
        const updatedOrder = await OrderModel.findByIdAndUpdate(orderId,{$set:{orderStatus: newStatus } });

        if (updatedOrder) {
            res.json({ success: true, message: "Order status updated successfully" });
        } else {
            res.json({ success: false, message: "Order not found" });
        }
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ success: false, message: "Server error" });
    }
}

const cancellOrder = async(req,res)=>{
    try {
        const orderid = req.query.orderId
        console.log(orderid);
        const update = await OrderModel.findByIdAndUpdate(orderid,{$set:{orderStatus:"cancelled"}})

        res.status(200).send({ message: 'Order Cancelled Successfully' });
    } catch (error) {
        console.log(error.message);
    }
}

const returnOrder = async(req,res)=>{
    try {
        const { orderId, reason } = req.body;

        const order = await OrderModel.findByIdAndUpdate(orderId,
            {$set:{returnReason: reason, orderStatus : 'returned'}})

        if (!order) {
            return res.status(404).send({
                message: "Order not found."
            });
        }

        res.status(200).send({
            message: "Return processed successfully.",
            order: order
        });
    } catch (error) {
        console.log(error.message);

    }
}

// const searchOrder = async(req,res)=>{
//     try {
//         const currentPage = parseInt(req.query.page) || 1 
//         const PerPage = 10;
//         const skip = (currentPage - 1) * PerPage ;

//         let orders  = []
//         if(req.query.search){
//             orders = await OrderModel.find({order.orderItems.:{$regex:req.query.search,$options: 'i'}}).skip(skip).limit(PerPage).sort({orderDate:-1 })
//         }else{
//             orders= await OrderModel.find({}).skip(skip).limit(PerPage).sort({orderDate:-1 })
//         }

//         const totalOrders = await OrderModel.countDocuments()
//         const totalPages = Math.ceil(totalOrders / PerPage)

//         res.render('orderManagement', { orders, currentPage, totalPages });
//     } catch (error) {
//         console.log(error.message);
//     }
// }

module.exports = {
    ordersPageLoad,
    checkoutPageLoad,
    confirmOrder,
    orderDetailsLoad,
    orderManagementLoad,
    updateOrderStatus,
    ordelDetailsForAdmin,
    cancellOrder,
    returnOrder
}