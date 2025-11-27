function signUp() {
    const userIn = document.getElementById("username").value;
    const passIn = document.getElementById("password").value;

    if (userIn === "" || passIn === "") {
        document.getElementById("result").innerText = "Cannot have empty fields!";
        return;
    }
    else if ((/\s/).test(userIn) || (/\s/).test(passIn)) {
        document.getElementById("result").innerText = "Fields cannot contain whitespace!";
        return;
    }

    var status;
    fetch('http://localhost:3000/sign-up', {
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
            document.getElementById("result").innerText = "Account creation successful!";
        }
        else {
            console.log("Failure");
            document.getElementById("result").innerText = "Account creation failed!";
        }
    })
    .catch((error) => {
        console.log("Error:",error);
        document.getElementById("result").innerText = "Account creation failed!";
        return;
    });
}

const btnEl = document.getElementById("btn");
btnEl.addEventListener("click", signUp);