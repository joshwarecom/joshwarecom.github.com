#!/usr/bin/env python3
import pyautogui
import math
import random
import time
import sys

for remaining in range(5, 0, -1):
    sys.stdout.write("\r")
    sys.stdout.write("{:2d} seconds remaining.".format(remaining))
    sys.stdout.flush()
    time.sleep(1)

# Radius
R = 100
# measuring screen size
(x,y) = pyautogui.size()
# locating center of the screen
(X,Y) = pyautogui.position(x/2,y/2)
# offsetting by radius
pyautogui.moveTo(X+R,Y)

i = 0
pyautogui.moveTo(X+R*math.cos(math.radians(i))+random.randint(-5,5),Y+R*math.sin(math.radians(i))+random.randint(-5,5))
pyautogui.mouseDown();
for i in range(360):
    # setting pace with a modulus
    #if i%6==0:
    pyautogui.moveTo(X+R*math.cos(math.radians(i))+random.randint(-5,5),Y+R*math.sin(math.radians(i))+random.randint(-5,5))
pyautogui.mouseUp();