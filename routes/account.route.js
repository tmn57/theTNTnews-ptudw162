var express = require('express');
var accountModel = require('../models/account.model');
var passport = require('passport');

var router = express.Router();

router.get('/is-email-available', (req, res, next) => {
    var userEmail = req.query.email;
    accountModel.singleByEmail(userEmail).then(rows => {
        if (rows.length > 0) {
            return res.json(false);
        }
        return res.json(true);
    })
});

router.get('/is-pseudonym-available', (req, res, next) => {
    var userPseudonym = req.query.pseudonym;
    accountModel.singleByPseudonym(userPseudonym).then(rows => {
        if (rows.length > 0) {
            return res.json(false);
        }
        return res.json(true);
    })
});

router.get('/login', (req, res) => {
    res.render('_nolayout/login', {
        layout: false
    });
});


router.get('/register', (req, res) => {
    res.render('_nolayout/register', {
        layout: false
    });
});

router.get('/forgotpassword', (req, res) => {
    res.render('_nolayout/forgotpassword', {
        layout: false
    });
});


router.post('/login', (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err)
        {
            console.log('error');
            return next(err);
        }
        if (!user) {
            console.log('false');
            return res.render('_noLayout/login', {
                layout: false,
                err_message: info.message
            })
        }

        req.logIn(user, err => {
            if (err)
            {
                return next(err);
            }

            console.log('success!');
            return res.redirect('/');
        });
    })(req, res, next);
})


router.post('/register', (req, res, next) => {
    var saltRounds = 10;
    var hash = bcrypt.hashSync(req.body.password, saltRounds);
    var dob = moment(req.body.dob, 'DD/MM/YYYY').format('YYYY-MM-DD');

    var entity = {
        acc_email: req.body.email,
        acc_hpw: hash,
        acc_fullname: req.body.fullname,
        acc_birthdate: req.body.email,
        f_DOB: dob,
        f_Permission: 0
    }

    userModel.add(entity).then(id => {
        res.redirect('/account/login');
    })
})

module.exports = router;