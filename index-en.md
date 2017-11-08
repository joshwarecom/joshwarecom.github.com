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

Introductory text about this site.  It should be a relatively concise paragraph with sufficient detail to set expectations.

And then perhaps something here to summarize.

{%comment%}
Consider re-adding facebook support at a later date.
Evaluate whether the facebook pixel code would be useful.
{%endcomment%}

<h2>Latest Post</h2>
{% include list-category-posts.html lang=page.lang category="blog" max=1 %}

---

<h2>Latest Comic</h2>
{% include list-category-posts-nolink.html lang=page.lang category="comics" max=1 %}
