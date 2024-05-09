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
const Coupen = require('../model/coupenModel')
const Offer = require('../model/offerModel')


// razorpay instance 

var razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_ID_KEY,
    key_secret: process.env.RAZORPAY_SECRET_KEY
});


const ordersPageLoad = async (req, res, next) => {
    try {
        const id = req.session.userId
        const userData = await User.findById({ _id: id })
        const orders = await OrderModel.find({ userId: id }).sort({ orderDate: -1 })

        res.render('orders', { user: userData, orders })
    } catch (error) {
        console.log(error.message);
        next(error)
    }
}

const checkoutPageLoad = async (req, res, next) => {
    try {
        const id = req.session.userId
        const productid = req.query.productId

        const userData = await User.findById({ _id: id })
        const userAddress = await Address.find({ user_id: id })
        let productData = [];
        if (productid) {
            let product = await Products.findById(productid)

            product = product.toObject()
            product.productId = product._id
            productData.push(product)
            let totalPrice = product.discountPrice;

            if (product.offer.length > 0) {
                const offerIndex = product.offer.length - 1
                const offerId = product.offer[offerIndex]

                const offer = await Offer.findById(offerId)
                totalPrice = totalPrice - (totalPrice * offer.discount) / 100

                if (totalPrice > offer.maxRedimabelAmount) {
                    totalPrice = offer.maxRedimabelAmount
                }

                req.session.offerId = offer._id
            }


            let coupenDiscount = 0;
            let coupenCode = null
            req.session.product = productData
            if (req.session.coupen && req.session.coupenId) {
                const coupen = await Coupen.findById(req.session.coupenId)
                const discountPercentage = req.session.coupen;
                const maxDiscount = coupen.maxRedimabelAmount;

                let discount = (totalPrice * discountPercentage) / 100;

                if (discount > maxDiscount) {
                    discount = maxDiscount;
                }

                coupenDiscount = discount
                coupenCode = coupen.coupenCode
                req.session.totalAmount = totalPrice + 60 - discount
            } else {
                req.session.totalAmount = totalPrice + 60
            }
            res.render('checkout', { user: userData, userAddress, productData, totalPrice, coupenDiscount, coupenCode })
        } else {
            const products = await Cart.aggregate([
                { $match: { userId: new mongoose.Types.ObjectId(id) } },
                { $unwind: '$cartItems' },
                {
                    $lookup: {
                        from: 'products',
                        localField: 'cartItems.productId',
                        foreignField: '_id',
                        as: 'productDetails',
                    }
                },
                {
                    $project: {
                        product: { $arrayElemAt: ['$productDetails', 0] },
                        quantity: '$cartItems.quantity'
                    }
                }
            ]);

            let totalPrice = 0;
            productData = products.map(async (item) => {
                let productPrice = item.product.discountPrice;
                let extendedPrice = productPrice * item.quantity;

                if (item.product.offer && item.product.offer.length > 0) {
                    const offerIndex = item.product.offer.length - 1;
                    const offerId = item.product.offer[offerIndex];
                    const offer = await Offer.findById(offerId);
                    productPrice -= (productPrice * offer.discount) / 100;
                    if (productPrice > offer.maxRedimabelAmount) {
                        productPrice = offer.maxRedimabelAmount;
                    }

                    extendedPrice = productPrice * item.quantity;
                }

                totalPrice += extendedPrice;
                return {
                    productId: item.product._id,
                    productName: item.product.productName,
                    discountPrice: productPrice,
                    brand: item.product.brand,
                    price: item.product.price,
                    category: item.product.category,
                    discount: item.product.discount,
                    dialColor: item.product.dialColor,
                    strapColor: item.product.strapColor,
                    image: item.product.image,
                    inStock: item.product.inStock,
                    quantity: item.quantity,
                    offer: item.product.offer,
                    extendedPrice: extendedPrice
                };
            });

            productData = await Promise.all(productData);

            let coupenDiscount = 0;
            let coupenCode = null
            req.session.product = productData
            if (req.session.coupen && req.session.coupenId) {
                const coupen = await Coupen.findById(req.session.coupenId)
                const discountPercentage = req.session.coupen;
                const maxDiscount = coupen.maxRedimabelAmount;

                let discount = (totalPrice * discountPercentage) / 100;

                if (discount > maxDiscount) {
                    discount = maxDiscount;
                }

                coupenDiscount = discount
                coupenCode = coupen.coupenCode
                req.session.totalAmount = totalPrice + 60 - discount
            } else {
                req.session.totalAmount = totalPrice + 60
            }
            res.render('checkout', { user: userData, userAddress, productData, totalPrice, coupenDiscount, coupenCode })

        }

    } catch (error) {
        console.log(error.message);
        next(error)
    }
}


const createOrder = async (req, res, next) => {
    try {
        if (!req.session || !req.session.userId) {
            return res.status(403).json({ message: "User is not authenticated." })
        }

        const userId = req.session.userId
        const { addressId, paymentMethod } = req.body;

        const userData = await User.findById(userId)
        const UserAddress = await Address.findById({ _id: addressId })
        const wallet = await Wallet.findOneAndUpdate({ userId: userId }, { $setOnInsert: { userId: userId } }, { new: true, upsert: true })


        const products = req.session.product;

        for (let product of products) {
            if (product.inStock <= 0) {
                return res.status(403).json({ message: "Product is Out of Stock!!" });
            }
        }

        if(paymentMethod==='cash On Delivery' && req.session.totalAmount > 1000){
            return res.status(403).json({ message: "Cash On Delivery only Availble for Product below ₹1000!!" });
        }

        if(paymentMethod==='Wallet' && wallet.walletAmount < req.session.totalAmount){
            return res.status(403).json({ message: "Uh-oh, your wallet's on a diet!" });
        }

        const orderItems = products.map(product => {
            const offerId = product.offer && product.offer.length > 0 ? product.offer[product.offer.length - 1] : null;
            return { ...product, offerId: offerId };
        });


        const order = new OrderModel({
            userId: userId,
            orderItems: orderItems,
            paymentMethod: paymentMethod,
            address: UserAddress,
            totalAmount: req.session.totalAmount
        })


        if (req.session.coupen && req.session.coupenId) {
            order.coupenId = req.session.coupenId
        }
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

            // wallet changes >>
            if(paymentMethod==='Wallet' ){
                await Wallet.findOneAndUpdate(
                    { userId: userId },
                    {
                        $inc: { walletAmount: -order.totalAmount },
                        $push: {
                            transactionHistory: {
                                amount: order.totalAmount,
                                PaymentType: "Debit",
                                date: new Date()
                            }
                        }
                    },
                    { new: true, upsert: true })
            }

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
        next(error);
    }
};

const verifyPayment = async (req, res, next) => {
    const { paymentId, orderId, razorpaySignature } = req.body;

    try {
        const order = await OrderModel.findById(orderId);
        if (!order) {
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
        next(error)
    }
};


const getPaymentDetails = async (req, res, next) => {
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
        next(error);
    }
}


const orderManagementLoad = async (req, res, next) => {
    try {
        const currentPage = parseInt(req.query.page) || 1
        const PerPage = 10;
        const skip = (currentPage - 1) * PerPage;

        const orders = await OrderModel.find().skip(skip).limit(PerPage).sort({ orderDate: -1 })

        const totalOrders = await OrderModel.countDocuments()
        const totalPages = Math.ceil(totalOrders / PerPage)

        res.render('orderManagement', { orders, currentPage, totalPages });
    } catch (error) {
        console.log(error.message);
        next(error)
    }
}

const orderDetailsLoad = async (req, res, next) => {
    try {
        const orderId = req.query.orderId
        const userData = await User.findById(req.session.userId)

        const orders = await OrderModel.findById(orderId)
        res.render('orderDetails', { user: userData, orders });

    } catch (error) {
        console.log(error.message);
        next(error)
    }
}

const ordelDetailsForAdmin = async (req, res, next) => {
    try {

        const orderId = req.query.orderId
        const orders = await OrderModel.findById(orderId)

        res.render('AdminOrderDetails', { orders })

    } catch (error) {
        console.error(error.message);
        next(error)
    }
}

const updateOrderStatus = async (req, res, next) => {
    try {
        const { orderId, newStatus } = req.body;
        const updatedOrder = await OrderModel.findByIdAndUpdate(orderId, { $set: { orderStatus: newStatus } });

        if (updatedOrder) {
            res.json({ success: true, message: "Order status updated successfully" });
        } else {
            res.json({ success: false, message: "Order not found" });
        }
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ success: false, message: "Server error" });
        next(error)
    }
}

const cancellOrder = async (req, res, next) => {
    try {
        const orderid = req.query.orderId
        const orderData = await OrderModel.findById(orderid)
        const update = await OrderModel.findByIdAndUpdate(orderid, { $set: { orderStatus: "cancelled" } })

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

        if (orderData.paymentMethod === 'online Payment' || orderData.paymentMethod === 'Wallet') {
            await Wallet.findOneAndUpdate(
                { userId: req.session.userId },
                {
                    $inc: { walletAmount: orderData.totalAmount },
                    $push: {
                        transactionHistory: {
                            amount: orderData.totalAmount,
                            PaymentType: "credit",
                            date: new Date()
                        }
                    }
                },
                { new: true, upsert: true })
        }

        res.status(200).send({ message: 'Order Cancelled Successfully' });
    } catch (error) {
        console.log(error.message);
        next(error)
    }
}

const requestForReturn = async (req, res, next) => {
    try {
        const { orderId, reason } = req.body;

        const order = await OrderModel.findByIdAndUpdate(orderId,
            { $set: { returnReason: reason, orderStatus: 'Requested for Return' } })

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
        next(error)

    }
}

const approveReturn = async (req, res, next) => {
    try {
        const orderId = req.query.orderId;

        const order = await OrderModel.findByIdAndUpdate(orderId,
            { $set: { orderStatus: 'returned' } })

        if (!order) {
            return res.status(404).send({
                message: "Order not found."
            });
        }

        // add to wallet
        const orderData = await OrderModel.findById(orderId)
        await Wallet.findOneAndUpdate(
            { userId: orderData.userId },
            {
                $inc: { walletAmount: orderData.totalAmount },
                $push: {
                    transactionHistory: {
                        amount: orderData.totalAmount,
                        PaymentType: "credit",
                        date: new Date()
                    }
                }
            },
            { new: true, upsert: true })

        res.status(200).send({
            message: "Return Approved successfully.",
            order: order
        });
    } catch (error) {
        console.log(error.message);
        next(error)

    }
}


const walletLoad = async (req, res, next) => {
    try {
        const userId = req.session.userId
        if (!userId) {
            return res.status(403).json({ message: "User is not authenticated." });
        }

        const wallet = await Wallet.findOneAndUpdate({ userId: userId }, { $setOnInsert: { userId: userId } }, { new: true, upsert: true })
        const user = await User.findById(userId)

        res.render('wallet', { user, wallet })

    } catch (error) {
        console.log(error.message);
        next(error)
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