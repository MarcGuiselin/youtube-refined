// ============================
// Copyright 2018 Marc Guiselin
// ============================

// Receive messages from website
window.addEventListener('message', function(event){
    let {method} = event.data;

    switch(method){
        case 'ask-extension-for-auth':
            chrome.runtime.sendMessage({method: 'get-donate-auth-info'}, function(response){
                window.postMessage({
                    method: 'give-page-auth',
                    email: response.email,
                    proUnlocked: response.proUnlocked
                }, '*');
            });
            return;
    }
});


// On page fully loaded
document.addEventListener('DOMContentLoaded', () => {
    for(let $button of document.querySelectorAll('a.return-to-extension')){
        $button.style.display = 'initial';
        $button.href = chrome.extension.getURL('options.html');
    }

    switch(location.pathname.replace(/\/$/, '')){
        case '/donate':
        case '/donate/success':
            chrome.runtime.sendMessage({method: 'check-pro-email'});
            break;
    }
});