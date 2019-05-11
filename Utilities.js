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
        res.set('course_code', [course_info.code]); // TODO: DO I needs this ?
        res.render('class', {course_info: course_info}); // load ejs file
    });
}

// add class code to database
export function addClass(user, dbinfo) {
    MongoClient.connect(dbinfo.url, {useNewUrlParser: true}, function(err, dbref) {
        if(err) throw err;
        // get db obj
        const db = dbref.db(dbinfo.name);
        // add to users collection
        updateUsersCollection(db, user, dbinfo.userCollection);
        // add to course codes collection
        updateCourseCodeCollection(db, user, dbinfo.courseCodeCollection);
        // close db
        dbref.close();
    });
}

// structure {email: 'myemail', courseCodes: []}
function updateUsersCollection(db, user, collectionName) {
    // check if user exist first
    const query = {email: user.email};
    // change to be made (unique course codes)
    const update = {$addToSet: {courseCodes: user.courseCode}};
    // add new document if it does not exist
    const options = { upsert: true };
    db.collection(collectionName).updateOne(query, update, options);
}

function updateCourseCodeCollection(db, user, collectionName) {
    const query = {courseCode: user.courseCode};
    const update = {$addToSet: {email: user.email}};
    const options = {upsert: true};
    db.collection(collectionName).updateOne(query, update, options);
}

// TODO test function
export function sendAlert(sender, transporter, collection) {
    // structure {courseCode: [email1, email2, emailN]}
    MongoClient.connect(dbinfo.url, {useNewUrlParser: true}, function(err, dbref) {
        if(err) console.log(err);

        dbref.db(dbinfo.name).collection(collection).find({}).toArray(function(err, result) {
            if(err) console.log(err);

            // not open so skip sending sendEmailNotification
            if(!isClassOpen(result))
            {
                dbref.close();
                return;
            }
            // for each course code in collection
            result.forEach(function(doc) {
                const recipients = doc.emails.join(', ');
                const mailOptions = {
                    from: sender,
                    to: recipients,
                    subject: `ZotClass Course Code: ${doc.courseCode}!`,
                    text: 'Your couse is now OPEN!'
                };
                sendEmailNotification(transporter, mailOptions);
            });
            dbref.close();
        });
    });
}

// TODO make function synchronous
function isClassOpen() {
    let isOpen = false;
    PythonShell.run("scan_class.py", {args: [course_code]}, function(err, results) {
        if(err) { // INVALID COURSE CODE
            console.log(err);
            return;
        }
        const data = results[0].replace(/[']/g, "\""); // remove '' from keys in object
        const course_info = JSON.parse(data);
        if(course_info.status === 'OPEN')
            isOpen = true;
    });
    return isOpen;
}

//  send email
export function sendEmailNotification(transporter, mailOptions) {
    transporter.sendMail(mailOptions, function(err, info) {
        if(err) console.log(`Email Failed to be Sent: ${err}`);
        else console.log(`sent: ${info}`);
    });
}
