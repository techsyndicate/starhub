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
        chrome.storage.local.set({accesstoken: null, username: null}, function() {
            chrome.runtime.reload()
        });
    } 
});

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.text == "getData") {
            chrome.storage.local.get(['accesstoken'], function(result) {
                if(result.accesstoken != null) {
                    chrome.storage.local.get(['username'], function(result) {
                        sendResponse({message: result.username});
                    })
                } else {
                   sendResponse({message: false}) 
                }
            }) 
        }
        return true;
    }
  );

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
