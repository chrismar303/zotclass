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
app.post('/search', function(req, res) {
    const course_code = req.body.course_code
    scan_class(course_code);
    res.render('result');
});

// TODO: '/addclass' route

// setup app to listen for routes
app.listen(port, () => console.log(`listening on port: ${port}`));

// parse schedule of classes
function scan_class(course_code) {
    PythonShell.run("scan_class.py", {args: [course_code]}, function(err, results) {
        if(err) throw err;
        console.log(`Results: ${results[1]}` );
    });
}
