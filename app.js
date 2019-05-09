// module imports
const {PythonShell} = require('python-shell');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoClient = require('mongodb').MongoClient;
const config = require('./config');
const nodemailer = require('nodemailer');

// localhost port
const port = 3000;
// Atlas cloud URL
const dbinfo = {
    name: config.getDBName(),
    url: config.getDBConnectionURL(),
    collection: config.getCollectionName()
}
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

/*========== Utility Functions ==========*/
// parse schedule of classes
function scanClass(course_code, res) {
    PythonShell.run("scan_class.py", {args: [course_code]}, function(err, results) {
        if(err) throw err;
        const data = results[0].replace(/[']/g, "\""); // remove '' from keys in object
        const course_info = JSON.parse(data);
        res.set('course_code', [course_info.code]);
        res.render('class', {course_info: course_info}); // load ejs file
    });
}

// add class code to database
function addClass(user, dbinfo) {
    mongoClient.connect(dbinfo.url, {useNewUrlParser: true}, function(err, dbref) {
        if(err) throw err;
        // get db obj
        const db = dbref.db(dbinfo.name);
        // check if user exist first
        const query = {email: user.email};
        // change to be made (unique course codes)
        const update = {$addToSet: {courseCodes: user.courseCode}};
        // add new document if it does not exist
        const options = { upsert: true };
        db.collection(dbinfo.collection).updateOne(query, update, options);
        dbref.close();
    });
}

//  send email
function sendEmailNotification(mailOptions) {
    transporter.sendMail(mailOptions, function(err, info) {
        if(err) console.log(`Email Failed to be Sent: ${err}`);
        else console.log(`sent: ${info}`);
    });
}
