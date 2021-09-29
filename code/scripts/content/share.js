// ============================
// Copyright 2018 Marc Guiselin
// ============================

if(!window.ranonce){
    window.ranonce = true;
    location.hash = '#ytr';

    if(location.host == 'www.facebook.com'){
        // Add style element to head
        let interval1 = setInterval(() => {
            if(document.head){
                clearInterval(interval1);
                let $style = document.createElement('style');
                $style.innerHTML = `
                    #platformDialogForm #u_0_m,
                    .uiContextualLayerPositionerFixed ul>li:nth-child(n+5){
                        display: none;
                    }
                `;
                document.head.appendChild($style);
            }
        }, 100);
    
        // When user clicks post to facebook button, 
        let interval2 = setInterval(() => {
            let $postToFacebook = [...document.querySelectorAll('button[type="submit"]')].find(el => !el.innerText.toLowerCase().includes('cancel') && el.innerText.toLowerCase().includes('post'));
            if($postToFacebook){
                clearInterval(interval2);
                $postToFacebook.addEventListener('click', () => chrome.runtime.sendMessage({method: 'shared-with-facebook'}));
            }
        }, 100);
    }else if(location.host == 'www.linkedin.com'){
        // When user clicks submit on form
        let interval = setInterval(() => {
            let $share = document.querySelector('input[type="submit"]');
            if($share){
                clearInterval(interval);
    
                let runDefault = false;
                $share.addEventListener('click', evt => {
                    if(!runDefault){
                        runDefault = true;
                        evt.preventDefault();
                        chrome.runtime.sendMessage({method: 'shared-with-linkedin'}, () => $share.click());
                    }
                });
            }
        }, 100);
    }
}