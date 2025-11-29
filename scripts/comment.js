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

function editComment() {
    const bodyIn = document.getElementById("comment-body").value;
    const commentnum = parseInt(document.getElementById("commentnum").value);

    if (bodyIn === "") {
        document.getElementById("result").innerText = "Cannot have empty fields!";
        return;
    }

    var status;
    fetch('http://localhost:3000/edit-comment', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json' 
        },
        body: JSON.stringify({
            body: bodyIn,
            commentID: commentnum
        })
    })
    .then(response => {
        status = response.status;
    })
    .then(data => {
        if (status == 200) {
            console.log("Success:",data);
            window.location.href = "http://localhost:3000/posts/" + document.getElementById("postnum").value;    // send us back to the original post
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

const commentBtnEl = document.getElementById("commentBtn");
if (commentBtnEl != null) commentBtnEl.addEventListener("click", comment);
const editCommentBtnEl = document.getElementById("editCommentBtn");
if (editCommentBtnEl != null) editCommentBtnEl.addEventListener("click", editComment);