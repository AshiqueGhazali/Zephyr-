const User = require("../model/userModel")
const Products = require('../model/productModel')
const Category = require('../model/categoryModel')
const Address = require('../model/addressModel')
const Cart = require('../model/cartModel')
const { default: mongoose } = require("mongoose");
const OrderModel = require('../model/orderModel')
const Wallet = require('../model/walletModel')
const Razorpay = require('razorpay')
const crypto = require('crypto')


// razorpay instance 

var razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_ID_KEY,
    key_secret: process.env.RAZORPAY_SECRET_KEY
});
  

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


const createOrder = async (req, res) => {
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

        if (paymentMethod === "online Payment") {
            const razorpayOrder = await razorpayInstance.orders.create({
                amount: order.totalAmount * 100, 
                currency: "INR",
                receipt: `receipt_order_${order._id}`,
                payment_capture: '1'
            });

            order.razorpayOrderId = razorpayOrder.id;
            await order.save();

            // responce
            return res.json({
                success: true,
                message: "Order created and ready for payment.",
                orderId: order._id,
                razorpayOrderId: razorpayOrder.id,
                amount: order.totalAmount * 100,
                key_id: process.env.RAZORPAY_ID_KEY 
            });
        } else {
            order.orderStatus = "order confirmed"
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

            return res.json({
                success: true,
                message: "Order created successfully.",
                orderId: order._id
            });
        }
    } catch (error) {
        console.error('Create Order Failed:', error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

const verifyPayment = async (req, res) => {
    const { paymentId, orderId, razorpaySignature } = req.body;

    try {
        const order = await OrderModel.findById(orderId);
        if (!order) {
            console.log("aaaaa");
            return res.status(404).json({ success: false, message: "Order not found" });
        }

        // creating signature to verify 
        const data = `${order.razorpayOrderId}|${paymentId}`;
        const shasum = crypto.createHmac('sha256', process.env.RAZORPAY_SECRET_KEY);
        shasum.update(data);
        const digest = shasum.digest('hex');

        if (digest !== razorpaySignature) {
            return res.status(400).json({ success: false, message: "Invalid signature provided" });
        }

        order.orderStatus = "order confirmed";
        await order.save();

        const orderData = await OrderModel.aggregate(
            [
            {
                '$match': {
                '_id': new mongoose.Types.ObjectId(orderId)
                }
            }
            ]
        )
        for (const product of orderData[0].orderItems) {

            const update = Number(product.quantity);
            await Products.findOneAndUpdate(
              { _id: product.productId },
              {
                $inc: { inStock: -update },
                $set: { popularProduct: true }  
            },
            )
        
          }

        res.json({ success: true, message: "Payment verified and order updated" });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ success: false, message: "Server error during payment verification" });
    }
};


const getPaymentDetails = async(req,res)=>{
    try {
        const { orderId } = req.body;
    if (!req.session || !req.session.userId) {
        return res.status(403).json({ message: "User is not authenticated." });
    }

    const order = await OrderModel.findById(orderId);
        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found." });
        }

        if (order.userId.toString() !== req.session.userId) {
            return res.status(403).json({ success: false, message: "Unauthorized access to the order." });
        }

        const amount = order.totalAmount * 100;  

        const razorpayOrder = await razorpayInstance.orders.create({
            amount: amount,
            currency: "INR",
            receipt: `receipt_order_${orderId}`,
            payment_capture: '1'
        });

        order.razorpayOrderId = razorpayOrder.id;
        await order.save();

        res.json({
            success: true,
            key_id: process.env.RAZORPAY_ID_KEY,
            amount: amount,
            currency: "INR",
            razorpayOrderId: razorpayOrder.id,
            orderId: order._id

        });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ success: false, message: "Server error while retrieving payment details." });
    }
}


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
        const orderData = await OrderModel.findById(orderid)
        const update = await OrderModel.findByIdAndUpdate(orderid,{$set:{orderStatus:"cancelled"}})

        const data = await OrderModel.aggregate(
            [
            {
                '$match': {
                '_id': new mongoose.Types.ObjectId(orderid)
                }
            }
            ]
        )
        for (const product of data[0].orderItems) {

            const update = Number(product.quantity);
            await Products.findOneAndUpdate(
              { _id: product.productId },
              {
                $inc: { inStock: update },
                $set: { popularProduct: true }  
            },
            )
        
          }

          if(orderData.paymentMethod==='online Payment'){
            await Wallet.findOneAndUpdate(
                {userId:req.session.userId},
                { $inc: { walletAmount: orderData.totalAmount },
                    $push: { 
                        transactionHistory: {
                            amount: orderData.totalAmount,
                            PaymentType: "credit",
                            date: new Date() 
                        }
                    }
                },
                {new: true, upsert: true})
          }

        res.status(200).send({ message: 'Order Cancelled Successfully' });
    } catch (error) {
        console.log(error.message);
    }
}

const requestForReturn = async(req,res)=>{
    try {
        const { orderId, reason } = req.body;

        const order = await OrderModel.findByIdAndUpdate(orderId,
            {$set:{returnReason: reason, orderStatus : 'Requested for Return'}})

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

const approveReturn = async(req,res)=>{
    try {
        const orderId= req.query.orderId;

        const order = await OrderModel.findByIdAndUpdate(orderId,
            {$set:{orderStatus : 'returned'}})

        if (!order) {
            return res.status(404).send({
                message: "Order not found."
            });
        }

        // add to wallet
        const orderData = await OrderModel.findById(orderId)
        await Wallet.findOneAndUpdate(
            {userId:orderData.userId},
            { $inc: { walletAmount: orderData.totalAmount },
                $push: { 
                    transactionHistory: {
                        amount: orderData.totalAmount,
                        PaymentType: "credit",
                        date: new Date() 
                    }
                }
            },
            {new: true, upsert: true})

        res.status(200).send({
            message: "Return Approved successfully.",
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


const walletLoad = async(req,res)=>{
    try {
        const userId = req.session.userId
        if(!userId){
            return res.status(403).json({ message: "User is not authenticated." });
        }

        const wallet = await Wallet.findOneAndUpdate({userId:userId},{ $setOnInsert: { userId: userId } }, { new: true, upsert: true})
        const user = await User.findById(userId )

        res.render('wallet',{user,wallet})
        
    } catch (error) {
        console.log(error.message);
    }
}

module.exports = {
    ordersPageLoad,
    checkoutPageLoad,
    createOrder,
    orderDetailsLoad,
    orderManagementLoad,
    updateOrderStatus,
    ordelDetailsForAdmin,
    cancellOrder,
    requestForReturn,
    approveReturn,
    verifyPayment,
    getPaymentDetails,
    walletLoad
}