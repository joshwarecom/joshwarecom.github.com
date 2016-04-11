---
layout: default
title: Home
---

{% assign pages_list = site.pages | sort:"url" %}
{% assign comicArray = "" | split: ""  %}
{% for node in pages_list reversed %}
{% if node.layout == "comic" %}
{% assign comicArray = comicArray | push: node %}
{% assign sz = comicArray | size | minus: 1 %}
{% endif %}
{% endfor %}
{% assign sz = comicArray | size %}
{% if sz > 0 %}


<h5>this week's <a href="/comics/">comic</a></h5>
<h2 class="post-title">
    <a href="{{ site.baseurl }}{{ comicArray[0].url }}">
        {{ comicArray[0].title }}<br>
        <img src="/public/img/comics/{{comicArray[0].id}}_tn.{{comicArray[0].ext}}">
    </a>
</h2>     
<a href="{{ site.baseurl }}{{ comicArray[0].url }}"><span class="post-date">{{ comicArray[0].date | date_to_string }}</span></a>
{% else %}
{% endif %}


{% for post in site.posts limit:1 %}
<h5>latest <a href="/blog/">blog</a> post</h5>
<div class="posts">
  <div class="post-summary">
    <h2 class="post-title">
      <a href="{{ site.baseurl }}{{ post.url }}">
        {{ post.title }}
      </a>
    </h2>
    <a href="{{ site.baseurl }}{{ post.url }}"><span class="post-date">{{ post.date | date_to_string }}</span></a>
    <h5>{{post.summary}}</h5>
    <span style="float: right;"><a href="{{ site.baseurl }}{{ post.url }}">read this post</a></span>
  </div>
</div>
{% endfor %}
<!--
<hr>
<h5><a href="/bibliography/">bibliography</a> &amp; <a href="/annotations/">annotation</a> updates</h5>
none at this time
-->