const jwt = require('jsonwebtoken')

module.exports = (req,res,next) => {
    // checking whether request has authorization field in request headers or not
    const authHeader = req.get('Authorization');
    if(!authHeader)
    {
        req.isAuth = false;
        return next();
    }

    const token = authHeader.split(' ')[1]; //Bearer tokenString
    if(!token || token === '')
    {
        req.isAuth = false;
        return next();
    }
    let decodedToken;
    try{
        decodedToken= jwt.verify(token,'secretKey');
    }
    catch(err)
    {
        req.isAuth = false;
        return next();
    }
    if(!decodedToken)
    {
        req.isAuth = false;
        return next();
    }
    req.isAuth = true;
    req.userId = decodedToken.userId;
    next();
    
}