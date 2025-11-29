function comment() {
    const bodyIn = document.getElementById("comment-body").value;
    const postnum = document.getElementById("postnum").value;

    if (bodyIn === "") {
        document.getElementById("result").innerText = "Cannot have empty fields!";
        return;
    }

    var status;
    fetch('http://localhost:3000/comment', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json' 
        },
        body: JSON.stringify({
            body: bodyIn,
            postID: postnum
        })
    })
    .then(response => {
        status = response.status;
    })
    .then(data => {
        if (status == 200) {
            console.log("Success:",data);
            window.location.href = window.location.href;    // refresh the page
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

const btnEl = document.getElementById("commentBtn");
btnEl.addEventListener("click", comment);