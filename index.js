(function (window, document) {
    const key = '323925712C8B49E48C00EBA72486203D',
        elementsId = [
            'details',
            'print',
            'today',
            'requestHeader',
            'requestDetails',
            'showRequests',
            'hideRequests'
        ],
        elements = {};

    init();

    function init() {
        try {
            initElements();
            initDetailsToggle();
            requestData();
        } catch (error) {
            console.error(error);
        }
    }

    function initElements() {
        let index, id;
        for (index = 0; index < elementsId.length; index++) {
            id = elementsId[index];
            elements[id] = document.getElementById(id);
        }

        elements.details.addEventListener('click', toggleAllDetails, false);
        elements.print.addEventListener('click', printDocument, false);
        elements.showRequests.addEventListener('click', toggleRequests, false);
        elements.hideRequests.addEventListener('click', toggleRequests, false);
        if (elements.today) {
            const now = new Date();
            elements.today.textContent = `(au ${('0' + now.getDate()).slice(-2)}/${('0' + (now.getMonth() + 1)).slice(-2)}/${now.getFullYear()})`;
        }
    }

    function toggleAllDetails(event) {
        event.preventDefault && event.preventDefault();

        const elements = document.querySelectorAll('details');
        let index = -1, element, hasClosed = false;
        while (!hasClosed && ++index < elements.length) {
            element = elements[index];
            hasClosed = !element.attributes['open'];
        }

        if (hasClosed) {
            while (index < elements.length) {
                element = elements[index];
                if (!element.attributes['open']) {
                    element.setAttribute('open', '');
                }

                index++
            }
        } else {
            index = 0;
            while (index < elements.length) {
                element = elements[index];
                element.removeAttribute('open');
                index++
            }
        }
    }

    function printDocument(event) {
        event.preventDefault && event.preventDefault();
        window.print();
    }

    function toggleRequests(event) {
        event.preventDefault && event.preventDefault();
        const hidden = elements.requestDetails.classList.toggle('hidden');
        elements.requestHeader.classList.toggle('noprint', hidden);
        elements.showRequests.classList.toggle('hidden', !hidden);
        elements.hideRequests.classList.toggle('hidden', hidden);
    }

    function initDetailsToggle() {
        const detailsElement = document.createElement('details');
        if (detailsElement.open !== false && detailsElement.open !== true) {
            const details = document.querySelectorAll('details');
            let index;
            for (index = 0; index < details.length; index++) {
                details[index].addEventListener('click', toggleDetails, false);
            }
        }
    }

    function toggleDetails(event) {
        const openAttribute = event.currentTarget.attributes['open'];
        if (openAttribute) {
            event.currentTarget.removeAttribute('open');
        } else {
            event.currentTarget.setAttribute('open', '');
        }
    }

    function requestData() {
        const xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = dataReceived;
        xhttp.open('GET', '/data.json', true);
        xhttp.send();
    }

    function dataReceived() {
        if (this.readyState == 4 && this.status == 200) {
            const data = JSON.parse(this.responseText);
            displayData(data);
        }
    }

    function displayData(data) {
        let index, item, elements, element, elementIndex;

        for (index = 0; index < data.length; index++) {
            item = data[index];
            if (item.id) {
                elements = [document.getElementById(item.id)];
            } else if (item.class) {
                elements = document.getElementsByClassName(item.class);
            }

            if (elements.length > 0) {
                for (elementIndex = 0; elementIndex < elements.length; elementIndex++) {
                    element = elements[elementIndex];
                    if (element) {
                        element.innerText = decryptCodes(item.text, key);

                        if (item.link) {
                            element.href = decryptCodes(item.link, key);
                        }
                    }
                }
            }
        }
    }

    function decryptCodes(content, passcode) {
        const data = atob(content);
        let index, calAscii, result = '';

        for (index = 0; index < data.length; index++) {
            calAscii = (data.charCodeAt(index) - passcode.charCodeAt(index % passcode.length));
            result += String.fromCharCode(calAscii);
        }

        return result;
    }

    function encryptCodes(content, passcode) {
        let index, calAscii, result = '';
        for (index = 0; index < content.length; index++) {
            calAscii = (content.charCodeAt(index) + passcode.charCodeAt(index % passcode.length));
            result += String.fromCharCode(calAscii);
        }

        return btoa(result);
    }

})(window, document);