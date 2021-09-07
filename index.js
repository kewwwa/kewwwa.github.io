(function (document) {
    const key = '323925712C8B49E48C00EBA72486203D';
    init();

    function init() {
        try {
            initDetailsToggle();
            requestData();
        } catch (error) {
            console.error(error);
        }
    }

    function initDetailsToggle() {
        var detailsElement = document.createElement('details');
        if (detailsElement.open !== false && detailsElement.open !== true) {
            var details = document.getElementsByTagName('details');
            var index;
            for (index = 0; index < details.length; index++) {
                details[index].addEventListener('click', toggleDetails, false);
            }
        }
    }

    function toggleDetails(event) {
        var openAttribute = event.currentTarget.attributes['open'];
        if (openAttribute) {
            event.currentTarget.removeAttribute('open');
        } else {
            event.currentTarget.setAttribute('open', '');
        }
    }

    function requestData() {
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = dataReceived;
        xhttp.open('GET', '/data.json', true);
        xhttp.send();
    }

    function dataReceived() {
        if (this.readyState == 4 && this.status == 200) {
            var data = JSON.parse(this.responseText);
            displayData(data);
        }
    }

    function displayData(data) {
        var index, item, element;

        for (index = 0; index < data.length; index++) {
            item = data[index];
            element = document.getElementById(item.id);
            if (element) {
                element.innerText = decryptCodes(item.text, key);

                if (item.link) {
                    element.href = decryptCodes(item.link, key);
                }
            }
        }
    }

    function encryptCodes(content, passcode) {
        var calAscii, result = '';

        for (var i = 0; i < content.length; i++) {
            calAscii = (content.charCodeAt(i) + passcode.charCodeAt(i % passcode.length));
            result += String.fromCharCode(calAscii);
        }

        return btoa(result);
    }

    function decryptCodes(content, passcode) {
        var calAscii, result = '';
        var data = atob(content);

        for (var i = 0; i < data.length; i++) {
            calAscii = (data.charCodeAt(i) - passcode.charCodeAt(i % passcode.length));
            result += String.fromCharCode(calAscii);
        }

        return result;
    }

})(document);