const fileUpload = require('express-fileupload');
const express = require('express');
const mysql = require('mysql');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const session = require('express-session');
const bcrypt = require('bcrypt');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const MySQLStore = require('express-mysql-session')(session);
const flash = require('connect-flash');

const app = express();
const keys = require('./config/keys');
const options = require('./config/db')


// Database connection
const db = mysql.createConnection(options)
const sessionStore = new MySQLStore({}, db);
global.db = db;


// Configure middleware
app.use(express.static('./public'));

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');


// body-parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
// app.use(fileUpload());


app.use(session({
    secret: 'hyphen',
    resave: false,
    store: sessionStore,
    saveUninitialized: true
    // cookie: { secure: false }
}));
app.use(passport.initialize());
app.use(passport.session());

// Connect flash
app.use(flash());

// Global Vairables
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    next();
});


passport.use(new LocalStrategy({ usernameField: 'username' }, (username, password, done) => {
    // Match user
    const queryPass = 'SELECT id, password FROM users WHERE username = ?';
    console.log(id)
    db.query(queryPass, [username], (err, result, fields) => {
        console.log('LocalAuth: ' + result[0])
        if (err) done (err)

        console.log(result);

        if (result.length === 0) {
            done(null, false)
        } else {

            const hash = result[0].password.toString();
            bcrypt.compare(password, hash, (err, response) => {

                if (response === true) {
                    return done(null, ({ user_id: result[0].id }))
                } else {
                    return done(null, false)
                }
            });
        }
    });
}));

// Routes
app.use('/', require('./routes/index'));
app.use('/user', require('./routes/users'));



app.listen(keys.PORT, (err) => {
    console.log(`Server is running on PORT: ${keys.PORT}`);
})

