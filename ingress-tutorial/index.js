(function (window, document) {
var container,
    collapseLinkList;

init();

function init() {
    container = jQuery('#accordionExample');
    collapseLinkList = container.find('[data-toggle=\'collapse\']');
    collapseLinkList.on('click', collapseLinkClick);

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
    //window.location.hash = collapse.attr('aria-labelledby');
}
})(window, document, jQuery);
