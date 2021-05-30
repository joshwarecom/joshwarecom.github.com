"Loud House 'game on'" by Caleb Wilson

Release along with an "Edgecase Parchment" interpreter.

Include version 10/161003 of Simple Graphical Window by Emily Short.

A coin is a kind of thing.

A passb is a kind of thing.

Chattiness is a kind of value. The chattinesses are chatty and silent.  A thing has chattiness.  A thing is usually silent.

Instead of talking to a thing that is silent:
	say "[the noun] remains silent."
	
Understand the commands "ask" and "tell" and "say" and "answer" as something new. 
Understand "ask [text]" or "tell [text]" or "answer [text]" or "say [text]" as a mistake ("[talk to instead]"). 
To say talk to instead: 
	say "(To communicate in [story title], TALK TO a character.) " 

Instead of asking someone to try doing something: 
	say "[talk to instead][paragraph break]". 
Instead of answering someone that something: 
	say "[talk to instead][paragraph break]". 
Understand "talk to [someone]" as talking to. Understand "talk to [something]" as talking to. Talking to is an action applying to one visible thing. 


your room is a room. "You need money to buy a video game.  You can go north to the hallway."	

After starting the virtual machine:
	Now the current graphics drawing rule is the standard placement rule;

Figure Collectable cards-picture is the file "cards-picture.jpg".
The hallway is north of Your Room.  "Now you are in the hallway.  You can go back south, or west to Lynn's and Lucy's room, or east to Lisa's and Lily's room or north to the north hall."

Before examining collectable cards:
	now the currently shown picture is figure Collectable cards-picture;
	follow the current graphics drawing rule.

Figure lower-room-picture is the file "lower-room-picture.jpg".
Lynn's Lucy's room is west of the hallway.  "Now you are in Lynn's and Lucy's room. The only way out is back east."
Figure lionel-picture is the file "lionel-picture.jpg".
Rule for printing the name of Lynn's Lucy's:
	say "Lynn's and Lucy's room";
	
Figure Royal-Woods-Main-Street-picture is the file "Royal-Woods-Main-Street-picture.png".

Before going to Royal Woods Main Street:
	now the currently shown picture is figure Royal-Woods-Main-Street-picture;
	follow the current graphics drawing rule.
		
A coffin is a thing in Lynn's Lucy's.  The description of a coffin is "Dank.  Dark. And full of bats."

Lucy is a person in Lynn's Lucy's.

Instead of talking to Lucy:
	say "Lucy remains silent."

Lisa's Lily's is east of the hallway."Now you are in Lisa's and Lily's room. You see the north hall to the west."
Rule for printing the name Lisa's Lily's:
	say "Lisa's and Lily's room";

Lisa is a female person in Lisa's Lily's. "".  The description of Lisa is "She is wearing glasses and a light green jacket."

Instead of talking to Lisa: 
	say "'I am working on a device to turn a regular kid into an athlete! It requires DNA from someone who's good at sports, though.' Now where can you find an athlete kid that's good at sports?"; 

	
north hall is north of hallway."You are in the north hall. you see Lori's and Leni's room to the east, Luan's and Luna's room to the west, hallway to the south, and the far north hall to the north."
Lori's Leni's is east of north hall." You see north hall to the west."
Rule for printing the name Lori's Leni's:
	say "Lori's and Leni's room";
	
Leni's bed is a fixed in place thing in Lori's Leni's. The description of Leni's bed is "You check Leni's bed, but all you see are clothes and dolls."
Lori's bed is a thing in Lori's Leni's. The description of Lori's bed is "You check Lori's bed, and you find Lori's phone."
Lori's phone is a thing on Lori's bed.  The description of Lori's phone is "You turn on Lori's phone, and you see an advertisement for proffessional kids football. It says that only athletes 10 to 15 (of course, you're 11) can enter. it's a $1 entry fee, and if you win, you'll earn $500! You should keep that in mind. Just collect 4 Quarters and become an athlete to enter."

Rule for listing nondescript items of the Lori's Leni's:
 say "All you see ";
	list the contents of the Lori's Leni's, as a sentence, tersely, listing marked items only, prefacing with is/are, and giving brief inventory information;
	say "."

A dresser is a thing in Lori's Leni's.
Quarter 2 is a coin in the dresser.
Quarter 1 is a coin in the coffin.
Luan's Luna's room is west of north hall."You are in Luan's and Luna's room. You see the north hall to the east."
Rule for printing the name Luan's Luna's:
	say "Luan's and Luna's room";
	
Luan is a female person in  Luan's Luna's. The description of Luan is "She is wearing a dress with a  yellow bottom to it and a squirt flower at the top of the dress."

Instead of talking to Luan:
	say "You try to ask Luan for advice on how to make money, but she inturupts with a joke. 'why did the chicken cross the road? To prove it wasn't a chicken!' She laughs at her own joke."
Luna is a female person in Luan's Luna's. The description of Luna is "She is wearing a purple skull T-shirt, and is playing on her guitar."
Instead of talking to Luna:
	say "You ask Luna for advice on how to make money, and she says, 'You know, if I were you, I'd try searching the ENTIRE house for clues and Quarters.' She goes back to playing her guitar."
A puppet is a thing in Luan's Luna's. The description of the puppet is "You check the puppet, and it's full of loose change! Slight problem: It's not LOOSE change- It's actually Luan's 'wallet'. You can't take that."
A speaker is a thing in Luan's Luna's. The description of the speaker is "You check every inch of the speaker, but no loose change found."

far north hall is north of north hall."You are in far north hall. You see Lola's and Lana's room to the west, stairs to the east, and north hall to the south."
Lola's Lana's is west of far north hall."You enter Lola's and Lana's room. You see far north hall to the east."
Rule for printing the name Lola's Lana's:
	say "Lola's and Lana's room";
	
A mirror is a thing in Lola's Lana's. The description of the mirror is "You look in the mirror, and... Bingo! You see a coin in the frog cage, and a bundle of cash in the teacup!"
A teacup is a thing in Lola's Lana's. The description of the teacup is "You check the teacup, and you find a bundle of cash! But you can't take that. It's Lola's, and if she found out, she would do anything to make your life miserable."
A frog cage is a thing in Lola's Lana's. The description of the frog cage is "You look in the frog cage and find a Quarter! But Hops the frog won't let you take it. Mabey you should check a place that IS'NT a pet cage."

living room is east of far north hall."You are in the living room. You see Lynn to the north, Lola and Lana to the south, stairs to the west, and the exit to the east."
Lynn's area is north of Living room."You entered the area where Lynn excercises. You see the Living room to the south, and a couch to the north."
Lynn is a female person in Lynn's area. The description of Lynn is "She is wearing her sports uniform, which her player number is 1( which stands for her being number 1 at all the sports )."

Instead of talking to Lynn:
	say "She says, 'I'm trying to excercise for my football game. I've been excercising for about 5 hours straight.' You ask her both how she hasn't gotten tired, and why she hasn't used the bathroom for 5 hours. She answers with '1, I don't really get tired unless it's night time, and 2, it's bad luck to use the bathroom before a football game- if I go number 2, I can't be number 1.' You see her excercise so hard that a bit of her hair falls off."
	Lynn's hair is a thing in Lynn's area. The description of Lynn's hair is "This is part of Lynn's hair. It's useful if you need a DNA sample of her."

Check giving something to Lisa:
	if the noun is Lynn's hair:
		move hair to Lisa;
		move Quarter 3 to player;
		say "Lisa is excited that you gave her Lynn's hair, and she blasts you with the athlete ray. She also gives you a Quarter.";
		rule succeeds;
				
South Living room is south of Living room. "You see Living room to the north and the basement stairs to the south."
Lola is a female person in South Living room. The description of Lola is "She is wearing a pink dress and a tiara."

Instead of talking to Lola:
	say "She says, 'I don't have much time to talk right now- I'm getting my go-kart repaired. But if you have four Quarters to trade with me for a dollar, then I'm listening.'"
Lana is a female person in South Living room. The description of Lana is "Lana is wearing muddy overalls (she must have been eating mud pies again) and a dirty cap."

Instead of talking to Lana:
	say "She says, 'You know, I learned how to plumb, like the taste of mud, and how to repair cars through Lori's phone- maybey you should check her phone, too.' She goes back to repairing Lola's go-kart."
The locked safe is a Locked thing in Lisa's Lily's.
Quarter 3 is a coin in the locked safe.

Understand "quarters" as Quarter 1.

Check giving something to Lola:
	if the noun is a coin:
		if the player has Quarter 1 and the player has Quarter 2 and the player has Quarter 3 and the player has Quarter 4:
			move Quarter 1 to Lola;
			move Quarter 2 to Lola;
			move Quarter 3 to Lola;
			move Quarter 4 to Lola;
			move Dollar Bill to player;
			say "Lola is excited and hands you a dollar bill.";
			rule succeeds;
		otherwise:
			Say "'Eh. Not enough money to trade for a dollar.'";
			rule succeeds;
		

Basement is south of South Living room."You see Lola and Lana to the north."
Couch 2 is a thing in the Basement. The description of Couch 2 is "You examine the entire couch, but no loose change found."
A Video game console is a thing in the Basement. The description of the Video game console is "The Video game console has Nickolodeon written on the side and you need to save up to buy the video game for it."
North Living room is north of Lynn's area."You can see Lynn to the south."
Couch 1 is a thing in North Living room. The description of Couch 1 is "You examine the Couch, and..."
Quarter 4 is a coin in Couch 1.
Royal Woods Main Street is east of Living room."You can see a video game shop to the north, your house to the west, and the schools to the south."
Royal Woods School Grounds is south of Royal Woods Main Street."These bullies come to stop you from entering unless you give them money. You see the inside of the school to the south, and Royal Woods Main Street to the north."

locked safe 2 is a locked thing in Lola's Lana's.

A dollar bill is a thing in locked safe 2.

Bully is a male person in Royal Woods School Grounds. The description of Bully is "He is holding a jar of money, and he wants you to give him a dollar bill to pass through."

Check giving something to Bully:
	if the noun is a dollar bill:
		move dollar bill to Bully;
		say "'Come on in,' said the Bully. 'Oh, and, the football stadium is above here.'"
		
The football stadium is above Royal woods School Grounds. "The Football game is about to start, and guess who your playing against- Lynn! She says 'Wow, Lincoln! I didn't know that you were coming to the same football game as me!'"

a ball is a thing in the football stadium.

A Scoring post is a person in the football stadium.

 Instead of giving ball to A Scoring post:
	if the noun is ball:
		move ball to A Scoring post;
		move $45 to player;
		say "You throw the ball into the scoring post, and you won the game! The same bully from earlier hands you $500. You decide to split it evenly between your ten sisters- that means $45 each- exactly enough!"
Locked safe 3 is a locked thing in Royal Woods School Grounds.
$45 is a thing in Locked safe 3.

Instead of throwing the ball at the post:
	try giving the ball to the post;
	
the video game shop is north of Royal Woods Main Street. "You are in the video game shop. Here you can buy that video game + collectable rare cards for just $45!"

the owner is a person in the video game shop.

Instead of giving $45 to the owner:
	if the noun is $45:
		move $45 to the owner;
		move collectable cards to player;
		say "'Thank you for buying from Royal Woods Video Game shop,' said the owner. 'oh, and don't forget that you can play your video game in the room under the room under the basement.'"
		
Locked safe 4 is a locked thing in the video game shop.
collectable cards are a thing in Locked safe 4. The Description of collectable cards is "Now you have your own background to look at for the rest of the game!"

Secret Passageway is below Basement. "So, I guess you found my secret room. Either you beat the game, or you found a hack to it. If the first one, good job! Well, you know where to go from here."

Nickolodeon game is below Secret Passageway. "You can play the Spongebob game to the north, Alvin and the chipmunks to the south, Henry Danger to the west, and Teenage Mutant Ninja Turtles to the east. Go up twice to leave."

Pineapple house is north of Nickolodeon. "You can go north."

Gary is a person in Pineapple house. The description of Gary is "He is a snail with a spiral shell."

Bikini Bottom is north of Pineapple house. "you  see your Pineapple house to the south and the Krusty Krab to the north."

the Krusty Krab is north of Bikini Bottom. "You see Bikini Bottom to the south."

Plankton's robot is a person in Bikini Bottom.

mister Krabs is a person in the Krusty Krab.

Locked safe 5 is a locked thing in the Krusty Krab.
Krabby Patty is a thing in Locked safe 5.
Krabby Patty dresser is a thing in the Krusty Krab.
Dollar Bill 2 is a thing in Krabby Patty dresser.

Instead of giving Dollar Bill 2 to mister Krabs:
	if the noun is Dollar Bill 2:
		move Dollar Bill 2 to mister Krabs;
		move Krabby Patty to player;
		say "mister Krabs's eyes show dollar signs and he hands you a Krabby Patty."
		
Instead of giving Krabby Patty to Plankton's robot:
	if the noun is Krabby Patty:
		move Krabby Patty to Plankton's robot;
		move Gamer Pass 1 to player;
		say "you throw the Krabby Patty at the robot, and you've saved Bikini Bottom! You now have a gamer pass!"
		
Instead of throwing the Krabby Patty at Plankton's robot:
	try giving Krabby Patty to Plankton's robot;
	
Chipmunk house is south of Nickolodeon game. "You can see the exit to the south or you can leave the game by going north."

Neighborhood is south of Chipmunk house. "You can see your house to the north, and The Tree house to the south."

evil robot is a person in Neighborhood.

The Tree house is south of Neighborhood. "You are in The Tree house. You can leave to the north."

Dave's computer is a thing in The Tree house.

a squirt gun is a thing in Locked safe 5.

Dave is a person in Chipmunk house.

Instead of talking to Dave:
	say "Dave asks 'Have you seen my computer?'"
	
Instead of throwing the squirt gun at evil robot:
	try giving the squirt gun to evil robot;
	
Instead of giving Dave's computer to Dave:
	if the noun is Dave's computer:
		move Dave's computer to Dave;
		move squirt gun to player;
		say "Dave is excited and gives you a squirt gun as a reward. Maybe you could use this to fight the evil robot."
		
		
the Man-cave is west of Nickolodeon game. "You can leave the Man-cave by going up."

Swellview is above the Man-cave. "Oh no! There's now an alien invasion from Mars! Go down to enter the Man-Cave, or go west to enter the rocket and get to Mars."

Marty is a person in Swellview. The description of Martian is "He has green skin (as he's from Mars) and is wearing protective armor."

Instead of talking to Marty:
	say "the Martian says 'I shall destroy earth! And nothing can stop me except the Omega Grenade!'";


Mars is a room. "You are now on Mars. You can go west to the Canyon or east to get back to earth."
A rocket is a door.  It is east of Mars and west of Swellview. The rocket is locked.

The space key is in the Man-cave. It unlocks the rocket.

The canyon is west of Mars. "You are now on the canyon. You can see Mars to the east."

a rover is a person in the Canyon.

Instead of talking to a rover:
	say "the rover says 'Beep Boop Beep.'"
	
a Translater is a thing in Mars.

Instead of giving a Translater to a rover:
	if the noun is a Translater:
		move Translater to a rover;
		say "The rover can now say stuff in english. it says 'Oh, Wow! I can speak human language! Hey, I need you to give me this special alien bug in the valley to the west so my human controllers can finally stop searching and take me off this planet once and for all!'"
		
The Valley is west of The Canyon. "You are in the Valley. You see the Canyon to the east."

An Alien Bug is a thing in The Valley. The description of the Alien Bug is "Quite a strange creature, really."

Instead of giving Alien Bug to a rover:
	if the noun is Alien Bug:
		move Alien Bug to rover;
		move Omega Grenade to player;
		say "You give the Alien Bug to the rover and it says 'Oooh! Now I can report it to NASA!' He hands you an Omega Grenade."
		
an Omega Grenade is a thing in Locked safe 5.

Instead of throwing the Omega Grenade at Marty:
	try giving the Omega Grenade to Marty;
	
Instead giving Omega Grenade to Marty:
	if the noun is Omega Grenade:
		move Omega Grenade to Marty;
		move Gamer Pass 3 to player;
		say "You did it! You blew up the alien invaders and saved swellview! You also earned a gamer pass!"
		
The Sewer is east of Nickolodeon game. "You are in the sewer. You see the City above you."

Locked safe 6 is a locked thing in the Sewer.
Raph's sai is a thing in Locked safe 6.
Leo's sword is a thing in the Sewer. The Description of Leo's sword is "It is made mostly out of iron."
Mike's nun-chucks are a thing in the Sewer.

the City is above The Sewer. "You are in the city. You see a sai target to the east and your sewer under you."

a Guard is a person in the City. The description of a Guard is "He has completely sword-proof armor, but his head looks easy to hit."

Instead of throwing Mike's nun-chucks at a Guard:
	try giving Mike's nun-chucks to a Guard;
	
Instead of giving Mike's nun-chucks to a Guard:
	if the noun is Mike's nun-chucks:
		move Mike's nun-chucks to a Guard;
		move Raph's sai to player;
		say "You knock him out and win your sai back."
		
Target gate is east of the City. "You are in the City. You see Shredder's Castle to the east."

a sai target is a person in Target gate.

Instead of throwing Raph's sai at a sai target:
	try giving Raph's sai to a sai target;
	
Instead of giving Raph's sai to a sai target:
	if the noun is Raph's sai:
		move Raph's sai to a sai target;
		move Skull Key to player;
		say "You throw the sai and hit the target, scoring the key to the gate!"
		
Shredder's Castle is a room. "You are in Shredder's Castle! You see Target gate to the west."

Castle Gate is a door. It is east of Target gate and west of Shredder's Castle. Castle Gate is locked.

The Skull Key is in Locked Safe 6. It unlocks Castle Gate.

Shredder is a person in Shredder's Castle. The Description of Shredder is "He is wearing armor that is proof to all metals except iron."

Instead of giving Leo's sword to Shredder:
	if the noun is Leo's sword:
		move Leo's sword to Shredder;
		move Gamer Pass 4 to player;
		say "You throw the sword, and it cuts through Shredder's armor, killing him. You saved the city, and earned a gamer pass!"
		
Instead of throwing Leo's sword at Shredder:
	try giving Leo's sword to Shredder;
	
gamer pass 1 is a passb in Locked safe 5. The Description of gamer pass 1 is "You earned this by beating Plankton's Robot. If you give this to the owner of the video game shop, and collect all the other ones, you'll unlock a secret minigame."

gamer pass 2 is a passb in Locked safe 5. The Description of gamer pass 2 is "You earned this by beating the evil robot that attacked the neighboorhood. If you give this to the owner of the video game shop, and collect all the other ones, you'll unlock a secret minigame."

gamer pass 3 is a passb in Locked safe 5. The Description of gamer pass 3 is "You earned this by beating the alien invaders. If you give this to the owner of the video game shop, and collect all the other ones, you'll unlock a secret minigame."

gamer pass 4 is a passb in Locked safe 5. The Description of gamer pass 4 is "You earned this by beating Shredder. If you give this to the owner of the video game shop, and collect all the other ones, you'll unlock a secret minigame."

Slime Boss is a room. "You can go up to the menu, or west once you get your first Key. Talk to the Slime monster to see your first riddle."
Game Gate is a door. It is above Slime Boss and below Nickolodeon game. Game Gate is locked.

The Game Key is in Locked safe 4. It unlocks Game Gate.

Understand "gamer passes" as gamer pass 1.

Instead of giving gamer pass 1 to the owner:
	if the noun is a passb:
		if the player has gamer pass 1 and the player has gamer pass 2 and the player has gamer pass 3 and the player has gamer pass 4:
			move gamer pass 1 to Lola;
			move gamer pass 2 to Lola;
			move gamer pass 3 to Lola;
			move gamer pass 4 to Lola;
			move Game Key to player;
			say "the owner says, 'I see you've played your new game.' He hands you a game key. 'This should unlock a secret level. It is below the menu.'";
			rule succeeds;
		otherwise:
			Say "'Come on, man. earn more game passes if you want to play the secret level.'";
			rule succeeds;
		
a Slime monster is a person in Slime Boss.

Instead of talking to a Slime monster:
	say "The Slime monster says, 'Here's your first riddle. Now this is something that roars- and it's called a ________. Throw the answer at me to recieve your first key."
	
a dinosaur is a thing in Slime Boss.
a skateboard is a thing in Slime Boss.
a Lion is a thing in Slime Boss.

Instead of throwing the skateboard at a Slime monster:
	try giving the skateboard to a Slime monster;
	
Instead of throwing the Lion at a Slime monster:
	try giving the Lion to a Slime monster;
	
Instead of throwing the dinosaur at a Slime monster:
	try giving the dinosaur to a Slime monster;
	
Instead of giving dinosaur to a Slime monster:
	if the noun is dinosaur:
		move dinosaur to a Slime monster;
		move Game Key 2 to player;
		say "You throw the dinosaur at the Slime monster, and it's impressed. 'Here's your first key,' he says."
		
Slime Boss 2 is a room. "You can go east than up to leave the Boss, or go west once you have the Key."
Game Gate 2 is a door. It is east of Slime Boss 2, and west of Slime Boss. Game Gate 2 is locked.

Game Key 2 is in Locked Safe 4. It unlocks Game Gate 2.

Slime monster 2 is a person in Slime Boss 2.

Instead of talking to Slime monster 2:
	say "The Slime monster says, 'Here's your second riddle- and it won't be easy like the last one. Now, this object will destroy me: Kaboom! Kabwire! and this is called a ____. Throw the answer at me to earn your second key."
	
a Charged wire is a thing in Slime Boss 2.

a Fire is a thing in Slime Boss 2.

Instead of throwing the Charged wire at Slime monster 2:
	try giving the Charged wire to Slime monster 2;
	
Instead of throwing the Fire at Slime monster 2:
	try giving the Fire to Slime monster 2;
	
Instead of giving Fire to Slime monster 2:
	if the noun is Fire:
		move Fire to Slime monster 2;
		move Game Key 3 to player;
		say "You throw the Fire at the Slime monster, Causing him to scream in pain as half of him burns off."
		
Slime Boss 3 is a room. "You can go east twice than up to leave the Boss, or go west once you have the key to end the game."
Game Gate 3 is a door. It is east of Slime Boss 3 and west of Slime Boss 2. Game Gate 3 is locked.

Game Key 3 is a thing in Locked Safe 4. It unlocks Game Gate 3.

Slime monster 3 is a person in Slime Boss 3.

Instead of talking to Slime monster 3:
	say "The Slime monster says, 'Here's your final riddle: use your Logic and Science- which one will completly destroy me?"
	
Pringle Chips are a thing in Slime Boss 3.
a Knife is a thing in Slime Boss 3.
Citric acid is a thing in Slime Boss 3.

Instead of throwing the Pringle Chips at Slime monster 3:
	try giving the Pringle Chips to Slime monster 3;
	
Instead of throwing the Knife at Slime Boss 3:
	try giving the Knife to Slime Boss 3;
	
Instead of throwing the Citric acid at Slime monster 3:
	try giving the Citric acid to Slime monster 3;
	
Instead of giving Pringle Chips to Slime monster 3:
	if the noun is Pringle Chips:
		move Pringle Chips to Slime monster 3;
		move Game Key 4 to player;
		say "You throw the Chips at the Slime monster, and the vinegar is making him disintegrate. He drops the final key, and you take it."
		
The Credits is a room. "Mostly made by Caleb R. Wilson

Made with characters from Nickolodeon

Errors fixed by Joshua R. Wilson

Dedicated to Joshua R. Wilson for teaching Creator code

Tiana M. Wilson as Tester 1

Joshua R. Wilson as Tester 2

Made from inform 7 coding language

Recomended game by Joshua R. Wilson ( Daddy of Caleb R. Wilson ):
	Djinn on the rocks at Joshware.com"
	
Game Gate 4 is a door. It is east of The Credits, and west of Slime Boss 3. Game Gate 4 is locked.

Game Key 4 is in Locked Safe 4. It unlocks Game Gate 4.

Understand "squirt [something]" as squirting.  Squirting is an action applying to one thing.
	
Carry out squirting when the player is holding a squirt gun:
	if the noun is the evil robot:
		say "You are now squirting the evil robot. You save the neighborhood and get a gamer pass!";
	else:
		say "You teach [the noun] the meaning of soaked.";

Carry out squirting when the player is not holding a squirt gun:
	move gamer pass 2 to player;
	say "You can only squirt if you have a squirt gun, squirt.";
