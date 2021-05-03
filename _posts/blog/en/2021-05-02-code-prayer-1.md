---
layout: post
title: "codeprayer #1/256 [00000000 / 11111111]"
image: /assets/patterns/paisley.png
header:
  image: /assets/img/blog-header.jpg
tags: ["code","prayers","codeprayers"]
keywords: code prayers codeprayers c
ref: codeprayer1
lang: en
category: posts
cattitle: true
---
```
#include <stdio.h>
int main()
{
    char x[4][6] = {"dona","nobis","pacem",""};
    while (true) {
        for (int i = 0; *(x[i]); i++) printf(x[i]);
    }
    return 0;    
}
```
