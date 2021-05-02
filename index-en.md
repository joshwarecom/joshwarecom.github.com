---
layout: home
permalink: /index-en.html
header:
  image: /assets/img/home-header.jpg
tagline: > # this means to ignore newlines until "repository:"
  a hacker writes on faith, technology and conscience
excerpt: >
  a hacker writes on faith, technology and conscience
ref: home
lang: en
---

I am a theologian, humanities scholar, and hacker experimenting with the intersection of faith and information technology.

{%comment%}
Consider re-adding facebook support at a later date.
Evaluate whether the facebook pixel code would be useful.
{%endcomment%}

<h2>Latest Post</h2>
{% include list-category-posts.html lang=page.lang category="blog" max=1 %}
{%comment%}
commenting out references to comic, maybe if I actuall make the comic I'll uncomment it.
---
<h2>Latest Comic</h2>
{% include list-category-posts-nolink.html lang=page.lang category="comics" max=1 %}
{%endcomment%}
