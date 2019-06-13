var moment = require('moment');
var accountModel = require('../models/account.model');

module.exports.admin = (req, res, next) => {
    if (req.user) {
        if (req.user.acc_permission == 'admin') {
            next();
        } else {
            res.render('_noLayout/permissionDenied', { layout: false });
        }
    } else {
        res.redirect('/account/login');
    }
}

module.exports.editor = (req, res, next) => {
    if (req.user) {
        if (req.user.acc_permission == 'editor') {
            next();
        } else {
            res.render('_noLayout/permissionDenied', { layout: false });
        }
    } else {
        res.redirect('/account/login');
    }
}

module.exports.writer = (req, res, next) => {
    if (req.user) {
        if (req.user.acc_permission == 'writer') {
            next();
        } else {
            res.render('_noLayout/permissionDenied', { layout: false });
        }
    } else {
        res.redirect('/account/login');
    }
}

module.exports.premiumCheck = (req, res, next) => {
    if (req.user) {
        accountModel.accountSubscription(req.user.acc_id).then(subs => {
            if (subs.length > 0) {
                req.isPremiumUser = true;
                next();
            } else {
                if (req.user.acc_permission == 'admin') {
                    req.isPremiumUser = true;
                    next();
                }
                else next();
            }
        })
    } else { next() }
}

module.exports.isAuth = (req, res, next) => {
    if (req.user) {
        res.locals.isAuthenticated = true;
        if (req.user.acc_permission == 'subscriber') {
            res.locals.greetingLink = 'account/details';
        } else {
            res.locals.greetingLink = req.user.acc_permission;
        }
        res.locals.accountName = req.user.acc_fullname;
    } else { res.locals.isAuthenticated = false; }
    next();
}

module.exports.notAuthRequired = (req, res, next) => {
    if (req.user) {
        redirect('/');
    } else next();
}