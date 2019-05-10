// module imports
import express from 'express';
import bodyParser from 'body-parser';
import {config} from './config';
import {scanClass, addClass, sendEmailNotification} from './Utilities.js';
import nodemailer from 'nodemailer';
const app = express();

// localhost port
const port = 3000;
// Atlas cloud URL
const dbinfo = {
    name: config.getDBname(),
    url: config.getConnectionURL(),
    collection: config.getCollectionName()
};

// Setup Email configuration
const transporter = nodemailer.createTransport(config.getTransporter());
const mailOptions = {
    from: config.getDomain(),
    subject: 'ZotClass Alert!',
    text: 'Your Course is now Available!'
};

// configuration
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));

/*============= ROUTES  =============*/
// listen on '/'
app.get('/', function(req, res) {
    res.render('home');
});

// class search
app.post('/class', function(req, res) {
    const course_code = req.body.course_code;
    scanClass(course_code, res); // scans and loads 'class.ejs'
});

app.post('/class/new', function(req, res) {
    const user = {email: req.body.email, courseCode: req.body.code};
    addClass(user, dbinfo);
    res.redirect('/');
});

// setup app to listen for routes
app.listen(port, () => console.log(`listening on port: ${port}`));
