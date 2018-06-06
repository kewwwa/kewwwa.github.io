(function (window, document, $) {
    var container,
        itemList = new Map(),
        searchInput,
        searchInputDelay = 500,
        searchInputTimeout;

    init();

    function init() {
        container = $('#termList');
        container.find('[data-toggle=\'collapse\']')
            .each(initCollapseLink);

        searchInput = $('#searchInput');
        searchInput.on('keyup', searchInputKeyUp);

        window.addEventListener("hashchange", showMatchingHash, false);

        showMatchingHash();
    }

    function showMatchingHash() {
        var hash = window.location.hash,
            item;

        if (hash) {
            item = itemList.get(hash.substr(1));
            if (item) {
                item.content.collapse('show');
            }
        }
    }

    function initCollapseLink() {
        var collapse = $(this),
            parent = $(collapse.parentsUntil(container).last()),
            id = collapse.attr('id'),
            content = container.find(collapse.data('target'));

        collapse.on('click', collapseLinkClick);

        var item = {
            id: id,
            collapse: collapse,
            content: content,
            parent: parent,
            text: collapse.text().trim().toLowerCase(),
        };

        itemList.set(id, item);
    }

    function collapseLinkClick() {
        var entries = itemList.entries(),
            entry,
            item,
            key,
            match;

        while (!match && !(entry = entries.next()).done) {
            [key, item] = entry.value;
            match = item.collapse.is(this);
        }

        if (match) {
            history.replaceState({}, key, '#' + key);
        }
    }

    function searchInputKeyUp(event) {
        if (searchInputTimeout) {
            clearTimeout(searchInputTimeout);
        }

        if (event.keyCode === 13) {
            searchTerm();
        } else {
            searchInputTimeout = setTimeout(searchTerm, searchInputDelay);
        }
    }

    function searchTerm() {
        var term = searchInput.val().trim().toLowerCase(),
            item,
            match,
            count = 0;

        for (item of itemList.values()) {
            match = item.text.indexOf(term) >= 0;
            count += match;
            item.parent.attr('hidden', !match);
        }

        if (count === 1) {
            // TODO: anchor + expand
        }
    }
})(window, document, jQuery);
