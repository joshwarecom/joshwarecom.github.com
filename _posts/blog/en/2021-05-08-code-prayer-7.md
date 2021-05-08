---
layout: post
title: "codeprayer #7 [00100000 / 11111111]"
image: /assets/patterns/paisley.png
header:
  image: /assets/img/blog-header.jpg
tags: ["go", "codeprayers"]
keywords: go codeprayers
ref: codeprayer7
lang: en
category: posts
cattitle: true
---
```
package main
func main() {
	const fullness = 255;
	var fulfillment = 0;
	for time := 0.0; time < fullness; time++ {
		fulfillment++;
		if (time > fullness/2) {
			time /= 2;
		}
	}
}
```
