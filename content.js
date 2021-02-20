const current_url = location.href
const splitted_url = current_url.split('https://github.com/')
const repo_name = splitted_url[1]

function parseISOString(s) {
  var b = s.split(/\D+/);
  return new Date(Date.UTC(b[0], --b[1], b[2], b[3], b[4], b[5], b[6]));
}

if(repo_name.split('/').length < 3) {
    chrome.runtime.sendMessage({text: "getUpdatedData"}, function(response) {
      if(response.message == "repos found") {
        const repos = response.repos
        let show_icon = false
        let unstar_count = 0
        for(let i = 0; i < repos.length; i++) {
          if(repos[i].repoName == repo_name) {
            show_icon = true
            unstar_count = repos[i].unstars.length
          }
        }
        if(show_icon == true) {
          const stargazers_url = "https://github.com/" + repo_name + "/stargazers"
          let iconBar = document.getElementsByClassName("pagehead-actions")[0]
          iconBar.innerHTML = iconBar.innerHTML + `<li>
          <div class="d-block js-toggler-container js-social-container starring-container ">
              <button type="button" class="btn btn-sm btn-with-count">
                  <span>Unstars</span>
              </button>
              <a class="social-count js-social-count" href="${stargazers_url}">${unstar_count}</a> 
          </div>
          </li>`
        }
      }
    })
} else {
    chrome.runtime.sendMessage({text: "getUpdatedData"}, function(response) {
      if(response.message == "repos found") {
        const repos = response.repos
        let show_icon = false
        let unstar_count = 0
        let unstars = []
        for(let i = 0; i < repos.length; i++) {
          if(`${repos[i].repoName}/stargazers` == repo_name) {
            show_icon = true
            unstar_count = repos[i].unstars.length
            unstars = repos[i].unstars
          }
        }
        if(show_icon == true) {
          const repos_div = document.getElementById("repo-content-pjax-container")
          console.log(repos_div);
          let intial_html = `<div id="repos">
                                <h2>Unstargazers</h2>
                                <div class="tabnav">
                                <nav class="tabnav-tabs" aria-label="Stargazers">
                                  <a class="js-selected-navigation-item selected tabnav-tab" aria-current="page" data-selected-links="stargazers_main /${repo_name}" href="/${repo_name}">
                                  All <span class="Counter ">${unstar_count}</span>
                                </a>    
                                </nav></div>
                                
                                  <ol class="follow-list clearfix">`
          for(let i = 0; i < unstars.length; i++) {
            const d = new Date(unstars[i].unstarredAt);
            const ye = new Intl.DateTimeFormat('en', { year: 'numeric' }).format(d);
            const mo = new Intl.DateTimeFormat('en', { month: 'short' }).format(d);
            const da = new Intl.DateTimeFormat('en', { day: '2-digit' }).format(d);
            intial_html += `<li class="follow-list-item float-left border-bottom">
            <div class="follower-list-align-top d-inline-block position-relative" style="height: 75px">
          
              <a class="d-inline-block" data-hovercard-type="user" data-hovercard-url="/users/${unstars[i].userName}/hovercard" data-octo-click="hovercard-link-click" data-octo-dimensions="link_type:self" href="/${unstars[i].userName}"><img class="avatar avatar-user" height="75" width="75" alt="@${unstars[i].userName}" src="https://github.com/${unstars[i].userName}.png"></a>
            </div>
          
            <div class="follower-list-align-top d-inline-block ml-3">
              <h3 class="follow-list-name"><span class="css-truncate css-truncate-target"><a data-hovercard-type="user" data-hovercard-url="/users/${unstars[i].userName}/hovercard" data-octo-click="hovercard-link-click" data-octo-dimensions="link_type:self" href="/${unstars[i].userName}">${unstars[i].userName}</a></span></h3>
              
          <p class="follow-list-info"> <span class="css-truncate css-truncate-target">Unstarred on: ${da} ${mo}, ${ye}</span></p>
          
            </div>
          </li>`
          }
          const ending_html = `</ol>
          </div>
          <br>`
          repos_div.innerHTML = intial_html + ending_html +repos_div.innerHTML
        }
      }
    })
}

