---
layout: default
title: Lexique
---
<h1>Lexique</h1>

<input id="searchInput" type="text" role="search" placeholder="Rechercher...">

<ul class="accordion" id="termList">

{% assign itemList = site.terms | sort: 'title'  %}
{% for item in itemList %}
<li>
    <a id="{{ item.name }}" href="#{{ item.name }}" data-toggle="collapse" data-target="#content-{{ item.name }}" aria-expanded="false" aria-controls="content-{{ item.name }}">
        {{ item.title }}
    </a>
    <blockquote id="content-{{ item.name }}" aria-labelledby="{{ item.name }}" data-parent="#termList" class="collapse">
        <p>{{ item.description }}</p>
        <!--<p><a href="{{ item.url }}">Plus d'info...</a></p>-->
    </blockquote>
</li>
{% endfor %}
</ul>

<p>Vous ne trouvez pas ce que vous cherchez ?</p>
<p>Il s'agit peut être d'un terme spécifique à votre <a href="cellules">cellule</a></p>

<script type="text/javascript" src="/assets/terms.js"></script>
