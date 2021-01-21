const passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy;
const userService = require('../models/user/user.model');

const adminService = require('../models/user.model');

passport.use(new LocalStrategy(
    function (username, password, done) {
        userService.checkCredential(username, password).then((user) => {
            if (user == false) {
                adminService.checkCredential(username, password).then((user) => {
                    if (!user) {
                        return done(null, false, {
                            message: 'Incorrect username or password'
                        });
                    }
                    return done(null, user);
                });
            } else {
                return done(null, user);
            }
        });

    }
));

passport.serializeUser(function (user, done) {
    done(null, user.email);
});

passport.deserializeUser(function (id, done) {
    userService.findOneByEmail(id).then((user) => {
        if (user == null) {
            adminService.findOneByEmail(id).then((admin) => {
                if(admin!=null){
                    delete admin.password_hash;
                    admin.isAdmin = true;
                    done(null, admin);
                    return;
                } else {
                    return;
                }
            })
        } else {
            adminService.findOneByEmail(id).then((admin) => {
                if (admin != null) {
                    delete admin.password_hash;
                    admin.isAdmin = true;
                    admin.isUser = true;
                    admin.isBoth = true;
                    done(null, admin);
                    return;
                } else {
                    delete user.password_hash;
                    user.isUser = true;
                    done(null, user);
                    return;
                }
            })
        }

    });
});


module.exports = passport;