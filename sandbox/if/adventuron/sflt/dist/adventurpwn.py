import os, subprocess, base64, webbrowser;

top_script = """
	<script type="text/javascript">
		document.loadInitialized = false;
	</script>
""";

script_1 = """
	//@CEC new input ready for commands.  Inject loadf init here.
	if (document.loadInitialized == false) {
		document.loadInitialized = true;
		var o = new Object();
		o.a = this;		
		var cec_c = new Ove(o, "LOADF");
		Nve(cec_c);				
	}
""";

script_2 = "{Llb(b.b,d,true);/*@CEC commenting this out prevents the game from hanging, maybe introduces issues elsewhere but it's a start! r.Md(false,true);pb.a=false;Snb(b.b);break */}";

game = "game.html";

updated_data = "";

htmldata = open(f"{game}", "r").read()
updated_data += (htmldata[0:htmldata.index("<script")])
updated_data += top_script
updated_data += (htmldata[htmldata.index("<script"):])
htmldata = updated_data;
updated_data = "";

updated_data += (htmldata[0:htmldata.index("Rre('readyToAcceptNewInput()');")])
updated_data += script_1
updated_data += (htmldata[htmldata.index("Rre('readyToAcceptNewInput()');"):])
htmldata = updated_data;

updated_data = htmldata.replace("{Llb(b.b,d,true);r.Md(false,true);pb.a=false;Snb(b.b);break}",script_2);
htmldata = updated_data;

f = open(f"{game}.modified.html", "w")
f.write(updated_data)
f.close()
