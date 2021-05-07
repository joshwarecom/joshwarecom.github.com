---
layout: post
title: "codeprayer #6 [00010000 / 11111111]"
image: /assets/patterns/paisley.png
header:
  image: /assets/img/blog-header.jpg
tags: ["adventuron", "codeprayers"]
keywords: adventuron codeprayers
ref: codeprayer6
lang: en
category: posts
cattitle: true
---
```
start_at = lord

locations {
   lord      : location "You are exactly where you need to be." ;
}

strings {
   unchangeable_name : string "an unchangeable";
   unacceptable_name : string "an unacceptable";
}

booleans {
   changed : boolean "false";
   accepted : boolean "false";
}


objects {
   unchangeable          : object  "{unchangeable_name}" msg="Accepting it requires serenity." at = "lord";
   unacceptable          : object "{unacceptable_name}" msg="Changing it requires courage." at = "lord";
   serenity              : object "some serenity" msg="This helps you accept unchangeable things." at = "lord";
   courage              : object "some courage" msg="This helps you change unacceptable things." at = "lord";
   wisdom              : object "the wisdom" msg="This helps you know the difference between unacceptables and unchangeables." at = "lord";   
}

on_command {
   :match "accept -;accept *" {
      :if (is_carried "wisdom") {   
      :if (is_carried "serenity") {
         :print "Accepted.";
         :set_true "accepted";
      }
      :else {
         :print "That requires serenity.";      
      }
      }
      :else { :print "First you need the wisdom to know the difference.";}
   }
   :match "change -;change *" {
      :if (is_carried "wisdom") {   
      :if (is_carried "courage") {
         :print "Changed.";
         :set_true "changed";         
      }
      :else {
         :print "That requires courage.";      
      }
      }
      :else { :print "First you need the wisdom to know the difference.";}
   }
}

on_startup {
   :if (is_carried "wisdom") {
      :set_string var="unchangeable_name" text="an unchangeable";
      :set_string var="unacceptable_name" text="an unacceptable";      
   }
   :else {
      :set_string var="unchangeable_name" text="a thing";
      :set_string var="unacceptable_name" text="a thing";      
   }
}

on_tick {
   :if (is_carried "wisdom") {
      :set_string var="unchangeable_name" text="an unchangeable";
      :set_string var="unacceptable_name" text="an unacceptable";   
      
      :if (changed) {
         :set_string var="unchangeable_name" text="something changed";  
      }
      :if (accepted) {
         :set_string var="unacceptable_name" text="something accepted";  
      }
   }
   :else {
      :set_string var="unchangeable_name" text="a thing";
      :set_string var="unacceptable_name" text="a thing";      
   }
   :if (changed && accepted) {
      :print "Amen.";
      :win_game;
   }
}
```
