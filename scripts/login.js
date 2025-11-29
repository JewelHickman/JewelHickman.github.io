function logIn() {
    const userIn = document.getElementById("username").value;
    const passIn = document.getElementById("password").value;

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

            window.location.replace("http://localhost:3000/users/" + userIn);   // redirect to userpage
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
if (loginbtnEl) loginbtnEl.addEventListener("click", logIn);
const logoffbtnEl = document.getElementById("logoffBtn");
if (logoffbtnEl) logoffbtnEl.addEventListener("click", logOff);