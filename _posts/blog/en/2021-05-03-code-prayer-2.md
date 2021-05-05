---
layout: post
title: "codeprayer #2 [00000001 / 11111111]"
image: /assets/patterns/paisley.png
header:
  image: /assets/img/blog-header.jpg
tags: ["c++", "codeprayers"]
keywords: c++ codeprayers
ref: codeprayer2
lang: en
category: posts
cattitle: true
---

#include <cstdlib>

class Experience {
    int duration = 255;
    public:
        int setDuration(int d) { return (duration = d);}
        int getDuration() { return duration;}
        int result() { for (int i = 0; i < duration; i++); return 0; };
        virtual ~Experience() { }
};

class Joy : public Experience {
};

class Suffering : public Experience {
};

int main()
{
    while (true) {
        Experience * e;
        Suffering s;
        switch (rand()%2) {
            case 0: e = new Joy; break;
            default: e = new Suffering; break;
        }
        if(dynamic_cast<Suffering*>(e)) {
            e->setDuration(e->getDuration()/2);
        }
        else {
            e->setDuration(e->getDuration()*2);
        }
    }
}

