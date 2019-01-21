---
layout: default
title: Cellules
---
<h1>Cellules</h1>

<input id="searchInput" type="text" role="search" placeholder="Rechercher...">

<ul class="accordion" id="termList">

{% assign itemList = site.cells | sort: 'title'  %}
{% for item in itemList %}
<li>
    <a id="{{ item.name }}" href="{{ item.url }}">
        {{ item.title }} ({{ item.name }})
    </a>
</li>
{% endfor %}
</ul>

<script type="text/javascript" src="/assets/terms.js"></script>
<script type="text/javascript">

</script>