const {PythonShell} = require('python-shell');

PythonShell.run("scan_class.py", {args: [34130]}, function(err, results) {
    if(err) throw err;
    console.log(`Results: ${results[1]}` );
});
