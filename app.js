const {PythonShell} = require('python-shell');
const express = require('express');
const app = express();
const port = 3000;

app.use(express.static('public'));
app.set('view engine', 'ejs');

// listen on '/'
app.get('/', function(req, res) {
    res.render('home.ejs');
});

// setup app to listen for routes
app.listen(port, () => console.log(`listening on port: ${port}`));

function scan_class(course_code) {
    PythonShell.run("scan_class.py", {args: [course_code]}, function(err, results) {
        if(err) throw err;
        console.log(`Results: ${results[1]}` );
    });
}
