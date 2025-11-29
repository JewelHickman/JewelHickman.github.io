const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express().use(express.static(__dirname + "//"));
const PORT = 3000;
const mysql = require('mysql2');

// Middleware
app.use(bodyParser.json());
app.use(cors());
app.use(session({
  secret: 'your_secret_key',
  resave: true,
  saveUninitialized: true,
  cookie: { secure: false },
  saveUninitialized: true,
  cookie: { maxAge: 1800000 }
}));
app.set('view engine', 'ejs');
app.set('views', __dirname + '/templates');

// authenticates a user to see if they're logged in
function authenticate(req) {
    if (req.session && req.session.userID)
        return true;
    return false;
}

function getSessionData(req) {
    if (authenticate(req))
        return JSON.parse(JSON.stringify(({ sessionUser: req.session.username, sessionID: req.session.userID, sessionPriv: req.session.privilegeLevel })));
    else
        return JSON.parse(JSON.stringify({ sessionUser: "guest", sessionID: -1, sessionPriv: "Guest" }));
}

let sql = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "root",
    database: "blog_website"
});

// not working? redirect?
app.get('/', function(req,res){
    res.status(200).render('index', {
        title: "My website",
        style: "",
        sessionData: getSessionData(req)
    });
});

app.get('/userlist', function(req,res){
    sql.query(
        "SELECT username FROM users;",
        function(err, results, fields) {
            if (err) res.status(500).send("Error occurred");
            else res.status(200).render('userlist', {
                title: "Userlist",
                style: "",
                userList: results,
                sessionData: getSessionData(req)
            });
        }
    );
});

// render a user page
// TODO: if session user matches user page, include ability to edit & delete & stuff
app.get('/users/:username', (req, res) => {
    sql.query(
        "SELECT * FROM users WHERE username = " + mysql.escape(req.params.username) + ";",
        function(err, results, fields) {
            if (err || results.length == 0) res.send("Page could not be found");
            var user = results[0];
            sql.query(
                "SELECT posted AS `date`, title, body, posts.userID, postID FROM posts WHERE posts.userID = (SELECT userID FROM users WHERE users.username = " + mysql.escape(req.params.username) + " LIMIT 1) ORDER BY date DESC;",
                function(err, results, fields) {
                    if (err) res.send("Page could not be found");
                    else res.status(200).render('userpage', {
                        title: user.username + "'s Page",
                        style: "",  // TODO: users might be able to choose a stylesheet to work from
                        userData: user,
                        posts: results,
                        sessionData: getSessionData(req)
                    });
                }   
            )
        }
    );

});

// render a specific post and its comments
// TODO: if session user matches username (or session user is admin), include ability to edit & delete & stuff
// TODO: add a form so users can make a comment on a post (this should be on the template I think)
app.get('/posts/:postnum', (req, res) => {
    sql.query(
        "SELECT DATE(posted) AS `date`, title, body, userID, postID FROM posts WHERE posts.postID = " + mysql.escape(req.params.postnum) + ";",
        function(err, results, fields) {
            if (err || results.length == 0) res.send("Page could not be found");
            var post = results[0];
            sql.query(
                "SELECT posted AS `date`, username, body, comments.userID FROM comments JOIN users USING (userID) WHERE comments.postID = " + mysql.escape(req.params.postnum) + " ORDER BY DATE ASC;",
                function(err, results, fields) {
                    if (err) res.status(500).send(err);
                    else res.status(200).render('post', {
                        title: post.title,
                        style: "",
                        post,
                        comments: results,
                        sessionData: getSessionData(req)
                    })
                }
            );
        }
    )
});

// this should be the form page for writing a new blog post
app.get('/post', (req, res) => {
    if (authenticate(req)) {
        res.render('makepost', {
            title: "Make a Post",
            style: "",
            sessionData: getSessionData(req)
        });
    }
    else res.redirect('/login');
});

// when user makes a post
app.post('/post', (req, res) => {
    if (!authenticate(req)) res.status(500).send("Not logged in!");

    const {title, body} = req.body;
    sql.query(
        "INSERT INTO posts (userID, title, body) VALUES (" + mysql.escape(req.session.userID) + ", " + mysql.escape(title) + ", " + mysql.escape(body) + ");",
        function(err, results, fields) {
            if (err) res.status(500).send("Post creation failed!");
            else res.status(200).send("Post creation success!");
        }
    );
});

// when user deletes a post
app.post('/delete-post', (req, res) => {
    if (!authenticate(req)) res.status(500).send("Not logged in!");

    // TODO: replace query with body
    const postID = req.query.postnum;
    if (!postID) res.status(500).send("No post");
    sql.query(
        "CALL deletePost = (" + mysql.escape(postID) + ", " + mysql.escape(req.session.userID) + ");",
        function(err, results, fields) {
            if (err) res.status(500).send("Post deletion failed!");
            else res.status(200).send("Post deletion success!");
        }
    );
});

// when user comments on a post
app.post('/comment', (req, res) => {
    if (!authenticate(req)) res.status(500).send("Not logged in!");

    const {body, postID} = req.body;
    if (!postID) res.status(500).send("No post");

    sql.query(
        "INSERT INTO comments (userID, postID, body) VALUES (" + mysql.escape(req.session.userID) + ", " + mysql.escape(postID) + ", " + mysql.escape(body) + ");",
        function(err, results, fields) {
            if (err) throw err; //res.status(500).send("Comment creation failed!");
            else res.status(200).send("Comment creation success!");
        }
    );
});

// when user deletes a comment
// TODO: authenticate
app.post('/delete-comment', (req, res) => {
    if (!authenticate(req)) res.status(500).send("Not logged in!");

    const commentID = req.query.commentnum;
    if (!commentID) res.status(500).send("No comment");

    sql.query(
        "CALL deleteComment = (" + mysql.escape(commentID) + ", " + mysql.escape(req.session.userID) + ");",
        function(err, results, fields) {
            if (err) res.status(500).send("Comment deletion failed!");
            else res.status(200).send("Comment deletion success!");
        }
    );
});

app.get('/sign-up', (req, res) => {
    if (!authenticate(req)) {
        res.render('sign-up', {
            title: "Sign Up",
            style: "",
            sessionData: getSessionData(req)
        });
    }
    else res.redirect('/');
});

app.post('/sign-up', (req, res) => {
    if (authenticate(req)) res.status(500).send("Already logged in!");

    const {user, pass} = req.body;
    sql.query(
        "INSERT INTO users (username, password) VALUES (" + mysql.escape(user) + ", " + mysql.escape(pass) + ");",
        function (err, results) {
            if (err) { res.status(500).send("Account creation failed!"); }
            else res.status(200).send("Account created!");
        }
    )
});

// since we've added it to the header, can probably just get rid of the log in page... maybe
app.get('/login', (req, res) => {
    if (!authenticate(req)) {
        res.render('login', {
            title: "Log In",
            style: "",
            sessionData: getSessionData(req)
        });
    }
    else res.redirect('/');     // if the user is already logged in, we don't want them to be able to log in again
})

// logs a user in
app.post('/login', (req, res) => {
    if (authenticate(req)) res.status(500).send("Already logged in!");  // if the user is already logged in, we don't want them to be able to log in again

    const {user, pass} = req.body;
    sql.query(
        "SELECT * FROM users WHERE " + mysql.escape(user) + " = username AND " + mysql.escape(pass) + " = password LIMIT 1;",
        function(err, results) {
            if (err) { res.status(500).send("Login failed"); }
            else if (results.length == 1) {
                req.session.userID = results[0].userID;
                req.session.username = results[0].username;
                req.session.privilegeLevel = results[0].privilege;
                return res.status(200).json({
                    message: "Success",
                    user: {
                        userID : results[0].userID,
                        username : results[0].username,
                        privilegeLevel : results[0].privilege
                    }
                })
            }
            else res.status(500).send("Login failed");
        }
    )
});

app.post('/logoff', (req, res) => {
    req.session.destroy((err) => {
        res.status(200).send("Success");
    });
});

app.listen(PORT, () => {
    console.log('Server running on port ' + PORT);
});