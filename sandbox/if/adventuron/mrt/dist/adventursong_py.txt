import os, subprocess, base64, webbrowser;

top_script = """
	<script type="text/javascript">
		//@CEC utility functions
		function cecResetLoadSrc() {
			document.loadSrc = 0;
		}
		function cecLoadedFromAutosave() {
			document.loadSrc = 1;
		}
		function cecLoadedFromCommand() {
			document.loadSrc = 2;
		}
		function cecWasJustLoaded() {
			return (document.loadSrc != 0);
		}
		cecResetLoadSrc();
	</script>
""";

script_2 = """
    	//@CEC explicit load was called
	cecLoadedFromCommand();
""";

script_3 = """
	//@CEC implicit load from autosave
	cecLoadedFromAutosave();
""";

script_4 = """
	//@CEC new input ready for commands.  Inject init here if loaded.
	if (cecWasJustLoaded()) {
		var o = new Object();
		o.a = this;
		var cec_c = new Ove(o, "init music");
		Nve(cec_c);
		cecResetLoadSrc();
	}
""";

script_5 = """
	//@CEC reinitialize after first command
	cecResetLoadSrc();
""";

#print("Enter path to compiled game HTML file: ")
#game = input();
game = "game.html";

updated_data = "";

htmldata = open(f"{game}", "r").read()
updated_data += (htmldata[0:htmldata.index("<script")])
updated_data += top_script
updated_data += (htmldata[htmldata.index("<script"):])
htmldata = updated_data;
updated_data = "";

updated_data += (htmldata[0:htmldata.index("Rnb(this.a.a)")])
updated_data += script_2
updated_data += (htmldata[htmldata.index("Rnb(this.a.a)"):])
htmldata = updated_data;
updated_data = "";

updated_data += (htmldata[0:htmldata.index("Rnb(this.a.a.a.a.a.a)")])
updated_data += script_3
updated_data += (htmldata[htmldata.index("Rnb(this.a.a.a.a.a.a)"):])
htmldata = updated_data;
updated_data = "";

updated_data += (htmldata[0:htmldata.index("Rre('readyToAcceptNewInput()');")])
updated_data += script_4
updated_data += (htmldata[htmldata.index("Rre('readyToAcceptNewInput()');"):])
htmldata = updated_data;
updated_data = "";

updated_data += (htmldata[0:htmldata.index("g=b>0;")])
updated_data += script_5
updated_data += (htmldata[htmldata.index("g=b>0;"):])
htmldata = updated_data;

f = open(f"{game}.hacked.html", "w")
f.write(updated_data)
f.close()
