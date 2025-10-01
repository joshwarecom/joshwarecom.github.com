module.exports = {
    init: function(app, log_function, logger_object, shared_handler_data, package_json) {
        const { exec } = require("child_process");
        const main_package_json = shared_handler_data["main_package_json"];
        const master_onlineDate = new Date("Dec 11 2023 00:00:00 GMT+0000").getTime();
        const master_endDate = new Date("Dec 14 2023 00:00:00 GMT+0000").getTime();

        function i_am_online(req) {
            let my_nowDate = new Date().getTime();
            return (((master_onlineDate - my_nowDate) <= 0) || req.headers["online-s7gnb8po"] || req.headers["begun-s7gnb8po"] || main_package_json.config.mode_toggle);
        }

        function i_am_begun(req) {
            let my_nowDate = new Date().getTime();
            return (((master_endDate - my_nowDate) <=0) || req.headers["begun-s7gnb8po"]);
        }

        if (main_package_json.config.gate_ui) {
        app.get('/get_firewall_rules', (req, res) => {
            if (!i_am_online(req)) { res.status(400).send("System offline until 72 hours prior to start.  Patience is a virtue :)");}
            else {
            try {
                const wgg = req.cookies['wgg'];
                const authorized_hashes = shared_handler_data["authorized_hashes"];
                if (wgg in authorized_hashes) {
                    const uindex = authorized_hashes[wgg];
                    const authorized_users = shared_handler_data["authorized_users"];
                    const fwid = authorized_users[uindex]["fwid"];
                    const token = package_json.config.lat;
                    let output = null;
                    exec(`${package_json.config.base_directory}/http_handlers/war-gate/scripts/get-ip-list ${token} ${fwid}`, (error, stdout, stderr) => {
                        try {
                            if (stdout) {
                                res.status(200).send(stdout);
                            }
                        }
                        catch (e) {
                            res.status(500).send();
                        }
                    });
                }
                else {
                    res.status(401).send();
                }
            }
            catch (e) {
                log_function("ALERT! Recovered from unhandled error:", req, logger_object.error);
                log_function(e, req, logger_object.error);
            }
            }
        });
        app.add_test_curl(null, `-s -H "Cookie: wgg=badsession;" -v -o /dev/null 2>&1 | (egrep "< HTTP" || echo ABORT ABORT ABORT ABORT ABORT) | awk '{print $3}' | tr '\\n' ' ' | tr '\\r' ' ' | awk 'BEGIN { printf("\\033[97m") } {status="\\033[31mFAIL \\033[97m"; if ($1 == "ABORT") { status="\\033[35mFATAL\\033[97m" } else if ($1 == "401" || $1 == "403") { status="\\033[92mPASS \\033[97m";} print status ": TEST#1 Bad session disallowed.";}'`);
        app.add_test_curl(null, `-s -H "Cookie: wgg=fb24984a693317d803763f0ac0e4cb69f25680803ddaf190af396a6663773bfb;" -v -o /dev/null 2>&1 | (egrep "< HTTP" || echo ABORT ABORT ABORT ABORT ABORT) | awk '{print $3}' | tr '\\n' ' ' | tr '\\r' ' ' | awk 'BEGIN { printf("\\033[97m") } {status="\\033[31mFAIL \\033[97m"; if ($1 == "ABORT") { status="\\033[35mFATAL\\033[97m" } else if ($1 == "200") { status="\\033[92mPASS \\033[97m";} print status ": TEST#2 Got firewall IPs.";}'`);
        }

        if (main_package_json.config.gate_ui) {
        app.get('/welcome', (req, res) => {
            if (!i_am_online(req)) { res.status(400).send("System offline until 72 hours prior to start.  Patience is a virtue :)");}
            else {
            try {
            const authorized_hashes = shared_handler_data["authorized_hashes"];
            if (!req.cookies || !("wgg" in req.cookies)) {
                log_function("welcome error: user not logged in", req, logger_object.warn);
                res.status(403).send("Not logged in.");
            }
            else if (!(req.cookies["wgg"] in authorized_hashes)) {
                log_function("welcome error: invalid session: " + req.cookies["wgg"], req, logger_object.warn);
                res.status(403).send("Invalid session.");
            }
            else {
                const authorized_users = shared_handler_data["authorized_users"];
                const this_user = authorized_hashes[req.cookies["wgg"]];
                let id = authorized_users[this_user]["id"];
                let rctarget = authorized_users[this_user]["rctarget"];
                let rcschema = "http://";
                let ahtarget = authorized_users[this_user]["ahtarget"];
                let ahschema = "http://";
                let ahtarget_msg = ahschema + ahtarget;

                let endDate = new Date(master_endDate).getTime();
                let nowDate = new Date().getTime();
                let tDate = endDate - nowDate;
                if (!i_am_begun(req)) {
                    ahschema = "";
                    ahtarget="TO BE ANNOUNCED 12/14/2023 00:00:00 UTC!";
                    ahtarget_msg="TO BE ANNOUNCED 12/14/2023 00:00:00 UTC!";
                    rcschema = "";
                }

                let ip = req.headers["true-client-ip"];
                if (!ip) ip = req.ip;

                let activate_demo_mode = req.headers["demo-s7gnb8po"];

                console.log(activate_demo_mode);
                if (activate_demo_mode) activate_demo_mode = true;
                else activate_demo_mode = false;
                console.log(activate_demo_mode);

                const fwid = authorized_users[this_user]["fwid"];
                const token = package_json.config.lat;
                const rckey = authorized_users[this_user]["rckey"];

                let rc_full = rcschema + rctarget + "/target.html?key=" + rckey;
                if (rcschema == "") {
                    rc_full = "TO BE ANNOUNCED 12/14/2023 00:00:00 UTC!<br><br>Until then, you may practice on the sample target:<br>http://[UPDATE TO YOUR HOSTNAME HERE]/target.html?key=" + rckey;
                    //if (activate_demo_mode) rc_full = "TO BE ANNOUNCED 12/14/2023 00:00:00 UTC!<br><br>Until then, you may practice on the sample target:<br>[REDACTED FOR NOW]";
                }

                let sb_full = "https://[UPDATE TO YOUR HOSTNAME HERE]/";

                if (activate_demo_mode) {
                    ahschema = "http://";
                    if (ip.indexOf(":") >= 0) {
                        ahtarget = "[2600:3c05::f03c:94ff:fe79:1f61]:3010/form.html";
                    }
                    else {
                        ahtarget = "172.233.201.32:3010/form.html";
                    }
                    ahtarget_msg="This demo uses a simulated target, the real one will be published later.";
                }

                let hack_str = "Hack the Target!";

                let welcome_text =
`
<!DOCTYPE html>
<html>
	<head>
		<title>Akamai War Gate</title>
		<script src="/lib/util.js"></script>
		<script>
			let v_status = null;
			let v_error = true;
			try {
			let v_status = headURL("[UPDATE TO YOUR HOSTNAME HERE]");
			if (v_status) v_status = v_status.status;
			v_error = (v_status != 200);
			} catch(e) { }
        </script>
		<style>
		div.scroll {
			 background-color: white;
			 overflow-x: hidden;
			 overflow-y: auto;
			 text-align:justify;
		}
		.center {
			 position: absolute;
			 display: flex;
			 justify-content: center;
			 align-items: center;
		}
		.content {
			 position: absolute;
			 left: 50%;
			 top: 50%;
			 -webkit-transform: translate(-50%, -50%);
			 transform: translate(-50%, -50%);
		}
		</style>
	</head>
	<body style="background-color: black;">
	    <center>
		<div class="" style="width: 800px; height: 700px; text-align: center; background-size: contain; background-color: black;" id="welcome-div">
        </div>
		<script>
            innerHTML =
\`
			<div style="width: 800px; text-align: left; background-color: #000000; padding: 10px; color: limegreen; border-style: solid; border-color: blue;">
                <center>Welcome <b>${id}</b> to the War Gate</center><hr>
                <table style="width: 100%; border-color: blue;" cellpadding=0 cellspacing=0 border=1><tr><td>
                <table style="width: 100%;" cellpadding=0 cellspacing=0>
                    <tr><td colspan="2"><h2 style="color: white;">1. APP HACKING PARTICIPANTS:<br><i>Register your IP here, then click "${hack_str}"</i></h2></td></tr>
                    <tr><td colspan="2">
                    @WARNING
                    </td></tr>
                    <tr><td height="16px"></td><td></td></tr>
                    <tr><td>Registered App Hacking IPs:<br><font size="-1" style="color: cyan;">@USED</font></td><td><b><font style="color: yellow;"><span id='confirmed_ip_list'>@IP_LIST</span></font></b></td></tr>
                    <tr><td colspan="2"><br></td></tr>
                    <tr><td width="200px">Target host:</td><td><b><font style="color: yellow;">${ahtarget_msg}</font></b></td></tr>
                    <tr><td height="16px"></td><td></td></tr>
                    <tr><td colspan="2"></td></tr>
                    <table style="width: 100%;" cellpadding=0 cellspacing=0 border=0><tr>
                    <td><center><input type="button" value="Register My IP" name="op" id="rmi" onclick="if (document.addip_ah) {document.getElementById('spinner').style.display=''; this.setAttribute('disabled','true'); document.addip_ah.submit();}"></center></td><td><center><input type="button" value="Remove My IP" name="op" id="vmi" onclick="if (document.remip_ah) {document.getElementById('spinner').style.display=''; this.setAttribute('disabled','true'); document.remip_ah.submit();}"></center></td><td><center><input type="button" value="Remove Other IP" name="op" id="vmi2" onclick="ipc = prompt('Enter the IP you wish to remove:'); if (!ipc) return; sp = document.getElementById('confirmed_ip_list').innerHTML; if (!(sp.indexOf(ipc) >= 0)) { alert('That IP is not on the list and so cannot be removed.'); return;} else if (sp == ipc) { alert('You may not remove the last IP on the list.'); return;} if (!ipc || ipc == '') { alert('Invalid response, no IP removed.'); return false;} if (document.remip_ah2) {document.getElementById('spinner').style.display=''; this.setAttribute('disabled','true'); set_ip(ipc); document.remip_ah2.submit();}"></center></td><td><center><input type="button" value="${hack_str}" name="op" onclick="window.open('http://${ahtarget}');" id="htt"></center></td>
                    </tr>
                    <tr><td height="16px"></td><td></td></tr>
                    </table>
                    </table>
                </table>
                </td></tr></table>
                <table style="width: 100%; border-color: blue;" cellpadding=0 cellspacing=0 border=1><tr><td>
                <table style="width: 100%;" cellpadding=0 cellspacing=0 id="rc_interface">
                    <tr><td colspan="2"><h2 style="color: white;">2. ATTACKERS:<br><i>Add and remove your Attack IPs here throughout the exercse as needed.<br><font size="+0">Only current Simulated Attack IPs can be used to send Attack traffic.  Others will be proactively blocked.</font></i></h2></td></tr>
                    <tr><td>Rate Combat Attack IPs:</td><td><b><font style="color: cyan;">@RC_USED</font></b></td></tr>
                    <tr><td height="16px"></td><td><font style="color: white;"><i>To see the IPs click 'View &amp; Remove Rate Combat IPs' below.</i></font></td></tr>
                    <tr><td colspan="2">Rate Combat Target:</td></tr>
                    <tr><td colspan="2"><b><font style="color: yellow;" size="-1">${rc_full}</font></b></td></tr>
                    <tr><td height="16px"></td><td></td></tr>
                    </td>
                    </tr>
                    <tr><td colspan="2"><br></td></tr>
                    <tr><td colspan="2">
                    <table style="width: 100%;" cellpadding=0 cellspacing=0 border=0><tr>
                    <td>
                    <center>
                    <input type="button" value="Add Rate Combat IPs" name="op" onclick="openCenteredWindow('/rcips?add');">
                    </center></td>
                    <td><center>
                    <input type="button" value='View &amp; Remove Rate Combat IPs' name="vrc" id="vrc" onclick="openCenteredWindow('/rcips');">
                    </center>
                    </td>
                    </tr></table>
                    <tr><td colspan="2">NOTE: It takes about 10 seconds after acknowledgement for the changes to propagate.</td></tr>
                    <tr><td colspan="2"><br></td></tr>
                    </table>
                </table>

                <table style="width: 100%; display: none;" cellpadding=0 cellspacing=0 id="rc_alternative">
                    <tr><td colspan="2"><h2 style="color: white;">2. RATE COMBAT PARTICIPANTS:<br><i><br>PLEASE READ! Rate Combat IP Management appears to be offline.  Most likely, this is expected and Rate Combat continues as planned!<br><br>Check the Live Support Chat for an official announcement to make sure this is expected.<br><br>Go ahead proceed with Rate Combat using the systems you have at your disposal, just make sure you follow the <a href="https://ac-aloha.akamai.com/home/rate-combat-rules-of-engagement">Rules of Engagement</a><br><br>If there has been no official announcement that this function that Rate Combat IP Management is offline, raise the issue on the Live Support chat please :)</i></h2></td></tr>
                </table>

                <table style="width: 100%; border-color: blue;" cellpadding=0 cellspacing=0 border=1><tr><td>
                <table style="width: 100%;" cellpadding=0 cellspacing=0>
                    <tr><td colspan="2"><h2 style="color: white;">3. SCORE BOARD: <a style="color: white;" href="${sb_full}">${sb_full}</a></h2></td></tr>
                    </table>
                </table>

                </td></tr></table>
                <br>
                <center>
                    <input type="button" value="Log Out" name="op" onclick="if (document.access) {document.getElementById('spinner').style.display=''; document.access.submit();}">
                </center>
            </div>
            <div id="spinner" class="center content" style="border-color: blue; border: 1px; border-style: solid; display: none; width: 325px; height: 325px; position: absolute; color: white; background-color: white; background-size: cover; background-image: url(data:image/webp;base64,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);">
               Processing...<br><br><br><br><br><br>
            </div>
            <div id="report" class="center content" style="display: none; width: 625px; height: 525px; position: absolute; background-color: orange; text-align: center; border: 4px solid black;"></div>
            <iframe id="welcome-forms" style="display: none;" onload="document.getElementById('spinner').style.display='none'; document.report();"></iframe>
\`;
            document.getElementById('welcome-div').innerHTML = innerHTML;

            if (v_error) {
                document.getElementById("rc_interface").style.display = "none";
                document.getElementById("rc_alternative").style.display = "";
            }

            var iframe = document.getElementById("welcome-forms");
            var doc; if(iframe.contentDocument) { doc = iframe.contentDocument;} else { doc = iframe.contentWindow.document;}
            doc.body.innerHTML = "<form action='/addip_ah' method='POST' id='addip_ah'><input type='submit' value='Register My IP' name='op' id='rmi'></form><form action='/remip_ah' method='POST' id='remip_ah'><input type='submit' value='Remove My IP' name='op' id='vmi'></form><form action='/remip_ah' method='POST' id='remip_ah2'><input type='submit' value='Remove Other IP' name='op' id='vmi2'><input type='hidden' value='' name='ip' id='ip'></form><form action='/access' method='POST' id='access'><input type='hidden' value='Log Out' name='op'></form>";
            document.report = function() {
                let iframe2 = document.getElementById("welcome-forms");
                let doc2 = null; if(iframe2.contentDocument) { doc2 = iframe2.contentDocument;} else { doc2 = iframe2.contentWindow.document;}
                if (doc2.body.innerHTML && doc2.body.innerHTML != "") {
                    nextp = (doc2.body.innerHTML.indexOf("Logout successful") >= 0) ? "" : "welcome";
                    document.getElementById("report").innerHTML = "<span>" + doc2.body.innerHTML + "<br><br><input type='button' value='OK' onclick='window.location = \\"/" + nextp + "\\";'></span>";
                    document.getElementById("report").style.display = "";
                }
            };
            document.addip_ah = doc.getElementById('addip_ah');
            document.remip_ah = doc.getElementById('remip_ah');
            document.remip_ah2 = doc.getElementById('remip_ah2');
            document.access = doc.getElementById('access');

            function set_ip(val) {
                var iframe3 = document.getElementById("welcome-forms");
                var doc3; if(iframe3.contentDocument) { doc3 = iframe3.contentDocument;} else { doc3 = iframe3.contentWindow.document;}
                doc3.getElementById('ip').value = val;
            }
            //@UPDATE_BUTTONS
            //@UPDATE_CD
        </script>
        </center>
	</body>
</html>
`
                exec(`${package_json.config.base_directory}/http_handlers/war-gate/scripts/get-ip-list ${token} ${fwid}`, (error, stdout, stderr) => {
                    try {
                        if (stdout) {
                            let ip_list = JSON.parse(stdout)["inbound"];
                            let ip_str = "NO IPS AUTHORIZED YET";
                            let v4 = null;
                            let v6 = null;
                            let complete_list = [];
                            try { v4 = ip_list[0]["addresses"]["ipv4"]} catch (e) { }
                            try { v6 = ip_list[0]["addresses"]["ipv6"]} catch (e) { }
                            if (v4 || v6) ip_str = "";
                            if (v4) {
                                for (let iii = 0; iii < v4.length; iii++) {
                                    if (ip_str != "") ip_str = ip_str + " | ";
                                    complete_list.push(v4[iii].split("/32")[0]);
                                    ip_str = ip_str + v4[iii].split("/32")[0];
                                }
                            }
                            if (v6) {
                                for (let iii = 0; iii < v6.length; iii++) {
                                    if (ip_str != "") ip_str = ip_str + " | ";
                                    complete_list.push(v6[iii].split("/128")[0]);
                                    ip_str = ip_str + v6[iii].split("/128")[0];
                                }
                            }

                            let g_allowed_total_count = 10;
                            welcome_text = welcome_text.replace("@USED","(" + (g_allowed_total_count - complete_list.length) + "/" + g_allowed_total_count + " AVAILABLE)");

                            welcome_text = welcome_text.replace("@IP_LIST",ip_str);
                            let tmp_clean_ip = ip;
                            console.log(tmp_clean_ip);
                            if (tmp_clean_ip.indexOf("::ffff:") == 0) {
                                tmp_clean_ip = ip.substr(7);
                                console.log(tmp_clean_ip);
                                if (tmp_clean_ip.indexOf(".") >= 0) {
                                    console.log(tmp_clean_ip);
                                    if (tmp_clean_ip.indexOf(":") >= 0) {
                                        tmp_clean_ip = ip;
                                        console.log(tmp_clean_ip);
                                    }
                                }
                            }
                            if (complete_list.indexOf(tmp_clean_ip) >= 0) {
                                welcome_text = welcome_text.replace("@WARNING","");
                                welcome_text = welcome_text.replace("//@UPDATE_BUTTONS",
`
document.getElementById("rmi").style.display = "none";
`);

                            }
                            else {
                                welcome_text = welcome_text.replace("@WARNING",
`
<br><font style="color: red;">YOUR CLIENT IP (<b><font style="color: yellow;">${tmp_clean_ip}</font></b>) IS NOT ON THE AUTHORIZED IP LIST.</font><br>
<font style="color: yellow;">You must register it before you can ${hack_str}</font>
`);

                                welcome_text = welcome_text.replace("//@UPDATE_BUTTONS",
`
document.getElementById("vmi").style.display = "none";
document.getElementById("htt").setAttribute("disabled","true");
`);

                            }

                            const my_attacker_hashes = authorized_users[this_user]["rc_attacker_hashes"];
                            let ip_len = Object.keys(my_attacker_hashes).length;
                            welcome_text = welcome_text.replace("@RC_USED","(" + (256 - ip_len) + "/256 AVAILABLE)");

                            if (ahschema == "" && !activate_demo_mode) {
                                welcome_text = welcome_text.replace("//@UPDATE_CD",
`
document.getElementById("htt").setAttribute("disabled","true");
`);
                            }

                            res.status(200).send(welcome_text);
                        }
                    }
                    catch (e) {
                        welcome_text = welcome_text.replace("@IP_LIST","ERROR RETRIEVING IP LIST");
                        welcome_text = welcome_text.replace("@WARNING","");
                        welcome_text = welcome_text.replace("@USED","");
                        welcome_text = welcome_text.replace("@RC_USED","");
                        welcome_text = welcome_text.replace("//@UPDATE_BUTTONS","");
                        res.status(500).send(welcome_text);
                    }
                });
            }
            }
            catch (e) {
                log_function("ALERT! Recovered from unhandled error:", req, logger_object.error);
                log_function(e, req, logger_object.error);
            }
            }
        });
        }
        app.add_test_curl(null, `-s -H "NoCookie: wgg=badsession;" -v -o /dev/null 2>&1 | (egrep "< HTTP" || echo ABORT ABORT ABORT ABORT ABORT) | awk '{print $3}' | tr '\\n' ' ' | tr '\\r' ' ' | awk 'BEGIN { printf("\\033[97m") } {status="\\033[31mFAIL \\033[97m"; if ($1 == "ABORT") { status="\\033[35mFATAL\\033[97m" } else if ($1 == "403") { status="\\033[92mPASS \\033[97m";} print status ": TEST#3 /welcome denied with no wgg cookie.";}'`);
        app.add_test_curl(null, `-s -H "Cookie: wgg=badsession;" -v -o /dev/null 2>&1 | (egrep "< HTTP" || echo ABORT ABORT ABORT ABORT ABORT) | awk '{print $3}' | tr '\\n' ' ' | tr '\\r' ' ' | awk 'BEGIN { printf("\\033[97m") } {status="\\033[31mFAIL \\033[97m"; if ($1 == "ABORT") { status="\\033[35mFATAL\\033[97m" } else if ($1 == "403") { status="\\033[92mPASS \\033[97m";} print status ": TEST#4 /welcome denied with bad wgg cookie.";}'`);
        app.add_test_curl(null, `-s -H "Cookie: wgg=fb24984a693317d803763f0ac0e4cb69f25680803ddaf190af396a6663773bfb;" -v -o /dev/null 2>&1 | (egrep "< HTTP" || echo ABORT ABORT ABORT ABORT ABORT) | awk '{print $3}' | tr '\\n' ' ' | tr '\\r' ' ' | awk 'BEGIN { printf("\\033[97m") } {status="\\033[31mFAIL \\033[97m"; if ($1 == "ABORT") { status="\\033[35mFATAL\\033[97m" } else if ($1 == "200") { status="\\033[92mPASS \\033[97m";} print status ": TEST#5 /welcome successful with good wgg session.";}'`);

        if (main_package_json.config.gate_ui) {
        app.get('/rcips', (req, res) => {
            if (!i_am_online(req)) { res.status(400).send("System offline until 72 hours prior to start.  Patience is a virtue :)");}
            else {
            try {
            const authorized_hashes = shared_handler_data["authorized_hashes"];
            if (!req.cookies || !("wgg" in req.cookies)) {
                log_function("view error: user not logged in", req, logger_object.warn);
                res.status(403).send("Not logged in.");
            }
            else if (!(req.cookies["wgg"] in authorized_hashes)) {
                log_function("view error: invalid session: " + req.cookies["wgg"], req, logger_object.warn);
                res.status(403).send("Invalid session.");
            }
            else {
            let qs = req.url.substr(req.url.indexOf("?")+1);
            const authorized_users = shared_handler_data["authorized_users"];
            const this_user = authorized_hashes[req.cookies["wgg"]];
            const rc_ips = authorized_users[this_user]["rc_attacker_hashes"];
            const rc_lock = authorized_users[this_user]["rc_lock"];
            let welcome_text = '';
            if (qs == 'show') {
                if (rc_lock) {
                    welcome_text =
`
<!DOCTYPE html>
<html>
    <head>
        <title>War Gate - Processing Attacker IPs</title>
    </head>
    <body>
        <div id="content"></div>
        <script id="data" type="application/json">@IP_DATA</script>
        <script>
            document.data = JSON.parse(document.getElementById('data').textContent);
            k = Object.keys(document.data);
            /*
            let content = "<table style='width: 100%; border-style: solid; border-color: black; border: 1px;' ><tr><td>IP Candidate</td><td>Timestamp</td><td>Accepted?</td><td>Rejected?</td><td>Message</td><td>Status</td></tr>";
            let completed = 0;
            let rejects = "";
            for (let i = 0; i < k.length; i++) {
                let timestamp = "<img width='32' height='32' src='/img/ellipsis.gif'>";
                let accepted = "<img width='32' height='32' src='/img/ellipsis.gif'>";
                let rejected = "<img width='32' height='32' src='/img/ellipsis.gif'>";
                let status = "<img width='32' height='32' src='/img/ellipsis.gif'>";
                let msg = "<img width='32' height='32' src='/img/ellipsis.gif'>";
                if (document.data[k[i]]["accepted"] == false || document.data[k[i]]["accepted"] == true) accepted = ""+document.data[k[i]]["accepted"];
                if (document.data[k[i]]["rejected"] == false || document.data[k[i]]["rejected"] == true) rejected = ""+document.data[k[i]]["rejected"];
                if (document.data[k[i]]["status"] != null) status = ""+document.data[k[i]]["status"];
                if (document.data[k[i]]["msg"] != null) msg = ""+document.data[k[i]]["msg"];
                content = content + "<tr><td>" + k[i] + "</td><td>" + timestamp + "</td><td>" + accepted + "</td><td>" + rejected + "</td><td>" + msg + "</td><td>" + status + "</td></tr>";
                if (document.data[k[i]]["accepted"] == true || document.data[k[i]]["rejected"] == true) completed = completed + 1;
                else {
                    rejects = rejects + document.data[k[i]]["accepted"] + " / " + document.data[k[i]]["rejected"] + ";";
                }
            }
            content  = content + "</table><br><br>" + completed + "/" + k.length + "<br>rejects:" + rejects;
            */
            let content = "Processed IPs:<br>";
            let pending = "Pending IPs:<br>";
            let completed = 0;
            let pending_count = 0;
            for (let i = 0; i < k.length; i++) {
                if (document.data[k[i]]["accepted"] == true)
                    content = content + "<span style='background-color: PaleGreen;'>" + k[i] + " " + document.data[k[i]]["status"] + "</span> ";
                else if (document.data[k[i]]["rejected"] == true)
                    content = content + "<span style='background-color: LightPink;'>" + k[i] + " " + document.data[k[i]]["status"] + ":" + document.data[k[i]]["msg"] + "</span> ";
                else {
                    pending = pending + "<span style='background-color: Gainsboro;'>" + k[i] + "</span> ";
                    pending_count = pending_count + 1;
                }
                if (document.data[k[i]]["accepted"] == true || document.data[k[i]]["rejected"] == true) completed = completed + 1;
            }

            if (completed != k.length) {
                content = content + "<br><br>Refreshing in 1 second.";
                setTimeout(function () {
                    window.location = '/rcips?show';
                }, 1000);
            }
            else {
                content = content + "<br><br>All done!<br><form action='/rcack' method='POST'><input type='submit' name='op' value='Acknowledge!'></form>";
            }
            if (pending_count > 0) content = pending + "<br><br>" + content;
            document.getElementById("content").innerHTML = content;
        </script>
    </body>
</html>
`;
                    welcome_text = welcome_text.replace("@IP_DATA",JSON.stringify(rc_lock));
                    res.status(200).send(welcome_text);
                }
                else {
                    res.status(200).send("No add or remove operations are currently being processed.");
                }
            }
            else if (qs == 'add') {
                if (rc_lock) {
                    welcome_text =
`
Another add or remove operation is underway.  Try again later.<br><br><a href="/rcips?show">View the status of the current operation.</a><br><br>
`;
                    res.status(401).send(welcome_text);
                }
                else {
                welcome_text =
`
<!DOCTYPE html>
<html>
	<head>
		<title>War Gate - Adding Attacker IPs</title>
		<script src="/lib/util.js"></script>
		<script src="/lib/ipaddr.min.js"></script>
		<script>
		    function submitRateControlIPs() {
		        ips = document.getElementById('iplist').value.trim();
		        ips = ips.replaceAll("\\n"," ").trim();
		        while (ips.indexOf("  ") >= 0) ips = ips.replaceAll("  "," ");

		        total_len = @CURRENT_LEN;
		        check = ips.split(' ');
		        abort = false;
		        if (!check) {
		            alert('An error occurred and the IPs cannot be added.');
		            abort = true;
		        }
                else if (check.length > 16) {
                    alert('Too many IPs requested, you may authorize 16 IPs at a time.');
                    abort = true;
                }
		        else if (((check.length)+(total_len))>256) {
		            if (total_len > 0) {
		                alert('Too many IPs! There are already ' + total_len + ' registered, you may add ' + (256-total_len) + ' more.');
		                abort = true;
		            }
		            else {
		                alert('Too many IPs! You may not add more than 256.');
                        abort = true;
                    }
		        }
		        else if (!(/^[0-9\\.\\:A-F ]+$/.test(ips.toUpperCase()))) {
                    alert('That is not a space delimited list of only public valid individual IPv4 and IPv6 addresses.  Fix it please before continuing.');
                    abort = true;
		        }
		        else {
		            for (let i = 0; i < check.length; i++) {
		                tip = check[i].toUpperCase();
                        if (/^\\:\\:ffff\\:((25[0-5]|(2[0-4]|1\\d|[1-9]|)\\d)\\.?\\b){4}$/.test(tip)) {
                            tip = tip.replace("::ffff:","");
                        }
                        if (!ipaddr.isValid(tip) && !isIp(tip)) {
                            alert('That is not a space delimited list of only public valid individual IPv4 and IPv6 addresses.  Fix it please before continuing.');
                            abort = true;
                            break;
                        }
                        else if (isIp4InCidrs(tip, ['10.0.0.0/8','172.16.0.0/12','192.168.0.0/16'])) {
                            alert('That is not a space delimited list of only public valid individual IPv4 and IPv6 addresses.  Fix it please before continuing.');
                            abort = true;
                            break;
                        }
                        else {
                            try {
                                let range = ipaddr.parse("fc00::");
                                let addr = ipaddr.parse(tip);
                                if (tip.indexOf(":") >= 0 && addr.match(range, 7)) {
                                    alert('That is not a space delimited list of only public valid individual IPv4 and IPv6 addresses.  Fix it please before continuing.');
                                    abort = true;
                                    break;
                                }
                                else {
                                    range = ipaddr.parse("fec0::");
                                    if (tip.indexOf(":") >= 0 && addr.match(range, 10)) {
                                        alert('That is not a space delimited list of only public valid individual IPv4 and IPv6 addresses.  Fix it please before continuing.');
                                        abort = true;
                                        break;
                                    }
                                }
                            } catch (e) {
                                alert(e + 'That is not a space delimited list of only public valid individual IPv4 and IPv6 addresses.  Fix it please before continuing.');
                                abort = true;
                                break;
                            }
                        }
                        try { tip=ipaddr.parse(tip).toString(); check[i] = tip;} catch(e) {}
		            }
		        }
		        if (!abort) {
		            if ((check.filter((currentValue, currentIndex) => check.indexOf(currentValue) !== currentIndex)).length > 0) {
		                alert("There are duplicate IPs in this list.  Remove duplicates before continuing.");
		                abort = true;
		            }
		            else {
                        ip_str = "";
                        for (let i = 0; i < check.length; i++) {
                            if (i > 0) ip_str = ip_str + " ";
                            ip_str = ip_str + check[i];
                        }
                        document.getElementById('iplist').value = ip_str;
                        f = document.getElementById("rcips");
                        d = document.getElementById("ips");
                        d.value = ip_str;
                        f.submit();
		            }
		        }
		    }
		</script>
	</head>
<body>
Paste a space-delimited list of IPs which follow the guidelines below into this text area:<br>
<textarea id='iplist' name='iplist' style="width: 100%; height: 256px;">
</textarea>
<input type='button' value='Submit' onclick='submitRateControlIPs();'>
<br><br>
Guidelines:<br>
1. Only individual public IPv4 or IPv6 IPs are permitted; no CIDR blocks, subnet masks or private addresses allowed.<br>
2. No IPs of Akamai Edge Servers.  Using these is against the Rules of Engagement.<br>
3. To help maintain compliance with #2 above, any IP with a WHOIS NetName of "AKAMAI" is not allowed and will be rejected.<br>
4. Submit a given IP only once.<br>
5. Previous submissions must finished being processed, and must be acknowledged via the 'Acknowledge!' button, before more requests can be submitted.<br>
6. A maximum of 256 IPs total are allowed to be authorized, and 16 may be registered at a time.  To use different IPs, you must rotate out old ones if all 256 slots are being used.<br><br>
<form action="/rcips" method="POST" id="rcips"><input type="hidden" name="ips" id="ips"><input type="hidden" name="op" id="rcop" value="add"></form>
</body>
</html>
`;
                k = Object.keys(rc_ips);
                welcome_text = welcome_text.replace("@CURRENT_LEN",k.length)
                res.status(200).send(welcome_text);
            }
            }
            else {
                if (rc_lock) {
                    welcome_text =
`
Another add or remove operation is underway.  Try again later.<br><br><a href="/rcips?show">View the status of the current operation.</a><br><br>
`;
                    res.status(401).send(welcome_text);
                }
                else {
                    welcome_text =
    `
    <!DOCTYPE html>
    <html>
        <head>
            <title>War Gate</title>
            <script>
            function checkAll() {
                cb = document.getElementsByTagName('input');
                tmp = [];
                if (cb) {
                    for (let i = 0; i < cb.length; i++) {
                        if (cb[i].type == 'checkbox') tmp.push(cb[i]);
                    }
                    cb = tmp;
                }
                if (cb && cb.length > 0) {
                    if (cb[0].checked) {
                        for (let i = 0; i < cb.length; i++) {
                            cb[i].checked = false;
                        }
                    }
                    else {
                        for (let i = 0; i < cb.length; i++) {
                            cb[i].checked = true;
                        }
                    }
                }
            }

            function removeSelected() {
                cb = document.getElementsByTagName('input');
                tmp = [];
                if (cb) {
                    for (let i = 0; i < cb.length; i++) {
                        if (cb[i].type == 'checkbox') tmp.push(cb[i]);
                    }
                    cb = tmp;
                }
                data = "";
                if (cb && cb.length > 0) {
                    for (let i = 0; i < cb.length; i++) {
                        if (cb[i].checked) data = data + cb[i].name + " ";
                    }
                }
                data = data.trim();
                if (data == "") {
                    alert("No IPs selected!");
                }
                else {
                    document.getElementById('ips').value = data;
                    document.getElementById('remips').submit();
                }
            }
            </script>
        </head>
        <body>
            @RC_IP_LIST
            <form action='/rcips' method='POST' id='remips'><input type='hidden' name='ips' id='ips' value=''><input type='hidden' name='op' id='op' value='remove'></form>
        </body>
    </html>
    `;
                    let ip_str = "<table style='width: 100%;'><tr>";
                    k = Object.keys(rc_ips);
                    for (let qi = 0; qi < k.length; qi++) {
                        ip_str = ip_str + "<td><input type='checkbox' name='" + rc_ips[k[qi]][0] + "' id='"+ rc_ips[k[qi]][0] + "'> " + rc_ips[k[qi]][0] + "</td>";
                        if (((qi+1) % 3) == 0) {
                            ip_str = ip_str + "</tr><tr>";
                        }
                    }
                    ip_str = ip_str + "</tr><tr><td colspan='3'><input type='button' onclick='checkAll();' value='Select/Unselect All'> <input type='button' onclick='removeSelected();' value='Remove Selected IPs from Rate Combat'></td></tr></table>";
                    if (k.length == 0) ip_str = "You have not authorized any IPs for rate combat.  Use the 'Add Rate Combat IPs' function to add them.";
                    welcome_text = welcome_text.replace("@RC_IP_LIST",ip_str);
                    res.status(200).send(welcome_text);
                }
                }
        }
        }
        catch (e) {
            log_function("ALERT! Recovered from unhandled error:", req, logger_object.error);
            log_function(e, req, logger_object.error);
        }
        }
        })
        }
        app.add_test_curl(null, `-s -H "NoCookie: wgg=badsession;" -v -o /dev/null 2>&1 | (egrep "< HTTP" || echo ABORT ABORT ABORT ABORT ABORT) | awk '{print $3}' | tr '\\n' ' ' | tr '\\r' ' ' | awk 'BEGIN { printf("\\033[97m") } {status="\\033[31mFAIL \\033[97m"; if ($1 == "ABORT") { status="\\033[35mFATAL\\033[97m" } else if ($1 == "403") { status="\\033[92mPASS \\033[97m";} print status ": TEST#6 /rcips denied with no wgg cookie.";}'`);
        app.add_test_curl(null, `-s -H "Cookie: wgg=badsession;" -v -o /dev/null 2>&1 | (egrep "< HTTP" || echo ABORT ABORT ABORT ABORT ABORT) | awk '{print $3}' | tr '\\n' ' ' | tr '\\r' ' ' | awk 'BEGIN { printf("\\033[97m") } {status="\\033[31mFAIL \\033[97m"; if ($1 == "ABORT") { status="\\033[35mFATAL\\033[97m" } else if ($1 == "403") { status="\\033[92mPASS \\033[97m";} print status ": TEST#7 /rcips denied with bad wgg cookie.";}'`);
        app.add_test_curl("show", `-s -H "Cookie: wgg=fb24984a693317d803763f0ac0e4cb69f25680803ddaf190af396a6663773bfb;" -v -o /dev/null 2>&1 | (egrep "< HTTP" || echo ABORT ABORT ABORT ABORT ABORT) | awk '{print $3}' | tr '\\n' ' ' | tr '\\r' ' ' | awk 'BEGIN { printf("\\033[97m") } {status="\\033[31mFAIL \\033[97m"; if ($1 == "ABORT") { status="\\033[35mFATAL\\033[97m" } else if ($1 == "200") { status="\\033[92mPASS \\033[97m";} print status ": TEST#8 /rcips?show operation successful with good wgg session.";}'`);
        app.add_test_curl("add", `-s -H "Cookie: wgg=fb24984a693317d803763f0ac0e4cb69f25680803ddaf190af396a6663773bfb;" -v -o /dev/null 2>&1 | (egrep "< HTTP" || echo ABORT ABORT ABORT ABORT ABORT) | awk '{print $3}' | tr '\\n' ' ' | tr '\\r' ' ' | awk 'BEGIN { printf("\\033[97m") } {status="\\033[31mFAIL \\033[97m"; if ($1 == "ABORT") { status="\\033[35mFATAL\\033[97m" } else if ($1 == "200") { status="\\033[92mPASS \\033[97m";} print status ": TEST#9 /rcips?add operation successful with good wgg session.";}'`);

        if (main_package_json.config.rc_auth) {
        app.get('/auth/*', (req, res) => {
            try {
                const attacker_hashes = shared_handler_data["global_attacker_hashes"];
                attacker_hash = req["params"]['0'];
                if (attacker_hash in attacker_hashes) {
                    res.status(200).send();
                }
                else throw new Error("Unauthorized hash " + attacker_hash);
            } catch(e) {
                res.status(410).send();}
        })
        }
        app.add_test_curl(null, `-s -v -o /dev/null 2>&1 | (egrep "< HTTP" || echo ABORT ABORT ABORT ABORT ABORT) | awk '{print $3}' | tr '\\n' ' ' | tr '\\r' ' ' | awk 'BEGIN { printf("\\033[97m") } {status="\\033[31mFAIL \\033[97m"; if ($1 == "ABORT") { status="\\033[35mFATAL\\033[97m" } else if ($1 == "403") { status="\\033[92mPASS \\033[97m";} print status ": TEST#10 /auth/* 410 response";}'`);
    }
};