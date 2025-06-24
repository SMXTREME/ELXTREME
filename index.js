require('dotenv/config');
const path = require('path');
const redis = require('./redis');
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const cookieParser = require('cookie-parser');

const PORT = process.env?.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || false;

if (!MONGODB_URI) {
    throw Error('MONGODB_URI is a required environment variable');
}

const app = express();

(async () => {
    await mongoose.connect(MONGODB_URI).catch((e) => console.log(e));
    console.log('Connected to Database.');

    app.listen(PORT, () => console.log(`server running on Port ${PORT}`));
})();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
    session({
        store: MongoStore.create({ mongoUrl: MONGODB_URI }),
        secret: process.env.JWT_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: {
            maxAge: 1000 * 60 * 60 * 24, // 1 day
            httpOnly: false,
        },
    })
);

const { indexRouter } = require('./routes');
app.use('/', indexRouter);
