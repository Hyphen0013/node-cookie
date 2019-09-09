const express = require('express');
const router = express.Router();


// require('./users');

router.get('/', (req, res) => {
    console.log(req.user);
    console.log(req.isAuthenticated());

    res.render('layouts/welcome', {
        title: 'Welcome Page'
    });
});


module.exports = router;