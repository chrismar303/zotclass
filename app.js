const {PythonShell} = require('python-shell');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const port = 3000;

app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));

// listen on '/'
app.get('/', function(req, res) {
    res.render('home');
});

// class search
app.post('/course_info', function(req, res) {
    const course_code = req.body.course_code
    scan_class(course_code,res); // scans and loads 'result.ejs'
});

// TODO: '/addclass' route
app.post('/addclass', function(req, res) {

});

// setup app to listen for routes
app.listen(port, () => console.log(`listening on port: ${port}`));

// parse schedule of classes
function scan_class(course_code, res) {
    PythonShell.run("scan_class.py", {args: [course_code]}, function(err, results) {
        if(err) throw err;
        const data = results[0].replace(/[']/g, "\""); // remove '' from keys in object
        const course_info = JSON.parse(data);
        res.render('course_info.ejs', {course_info: course_info}); // load ejs file
    });
}
