Master repository for ATC devops library with branches for individual contributors.

/testme.py
Description: quick script to test local python and edgeauth installation to get up and running with scripting the API.

/util.py
Description: library of helper functions for basic python functionality and API calls.

/commands.py
Description: library of python methods for calling arbitrary Akamai API endpoints.

/compile.sh
Description: use stickytape module to create a minimized single-file runnable build under dist/min-goatc.sh

/goatc.py
Description: main wrapper script for /commands.py, used to generate ATC tests cases stored as scripts in the Notes fied of the delivery configuration.

/gui.py
Description: gui module for point/click interface to this script, under construction.

/dist/min-goatc.py
Description: minimized runnable single-file version of goatc.py