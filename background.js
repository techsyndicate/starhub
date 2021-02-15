chrome.runtime.onMessage.addListener(function(message,sender,sendResponse){
    if (message.text == "auth") {
        chrome.storage.local.get(['accesstoken'], function(result) {
            if(result.accesstoken != null) {
                alert('already logged in')
            } else {
                chrome.storage.local.set({authState: true}, function() {
                    console.log('auth state set true');
                    window.open('https://starhub.ml/auth');
                });     
            }
        })     
    } 
    if (message.text == "logout") {
        const logoutBoolean = confirm("Are you sure you want to logout?")
        if(logoutBoolean) {
            chrome.storage.local.set({accesstoken: null, username: null}, function() {
                chrome.runtime.reload()
            });
        }
    } 
});

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.text == "getData") {
            chrome.storage.local.get(['accesstoken'], function(result) {
                const token = result.accesstoken
                if(token != null) {
                    chrome.storage.local.get(['username'], function(result) {
                        const username = result.username
                        chrome.storage.local.get(['repos'], function(result) {
                            if(result.repos != null) {
                                sendResponse({message: true, username: username, repos: result.repos});
                            } else {
                                const requestOptions = {
                                    method: 'GET',
                                    redirect: 'follow'
                                  };
                                
                                fetch(`https://starhub.ml/repos?token=${token}`, requestOptions)
                                    .then(async function(results) {
                                        const parsed = await results.json()
                                        if(parsed.message == "no repos found") {
                                            chrome.storage.local.set({repos: "no repos found"}, function() {
                                                sendResponse({message: true, username: username, repos: "no repos found"});
                                            });
                                        } else {
                                            chrome.storage.local.set({repos: parsed}, function() {
                                                sendResponse({message: true, username: username, repos: parsed});
                                            });
                                        }
                                    })
                                    .catch(error => sendResponse({message: "error"}));
                            }
                        })
                    })
                } else {
                   sendResponse({message: false}) 
                }
            }) 
        }
        return true;
    }
  );

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.text == "getRepos") {
            chrome.storage.local.get(['accesstoken'], function(result) {
                if(result.accesstoken != null) {
                    chrome.storage.local.get(['username'], function(result) {
                        const requestOptions = {
                            method: 'GET',
                            redirect: 'follow'
                          };
                        
                        fetch(`https://api.github.com/users/${result.username}/repos`, requestOptions)
                            .then(async function(results) {
                                const parsed = await results.json()
                                let options = []
                                for(let i = 0; i < parsed.length; i++) {
                                    options.push(parsed[i].name);
                                }
                                sendResponse({message: options})
                            })
                            .catch(error => sendResponse({message: "error"}));
                    })
                } else {
                   sendResponse({message: "error"}) 
                }
            }) 
        }
        return true;
    }
  );

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.text == "addRepoWebhook") {
            const repoName = request.repoName
            chrome.storage.local.get(['accesstoken'], function(result) {
                if(result.accesstoken != null) {
                    const accesstoken = result.accesstoken
                    chrome.storage.local.get(['username'], function(result) {
                        const username = result.username
                        const repoOwner = username
                        const requestOptions = {
                            method: 'GET',
                            redirect: 'follow'
                            };
                        
                        fetch(`https://starhub.ml/webhook?repository=${repoName}&user=${username}&token=${accesstoken}&repoOwner=${repoOwner}`, requestOptions)
                            .then(async function(result) {
                                const parsed = await result.json()
                                if(parsed.message == "repo already exists") {
                                    sendResponse({message: "repo is already being tracked", type: "negative"})
                                } else {
                                    if(parsed.message == "error") {
                                        sendResponse({message: "an error occurred", type: "negative"})
                                    } else {
                                        sendResponse({message: "repo added", type: "positive"})
                                    }
                                }
                            })
                            .catch(error => sendResponse({message: "error", type: "negative"}));
                    })
                } else {
                    sendResponse({message: "error", type: "negative"}) 
                }
            }) 
        }
        return true;
    }
);

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.text == "addOrgRepoButton") { 
            const orgRepoName = prompt("Enter organization repository name (<orgName>/<repoName>)", "<orgName>/<repoName>")
            if(orgRepoName != null) {
                if(!orgRepoName.includes("/")) {
                    alert("invalid format")
                } else {
                    const repoName = orgRepoName.split("/")[1]
                    const repoOwner = orgRepoName.split("/")[0]
                    chrome.storage.local.get(['accesstoken'], function(result) {
                        if(result.accesstoken != null) {
                            const accesstoken = result.accesstoken
                            chrome.storage.local.get(['username'], function(result) {
                                const username = result.username
                                const requestOptions = {
                                    method: 'GET',
                                    redirect: 'follow'
                                    };
                                
                                fetch(`https://starhub.ml/webhook?repository=${repoName}&user=${username}&token=${accesstoken}&repoOwner=${repoOwner}`, requestOptions)
                                    .then(async function(result) {
                                        const parsed = await result.json()
                                        if(parsed.message == "repo already exists") {
                                            sendResponse({message: "repo is already being tracked", type: "negative"})
                                        } else {
                                            if(parsed.message == "error") {
                                                sendResponse({message: "an error occurred", type: "negative"})
                                            } else {
                                                sendResponse({message: "repo added", type: "positive"})
                                            }
                                        }
                                    })
                                    .catch(error => sendResponse({message: "error", type: "negative"}));
                            })
                        } else {
                            sendResponse({message: "error", type: "negative"}) 
                        }
                    }) 
                }
            }
        } 
    } 
);

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.text == "updateCache") {
            chrome.storage.local.get(['accesstoken'], function(result) {
                const token = result.accesstoken
                if(token != null) {
                    const requestOptions = {
                        method: 'GET',
                        redirect: 'follow'
                      };
                    
                    fetch(`https://starhub.ml/repos?token=${token}`, requestOptions)
                        .then(async function(results) {
                            const parsed = await results.json()
                            if(parsed.message == "no repos found") {
                                chrome.storage.local.set({repos: "no repos found"}, function() {
                                    sendResponse({message: "updated"});
                                });
                            } else {
                                chrome.storage.local.set({repos: parsed}, function() {
                                    sendResponse({message: "updated"});
                                });
                            }
                        })
                        .catch(error => sendResponse({message: "error"}));
                } else {
                   sendResponse({message: "error"}) 
                }
            }) 
        }
    }
)

async function auth() {
    chrome.tabs.query({'active': true, 'windowId': chrome.windows.WINDOW_ID_CURRENT},
        function(tabs){
            if(tabs[0].url.startsWith("http://localhost:15015/callback")) {
                chrome.storage.local.get(['authState'], function(result) {
                    chrome.storage.local.set({authState: false}, function() {
                        console.log('auth state set false')
                    }) 
                    if (result.authState == true) {
                        const split = tabs[0].url.split('/')
                        const accesstoken = split[4]
                        const username = split[5]
                        const userId = split[6]
                        chrome.storage.local.set({accesstoken: accesstoken, username: username, userId: userId}, function() {
                            console.log('user state set');
                        }); 
                        chrome.tabs.update({url: "http://starhub.ml/auth/success"});
                    }
                });   
            }
        }   
    );
} 

chrome.tabs.onUpdated.addListener(auth)
