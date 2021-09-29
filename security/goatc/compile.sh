#!/bin/bash
stickytape --copy-shebang goatc.py --add-python-module util --add-python-module gui --add-python-module commands > ./dist/min-goatc.py
chmod 777 ./dist/min-goatc.py

