// middleware for is login or not is not login when click some link redirect to login page
const isLogin=async(req,res,next)=>{
    try {
        if(req.session.userId){
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
            return res.redirect('/logout')
        }
        
    } catch (error) {
        console.log();
    }
}

const isLogout = async(req,res,next)=>{
    try {
        if(req.session.userId){
            return res.redirect('/home')
        }
        return next()
    } catch (error) {
        
    }
}


module.exports = {
    isLogin,
    loginCheck,
    isLogout,
}