import os, subprocess, base64, webbrowser;

def die_python_die(error, msg, verbosity=-2):
	'''Throws exception with helpful error message and numeric exit code available to the shell'''
	try:
		raise Exception(msg)
	except:
		exc_type, exc_value, exc_traceback = sys.exc_info()
		traceback.print_exc(file=sys.stderr)
		sys.exit(error)

blorbdata = open(f"bin\\uoai.ulx", "rb").read()
blorbstring = base64.b64encode(blorbdata).decode();

dump = f"vorple.haven.setBase64StoryFile('{blorbstring}');";

f = open(f"bin\\uoai.ulx.js", "w")
f.write(dump)
f.close()