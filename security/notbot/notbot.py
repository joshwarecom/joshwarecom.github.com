import pyautogui
import time
import sys
import random
from datetime import datetime
pyautogui.FAILSAFE = False
numMin = None

# enter coordinates and keystrokes used to interact with the form
# -1,-1 to click the mouse at the current position
# -1,+N to delay N ms
# "textstring" to pass keystrokes

#set entropy to True to introduce random variance into mouse paths and keystrokes
entropy_setting = True

#set loop to True to repeat the behaviors
loop_setting = False

#mouse pixel speed
speed_setting = 10

#set the coordinates for mouse movements, delays, clicks and keystrokes to simulate human behavior
click_map = [
    [700,700],
    [-1,-1],
    "Hello, Bot Countermeasure"
]

do_loop = True

pyautogui.moveTo(0,0)
while do_loop:
    do_loop = loop_setting
    entropy = entropy_setting
    speed = speed_setting
    pos_x = 0
    pos_y = 0
    for cm_entry in click_map:
        if (isinstance(cm_entry, str)):
            print(cm_entry)
            pyautogui.press(cm_entry)
            for ch in cm_entry:
                pyautogui.keyDown(ch)
                pyautogui.keyUp(ch)
        else:
            if cm_entry[0] == -1:
                if cm_entry[1] == -1:
                    pyautogui.leftClick()
                elif cm_entry[1] > 0:
                    time.sleep(cm_entry[1]/1000)
            else:
                while True:
                    if pos_x < cm_entry[0]:
                        pos_x = pos_x + speed
                    if pos_y < cm_entry[1]:
                        pos_y = pos_y + speed
                    if pos_x > cm_entry[0]:
                        speed = 1
                        pos_x = pos_x - speed
                        entropy = False
                    if pos_y > cm_entry[1]:
                        speed = 1
                        pos_y = pos_y - speed
                        entropy = False

                    if entropy:
                        pos_x += random.randint(-1, 1)*speed;
                        pos_y += random.randint(-1, 1)*speed;                    
                    
                    pyautogui.moveTo(pos_x,pos_y)
                    if pos_x == cm_entry[0]:
                        if pos_y == cm_entry[1]:
                            break