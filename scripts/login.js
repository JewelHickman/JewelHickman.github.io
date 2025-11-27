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
            document.getElementById("result").innerText = "Success!";

            window.location.replace("http://localhost:3000/users/" + userIn);   // redirect to userpage
        }
        else {
            console.log("Failure");
            document.getElementById("result").innerText = "Login failed!";
        }
    })
    .catch((error) => {
        console.log("Error:",error);
        document.getElementById("result").innerText = "Login failed!";
        return;
    });
}

const btnEl = document.getElementById("btn");
btnEl.addEventListener("click", logIn);