(function (window, document) {
    var container,
        searchInput;

    init();

    function init() {
        container = jQuery('#accordionExample');
        container.find('[data-toggle=\'collapse\']')
            .on('click', collapseLinkClick);

        searchInput = jQuery('#searchInput');
        searchInput.on('focus', searchInputFocus);

        var hash = window.location.hash;
        if (hash) {
            var active = container.find(hash);
            if (active.length > 0) {
                var toggle = active.find('[data-toggle=\'collapse\']');
                var collapse = container.find(toggle.data('target'));
                collapse.collapse('show');
            }
        }
    }

    function collapseLinkClick() {
        var target = $(this).data('target');
        var collapse = container.find(target);
        var label = collapse.attr('aria-labelledby');
        history.replaceState({}, label, '#' + label);
    }

    function searchInputFocus() {
        alert('Nan ça marche pas encore... :p');
    }
})(window, document, jQuery);
