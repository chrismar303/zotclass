/*========== Utility Functions ==========*/
import {PythonShell} from 'python-shell';
import {MongoClient} from 'mongodb';

// parse schedule of classes
export function scanClass(course_code, res) {
    PythonShell.run("scan_class.py", {args: [course_code]}, function(err, results) {
        if(err) { // INVALID COURSE CODE
            console.log(err);
            res.redirect('/');
            return;
        }
        const data = results[0].replace(/[']/g, "\""); // remove '' from keys in object
        const course_info = JSON.parse(data);
        res.set('course_code', [course_info.code]);
        res.render('class', {course_info: course_info}); // load ejs file
    });
}

// add class code to database
export function addClass(user, dbinfo) {
    MongoClient.connect(dbinfo.url, {useNewUrlParser: true}, function(err, dbref) {
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
export function sendEmailNotification(mailOptions) {
    transporter.sendMail(mailOptions, function(err, info) {
        if(err) console.log(`Email Failed to be Sent: ${err}`);
        else console.log(`sent: ${info}`);
    });
}
