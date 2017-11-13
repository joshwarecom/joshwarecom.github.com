---
layout: page
title: appendix
tagline: index of topics and acknowledgements
excerpt: >
  index of topics and acknowledgements
permalink: /appendix.html
header:
  image: /assets/img/appendix-header.jpg
ref: wiki
lang: en
order: 2
---
{% assign previous_post = nil %}
{% assign wiki_pages = site.pages | where:"ref", "wikipage" | where:"lang", page.lang %}
{% assign  first_wiki = wiki_pages | size %}
{% assign first_nav = first_wiki | minus:1 %}
{% assign i = 0 %}
{% assign letter = nil %}
{% for x in wiki_pages %}{% assign next_letter = x.title | upcase | slice:0 %}{% if next_letter != letter %}


<br>
{{ next_letter }}

---
{% assign letter = next_letter %}{%endif%}<code><a href="{{x.url}}">{{ x.title | escape }}</a></code>&nbsp;&nbsp;&nbsp;{% endfor %}
<br />    
