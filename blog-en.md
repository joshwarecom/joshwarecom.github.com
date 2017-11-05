---
layout: page
title: blog
tagline: A few more words about this theme
excerpt: >
  A few more words about this theme. This goes SEO!
permalink: /blog.html
header:
  image: /assets/img/blog-header.jpg
ref: blog
lang: en  
order: 1
---

{% include list-category-posts.html lang=page.lang category="blog" max=10%}
