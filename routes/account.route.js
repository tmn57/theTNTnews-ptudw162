var express = require('express');
var accountModel = require('../models/account.model');
var passport = require('passport');
var bcrypt = require('bcrypt');
var moment = require('moment');
var notAuth = require('../middlewares/auth.middlewares').notAuthRequired;
var getAuthInfo = require('../middlewares/auth.middlewares').isAuth;
var dataValidate = require('../utils/validate');

var router = express.Router();

router.get('/is-email-available', notAuth, (req, res, next) => {
    var userEmail = req.query.email;
    accountModel.singleByEmail(userEmail).then(rows => {
        if (rows.length > 0) {
            return res.json(false);
        }
        return res.json(true);
    })
});

router.get('/is-pseudonym-available', notAuth, (req, res, next) => {
    var userPseudonym = req.query.pseudonym;
    accountModel.singleByPseudonym(userPseudonym).then(rows => {
        if (rows.length > 0) {
            return res.json(false);
        }
        return res.json(true);
    })
});

router.get('/login', notAuth, (req, res) => {
    res.render('_nolayout/login', {
        referer: req.headers.referer,
        layout: false
    });
});


router.get('/register', notAuth, (req, res) => {
    res.render('_nolayout/register', {
        layout: false
    });
});

router.get('/forgotpassword', notAuth, (req, res) => {
    res.render('_nolayout/forgotpassword', {
        layout: false
    });
});


router.post('/login', notAuth, (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) {
            //console.log('error');
            return next(err);
        }

        if (!user) {
            //console.log('false');
            return res.render('_noLayout/login', {
                layout: false,
                wrongPassword: true,
                err_message: info.message
            })
        }

        req.logIn(user, err => {
            if (err) {
                return next(err);
            }
            var strURL = '/';
            if (req.user.acc_permission) {
                switch (req.user.acc_permission) {
                    case 'admin':
                        strURL = '/admin';
                        break;
                    case 'writer':
                        strURL = '/writer';
                        break;
                    case 'editor':
                        strURL = '/editor';
                        break;
                    default:
                        if (req.body.refURL) strURL = req.body.refURL;
                        break;
                }
            }
            return res.redirect(strURL);
        });

    })(req, res, next);
})


router.post('/register', notAuth, (req, res, next) => {

    var strPermission = '';
    var strPseudonym = '';
    if (req.body.iswriter) {
        strPermission = 'writer';
        strPseudonym = req.body.pseudonym;
    }
    else {
        strPermission = 'subscriber';
    }

    if (dataValidate.accountStringsValidate(req.body.email, strPermission, req.body.fullname, req.body.birthdate, req.body.password)) {
        var saltRounds = 10;
        var dob = moment(req.body.birthdate, 'DD/MM/YYYY').format('YYYY-MM-DD');
        var hash = bcrypt.hashSync(req.body.password, saltRounds);
        var entity = {
            acc_email: req.body.email,
            acc_hpw: hash,
            acc_fullname: req.body.fullname,
            acc_birthdate: dob,
            acc_pseudonym: strPseudonym,
            acc_permission: strPermission
        }
        accountModel.add(entity).then(id => {
            res.redirect('/account/login');
        })
    } else {
        res.redirect('/account/register');
    }

})

router.get('/logout', (req, res, next) => {
    if (req.user) {
        req.logOut();
        res.redirect('/');
    } else {
        next();
    }
});


router.get('/details', getAuthInfo, (req, res, next) => {
    if (req.user) {
        accountModel.singleInfoById(req.user.acc_id).then(infos => {
            if (infos.length > 0) {
                var info = infos[0];
                accountModel.accountSubscription(info.acc_id).then(subs => {
                    var sub;
                    if (subs.length > 0) sub = subs[0];
                    res.render('dashboardViews/accountDetails', {
                        layout: 'dashboard.hbs',
                        AccInfo: info,
                        UserPermission: req.user.acc_permission,
                        Subscription: sub,
                    });
                })
            } else {
                res.render('_noLayout/404', { layout: false });
            }
        }
        )
    } else {
        res.render('_noLayout/404', { layout: false });
    }
});

router.post('/update', (req, res, next) => {
    if (req.user) {
        var userId = req.user.acc_id;
        var accEmail = req.body.email;
        var accFullname = req.body.fullname;
        if (dataValidate.accountStringsValidate(accEmail, req.user.acc_permission, accFullname, req.body.birthdate, '111111111111')) {
            var accPseudonym = ' ';
            if(req.user.acc_permission == 'writer') accPseudonym = req.body.acc_pseudonym;
            var accBirthDate = moment(req.body.birthdate, 'DD/MM/YYYY').format('YYYY-MM-DD');
            Promise.all([accountModel.singleInfoById(userId),
                accountModel.singleByPseudonym(accPseudonym)]).then(([urows,pseurows]) => {
                if (urows.length > 0) {
                    if(pseurows.length > 0) accPseudonym = urows[0].acc_pseudonym;
                    console.log('accPseudony = ' + accPseudonym);
                    var user = {
                        acc_id: userId,
                        acc_email: accEmail,
                        acc_fullname: accFullname,
                        acc_birthdate: accBirthDate,
                        acc_pseudonym: accPseudonym
                    };
                    accountModel.update(user).then(() => {
                        res.redirect('/account/details');
                    }).catch(err => { console.error(err); }
                    );
                } else {
                    res.render('_nolayout/404', { layout: false });
                }
            });
        } else {
            res.redirect('/account/details');
        }
    } else {
        res.redirect('/account/login');
    }
});

router.post('/updatepassword', (req, res, next) => {
    if (req.user) {
        var userId = req.user.acc_id;
        var oldpwd = req.body.old_password;
        var newpwd = req.body.password;
        console.log('update password of ', userId);
        accountModel.singleInfoById(userId).then(users => {
            if (users.length > 0) {
                var user = users[0];
                var ret = bcrypt.compareSync(oldpwd, user.acc_hpw);
                if (ret && newpwd.length > 7) {
                    const ROUNDS = 10;
                    var newhpw = bcrypt.hashSync(newpwd, ROUNDS);
                    accountModel.update({ acc_id: user.acc_id, acc_hpw: newhpw }).then(() => {
                        res.redirect('/account/details');
                    })

                } else {
                    console.log('Wrong old password or newpwd invalid');
                    res.render('dashboardViews/accountDetails', { layout: 'dashboard.hbs', errorPasswordInvalid: true });
                }
            } else {
                console.log('Waring UPDATE PWD: User is invalid');
                res.redirect('/');
            }
        });
    } else {
        res.redirect('/account/login');
    }
})

module.exports = router;