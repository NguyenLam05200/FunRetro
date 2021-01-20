require('express-async-errors');

module.exports = function (app) {
// url k tồn tại
//error 404
app.use(function (req, res) {
    res.render('404', {
        layout: false
    });
})

//error 500 (query string sai,lỗi database đọc đĩa cứng, ...)
app.use(function (err, req, res, next) {
    console.error(err.stack);
    res.status(500).render('500', {
        layout: false
    });
})

}