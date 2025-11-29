const deletePostBtnEl = document.getElementById("deletePostBtn");
if (deletePostBtnEl != null) deletePostBtnEl.addEventListener("click", deletePost);
const postBtnEl = document.getElementById("postBtn");
if (postBtnEl != null) postBtnEl.addEventListener("click", post);
const editPostBtnEl = document.getElementById("editPostBtn");
if (editPostBtnEl != null) editPostBtnEl.addEventListener("click", editPost);

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
        return response.json();
    })
    .then(data => {
        if (status == 200) {
            console.log("Success:",data);
            window.location.href = "http://localhost:3000/posts/" + data;
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

function deletePost() {
    const postnum = parseInt(document.getElementById("postnum").value);

    var status;
    fetch('http://localhost:3000/delete-post', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            postID: postnum
        })
    })
    .then(response => {
        status = response.status;
        return response.json();
    })
    .then(data => {
        if (status == 200) {
            console.log("Success",data);
            window.location.href = "http://localhost:3000/users/" + document.getElementById("username").value;
        }
        else
            console.log("Failure")
    })
    .catch((error) => {
        console.log("Error",error);
        return;
    });
}

function editPost() {
    const postnum = parseInt(document.getElementById("postnum").value);
    const titleIn = document.getElementById("title").value;
    const bodyIn = document.getElementById("body").value;

    var status;
    fetch('http://localhost:3000/edit-post', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            title: titleIn,
            body: bodyIn,
            postID: postnum
        })
    })
    .then(response => {
        status = response.status;
    })
    .then(data => {
        if (status == 200) {
            console.log("Success", data);
            window.location.href = "http://localhost:3000/posts/" + postnum;
        }
        else
            console.log("Failure");
    })
    .catch((error) => {
        console.log("Error",error);
        return;
    })
}