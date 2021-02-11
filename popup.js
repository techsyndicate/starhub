document.addEventListener("click", function (e) {
    if (e.target.id == "authButton") {
        chrome.runtime.sendMessage({text: "auth"});
    }
    if(e.target.id == "logoutButton") {
        chrome.runtime.sendMessage({text: "logout"})
    }
});

document.addEventListener('DOMContentLoaded', function () {
    chrome.runtime.sendMessage({text: "getData"}, function(response) {
        if(response.message == false) {
            document.getElementById("authButton").style.display = "block";
        } else {
            document.getElementById("username").innerHTML = 'username: ' + response.message;
            document.getElementById("username").style.display = "block";
            document.getElementById("logoutButton").style.display = "block";
        }
    })
});
