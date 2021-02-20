document.addEventListener("click", function (e) {
    if (e.target.id == "authButton") {
        chrome.runtime.sendMessage({text: "auth"});
    }
    if(e.target.id == "logoutButton") {
        chrome.runtime.sendMessage({text: "logout"})
    }
    if(e.target.id == "aboutButton") {
        window.open("https://starhub.ml")
    }
    if(e.target.id == "deleteButton") {
        chrome.runtime.sendMessage({text: "delete"}, function(response) {
            if(response.message == "deleted") {
                chrome.runtime.sendMessage({text: "updateCache"}, function(response) {
                    location.reload(); 
                })
            } 
        })
    }
    if(e.target.id == "refreshButton") {
        chrome.runtime.sendMessage({text: "updateCache"}, function(response) {
            location.reload(); 
        })
    }
    if(e.target.id == "addRepoButton") {
        document.getElementById("repos").style.display = "none";
        document.getElementById("message").style.display = "block";
        chrome.runtime.sendMessage({text: "getRepos"}, function(response) {
            if(response.message == "error") {
                document.getElementById("message").innerHTML = "an error occurred";
            } else {
                const options = response.message
                const repoSelector = document.getElementById("repoSelector")
                for(let i=0; i < options.length;i++) {
                    const option = '<option value="' + options[i] + '">' + options[i] + '</option>'
                    repoSelector.innerHTML = repoSelector.innerHTML + option
                }
                document.getElementById("message").style.display = "none";
                document.getElementById("addRepo").style.display = "block";
            }
        })
    }
    if(e.target.id == "addRepoAfterSelectButton") {
        const e = document.getElementById("repoSelector");
        const repoName = e.options[e.selectedIndex].value;
        chrome.runtime.sendMessage({text: "addRepoWebhook", repoName: repoName}, function(response) {
            document.getElementById("addRepo").style.display = "none";
            document.getElementById("message").style.display = "block";
            if(response.type == "negative") {                
                document.getElementById("message").innerHTML = response.message;
            } else {
                chrome.runtime.sendMessage({text: "updateCache"}, function(response) {
                    location.reload(); 
                })
            }
        })
    }
    if(e.target.id == "addOrgRepoButton") {
        chrome.runtime.sendMessage({text: "addOrgRepoButton"}, function(response) {
            document.getElementById("addRepo").style.display = "none";
            document.getElementById("message").style.display = "block";
            if(response.type == "negative") {                
                document.getElementById("message").innerHTML = response.message;
            } else {
                chrome.runtime.sendMessage({text: "updateCache"}, function(response) {
                    location.reload(); 
                })
            }
        })
    }
});

document.addEventListener('DOMContentLoaded', function () {
    chrome.runtime.sendMessage({text: "getData"}, function(response) {
        if(response.message == false) {
            document.getElementById("authButton").style.display = "block";
        } else {
            if(response.repos == "no repos found") {
                document.getElementById("repos-list-error").style.display = "block";
                document.getElementById("repos-table").style.display = "none";
            } else {
               const repos = response.repos
               for(let i = 0; i < repos.length; i++) {
                   document.getElementById("repos-table").innerHTML = document.getElementById("repos-table").innerHTML + `<tr><td><a href="https://github.com/${repos[i].repoName}" target="_blank" id="repo-hyperlink">${repos[i].repoName}</a></td><td style="text-align: center"><i style="color: red" class="fa fa-minus-circle fa-lg" aria-hidden="true" id="deleteButton"></i></td></tr>`
                }
            }
            document.getElementById("username").innerHTML = response.username;
            document.getElementById("pfp").src = "https://github.com/"+response.username+".png";
            document.getElementById("username").style.display = "block";
            document.getElementById("pfp").style.display = "block";
            document.getElementById("repos").style.display = "block";
            document.getElementById("logoutButton").style.display = "block";
            document.getElementById("aboutButton").style.display = "block";
        }
    })
});