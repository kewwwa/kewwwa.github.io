(function (document) {
    init();

    function init() {
        initDetailsToggle();
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

})(document);