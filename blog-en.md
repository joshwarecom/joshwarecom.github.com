---
layout: page
title: blog
tagline: A few more words about this theme
excerpt: >
  A few more words about this theme. This goes SEO!
permalink: /blog.html
header:
  image: /assets/patterns/upfeathers.png
ref: blog
lang: en  
order: 1
---

{% include list-category-posts.html lang=page.lang category="blog" max=10%}

{% include go-to-home-page.html %}
