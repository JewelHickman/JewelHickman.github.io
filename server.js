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
//app.use('/features/jokelist', authenticate, express.static(path.join(__dirname, 'features/jokelist')));

function authenticate(req, res, next) {
    if (req.session && req.session.userID) {
        return next();
    }
    res.redirect('/login');
}

let sql = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "root",
    database: "blog_website"
});

app.get('/', function(req,res){
    res.sendFile(__dirname + 'index.html');
});

// render a user page
// TODO: if session user matches username, include ability to edit & delete & stuff
app.get('/users/:username', (req, res) => {
    sql.query(
        "SELECT posted AS `date`, title, body, postID FROM posts WHERE posts.userID = (SELECT userID FROM users WHERE users.username = " + mysql.escape(req.params.username) + " LIMIT 1) ORDER BY date DESC;",
        function(err, results, fields) {
            if (err) res.send("Page could not be found");
            res.json(results);
        }
    )
});

// render a specific post and its comments
// TODO: if session user matches username (or session user is admin), include ability to edit & delete & stuff
// TODO: add a form so users can make a comment on a post (this should be on the template I think)
app.get('/posts/:postnum', (req, res) => {
    sql.query(
        "SELECT DATE(posted) AS `date`, title, body FROM posts WHERE posts.postID = " + mysql.escape(req.params.postnum) + ";",
        function(err, results, fields) {
            if (err) res.send("Page could not be found");
            var post = results;
            sql.query(
                "SELECT posted AS `date`, username, body FROM comments JOIN users USING (userID) WHERE comments.postID = " + mysql.escape(req.params.postnum) + " ORDER BY DATE DESC;",
                function(err, results, fields) {
                    if (err) res.json({post});
                    else res.json({post, comments: results});
                }
            );
        }
    )
});

// this should be the form page for writing a new blog post
// TODO: authenticate
app.get('/post', (req, res) => {
    res.sendFile(__dirname + '//post.html');
});

// when user makes a post
// TODO: authenticate
app.post('/post', (req, res) => {
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
// TODO: authenticate
app.post('/delete-post', (req, res) => {
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
// TODO: authenticate
app.post('/comment', (req, res) => {
    const postID = req.query.postnum;
    if (!postID) res.status(500).send("No post");
    const body = req.body;

    sql.query(
        "INSERT INTO comments (userID, postID, body) VALUES (" + mysql.escape(req.session.userID) + ", " + mysql.escape(postID) + ", " + mysql.escape(body) + ");",
        function(err, results, fields) {
            if (err) res.status(500).send("Comment creation failed!");
            else res.status(200).send("Comment creation success!");
        }
    );
});

// when user deletes a comment
// TODO: authenticate
app.post('/delete-comment', (req, res) => {
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
    res.sendFile(__dirname + '//sign-up.html');
});

app.post('/sign-up', (req, res) => {
    const {user, pass} = req.body;
    sql.query(
        "INSERT INTO users (username, password) VALUES (" + mysql.escape(user) + ", " + mysql.escape(pass) + ");",
        function (err, results) {
            if (err) { res.status(500).send("Account creation failed!"); }
            else res.status(200).send("Account created!");
        }
    )
});

app.get('/login', (req, res) => {
    if (!req.session || !req.session.userID)
        res.sendFile(__dirname + '//login.html');
    else res.redirect('/');     // if the user is already logged in, we don't want them to be able to log in again
})

// logs a user in
app.post('/login', (req, res) => {
    if (req.session && req.session.userID) res.status(500).send("Already logged in!");  // if the user is already logged in, we don't want them to be able to log in again
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

app.post('logoff', (req, res) => {
    req.session.destroy((err) => {
        res.status(500);
    });
    res.status(200).send("Success");
});

app.listen(PORT, () => {
    console.log('Server running on port ' + PORT);
});