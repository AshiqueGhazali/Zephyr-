const passport = require('passport')
const googleStrategy = require('passport-google-oauth2').Strategy

passport.serializeUser(function(user,done){
    done(null,user)
})
passport.deserializeUser(function(user,done){
    done(null,user)
})

passport.use(new googleStrategy({
    clientID: process.env.GOOGLE_CLINT_ID,
    clientSecret: process.env.GOOGLE_CLINT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL,
    passReqToCallback:true
},function(req,accessToken,refreshToken,profile,done){
    console.log(profile);
    return done(null,profile)
}

))

