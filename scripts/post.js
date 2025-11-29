function post() {
    const titleIn = document.getElementById("title").value;
    const bodyIn = document.getElementById("body").value;

    if (titleIn === "" || bodyIn === "") {
        document.getElementById("result").innerText = "Cannot have empty fields!";
        return;
    }

    var status;
    fetch('http://localhost:3000/post', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json' 
        },
        body: JSON.stringify({
            title: titleIn,
            body: bodyIn
        })
    })
    .then(response => {
        status = response.status;
    })
    .then(data => {
        if (status == 200) {
            console.log("Success:",data);
            document.getElementById("result").innerText = "Post creation successful!";
        }
        else {
            console.log("Failure");
            document.getElementById("result").innerText = "Post creation failed!";
        }
    })
    .catch((error) => {
        console.log("Error:",error);
        document.getElementById("result").innerText = "Post creation failed!";
        return;
    });
}

const btnEl = document.getElementById("btn");
btnEl.addEventListener("click", post);