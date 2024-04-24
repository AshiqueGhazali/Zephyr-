// middleware for is login or not is not login when click some link redirect to login page
const isLogin=async(req,res,next)=>{
    try {
        // console.log(req.session.userId);
        if(req.session.userId ){
            next()
        }else{
            res.redirect("/login")
        }
    } catch (error) {
        console.log(error.message);
    }
}

//middleware for is login
const loginCheck =async(req,res,next)=>{
    try {
        if(req.session.userId){
            next()
        }else{
            res.redirect('/logout')
        }
        
    } catch (error) {
        console.log();
    }
}

const isLogout = async(req,res,next)=>{
    try {
        // console.log(req.session.userId)
        if(req.session.userId){
            res.redirect('/home')
        }else{
            next()
        }
        
    } catch (error) {
        console.log(error.message);
    }
}

// Is orderConformed

const isOrderd =async(req,res,next)=>{
    try {
        if(req.session.orderConforme){
            next()
        }else{
            res.redirect('/home')

        }
    } catch (error) {
        console.log(error.message);
    }
}

module.exports = {
    isLogin,
    loginCheck,
    isLogout,
    isOrderd
}