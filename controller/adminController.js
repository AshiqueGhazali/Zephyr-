const User = require('../model/userModel')
const Products = require('../model/productModel')
const Category = require('../model/categoryModel')
const Orders = require('../model/orderModel')

const PDFDocument = require('pdfkit');
const PDFTable = require('pdfkit-table')
const ExcelJS = require('exceljs');
const fs = require('fs')



const loginLoad = async (req, res) => {
    try {
        res.render('login')
    } catch (error) {
        console.log(error.message);
    }
}

const verifyLogin = async (req, res) => {
    try {
        const isUser = req.body;
        const username = process.env.AUTH_ADMIN_NAME;
        const password = process.env.AUTH_ADMIN_PASSWORD;

        if (isUser.username == username) {
            if (isUser.password == password) {
                req.session.admin = { username: isUser.username }
                res.redirect('/admin/dashboard')
            } else {
                return res.render('login', { message: "Please enter a valid User Name and Password" })
            }
        } else {
            return res.render('login', { message: "Please enter a valid User Name and Password" })
        }

    } catch (error) {
        console.log(error.message);
    }
}

const loadHome = async (req, res, next) => {
    try {
        const userCount = await User.find().count()
        const productCount = await Products.find().count()
        const orderCount = await Orders.find().count()
        const result = await Orders.aggregate([{ $match: { orderStatus: "completed" } }, { $group: { _id: null, totalSales: { $sum: "$totalAmount" } } }])
        const totalSales = result[0].totalSales

        const salesReport = await Orders.find()

        res.render('dashboard', { userCount, productCount, orderCount, totalSales, salesReport })
    } catch (error) {
        console.log(error.message);
        next(error)
    }
}

const orderStatuses = async (req, res, next) => {
    try {
        const orderCounts = await Orders.aggregate([
            { $group: { _id: '$orderStatus', count: { $sum: 1 } } }
        ]);
        const categoryCounts = await Orders.aggregate([{ $unwind: "$orderItems" },
        { $group: { _id: '$orderItems.category', count: { $sum: 1 } } }
        ]);
        const dailyOrders = await Orders.aggregate([
            { $group: { _id: '$orderDate', count: { $sum: 1 } } }
        ]);
        res.json({ status: orderCounts, category: categoryCounts, perDay: dailyOrders });

    } catch (error) {
        console.log(error.message);
        next(error)
    }
}


const salesReport = async (req, res, next) => {
    try {
        const { interval } = req.query;
        const { startDate, endDate } = req.query;

        let salesReport;
        if (interval === 'daily') {
            salesReport = await Orders.find({
                orderDate: {
                    $gte: new Date(new Date().setHours(0, 0, 0, 0)),
                    $lt: new Date(new Date().setHours(23, 59, 59, 999))
                }
            });

        } else if (interval === 'weekly') {
            const startDate = new Date();
            const endDate = new Date(startDate.getTime() - 7 * 24 * 60 * 60 * 1000);
            salesReport = await Orders.find({
                orderDate: {
                    $gte: endDate,
                    $lt: startDate
                }
            });
        } else if (interval === 'yearly') {
            const yearStart = new Date(new Date().getFullYear(), 0, 1);
            const yearEnd = new Date(new Date().getFullYear() + 1, 0, 0);
            salesReport = await Orders.find({
                orderDate: {
                    $gte: yearStart,
                    $lt: yearEnd
                }
            });
        } else if (startDate && endDate) {
            salesReport = await Orders.find({
                orderDate: {
                    $gte: startDate,
                    $lte: endDate
                }
            });
        } else {
            salesReport = await Orders.find();
        }

        res.json({ salesReport });

    } catch (error) {
        console.log(error.message);
        next(error)
    }
}

const downloadPdf = async (req, res) => {
    try {
        const data = req.body.data;

        const doc = new PDFDocument();
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="salesReport.pdf"`);

        console.log("hiiiiiiiiiiiii");

        const table = new PDFTable(doc, { bottomMargin: 30 });
        console.log("hloooo");

        doc.pipe(res);

        await table.addTable([
            { key: 'orderId', label: 'Order Id', align: 'left', width: 70 },
            { key: 'orderDate', label: 'Order Date', align: 'left', width: 70 },
            { key: 'userName', label: 'User Name', align: 'left', width: 70 },
            { key: 'address', label: 'Address', align: 'left', width: 100 },
            { key: 'phone', label: 'Phone', align: 'left', width: 50 },
            { key: 'productName', label: 'Product Name', align: 'left', width: 70 },
            { key: 'category', label: 'Category', align: 'left', width: 70 },
            { key: 'status', label: 'Order Status', align: 'left', width: 70 },
            { key: 'price', label: 'Price', align: 'right', width: 50 }
        ], data, {
            border: null,
            width: "auto",
            striped: true,
            stripedColors: ["#f6f6f6", "#ffffff"],
            cellsPadding: 10,
            marginLeft: 30,
            marginRight: 30,
            headAlign: 'center',
            prepareHeader: () => doc.font('Helvetica-Bold').fontSize(12),
            prepareRow: (row, indexColumn, indexRow, rectRow, rectCell) => {
                doc.font('Helvetica').fontSize(10);
            },
        });


        doc.end();
    } catch (error) {
        console.error("Error generating PDF: ", error);
        res.status(500).send("Failed to generate PDF");
    }
}



const downloadExcel = async (req, res) => {
    try {
        const { data } = req.body;

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Sales Data');

        worksheet.columns = [
            { header: 'Order Id', key: 'orderId', width: 20 },
            { header: 'Order Date', key: 'orderDate', width: 20 },
            { header: 'User Name', key: 'userName', width: 20 },
            { header: 'Address', key: 'address', width: 30 },
            { header: 'Phone', key: 'phone', width: 15 },
            { header: 'Product Name', key: 'productName', width: 20 },
            { header: 'Category', key: 'category', width: 20 },
            { header: 'Status', key: 'status', width: 15 },
            { header: 'Total Amount', key: 'totalAmount', width: 20 },
        ];

        // Adding rows >>
        worksheet.addRows(data);

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename="salesReport.xlsx"');

        workbook.xlsx.write(res).then(() => {
            res.status(200).end();
        });
    } catch (error) {
        console.log(error.message);
    }
}

const loadUserManagement = async (req, res, next) => {
    try {
        const currentPage = parseInt(req.query.page)
        const userPerPage = 10
        const skip = (currentPage - 1) * userPerPage;

        const users = await User.find().skip(skip).limit(userPerPage)

        const totalProduct = await User.countDocuments()
        const totalPages = Math.ceil(totalProduct / userPerPage)

        res.render('userManagement', { users, currentPage, totalPages })

    } catch (error) {
        console.log(error.message);
        next(error)
    }
}

const searchUser = async (req, res, next) => {
    try {
        let users = [];
        const currentPage = parseInt(req.query.page)
        const userPerPage = 10
        const skip = (currentPage - 1) * userPerPage;

        const totalProduct = await User.countDocuments()
        const totalPages = Math.ceil(totalProduct / userPerPage)


        if (req.query.search) {

            users = await User.find({ Fname: { $regex: req.query.search, $options: 'i' } }).skip(skip).limit(userPerPage)
        } else {
            users = await User.find().skip(skip).limit(userPerPage)
        }
        res.render('userManagement', { users: users, currentPage, totalPages })
    } catch (error) {
        console.log(error.message);
        next(error)
    }
}


const blockAndUnblockUser = async (req, res, next) => {
    try {
        const id = req.query.id;
        const userData = await User.findById({ _id: id })
        userData.is_block = !userData.is_block
        await userData.save()

        if (userData.is_block) {
            delete req.session.userId;
        }

        let message = userData.is_block ? "User Blocked successfully" : "User Unblocked successfully";

        res.status(200).json({ message })

    } catch (error) {
        console.log(error.message);
        next(error)
    }
}

const logout = async (req, res) => {
    try {
        req.session.destroy()
        res.redirect('/admin/login')
    } catch (error) {
        console.log(error.message);
    }
}
module.exports = {
    loginLoad,
    verifyLogin,
    loadHome,
    orderStatuses,
    loadUserManagement,
    searchUser,
    logout,
    blockAndUnblockUser,
    salesReport,
    downloadPdf,
    downloadExcel
}