function logInHeader() {
    const userIn = document.getElementById("username-h").value;
    const passIn = document.getElementById("password-h").value;
    logIn(userIn, passIn);
}

function logInMain() {
    const userIn = document.getElementById("username").value;
    const passIn = document.getElementById("password").value;
    logIn(userIn, passIn);
}

function logIn(userIn, passIn) {
    var status;
    fetch('http://localhost:3000/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json' 
        },
        body: JSON.stringify({
            user: userIn,
            pass: passIn
        })
    })
    .then(response => {
        status = response.status;
    })
    .then(data => {
        if (status == 200) {
            console.log("Success:",data);

            window.location.href = window.location.href;    // refresh page: this will send us to either the user page or return us to current page
        }
        else {
            console.log("Failure");
        }
    })
    .catch((error) => {
        console.log("Error:",error);
        return;
    });
}

function logOff() {
    var status;
    fetch('http://localhost:3000/logoff', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({

        })
    })
    .then(response => {
        status = response.status;
    })
    .then(data => {
        if (status == 200) {
            console.log("Success:",data);
            window.location.href = window.location.href; // refresh page in case of redirects
        }
        else {
            console.log("Failure");
        }
    })
    .catch((error) => {
        console.log("Error:",error);
        return;
    });
}

const loginbtnEl = document.getElementById("loginBtn");
if (loginbtnEl) loginbtnEl.addEventListener("click", logInMain);
const loginbtnElHeader = document.getElementById("loginHeaderBtn");
if (loginbtnElHeader) loginbtnElHeader.addEventListener("click", logInHeader);
const logoffbtnEl = document.getElementById("logoffBtn");
if (logoffbtnEl) logoffbtnEl.addEventListener("click", logOff);