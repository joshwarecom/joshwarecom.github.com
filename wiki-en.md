---
layout: page
title: wiki
tagline: What I'm doing now
excerpt: >
  What I'm doing now. This goes SEO. Updated on 25 Settembre 2017.
permalink: /wiki.html
header:
  image: /assets/img/wiki-header.jpg
ref: wiki
lang: en
order: 2
---
{% assign previous_post = nil %}
{% assign wiki_pages = site.pages | where:"ref", "wikipage" | where:"lang", page.lang %}
{% assign  first_wiki = wiki_pages | size %}
{% assign first_nav = first_wiki | minus:1 %}
{% assign i = 0 %}
{% for x in wiki_pages %}
{% assign i = i | plus:1 %}
{% assign next_i = i | minus:2 %}
{% if next_i == -1 %}
{% assign next_i = i | minus:1 %}
{% endif %}
{{ wiki_pages[i].title }}
{% endfor %}
<br />    
