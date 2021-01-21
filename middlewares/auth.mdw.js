module.exports = function restrict(req, res, next) {
    
    if (!req.user) {
        return res.redirect(`/admin/account/login?retUrl=${req.originalUrl}`);
        //return res.redirect(`http://localhost:3000/home`);

        // chú ý dấu ``
        //đá về trang login kèm địa chỉ trước đó ng ta truy cập, 
        //nếu k (xxx > login > post login thì đc trước đó là login)
    }
    if(!req.user.isVerified){
        return res.redirect(`/admin/account/login?notification=1`);
    }
    if(req.user.isAdmin){
        if(!(req.user.permission >= 1) ){
            return res.redirect(`/admin/account/login?notification=3`);
        }
    }
    
    next();
}

//nếu thêm trường quyền hạn thì thêm 1 function y như trên nhưng biến tấu thêm thôi