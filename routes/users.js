const express = require('express');
const bcrypt = require('bcrypt');
const passport = require('passport');
const bodyParser = require('body-parser');
const session = require('express-session');
const LocalStrategy = require('passport-local').Strategy;

const router = express.Router();

// Registration page
router.get('/registration', (req, res, next) => {

    res.render('layouts/registration', {
        title: 'Registration Page'
    });
});

router.post('/registration', (req, res, next) => {

    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;
    const confirmpass = req.body.confirmpass;

    const errors = [];
    const illegalChars = /^\w+$/; // allow letters, numbers, and underscores
    const emailValid = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
    const phoneNum = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;

    if (!username || !email || !password) {
        errors.push({ msg: 'Pleaser fill all require fields' });
    }

    if (username.length < 5 || username.length > 15) {
        errors.push({ msg: 'username in between 5 to 15 characters only' })
    }

    if (!illegalChars.test(username)) {
        errors.push({ msg: 'username must be alphanumeric and underscore' })
    }

    if (!emailValid.test(email)) {
        errors.push({ msg: 'Not a valid email' })
    }

    if (password != confirmpass) {
        errors.push({ msg: 'Password not matched!' })
    }

    if (password.length < 5 || password.length > 15) {
        errors.push({ msg: 'Password in between 5 to 15 characters. ' })
    }

    // if (!phoneNum.test(phone)) {
    //     errors.push({ msg: "Entere correct contact number." })
    // }

    if (errors.length > 0) {
        res.render('layouts/registration', {
            title: '',
            errors
        });
    } else {

        const usernameQuery = "SELECT * FROM users WHERE username = '" + username + "'";

        bcrypt.hash(password, 10, (err, hash) => {

            db.query(usernameQuery, (err, results, fields) => {
                if (err) { return res.status(500).send(err); }

                if (results.length > 0) {
                    errors.push({ msg: 'user already exists' });
                    res.render('layouts/registration', {
                        title: '',
                        errors
                    });
                } else {
                    const insertUser = "INSERT INTO users (username, email, password) VALUES (?, ?, ?)";
                    db.query(insertUser, [username, email, hash], (err, results, fields) => {
                        if (err) throw err;

                        db.query("SELECT LAST_INSERT_ID() as user_id", (err, results, fields) => {
                            if (err) throw err;

                            console.log(results[0]);
                            const user_id = results[0];

                            req.login(user_id, (err) => {
                                req.flash('success_msg', 'You can login')
                                res.redirect('/user/login');
                            });
                        });
                    });
                }
            })
        });
    }
});

router.get('/login', (req, res, next) => {
    res.render('layouts/login', {
        title: 'Login Page'
    })
});

router.post('/login', passport.authenticate('local', {
    successRedirect: '/user/profile',
    failureRedirect: '/user/login'
}));

router.get('/profile', authenticationMiddleware(), (req, res, next) => {
    res.render('pages/profile', {
        title: 'User profile'
    });
});




passport.serializeUser(function (user_id, done) {
    done(null, user_id);
});

passport.deserializeUser(function (user_id, done) {
    done(null, user_id);
});

function authenticationMiddleware() {
    return (req, res, next) => {
        console.log(`req.session.passport.user: ${JSON.stringify(req.session.passport)}`);

        if (req.isAuthenticated()) return next();
        res.redirect('/login');
    }
};

module.exports = router;
