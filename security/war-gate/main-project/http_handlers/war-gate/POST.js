module.exports = {
    init: function(app, log_function, logger_object, shared_handler_data, package_json) {
        const fs = require('fs')
        const ipaddr = require('ipaddr.js');
        const net = require('net');
        const whois = require('whois')
        const https = require('https')
        const { exec } = require("child_process");
        const { spawn } = require("child_process");
        const blocklist = new net.BlockList();
        const main_package_json = shared_handler_data["main_package_json"];
        const ratecombat_db = shared_handler_data["ratecombat_db"];

        const master_onlineDate = new Date("Dec 11 2023 00:00:00 GMT+0000").getTime();
        const master_endDate = new Date("Dec 14 2023 00:00:00 GMT+0000").getTime();

        function i_am_online(req) {
            let my_nowDate = new Date().getTime();
            return (((master_onlineDate - my_nowDate) <= 0) || req.headers["online-s7gnb8po"] || req.headers["begun-s7gnb8po"] || main_package_json.config.mode_toggle);
        }

        function i_am_begun(req) {
            let my_nowDate = new Date().getTime();
            return (((master_endDate - my_nowDate) <= 0) || req.headers["begun-s7gnb8po"]);
        }

        blocklist.addRange("172.16.0.0","172.31.255.255");
        blocklist.addRange("10.0.0.0","10.255.255.255");
        blocklist.addRange("192.168.0.0","192.168.255.255");
        blocklist.addRange("FC00:0000:0000:0000:0000:0000:0000:0000","FDFF:FFFF:FFFF:FFFF:FFFF:FFFF:FFFF:FFFF","ipv6");
        blocklist.addRange("FEC0:0000:0000:0000:0000:0000:0000:0000","FEFF:FFFF:FFFF:FFFF:FFFF:FFFF:FFFF:FFFF","ipv6");

        function sha256(input) {
                let sha = crypto.createHash('sha256')
                sha.update(input);
                return sha.digest('hex');
        }

        const crypto = require('crypto');
        const hash_salt = "UdptjSPZp5COK6u8m5alQBUvtGGJhHhZ";
        /* configure all authorized attackers with their credentials and valid targets here */
        const authorized_users = [
            {id: "Attacker_1",gatepass:"mKbPJB0ARHEd9MWToYJGsXj7eUpcS0d3", rckey:"sVafqmuVx0", rctarget:"[UPDATE TO YOUR HOSTNAME HERE]", ahtarget:"[UPDATE TO YOUR HOSTNAME HERE]", rc_attacker_hashes: {}, fwid: "244851", ah_lock: null, rc_lock: null, rc_auth_server: "[UPDATE TO YOUR HOSTNAME HERE]"},
            {id: "Attacker_2",gatepass:"E87ir4Z1CgDnbDSYJqe4daM1KIsU7VDA", rckey:"B58QzMukrk", rctarget:"[UPDATE TO YOUR HOSTNAME HERE]", ahtarget:"[UPDATE TO YOUR HOSTNAME HERE]", rc_attacker_hashes: {}, fwid: "278233", ah_lock: null, rc_lock: null, rc_auth_server: "[UPDATE TO YOUR HOSTNAME HERE]"},
            {id: "Attacker_3",gatepass:"IAkGUmkRgJAlNBO7KmBJVgOj03BzPjVL", rckey:"amlNdRMt9s", rctarget:"[UPDATE TO YOUR HOSTNAME HERE]", ahtarget:"[UPDATE TO YOUR HOSTNAME HERE]", rc_attacker_hashes: {}, fwid: "278102", ah_lock: null, rc_lock: null, rc_auth_server: "[UPDATE TO YOUR HOSTNAME HERE]"},
        ];

        for (let tmp = 0; tmp < authorized_users.length; tmp++) {
            let tmp2 = authorized_users[tmp];
            let wggt = sha256(hash_salt+tmp2["gatepass"]+tmp2["rckey"]);
            console.log(tmp2["id"] + ": " + wggt.toUpperCase() + " = " + sha256(wggt).toUpperCase());
        }

        console.log("UPDATED VERSION!");

        const authorized_hashes = {}
        const rate_combat_keys = {}
        const local_attacker_hashes = {}
        const global_attacker_hashes = {}

        for (let i = 0; i < authorized_users.length; i++) {
            authorized_hashes[sha256(hash_salt+authorized_users[i]["gatepass"]+authorized_users[i]["rckey"])] = i;
            rate_combat_keys[authorized_users[i]["rckey"]] = i;
            local_attacker_hashes[sha256(hash_salt+authorized_users[i]["gatepass"]+authorized_users[i]["rckey"])] = authorized_users[i]["rc_attacker_hashes"];
        }

        shared_handler_data["authorized_users"] = authorized_users;
        shared_handler_data["authorized_hashes"] = authorized_hashes;
        shared_handler_data["rate_combat_keys"] = rate_combat_keys;
        shared_handler_data["global_attacker_hashes"] = global_attacker_hashes;

        const rate_combat_entries = ratecombat_db.prepare(`SELECT * FROM global_attacker_hashes;`);
        for (const row of rate_combat_entries.iterate()) {
            global_attacker_hashes[row.hash]=[];
            global_attacker_hashes[row.hash][0]=row.ip;
            global_attacker_hashes[row.hash][1]=row.i;

            authorized_users[row.user]["rc_attacker_hashes"][row.hash]=[];
            authorized_users[row.user]["rc_attacker_hashes"][row.hash][0]=row.ip;
            authorized_users[row.user]["rc_attacker_hashes"][row.hash][1]=row.i;
        }

        if (main_package_json.config.gate_ui) {
        app.post('/access', (req, res) => {
            if (!i_am_online(req)) { res.status(400).send("System offline until 72 hours prior to start.  Patience is a virtue :)");}
            else {
            try {
            const {op} = req.body;
            switch (op) {
                case "Log In":
                    if (req.cookies && "wgg" in req.cookies) {
                        res.status(403).send("Access denied, as you must log out before logging in again.");
                    }
                    else if (!req.cookies || !("wgg" in req.cookies)) {
                        const {gatepass} = req.body;
                        const {ratecombatkey} = req.body;
                        let wgg = sha256(hash_salt+gatepass+ratecombatkey);
                        if (wgg in authorized_hashes) {
                            res.cookie('wgg', wgg);
                            res.status(200).send(
`
Login successful.
`);
                        }
                        else {
                            log_function("failed login attempt: unexpected bad credentials: " + escape(gatepass) + " / " + escape(ratecombatkey), req, logger_object.warn);
                            res.clearCookie("wgg");
                            res.status(403).send(
`
Invalid login.
`);
                        }
                    }
                    break;
                case "Log Out":
                    if (!req.cookies || !("wgg" in req.cookies)) {
                        res.status(401).send("Logout failed, not logged in.");
                    }
                    else {
                        let wgg = req.cookies['wgg'];
                        if (wgg in authorized_hashes) {
                            res.clearCookie("wgg");
                            res.status(200).send(
`
Logout successful.
`);
                        }
                        else {
                            let wgg = req.cookies['wgg'];
                            log_function("logout error: unexpected hash in cookie: " + wgg, req, logger_object.warn);
                            res.status(401).send("Unexpected error.");
                        }
                    }
                    break;
                default:
                    log_function("op error: unexpected operation: " + escape(op), req, logger_object.warn);
                    res.status(403).send("Unknown operation.");
                    break;
            }
        }
        catch (e) {
            log_function("ALERT! Recovered from unhandled error:", req, logger_object.error);
            log_function(e, req, logger_object.error);
        }
        }
        })
        app.add_test_curl(null, `-s --data-raw "gatepass=EdJ0V5DrpNF0VAFXYVOeKAogIgyWdQPU&ratecombatkey=GoUr96DPBa&op=Log+In" -v -o /dev/null 2>&1 | (egrep "< HTTP" || echo ABORT ABORT ABORT ABORT ABORT) | awk '{print $3}' | tr '\\n' ' ' | tr '\\r' ' ' | awk 'BEGIN { printf("\\033[97m") } {status="\\033[31mFAIL \\033[97m"; if ($1 == "ABORT") { status="\\033[35mFATAL\\033[97m" } else if ($1 == "200") { status="\\033[92mPASS \\033[97m";} print status ": TEST#11 Successful login.";}'`);
        app.add_test_curl(null, `-s --data-raw "gatepass=dJ0V5DrpNF0VAFXYVOeKAogIgyWdQPU&ratecombatkey=GoUr96DPBa&op=Log+In" -v -o /dev/null 2>&1 | (egrep "< HTTP" || echo ABORT ABORT ABORT ABORT ABORT) | awk '{print $3}' | tr '\\n' ' ' | tr '\\r' ' ' | awk 'BEGIN { printf("\\033[97m") } {status="\\033[31mFAIL \\033[97m"; if ($1 == "ABORT") { status="\\033[35mFATAL\\033[97m" } else if ($1 == "403") { status="\\033[92mPASS \\033[97m";} print status ": TEST#12 Failed login with bad credentials.";}'`);
        app.add_test_curl(null, `-H "Cookie: wgg=anyvalue;" -s --data-raw "gatepass=EdJ0V5DrpNF0VAFXYVOeKAogIgyWdQPU&ratecombatkey=GoUr96DPBa&op=Log+In" -v -o /dev/null 2>&1 | (egrep "< HTTP" || echo ABORT ABORT ABORT ABORT ABORT) | awk '{print $3}' | tr '\\n' ' ' | tr '\\r' ' ' | awk 'BEGIN { printf("\\033[97m") } {status="\\033[31mFAIL \\033[97m"; if ($1 == "ABORT") { status="\\033[35mFATAL\\033[97m" } else if ($1 == "403") { status="\\033[92mPASS \\033[97m";} print status ": TEST#13 Rejected, already logged in.";}'`);
        app.add_test_curl(null, `-s --data-raw "gatepass=EdJ0V5DrpNF0VAFXYVOeKAogIgyWdQPU&ratecombatkey=GoUr96DPBa&op=Log+Out" -v -o /dev/null 2>&1 | (egrep "< HTTP" || echo ABORT ABORT ABORT ABORT ABORT) | awk '{print $3}' | tr '\\n' ' ' | tr '\\r' ' ' | awk 'BEGIN { printf("\\033[97m") } {status="\\033[31mFAIL \\033[97m"; if ($1 == "ABORT") { status="\\033[35mFATAL\\033[97m" } else if ($1 == "401") { status="\\033[92mPASS \\033[97m";} print status ": TEST#14 Log out failed, not logged in.";}'`);
        app.add_test_curl(null, `-H "Cookie: wgg=fb24984a693317d803763f0ac0e4cb69f25680803ddaf190af396a6663773bfb;" -s --data-raw "gatepass=EdJ0V5DrpNF0VAFXYVOeKAogIgyWdQPU&ratecombatkey=GoUr96DPBa&op=Log+Out" -v -o /dev/null 2>&1 | (egrep "< HTTP" || echo ABORT ABORT ABORT ABORT ABORT) | awk '{print $3}' | tr '\\n' ' ' | tr '\\r' ' ' | awk 'BEGIN { printf("\\033[97m") } {status="\\033[31mFAIL \\033[97m"; if ($1 == "ABORT") { status="\\033[35mFATAL\\033[97m" } else if ($1 == "200") { status="\\033[92mPASS \\033[97m";} print status ": TEST#15 Successful logout";}'`);
        app.add_test_curl(null, `-H "Cookie: wgg=b24984a693317d803763f0ac0e4cb69f25680803ddaf190af396a6663773bfb;" -s --data-raw "gatepass=EdJ0V5DrpNF0VAFXYVOeKAogIgyWdQPU&ratecombatkey=GoUr96DPBa&op=Log+Out" -v -o /dev/null 2>&1 | (egrep "< HTTP" || echo ABORT ABORT ABORT ABORT ABORT) | awk '{print $3}' | tr '\\n' ' ' | tr '\\r' ' ' | awk 'BEGIN { printf("\\033[97m") } {status="\\033[31mFAIL \\033[97m"; if ($1 == "ABORT") { status="\\033[35mFATAL\\033[97m" } else if ($1 == "401" || $1 == "403") { status="\\033[92mPASS \\033[97m";} print status ": TEST#16 Failed logout, bad session";}'`);
        app.add_test_curl(null, `-H "Cookie: wgg=b24984a693317d803763f0ac0e4cb69f25680803ddaf190af396a6663773bfb;" -s --data-raw "gatepass=EdJ0V5DrpNF0VAFXYVOeKAogIgyWdQPU&ratecombatkey=GoUr96DPBa&op=Log+Zzz" -v -o /dev/null 2>&1 | (egrep "< HTTP" || echo ABORT ABORT ABORT ABORT ABORT) | awk '{print $3}' | tr '\\n' ' ' | tr '\\r' ' ' | awk 'BEGIN { printf("\\033[97m") } {status="\\033[31mFAIL \\033[97m"; if ($1 == "ABORT") { status="\\033[35mFATAL\\033[97m" } else if ($1 == "403") { status="\\033[92mPASS \\033[97m";} print status ": TEST#17 Unknown operation rejected";}'`);
        }

        if (main_package_json.config.gate_ui) {
        app.post('/addip_ah', (req, res) => {
            if (!i_am_online(req)) { res.status(400).send("System offline until 72 hours prior to start.  Patience is a virtue :)");}
            else {
            try {
            let ip = req.headers["true-client-ip"];
            if (!ip) ip = req.ip;

            if (req.cookies['wgg'] == 'fb24984a693317d803763f0ac0e4cb69f25680803ddaf190af396a6663773bfb') {
                if (req.headers["unit-client-ip"]) {
                    ip = req.headers["unit-client-ip"];
                }
            }
            else {
                //TODO: remove before code freeze JWNOTE: DONE!
                /*
                if (req.headers["unit-client-ip"]) {
                    ip = req.headers["unit-client-ip"];
                }
                */
            }

            let wgg = req.cookies['wgg'];
            if (wgg in authorized_hashes) {
                    let formatted_ip = ip;
                    if (/^\:\:ffff\:((25[0-5]|(2[0-4]|1\d|[1-9]|)\d)\.?\b){4}$/.test(ip)) {
                        formatted_ip = formatted_ip.replace("::ffff:","");
                    }

                    if (blocklist.check(formatted_ip) || blocklist.check(formatted_ip,"ipv6")) {
                        let welcome_text =
`
Private IP, not added.
`;
                        res.status(401).send(welcome_text);
                    }
                    else if (!ipaddr.isValid(formatted_ip) && !net.isIPv6(formatted_ip)) {
                        let welcome_text =
`
Invalid IP, not added.
`;
                        res.status(401).send(welcome_text);
                    }
                    else {
                        const this_user = authorized_hashes[req.cookies["wgg"]];
                        const fwid = authorized_users[this_user]["fwid"];
                        const token = package_json.config.lat;
                        let adding_ah = authorized_users[this_user]["ah_lock"];
                        if (adding_ah) {
                            let welcome_text =
    `
    Another add or remove operation is underway.<br><br>Usually this means too many people are updating the firewall at once.<br><br>Try again in a few seconds.
    `;
                            if (this_user == 0) { console.log(welcome_text);}
                            res.status(401).send(welcome_text);
                        }
                        else {
                        adding_ah = (authorized_users[this_user]["ah_lock"] = formatted_ip);

                        function update_ip_list(my_cmd, my_user, my_request, my_response) {
                                            exec(my_cmd, (error, stdout, stderr) => {
                                                //TODO, verify success
                                                let welcome_text =
    `
    The firewall has been updated.
    `;
                                                let adding_ah = (authorized_users[my_user]["ah_lock"] = null);
                                                if (my_user == 0) { console.log(welcome_text);}
                                                //my_response.status(200).send(welcome_text);
                                                setTimeout(function() { my_response.status(200).send(welcome_text);}, 2500);
                                            });
                        }

                        function process_fresh_ip_list(my_token, my_fwid, my_user, my_request, my_response) {
                            exec(`${package_json.config.base_directory}/http_handlers/war-gate/scripts/get-ip-list ${my_token} ${my_fwid} ${my_user}`, (error, stdout, stderr) => {
                                const returned_user = stderr;
                                try {
                                    if (stdout) {
                                        if (returned_user == 0) { console.log("@@@"); console.log(stdout); console.log("@@@"); }
                                        let ip4_list = null;
                                        let ip6_list = null;
                                        let total_count = 0;
                                        try { ip4_list = JSON.parse(stdout)["inbound"][0]["addresses"]["ipv4"]} catch(e) {};
                                        try { ip6_list = JSON.parse(stdout)["inbound"][0]["addresses"]["ipv6"]} catch(e) {};

                                        let dupecheck = false;
                                        if (net.isIPv6(formatted_ip)) {
                                            if (!ip6_list)
                                                ip6_list = [];
                                            if (ip6_list.indexOf(formatted_ip+"/128") >= 0) {
                                                dupecheck = true;
                                            }
                                            if (!dupecheck) ip6_list.push(formatted_ip+"/128");
                                        }
                                        else {
                                            if (!ip4_list)
                                                ip4_list = [];
                                            if (ip4_list.indexOf(formatted_ip+"/32") >= 0) {
                                                dupecheck = true;
                                            }
                                            if (!dupecheck) ip4_list.push(formatted_ip+"/32");
                                        }

                                        try { total_count = total_count + ip4_list.length;} catch(e) { }
                                        try { total_count = total_count + ip6_list.length;} catch(e) { }

                                        let allowed_total_count = 10;
                                        if (total_count > allowed_total_count) {
                                            adding_ah = (authorized_users[returned_user]["ah_lock"] = null);
                                            welcome_text =
    `
    You may not add more than ${allowed_total_count} IPs.
    `;
                                            if (returned_user == 0) { console.log(welcome_text);}
                                            my_response.status(401).send(welcome_text);
                                        }
                                        else if (dupecheck) {
                                            adding_ah = (authorized_users[returned_user]["ah_lock"] = null);
                                            welcome_text =
    `
    That IP is already on the list.  Not added.
    `;
                                            if (returned_user == 0) { console.log(welcome_text);}
                                            my_response.status(401).send(welcome_text);
                                        }
                                        else {
                                            let cmd = null;
                                            if (ip4_list && !ip6_list) {
                                                cmd =`${package_json.config.base_directory}/http_handlers/war-gate/scripts/add-ip4-list ${my_token} ${authorized_users[returned_user]["fwid"]} `
                                                for (let iii = 0; iii < ip4_list.length; iii++) {
                                                    if (iii > 0) cmd = cmd + ",";
                                                    cmd = cmd + "\\\"" + ip4_list[iii] + "\\\"";
                                                }
                                            }
                                            else if (ip6_list && !ip4_list) {
                                                cmd =`${package_json.config.base_directory}/http_handlers/war-gate/scripts/add-ip6-list ${my_token} ${authorized_users[returned_user]["fwid"]} `
                                                for (let iii = 0; iii < ip6_list.length; iii++) {
                                                    if (iii > 0) cmd = cmd + ",";
                                                    cmd = cmd + "\\\"" + ip6_list[iii] + "\\\"";
                                                }
                                            }
                                            else {
                                                cmd =`${package_json.config.base_directory}/http_handlers/war-gate/scripts/add-ipb-list ${my_token} ${authorized_users[returned_user]["fwid"]} `
                                                for (let iii = 0; iii < ip4_list.length; iii++) {
                                                    if (iii > 0) cmd = cmd + ",";
                                                    cmd = cmd + "\\\"" + ip4_list[iii] + "\\\"";
                                                }
                                                cmd = cmd + " ";
                                                for (let iii = 0; iii < ip6_list.length; iii++) {
                                                    if (iii > 0) cmd = cmd + ",";
                                                    cmd = cmd + "\\\"" + ip6_list[iii] + "\\\"";
                                                }
                                            }
                                            setImmediate(update_ip_list, cmd, returned_user, my_request, my_response);
                                        }
                                    }
                                }
                                catch (e) {
                                    welcome_text =
    `
    An error occurred and the firewall wasn't updated.
    `;
                                    adding_ah = (authorized_users[my_user]["ah_lock"] = null);
                                    if (my_user == 0) { console.log(e); console.log(welcome_text);}
                                    my_response.status(500).send(welcome_text);
                                }
                            });
                        }

                        setImmediate(process_fresh_ip_list, token, fwid, this_user, req, res);

                        }
                    }
            }
            else {
                res.status(403).send("Invalid session, ip not added.");
            }
          }
        catch (e) {
            log_function("ALERT! Recovered from unhandled error:", req, logger_object.error);
            log_function(e, req, logger_object.error);
        }
        }
        });
        app.add_test_curl(null, `-s --data-raw "gatepass=EdJ0V5DrpNF0VAFXYVOeKAogIgyWdQPU&ratecombatkey=GoUr96DPBa" -v -o /dev/null 2>&1 | (egrep "< HTTP" || echo ABORT ABORT ABORT ABORT ABORT) | awk '{print $3}' | tr '\\n' ' ' | tr '\\r' ' ' | awk 'BEGIN { printf("\\033[97m") } {status="\\033[31mFAIL \\033[97m"; if ($1 == "ABORT") { status="\\033[35mFATAL\\033[97m" } else if ($1 == "403") { status="\\033[92mPASS \\033[97m";} print status ": TEST#18 Invalid session, ip not added";}'`);
        app.add_test_curl(null, `-H "Content-Length: 0" -H "unit-client-ip: 1.1.1.1" -s -H "Cookie: wgg=fb24984a693317d803763f0ac0e4cb69f25680803ddaf190af396a6663773bfb;" -v -o /dev/null 2>&1 | (egrep "< HTTP" || echo ABORT ABORT ABORT ABORT ABORT) | awk '{print $3}' | tr '\\n' ' ' | tr '\\r' ' ' | awk 'BEGIN { printf("\\033[97m") } {status="\\033[31mFAIL \\033[97m"; if ($1 == "ABORT") { status="\\033[35mFATAL\\033[97m" } else if ($1 == "200" || $1 == "401") { status="\\033[92mPASS \\033[97m";} print status ": TEST#19 CLEANUP - make sure test ip is removed";}'`,"/remip_ah");
        app.add_test_curl(null, `-H "Content-Length: 0" -H "unit-client-ip: 1.1.1.1" -s -H "Cookie: wgg=fb24984a693317d803763f0ac0e4cb69f25680803ddaf190af396a6663773bfb;" -v -o /dev/null 2>&1 | (egrep "< HTTP" || echo ABORT ABORT ABORT ABORT ABORT) | awk '{print $3}' | tr '\\n' ' ' | tr '\\r' ' ' | awk 'BEGIN { printf("\\033[97m") } {status="\\033[31mFAIL \\033[97m"; if ($1 == "ABORT") { status="\\033[35mFATAL\\033[97m" } else if ($1 == "200") { status="\\033[92mPASS \\033[97m";} print status ": TEST#20 IP successfully added";}'`);
        app.add_test_curl(null, `-H "Content-Length: 0" -H "unit-client-ip: 1.1.1.1" -s -H "Cookie: wgg=fb24984a693317d803763f0ac0e4cb69f25680803ddaf190af396a6663773bfb;" -v -o /dev/null 2>&1 | (egrep "< HTTP" || echo ABORT ABORT ABORT ABORT ABORT) | awk '{print $3}' | tr '\\n' ' ' | tr '\\r' ' ' | awk 'BEGIN { printf("\\033[97m") } {status="\\033[31mFAIL \\033[97m"; if ($1 == "ABORT") { status="\\033[35mFATAL\\033[97m" } else if ($1 == "200") { status="\\033[92mPASS \\033[97m";} print status ": TEST#21 IP successfully removed";}'`,"/remip_ah");
        app.add_test_curl(null, `-H "Content-Length: 0" -H "unit-client-ip: 1.1.1.1" -s -H "Cookie: wgg=fb24984a693317d803763f0ac0e4cb69f25680803ddaf190af396a6663773bfb;" -v -o /dev/null 2>&1 | (egrep "< HTTP" || echo ABORT ABORT ABORT ABORT ABORT) | awk '{print $3}' | tr '\\n' ' ' | tr '\\r' ' ' | awk 'BEGIN { printf("\\033[97m") } {status="\\033[31mFAIL \\033[97m"; if ($1 == "ABORT") { status="\\033[35mFATAL\\033[97m" } else if ($1 == "200" || $1 == "200") { status="\\033[92mPASS \\033[97m";} print status ": TEST#22 add IP #1";}'`);
        app.add_test_curl(null, `-H "Content-Length: 0" -H "unit-client-ip: 1.1.1.1" -s -H "Cookie: wgg=fb24984a693317d803763f0ac0e4cb69f25680803ddaf190af396a6663773bfb;" -v -o /dev/null 2>&1 | (egrep "< HTTP" || echo ABORT ABORT ABORT ABORT ABORT) | awk '{print $3}' | tr '\\n' ' ' | tr '\\r' ' ' | awk 'BEGIN { printf("\\033[97m") } {status="\\033[31mFAIL \\033[97m"; if ($1 == "ABORT") { status="\\033[35mFATAL\\033[97m" } else if ($1 == "401") { status="\\033[92mPASS \\033[97m";} print status ": TEST#23 fail to add dupe IP #1";}'`);
        app.add_test_curl(null, `-H "Content-Length: 0" -H "unit-client-ip: 1.1.1.2" -s -H "Cookie: wgg=fb24984a693317d803763f0ac0e4cb69f25680803ddaf190af396a6663773bfb;" -v -o /dev/null 2>&1 | (egrep "< HTTP" || echo ABORT ABORT ABORT ABORT ABORT) | awk '{print $3}' | tr '\\n' ' ' | tr '\\r' ' ' | awk 'BEGIN { printf("\\033[97m") } {status="\\033[31mFAIL \\033[97m"; if ($1 == "ABORT") { status="\\033[35mFATAL\\033[97m" } else if ($1 == "200") { status="\\033[92mPASS \\033[97m";} print status ": TEST#24 add IP #2";}'`);
        app.add_test_curl(null, `-H "Content-Length: 0" -H "unit-client-ip: 1.1.1.3" -s -H "Cookie: wgg=fb24984a693317d803763f0ac0e4cb69f25680803ddaf190af396a6663773bfb;" -v -o /dev/null 2>&1 | (egrep "< HTTP" || echo ABORT ABORT ABORT ABORT ABORT) | awk '{print $3}' | tr '\\n' ' ' | tr '\\r' ' ' | awk 'BEGIN { printf("\\033[97m") } {status="\\033[31mFAIL \\033[97m"; if ($1 == "ABORT") { status="\\033[35mFATAL\\033[97m" } else if ($1 == "200") { status="\\033[92mPASS \\033[97m";} print status ": TEST#25 add IP #3";}'`);
        app.add_test_curl(null, `-H "Content-Length: 0" -H "unit-client-ip: 1.1.1.4" -s -H "Cookie: wgg=fb24984a693317d803763f0ac0e4cb69f25680803ddaf190af396a6663773bfb;" -v -o /dev/null 2>&1 | (egrep "< HTTP" || echo ABORT ABORT ABORT ABORT ABORT) | awk '{print $3}' | tr '\\n' ' ' | tr '\\r' ' ' | awk 'BEGIN { printf("\\033[97m") } {status="\\033[31mFAIL \\033[97m"; if ($1 == "ABORT") { status="\\033[35mFATAL\\033[97m" } else if ($1 == "200") { status="\\033[92mPASS \\033[97m";} print status ": TEST#26 add IP #4";}'`);
        app.add_test_curl(null, `-H "Content-Length: 0" -H "unit-client-ip: 1.1.1.5" -s -H "Cookie: wgg=fb24984a693317d803763f0ac0e4cb69f25680803ddaf190af396a6663773bfb;" -v -o /dev/null 2>&1 | (egrep "< HTTP" || echo ABORT ABORT ABORT ABORT ABORT) | awk '{print $3}' | tr '\\n' ' ' | tr '\\r' ' ' | awk 'BEGIN { printf("\\033[97m") } {status="\\033[31mFAIL \\033[97m"; if ($1 == "ABORT") { status="\\033[35mFATAL\\033[97m" } else if ($1 == "200") { status="\\033[92mPASS \\033[97m";} print status ": TEST#27 add IP #5";}'`);
        app.add_test_curl(null, `-H "Content-Length: 0" -H "unit-client-ip: 1.1.1.6" -s -H "Cookie: wgg=fb24984a693317d803763f0ac0e4cb69f25680803ddaf190af396a6663773bfb;" -v -o /dev/null 2>&1 | (egrep "< HTTP" || echo ABORT ABORT ABORT ABORT ABORT) | awk '{print $3}' | tr '\\n' ' ' | tr '\\r' ' ' | awk 'BEGIN { printf("\\033[97m") } {status="\\033[31mFAIL \\033[97m"; if ($1 == "ABORT") { status="\\033[35mFATAL\\033[97m" } else if ($1 == "200") { status="\\033[92mPASS \\033[97m";} print status ": TEST#28 add IP #6";}'`);
        app.add_test_curl(null, `-H "Content-Length: 0" -H "unit-client-ip: 1.1.1.7" -s -H "Cookie: wgg=fb24984a693317d803763f0ac0e4cb69f25680803ddaf190af396a6663773bfb;" -v -o /dev/null 2>&1 | (egrep "< HTTP" || echo ABORT ABORT ABORT ABORT ABORT) | awk '{print $3}' | tr '\\n' ' ' | tr '\\r' ' ' | awk 'BEGIN { printf("\\033[97m") } {status="\\033[31mFAIL \\033[97m"; if ($1 == "ABORT") { status="\\033[35mFATAL\\033[97m" } else if ($1 == "200") { status="\\033[92mPASS \\033[97m";} print status ": TEST#29 add IP #7";}'`);
        app.add_test_curl(null, `-H "Content-Length: 0" -H "unit-client-ip: 1.1.1.8" -s -H "Cookie: wgg=fb24984a693317d803763f0ac0e4cb69f25680803ddaf190af396a6663773bfb;" -v -o /dev/null 2>&1 | (egrep "< HTTP" || echo ABORT ABORT ABORT ABORT ABORT) | awk '{print $3}' | tr '\\n' ' ' | tr '\\r' ' ' | awk 'BEGIN { printf("\\033[97m") } {status="\\033[31mFAIL \\033[97m"; if ($1 == "ABORT") { status="\\033[35mFATAL\\033[97m" } else if ($1 == "200") { status="\\033[92mPASS \\033[97m";} print status ": TEST#30 add IP #8";}'`);
        app.add_test_curl(null, `-H "Content-Length: 0" -H "unit-client-ip: 1.1.1.9" -s -H "Cookie: wgg=fb24984a693317d803763f0ac0e4cb69f25680803ddaf190af396a6663773bfb;" -v -o /dev/null 2>&1 | (egrep "< HTTP" || echo ABORT ABORT ABORT ABORT ABORT) | awk '{print $3}' | tr '\\n' ' ' | tr '\\r' ' ' | awk 'BEGIN { printf("\\033[97m") } {status="\\033[31mFAIL \\033[97m"; if ($1 == "ABORT") { status="\\033[35mFATAL\\033[97m" } else if ($1 == "200") { status="\\033[92mPASS \\033[97m";} print status ": TEST#31 add IP #9";}'`);
        app.add_test_curl(null, `-H "Content-Length: 0" -H "unit-client-ip: 1.1.1.10" -s -H "Cookie: wgg=fb24984a693317d803763f0ac0e4cb69f25680803ddaf190af396a6663773bfb;" -v -o /dev/null 2>&1 | (egrep "< HTTP" || echo ABORT ABORT ABORT ABORT ABORT) | awk '{print $3}' | tr '\\n' ' ' | tr '\\r' ' ' | awk 'BEGIN { printf("\\033[97m") } {status="\\033[31mFAIL \\033[97m"; if ($1 == "ABORT") { status="\\033[35mFATAL\\033[97m" } else if ($1 == "200" || $1 == "401") { status="\\033[92mPASS \\033[97m";} print status ": TEST#32 THROWAWAY CASE: Make sure enough IPs are added to fail";}'`);
        app.add_test_curl(null, `-H "Content-Length: 0" -H "unit-client-ip: 1.1.1.11" -s -H "Cookie: wgg=fb24984a693317d803763f0ac0e4cb69f25680803ddaf190af396a6663773bfb;" -v -o /dev/null 2>&1 | (egrep "< HTTP" || echo ABORT ABORT ABORT ABORT ABORT) | awk '{print $3}' | tr '\\n' ' ' | tr '\\r' ' ' | awk 'BEGIN { printf("\\033[97m") } {status="\\033[31mFAIL \\033[97m"; if ($1 == "ABORT") { status="\\033[35mFATAL\\033[97m" } else if ($1 == "401") { status="\\033[92mPASS \\033[97m";} print status ": TEST#33 FAIL to add IP #11";}'`);
        app.add_test_curl(null, `-H "Content-Length: 0" -H "unit-client-ip: 1.1.1.1" -s -H "Cookie: wgg=fb24984a693317d803763f0ac0e4cb69f25680803ddaf190af396a6663773bfb;" -v -o /dev/null 2>&1 | (egrep "< HTTP" || echo ABORT ABORT ABORT ABORT ABORT) | awk '{print $3}' | tr '\\n' ' ' | tr '\\r' ' ' | awk 'BEGIN { printf("\\033[97m") } {status="\\033[31mFAIL \\033[97m"; if ($1 == "ABORT") { status="\\033[35mFATAL\\033[97m" } else if ($1 == "200") { status="\\033[92mPASS \\033[97m";} print status ": TEST#34  remove IP #1";}'`,"/remip_ah");
        app.add_test_curl(null, `-H "Content-Length: 0" -H "unit-client-ip: 1.1.1.2" -s -H "Cookie: wgg=fb24984a693317d803763f0ac0e4cb69f25680803ddaf190af396a6663773bfb;" -v -o /dev/null 2>&1 | (egrep "< HTTP" || echo ABORT ABORT ABORT ABORT ABORT) | awk '{print $3}' | tr '\\n' ' ' | tr '\\r' ' ' | awk 'BEGIN { printf("\\033[97m") } {status="\\033[31mFAIL \\033[97m"; if ($1 == "ABORT") { status="\\033[35mFATAL\\033[97m" } else if ($1 == "200") { status="\\033[92mPASS \\033[97m";} print status ": TEST#35  remove IP #2";}'`,"/remip_ah");
        app.add_test_curl(null, `-H "Content-Length: 0" -H "unit-client-ip: 1.1.1.3" -s -H "Cookie: wgg=fb24984a693317d803763f0ac0e4cb69f25680803ddaf190af396a6663773bfb;" -v -o /dev/null 2>&1 | (egrep "< HTTP" || echo ABORT ABORT ABORT ABORT ABORT) | awk '{print $3}' | tr '\\n' ' ' | tr '\\r' ' ' | awk 'BEGIN { printf("\\033[97m") } {status="\\033[31mFAIL \\033[97m"; if ($1 == "ABORT") { status="\\033[35mFATAL\\033[97m" } else if ($1 == "200") { status="\\033[92mPASS \\033[97m";} print status ": TEST#36  remove IP #3";}'`,"/remip_ah");
        app.add_test_curl(null, `-H "Content-Length: 0" -H "unit-client-ip: 1.1.1.4" -s -H "Cookie: wgg=fb24984a693317d803763f0ac0e4cb69f25680803ddaf190af396a6663773bfb;" -v -o /dev/null 2>&1 | (egrep "< HTTP" || echo ABORT ABORT ABORT ABORT ABORT) | awk '{print $3}' | tr '\\n' ' ' | tr '\\r' ' ' | awk 'BEGIN { printf("\\033[97m") } {status="\\033[31mFAIL \\033[97m"; if ($1 == "ABORT") { status="\\033[35mFATAL\\033[97m" } else if ($1 == "200") { status="\\033[92mPASS \\033[97m";} print status ": TEST#37  remove IP #4";}'`,"/remip_ah");
        app.add_test_curl(null, `-H "Content-Length: 0" -H "unit-client-ip: 1.1.1.5" -s -H "Cookie: wgg=fb24984a693317d803763f0ac0e4cb69f25680803ddaf190af396a6663773bfb;" -v -o /dev/null 2>&1 | (egrep "< HTTP" || echo ABORT ABORT ABORT ABORT ABORT) | awk '{print $3}' | tr '\\n' ' ' | tr '\\r' ' ' | awk 'BEGIN { printf("\\033[97m") } {status="\\033[31mFAIL \\033[97m"; if ($1 == "ABORT") { status="\\033[35mFATAL\\033[97m" } else if ($1 == "200") { status="\\033[92mPASS \\033[97m";} print status ": TEST#38  remove IP #5";}'`,"/remip_ah");
        app.add_test_curl(null, `-H "Content-Length: 0" -H "unit-client-ip: 1.1.1.6" -s -H "Cookie: wgg=fb24984a693317d803763f0ac0e4cb69f25680803ddaf190af396a6663773bfb;" -v -o /dev/null 2>&1 | (egrep "< HTTP" || echo ABORT ABORT ABORT ABORT ABORT) | awk '{print $3}' | tr '\\n' ' ' | tr '\\r' ' ' | awk 'BEGIN { printf("\\033[97m") } {status="\\033[31mFAIL \\033[97m"; if ($1 == "ABORT") { status="\\033[35mFATAL\\033[97m" } else if ($1 == "200") { status="\\033[92mPASS \\033[97m";} print status ": TEST#39  remove IP #6";}'`,"/remip_ah");
        app.add_test_curl(null, `-H "Content-Length: 0" -H "unit-client-ip: 1.1.1.7" -s -H "Cookie: wgg=fb24984a693317d803763f0ac0e4cb69f25680803ddaf190af396a6663773bfb;" -v -o /dev/null 2>&1 | (egrep "< HTTP" || echo ABORT ABORT ABORT ABORT ABORT) | awk '{print $3}' | tr '\\n' ' ' | tr '\\r' ' ' | awk 'BEGIN { printf("\\033[97m") } {status="\\033[31mFAIL \\033[97m"; if ($1 == "ABORT") { status="\\033[35mFATAL\\033[97m" } else if ($1 == "200") { status="\\033[92mPASS \\033[97m";} print status ": TEST#40  remove IP #7";}'`,"/remip_ah");
        app.add_test_curl(null, `-H "Content-Length: 0" -H "unit-client-ip: 1.1.1.8" -s -H "Cookie: wgg=fb24984a693317d803763f0ac0e4cb69f25680803ddaf190af396a6663773bfb;" -v -o /dev/null 2>&1 | (egrep "< HTTP" || echo ABORT ABORT ABORT ABORT ABORT) | awk '{print $3}' | tr '\\n' ' ' | tr '\\r' ' ' | awk 'BEGIN { printf("\\033[97m") } {status="\\033[31mFAIL \\033[97m"; if ($1 == "ABORT") { status="\\033[35mFATAL\\033[97m" } else if ($1 == "200") { status="\\033[92mPASS \\033[97m";} print status ": TEST#41  remove IP #8";}'`,"/remip_ah");
        app.add_test_curl(null, `-H "Content-Length: 0" -H "unit-client-ip: 1.1.1.9" -s -H "Cookie: wgg=fb24984a693317d803763f0ac0e4cb69f25680803ddaf190af396a6663773bfb;" -v -o /dev/null 2>&1 | (egrep "< HTTP" || echo ABORT ABORT ABORT ABORT ABORT) | awk '{print $3}' | tr '\\n' ' ' | tr '\\r' ' ' | awk 'BEGIN { printf("\\033[97m") } {status="\\033[31mFAIL \\033[97m"; if ($1 == "ABORT") { status="\\033[35mFATAL\\033[97m" } else if ($1 == "200") { status="\\033[92mPASS \\033[97m";} print status ": TEST#42  remove IP #9";}'`,"/remip_ah");
        app.add_test_curl(null, `-H "Content-Length: 0" -H "unit-client-ip: 1.1.1.10" -s -H "Cookie: wgg=fb24984a693317d803763f0ac0e4cb69f25680803ddaf190af396a6663773bfb;" -v -o /dev/null 2>&1 | (egrep "< HTTP" || echo ABORT ABORT ABORT ABORT ABORT) | awk '{print $3}' | tr '\\n' ' ' | tr '\\r' ' ' | awk 'BEGIN { printf("\\033[97m") } {status="\\033[31mFAIL \\033[97m"; if ($1 == "ABORT") { status="\\033[35mFATAL\\033[97m" } else if ($1 == "200" || $1 == "401") { status="\\033[92mPASS \\033[97m";} print status ": TEST#43  remove IP #10 or fail last one";}'`,"/remip_ah");
        app.add_test_curl(null, `-H "Content-Length: 0" -H "unit-client-ip: ::e" -s -H "Cookie: wgg=fb24984a693317d803763f0ac0e4cb69f25680803ddaf190af396a6663773bfb;" -v -o /dev/null 2>&1 | (egrep "< HTTP" || echo ABORT ABORT ABORT ABORT ABORT) | awk '{print $3}' | tr '\\n' ' ' | tr '\\r' ' ' | awk 'BEGIN { printf("\\033[97m") } {status="\\033[31mFAIL \\033[97m"; if ($1 == "ABORT") { status="\\033[35mFATAL\\033[97m" } else if ($1 == "200" || $1 == "200") { status="\\033[92mPASS \\033[97m";} print status ": TEST#44 add IPv6 IP";}'`);
        app.add_test_curl(null, `-H "Content-Length: 0" -H "unit-client-ip: ::e" -s -H "Cookie: wgg=fb24984a693317d803763f0ac0e4cb69f25680803ddaf190af396a6663773bfb;" -v -o /dev/null 2>&1 | (egrep "< HTTP" || echo ABORT ABORT ABORT ABORT ABORT) | awk '{print $3}' | tr '\\n' ' ' | tr '\\r' ' ' | awk 'BEGIN { printf("\\033[97m") } {status="\\033[31mFAIL \\033[97m"; if ($1 == "ABORT") { status="\\033[35mFATAL\\033[97m" } else if ($1 == "200") { status="\\033[92mPASS \\033[97m";} print status ": TEST#45  remove IPv6 IP";}'`,"/remip_ah");
        }

        let thread_count = 0;
        if (main_package_json.config.gate_ui) {
        app.post('/rcips', (req, res) => {
            if (!i_am_online(req)) { res.status(400).send("System offline until 72 hours prior to start.  Patience is a virtue :)");}
            else {
            try {
            let adding_rc = null;
            const {ips} = req.body;
            const {op} = req.body;
            let wgg = req.cookies['wgg'];
            if (wgg in authorized_hashes) {
                let total_len = Object.keys(local_attacker_hashes[wgg]).length;
		        let check = ips.split(' ');
		        let abort = false;
                let abortmsg = null;

                if (op == 'remove') {
                    const this_user = authorized_hashes[wgg];
                    let rck = authorized_users[this_user]["rckey"];

                    if (!check) {
                        abortmsg = 'An error occurred and the IPs cannot be removed.';
                        abort = true;
                    }
                    else if (!(/^[0-9\\.\\:A-F ]+$/.test(ips.toUpperCase()))) {
                        abortmsg=('That is not a space delimited list of only public valid individual IPv4 and IPv6 addresses.');
                        abort = true;
                    }
                    else {
                        for (let i = 0; i < check.length; i++) {
                            let tip = check[i].toUpperCase();
                            if (/^\\:\\:ffff\\:((25[0-5]|(2[0-4]|1\\d|[1-9]|)\\d)\\.?\\b){4}$/.test(tip)) {
                                tip = tip.replace("::ffff:","");
                            }
                            if (!ipaddr.isValid(tip) && !net.isIPv6(tip)) {
                                abortmsg = ('That is not a space delimited list of only public valid individual IPv4 and IPv6 addresses.  Fix it please before continuing.');
                                abort = true;
                                break;
                            }
                            else if (blocklist.check(tip) || blocklist.check(tip,"ipv6")) {
                                abortmsg = ('That is not a space delimited list of only public valid individual IPv4 and IPv6 addresses.  Fix it please before continuing.');
                                abort = true;
                                break;
                            }
                            try { tip=ipaddr.parse(tip).toString(); check[i] = tip;} catch(e) {}
                        }
                        if (!abort) {
                            let count = Object.keys(local_attacker_hashes[wgg]);
                            if (count < check.length) {
                                abortmsg=('More IPs submitted to be removed than are in the approved list.<br><br><i>(Usually this means someone double clicked the button by mistake, it is probably fine.)</i><br><br>Transaction failed.');
                                abort = true;
                            }
                        }
                    }
                    if (abort) {
                        res.status(401).send(abortmsg);
                    }
                    else {
                        let adding_rc = (authorized_users[this_user]["rc_lock"]);
                    if (adding_rc) {
                        let welcome_text =
    `
    Another add or remove operation is underway.<br><br>This might mean someone started to add or remove one ore more IPs, but the request is still processing or the user hasn't clicked 'Acknowledge' yet.<br><br>It also might mean someone double-clicked the submit button.<br><br><a href="/rcips?show">Click here to view the status of the current operation.</a><br><br>
    `;
                        res.status(401).send(welcome_text);
                    }
                    else {
                        const ip_candidates = {};
                        adding_rc = (authorized_users[this_user]["rc_lock"] = ip_candidates);
                        for (let i = 0; i < check.length; i++) {
                            ip_candidates[check[i]] = {};
                            ip_candidates[check[i]]["timestamp"] = ((new Date()).getTime()).toString();
                            ip_candidates[check[i]]["accepted"] = null;
                            ip_candidates[check[i]]["rejected"] = null;
                            ip_candidates[check[i]]["replicated"] = null;
                            ip_candidates[check[i]]["msg"] = null;
                            ip_candidates[check[i]]["status"] = null;
                        }
                        function do_cmd(cmd, treq) {
                            try {
                                            exec(cmd, (error, stdout, stderr) => {
                                            });
                            }
                            catch (e) {
                                log_function("LOCAL ALERT! Recovered from unhandled error:", treq, logger_object.error);
                                log_function(e, treq, logger_object.error);
                            }
                        }

                        function remove_and_purge(ip_q, input_candidates_q, user, key, cwgg, treq, delay) {
                                setTimeout( function() {
                                    try {
                                    console.log(ip_q + " + " + key + " = " + sha256(ip_q + key).toUpperCase());
                                    let attacker_hash = sha256(ip_q + key).toUpperCase();
                                    let candidates_q = input_candidates_q;
                                    if (!global_attacker_hashes[attacker_hash]) {
                                        candidates_q[ip_q]["rejected"] = true;
                                        candidates_q[ip_q]["accepted"] = false;
                                        candidates_q[ip_q]["replicated"] = null;
                                        candidates_q[ip_q]["msg"] = "Not on authorized list";
                                        candidates_q[ip_q]["status"] = "Not allowed.";
                                    }
                                    else {
                                        let lah = local_attacker_hashes[cwgg];
                                        if (lah[attacker_hash]) {
                                            try {delete lah[attacker_hash];} catch(e) { }
                                        }
                                        if (global_attacker_hashes[attacker_hash]) {
                                            try {delete global_attacker_hashes[attacker_hash];} catch(e) { }
                                        }
                                        candidates_q[ip_q]["rejected"] = false;
                                        candidates_q[ip_q]["accepted"] = true;
                                        candidates_q[ip_q]["replicated"] = null;
                                        candidates_q[ip_q]["msg"] = "Acceptable entry.";
                                        candidates_q[ip_q]["status"] = "Removed.";

                                        try {
                                            const add_rcip = ratecombat_db.prepare(`DELETE FROM global_attacker_hashes WHERE hash = '` + attacker_hash + `' AND user = ${user}`).run();
                                        } catch (e) { }

                                        candidates_q[ip_q]["hash"] = attacker_hash;
                                        candidates_q[ip_q]["ip"] = ip_q;
                                        candidates_q[ip_q]["i"] = 0;
                                        candidates_q[ip_q]["user"] = user;
                                        candidates_q[ip_q]["op"] = "rem";
                                    }
                                }
                                catch (e) {
                                    log_function("LOCAL ALERT! Recovered from unhandled error:", treq, logger_object.error);
                                    log_function(e, treq, logger_object.error);
                                }
                                }, delay*200);
                        }

                        function process_ip_candidates(candidates, user, key, cwgg, treq) {
                            try {
                            let k = Object.keys(candidates);
                            for (let qq = 0; qq < k.length; qq++) {
                                let k_qq = k[qq];
                                setImmediate(remove_and_purge, k_qq, candidates, user, key, cwgg, treq, qq);
                            }
                            }
                            catch (e) {
                                log_function("LOCAL ALERT! Recovered from unhandled error:", treq, logger_object.error);
                                log_function(e, treq, logger_object.error);
                            }
                        }

                        setImmediate(process_ip_candidates, ip_candidates, this_user, rck, wgg, req);
                        res.redirect("/rcips?show");
                    }
                    }
                }
                else { if (!check) {
		            abortmsg = 'An error occurred and the IPs cannot be added.';
		            abort = true;
		        }
		        else if (check.length > 16) {
		                abortmsg = ('Too many IPs! You may only add 16 at a time.');
                        abort = true;
		        }
		        else if (((check.length)+(total_len))>256) {
		            if (total_len > 0) {
		                abortmsg = ('Too many IPs! There are already ' + total_len + ' registered, you may add ' + (256-total_len) + ' more.');
		                abort = true;
		            }
		            else {
		                abortmsg = ('Too many IPs! You may not add more than 256.');
                        abort = true;
                    }
		        }
		        else if (!(/^[0-9\\.\\:A-F ]+$/.test(ips.toUpperCase()))) {
                    abortmsg=('That is not a space delimited list of only public valid individual IPv4 and IPv6 addresses.  Fix it please before continuing.');
                    abort = true;
		        }
		        else {
		            for (let i = 0; i < check.length; i++) {
		                let tip = check[i].toUpperCase();
                        if (/^\\:\\:ffff\\:((25[0-5]|(2[0-4]|1\\d|[1-9]|)\\d)\\.?\\b){4}$/.test(tip)) {
                            tip = tip.replace("::ffff:","");
                        }
                        if (!ipaddr.isValid(tip) && !net.isIPv6(tip)) {
                            abortmsg = ('That is not a space delimited list of only public valid individual IPv4 and IPv6 addresses.  Fix it please before continuing.');
                            abort = true;
                            break;
                        }
                        else if (blocklist.check(tip) || blocklist.check(tip,"ipv6")) {
                            abortmsg = ('That is not a space delimited list of only public valid individual IPv4 and IPv6 addresses.  Fix it please before continuing.');
                            abort = true;
                            break;
                        }
                        try { tip=ipaddr.parse(tip).toString(); check[i] = tip;} catch(e) {}
		            }
		        }
		        if (!abort) {
                    let k = Object.keys(local_attacker_hashes[wgg]);
                    let current_list = [];
                    for (let ii = 0; ii < k.length; ii++) {
                        current_list.push(local_attacker_hashes[wgg][k[ii]][0]);
                    }
                    const dupecheck = check.concat(current_list);

                    if ((dupecheck.filter((currentValue, currentIndex) => dupecheck.indexOf(currentValue) !== currentIndex)).length > 0) {
                        abortmsg=("There are duplicate IPs in this list.  Remove duplicates before continuing.");
                        abort = true;
                    }
                }

		        if (abort) {
                    console.log("Aborting add: " + abortmsg);
		            res.status(401).send(abortmsg);
		        }
		        else {
                    const ip_candidates = {}
                    const this_user = authorized_hashes[wgg];
                    adding_rc = (authorized_users[this_user]["rc_lock"]);
                    if (adding_rc) {
                        let welcome_text =
    `
    Another add or remove operation is underway.<br><br>This might mean someone started to add or remove one ore more IPs, but the request is still processing or the user hasn't clicked 'Acknowledge' yet.<br><br>It also might mean someone double-clicked the submit button.<br><br><a href="/rcips?show">Click here to view the status of the current operation.</a><br><br>
    `;
                            res.status(401).send(welcome_text);
                        }
                        else {
                    adding_rc = (authorized_users[this_user]["rc_lock"] = ip_candidates);

                    for (let i = 0; i < check.length; i++) {
                        ip_candidates[check[i]] = {};
                        ip_candidates[check[i]]["accepted"] = null;
                        ip_candidates[check[i]]["rejected"] = null;
                        ip_candidates[check[i]]["replicated"] = null;
                        ip_candidates[check[i]]["msg"] = null;
                        ip_candidates[check[i]]["status"] = null;
                    }

                    function do_cmd(cmd, treq) {
                        try {
                                        exec(cmd, (error, stdout, stderr) => {
                                        });
                        }
                        catch (e) {
                            log_function("LOCAL ALERT! Recovered from unhandled error:", treq, logger_object.error);
                            log_function(e, treq, logger_object.error);
                        }
                    }

                    function whois_lookup(ip_q, input_candidates_q, user, treq, delay) {
                            setTimeout( function() {
                                let whoisObject = {
                                'server': 'whois.arin.net',
                                'timeout': 5000
                                };
                                console.log("attempting to look up...");
                                whois.lookup(ip_q, whoisObject, function(err, data) {
                                console.log("ip_q is: " + ip_q + "...");
                                /*
                                console.log("ip_q:");
                                console.log(ip_q);
                                console.log("err:");
                                console.log(err);
                                console.log("data:");
                                console.log(data);
                                */
                                try {
                                let candidates_q = input_candidates_q;
                                let allow_by_default = false;
                                if (err) {
                                    console.log("USER IS: " + user);
                                    console.log("err:");
                                    console.log(err);
                                    console.log("data:");
                                    console.log(data);
                                    console.log("IN EVENT OF WHOIS FAILURE, ALLOW IP BY DEFAULT");
                                    allow_by_default = true;
                                    /*
                                    if (!candidates_q[ip_q]["retries"]) candidates_q[ip_q]["retries"] = 1;
                                    else candidates_q[ip_q]["retries"] = candidates_q[ip_q]["retries"] + 1;
                                    candidates_q[ip_q]["msg"] = "WHOIS_ERR; retrying (#" + candidates_q[ip_q]["retries"] + ")";
                                    let f_ip_q = ip_q;
                                    let f_candidates_q = candidates_q;
                                    let f_user = user;
                                    let f_treq = treq;
                                    let f_delay = 3;
                                    setImmediate(whois_lookup, f_ip_q, f_candidates_q, f_user, f_treq, f_delay);
                                    */
                                    if (allow_by_default) {
                                        let rck = authorized_users[user]["rckey"];
                                        console.log("@" + ip_q + " + " + rck + " = " + sha256(ip_q + rck).toUpperCase());
                                        let attacker_hash = sha256(ip_q + rck).toUpperCase();
                                        if (local_attacker_hashes[wgg][attacker_hash]) {
                                            rejected = true;
                                            candidates_q[ip_q]["rejected"] = true;
                                            candidates_q[ip_q]["accepted"] = false;
                                            candidates_q[ip_q]["replicated"] = null;
                                            candidates_q[ip_q]["msg"] = "Duplicate IP";
                                            candidates_q[ip_q]["status"] = "Not allowed.";
                                        }
                                        else {
                                            candidates_q[ip_q]["rejected"] = false;
                                            candidates_q[ip_q]["accepted"] = true;
                                            candidates_q[ip_q]["replicated"] = null;
                                            candidates_q[ip_q]["msg"] = "Acceptable entry";
                                            candidates_q[ip_q]["status"] = "Added.";

                                            local_attacker_hashes[wgg][attacker_hash] = [];
                                            local_attacker_hashes[wgg][attacker_hash].push(ip_q);
                                            local_attacker_hashes[wgg][attacker_hash].push(0);

                                            global_attacker_hashes[attacker_hash] = [];
                                            global_attacker_hashes[attacker_hash].push(ip_q);
                                            global_attacker_hashes[attacker_hash].push(0);

                                            try {
                                                const add_rcip = ratecombat_db.prepare(`INSERT INTO global_attacker_hashes(user, hash, ip, i) SELECT ` + user + `, '` + attacker_hash + `', '` + ip_q + `', 0`).run();
                                            } catch (e) { }

                                            candidates_q[ip_q]["hash"] = attacker_hash;
                                            candidates_q[ip_q]["ip"] = ip_q;
                                            candidates_q[ip_q]["i"] = 0;
                                            candidates_q[ip_q]["user"] = user;
                                            candidates_q[ip_q]["op"] = "add";
                                        }
                                    }
                                }

                                if (!allow_by_default) {
                                if (typeof data === 'undefined') data = "";
                                const regexp = /NetName\: +(.+)\n/g;
                                const matches = data.matchAll(regexp);
                                let rejected = false;
                                for (const match of matches) {
                                  if (match[1] == "AKAMAI" && (true == true)) { //TODO revert this to disable edge IPs after testing; JWNOTE: DONE!
                                    rejected = true;
                                    candidates_q[ip_q]["rejected"] = true;
                                    candidates_q[ip_q]["accepted"] = false;
                                    candidates_q[ip_q]["replicated"] = null;
                                    candidates_q[ip_q]["msg"] = "NetName=AKAMAI";
                                    candidates_q[ip_q]["status"] = "Not allowed.";
                                    break;
                                  }
                                }
                                if (!rejected) {
                                    let rck = authorized_users[user]["rckey"];
                                    console.log("@" + ip_q + " + " + rck + " = " + sha256(ip_q + rck).toUpperCase());
                                    let attacker_hash = sha256(ip_q + rck).toUpperCase();
                                    if (local_attacker_hashes[wgg][attacker_hash]) {
                                        rejected = true;
                                        candidates_q[ip_q]["rejected"] = true;
                                        candidates_q[ip_q]["accepted"] = false;
                                        candidates_q[ip_q]["replicated"] = null;
                                        candidates_q[ip_q]["msg"] = "Duplicate IP";
                                        candidates_q[ip_q]["status"] = "Not allowed.";
                                    }
                                    else {
                                        candidates_q[ip_q]["rejected"] = false;
                                        candidates_q[ip_q]["accepted"] = true;
                                        candidates_q[ip_q]["replicated"] = null;
                                        candidates_q[ip_q]["msg"] = "Acceptable entry";
                                        candidates_q[ip_q]["status"] = "Added.";

                                        local_attacker_hashes[wgg][attacker_hash] = [];
                                        local_attacker_hashes[wgg][attacker_hash].push(ip_q);
                                        local_attacker_hashes[wgg][attacker_hash].push(0);

                                        global_attacker_hashes[attacker_hash] = [];
                                        global_attacker_hashes[attacker_hash].push(ip_q);
                                        global_attacker_hashes[attacker_hash].push(0);

                                        try {
                                            const add_rcip = ratecombat_db.prepare(`INSERT INTO global_attacker_hashes(user, hash, ip, i) SELECT ` + user + `, '` + attacker_hash + `', '` + ip_q + `', 0`).run();
                                        } catch (e) { }

                                        candidates_q[ip_q]["hash"] = attacker_hash;
                                        candidates_q[ip_q]["ip"] = ip_q;
                                        candidates_q[ip_q]["i"] = 0;
                                        candidates_q[ip_q]["user"] = user;
                                        candidates_q[ip_q]["op"] = "add";
                                    }
                                }
                                }
                            }
                            catch (e) {
                                log_function("LOCAL ALERT! Recovered from unhandled error:", treq, logger_object.error);
                                log_function(e, treq, logger_object.error);
                            }
                            }
                            )}, delay*1000);
                    }

                    function process_ip_candidates(candidates, user, treq) {
                        try {
                        let k = Object.keys(candidates);
                        for (let qq = 0; qq < k.length; qq++) {
                            let k_qq = k[qq];
                            console.log("setting function call: " + k_qq);
                            setImmediate(whois_lookup, k_qq, candidates, user, treq, qq);
                        }
                        }
                        catch (e) {
                            log_function("LOCAL ALERT! Recovered from unhandled error:", treq, logger_object.error);
                            log_function(e, treq, logger_object.error);
                        }
                    }

                    setImmediate(process_ip_candidates, ip_candidates, this_user, req);
                    res.redirect("/rcips?show");
		            }
		        }
		    }
		    }
            else {
                res.status(403).send("Invalid session, ip not added.");
            }
            }
            catch (e) {
                log_function("ALERT! Recovered from unhandled error:", req, logger_object.error);
                log_function(e, req, logger_object.error);
            }
            }
        });
        app.add_test_curl(null, `-s --data-raw "gatepass=EdJ0V5DrpNF0VAFXYVOeKAogIgyWdQPU&ratecombatkey=GoUr96DPBa" -v -o /dev/null 2>&1 | (egrep "< HTTP" || echo ABORT ABORT ABORT ABORT ABORT) | awk '{print $3}' | tr '\\n' ' ' | tr '\\r' ' ' | awk 'BEGIN { printf("\\033[97m") } {status="\\033[31mFAIL \\033[97m"; if ($1 == "ABORT") { status="\\033[35mFATAL\\033[97m" } else if ($1 == "403") { status="\\033[92mPASS \\033[97m";} print status ": TEST#46 Invalid session, ip not added";}'`);
        app.add_test_curl(null, `-s --data-raw 'ips=1.1.1.1&op=remove' -H "Cookie: wgg=fb24984a693317d803763f0ac0e4cb69f25680803ddaf190af396a6663773bfb;" -v -o /dev/null 2>&1 | (egrep "< HTTP" || echo ABORT ABORT ABORT ABORT ABORT) | awk '{print $3}' | tr '\\n' ' ' | tr '\\r' ' ' | awk 'BEGIN { printf("\\033[97m") } {status="\\033[31mFAIL \\033[97m"; if ($1 == "ABORT") { status="\\033[35mFATAL\\033[97m" } else if ($1 == "302" || $1 == "401") { status="\\033[92mPASS \\033[97m";} print status ": TEST#47  CLEANUP make sure RC IP is removed.";}' && sleep .3`);
        app.add_test_curl(null, `-s --data-raw 'ips=1.1.1.1&op=remove' -H "Cookie: wgg=fb24984a693317d803763f0ac0e4cb69f25680803ddaf190af396a6663773bfb;" -v -o /dev/null 2>&1 | (egrep "< HTTP" || echo ABORT ABORT ABORT ABORT ABORT) | awk '{print $3}' | tr '\\n' ' ' | tr '\\r' ' ' | awk 'BEGIN { printf("\\033[97m") } {status="\\033[31mFAIL \\033[97m"; if ($1 == "ABORT") { status="\\033[35mFATAL\\033[97m" } else if ($1 == "200" || $1 == "401" || $1 == "403") { status="\\033[92mPASS \\033[97m";} print status ": TEST#48  CLEANUP acknowledging previous request.";}'`,"/rcack");
        app.add_test_curl(null, `-s --data-raw 'ips=1.1.1.1&op=add' -H "Cookie: wgg=fb24984a693317d803763f0ac0e4cb69f25680803ddaf190af396a6663773bfb;" -v -o /dev/null 2>&1 | (egrep "< HTTP" || echo ABORT ABORT ABORT ABORT ABORT) | awk '{print $3}' | tr '\\n' ' ' | tr '\\r' ' ' | awk 'BEGIN { printf("\\033[97m") } {status="\\033[31mFAIL \\033[97m"; if ($1 == "ABORT") { status="\\033[35mFATAL\\033[97m" } else if ($1 == "302") { status="\\033[92mPASS \\033[97m";} print status ": TEST#49 Adding single IP";}'`);
        app.add_test_curl(null, `-s --data-raw 'ips=1.1.1.2&op=add' -H "Cookie: wgg=fb24984a693317d803763f0ac0e4cb69f25680803ddaf190af396a6663773bfb;" -v -o /dev/null 2>&1 | (egrep "< HTTP" || echo ABORT ABORT ABORT ABORT ABORT) | awk '{print $3}' | tr '\\n' ' ' | tr '\\r' ' ' | awk 'BEGIN { printf("\\033[97m") } {status="\\033[31mFAIL \\033[97m"; if ($1 == "ABORT") { status="\\033[35mFATAL\\033[97m" } else if ($1 == "401") { status="\\033[92mPASS \\033[97m";} print status ": TEST#50 Rejecting next add prior to acknowledgement";}' && sleep .3`);
        app.add_test_curl(null, `-s --data-raw 'ips=1.1.1.1&op=add' -H "Cookie: wgg=fb24984a693317d803763f0ac0e4cb69f25680803ddaf190af396a6663773bfb;" -v -o /dev/null 2>&1 | (egrep "< HTTP" || echo ABORT ABORT ABORT ABORT ABORT) | awk '{print $3}' | tr '\\n' ' ' | tr '\\r' ' ' | awk 'BEGIN { printf("\\033[97m") } {status="\\033[31mFAIL \\033[97m"; if ($1 == "ABORT") { status="\\033[35mFATAL\\033[97m" } else if ($1 == "200") { status="\\033[92mPASS \\033[97m";} print status ": TEST#51 Acknowledging previous operation";}'`,"/rcack");
        app.add_test_curl(null, `-s --data-raw 'ips=1.1.1.1&op=remove' -H "Cookie: wgg=fb24984a693317d803763f0ac0e4cb69f25680803ddaf190af396a6663773bfb;" -v -o /dev/null 2>&1 | (egrep "< HTTP" || echo ABORT ABORT ABORT ABORT ABORT) | awk '{print $3}' | tr '\\n' ' ' | tr '\\r' ' ' | awk 'BEGIN { printf("\\033[97m") } {status="\\033[31mFAIL \\033[97m"; if ($1 == "ABORT") { status="\\033[35mFATAL\\033[97m" } else if ($1 == "302") { status="\\033[92mPASS \\033[97m";} print status ": TEST#52 Removing single IP";}'`);
        app.add_test_curl(null, `-s --data-raw 'ips=1.1.1.2&op=remove' -H "Cookie: wgg=fb24984a693317d803763f0ac0e4cb69f25680803ddaf190af396a6663773bfb;" -v -o /dev/null 2>&1 | (egrep "< HTTP" || echo ABORT ABORT ABORT ABORT ABORT) | awk '{print $3}' | tr '\\n' ' ' | tr '\\r' ' ' | awk 'BEGIN { printf("\\033[97m") } {status="\\033[31mFAIL \\033[97m"; if ($1 == "ABORT") { status="\\033[35mFATAL\\033[97m" } else if ($1 == "401") { status="\\033[92mPASS \\033[97m";} print status ": TEST#53 Rejecting next remove prior to acknowledgement";}' && sleep .3`);
        app.add_test_curl(null, `-s --data-raw 'ips=1.1.1.1&op=remove' -H "Cookie: wgg=fb24984a693317d803763f0ac0e4cb69f25680803ddaf190af396a6663773bfb;" -v -o /dev/null 2>&1 | (egrep "< HTTP" || echo ABORT ABORT ABORT ABORT ABORT) | awk '{print $3}' | tr '\\n' ' ' | tr '\\r' ' ' | awk 'BEGIN { printf("\\033[97m") } {status="\\033[31mFAIL \\033[97m"; if ($1 == "ABORT") { status="\\033[35mFATAL\\033[97m" } else if ($1 == "200") { status="\\033[92mPASS \\033[97m";} print status ": TEST#54 Acknowledging previous operation";}'`,"/rcack");
        app.add_test_curl(null, `-s --data-raw 'ips=1.1.1.1b&op=remove' -H "Cookie: wgg=fb24984a693317d803763f0ac0e4cb69f25680803ddaf190af396a6663773bfb;" -v -o /dev/null 2>&1 | (egrep "< HTTP" || echo ABORT ABORT ABORT ABORT ABORT) | awk '{print $3}' | tr '\\n' ' ' | tr '\\r' ' ' | awk 'BEGIN { printf("\\033[97m") } {status="\\033[31mFAIL \\033[97m"; if ($1 == "ABORT") { status="\\033[35mFATAL\\033[97m" } else if ($1 == "401") { status="\\033[92mPASS \\033[97m";} print status ": TEST#55 reject removing non-ips";}'`);
        app.add_test_curl(null, `-s --data-raw 'ips=1.1.1.1b&op=add' -H "Cookie: wgg=fb24984a693317d803763f0ac0e4cb69f25680803ddaf190af396a6663773bfb;" -v -o /dev/null 2>&1 | (egrep "< HTTP" || echo ABORT ABORT ABORT ABORT ABORT) | awk '{print $3}' | tr '\\n' ' ' | tr '\\r' ' ' | awk 'BEGIN { printf("\\033[97m") } {status="\\033[31mFAIL \\033[97m"; if ($1 == "ABORT") { status="\\033[35mFATAL\\033[97m" } else if ($1 == "401") { status="\\033[92mPASS \\033[97m";} print status ": TEST#56 reject addomg non-ips";}'`);
        app.add_test_curl(null, `-s --data-raw 'ips=0.0.0.1 0.0.0.2 0.0.0.3 0.0.0.4 0.0.0.5 0.0.0.6 0.0.0.7 0.0.0.8 0.0.0.9 0.0.0.10 0.0.0.11 0.0.0.12 0.0.0.13 0.0.0.14 0.0.0.15 0.0.0.16 0.0.0.17&op=add' -H "Cookie: wgg=fb24984a693317d803763f0ac0e4cb69f25680803ddaf190af396a6663773bfb;" -v -o /dev/null 2>&1 | (egrep "< HTTP" || echo ABORT ABORT ABORT ABORT ABORT) | awk '{print $3}' | tr '\\n' ' ' | tr '\\r' ' ' | awk 'BEGIN { printf("\\033[97m") } {status="\\033[31mFAIL \\033[97m"; if ($1 == "ABORT") { status="\\033[35mFATAL\\033[97m" } else if ($1 == "401") { status="\\033[92mPASS \\033[97m";} print status ": TEST#57 reject adding >16 ips";}'`);
        app.add_test_curl(null, `-s --data-raw 'ips=0.0.0.1 0.0.0.2 0.0.0.3 0.0.0.4 0.0.0.5 0.0.0.6 0.0.0.7 0.0.0.8 0.0.0.9 0.0.0.10 0.0.0.11 0.0.0.12 0.0.0.13 0.0.0.14 0.0.0.15 0.0.0.16&op=add' -H "Cookie: wgg=fb24984a693317d803763f0ac0e4cb69f25680803ddaf190af396a6663773bfb;" -v -o /dev/null 2>&1 | (egrep "< HTTP" || echo ABORT ABORT ABORT ABORT ABORT) | awk '{print $3}' | tr '\\n' ' ' | tr '\\r' ' ' | awk 'BEGIN { printf("\\033[97m") } {status="\\033[31mFAIL \\033[97m"; if ($1 == "ABORT") { status="\\033[35mFATAL\\033[97m" } else if ($1 == "302") { status="\\033[92mPASS \\033[97m";} print status ": TEST#58 adding 16 ips";}' && sleep 4`);
        app.add_test_curl(null, `-s --data-raw 'ips=1.1.1.1' -H "Cookie: wgg=fb24984a693317d803763f0ac0e4cb69f25680803ddaf190af396a6663773bfb;" -v -o /dev/null 2>&1 | (egrep "< HTTP" || echo ABORT ABORT ABORT ABORT ABORT) | awk '{print $3}' | tr '\\n' ' ' | tr '\\r' ' ' | awk 'BEGIN { printf("\\033[97m") } {status="\\033[31mFAIL \\033[97m"; if ($1 == "ABORT") { status="\\033[35mFATAL\\033[97m" } else if ($1 == "200") { status="\\033[92mPASS \\033[97m";} print status ": TEST#59 Acknowledging previous operation";}'`,"/rcack");
        app.add_test_curl(null, `-s --data-raw 'ips=1.0.0.1 1.0.0.2 1.0.0.3 1.0.0.4 1.0.0.5 1.0.0.6 1.0.0.7 1.0.0.8 1.0.0.9 1.0.0.10 1.0.0.11 1.0.0.12 1.0.0.13 1.0.0.14 1.0.0.15 1.0.0.16&op=add' -H "Cookie: wgg=fb24984a693317d803763f0ac0e4cb69f25680803ddaf190af396a6663773bfb;" -v -o /dev/null 2>&1 | (egrep "< HTTP" || echo ABORT ABORT ABORT ABORT ABORT) | awk '{print $3}' | tr '\\n' ' ' | tr '\\r' ' ' | awk 'BEGIN { printf("\\033[97m") } {status="\\033[31mFAIL \\033[97m"; if ($1 == "ABORT") { status="\\033[35mFATAL\\033[97m" } else if ($1 == "302") { status="\\033[92mPASS \\033[97m";} print status ": TEST#60 adding 16 ips";}' && sleep 4`);
        app.add_test_curl(null, `-s --data-raw 'ips=1.1.1.1' -H "Cookie: wgg=fb24984a693317d803763f0ac0e4cb69f25680803ddaf190af396a6663773bfb;" -v -o /dev/null 2>&1 | (egrep "< HTTP" || echo ABORT ABORT ABORT ABORT ABORT) | awk '{print $3}' | tr '\\n' ' ' | tr '\\r' ' ' | awk 'BEGIN { printf("\\033[97m") } {status="\\033[31mFAIL \\033[97m"; if ($1 == "ABORT") { status="\\033[35mFATAL\\033[97m" } else if ($1 == "200") { status="\\033[92mPASS \\033[97m";} print status ": TEST#61 Acknowledging previous operation";}'`,"/rcack");
        app.add_test_curl(null, `-s --data-raw 'ips=2.0.0.1 2.0.0.2 2.0.0.3 2.0.0.4 2.0.0.5 2.0.0.6 2.0.0.7 2.0.0.8 2.0.0.9 2.0.0.10 2.0.0.11 2.0.0.12 2.0.0.13 2.0.0.14 2.0.0.15 2.0.0.16&op=add' -H "Cookie: wgg=fb24984a693317d803763f0ac0e4cb69f25680803ddaf190af396a6663773bfb;" -v -o /dev/null 2>&1 | (egrep "< HTTP" || echo ABORT ABORT ABORT ABORT ABORT) | awk '{print $3}' | tr '\\n' ' ' | tr '\\r' ' ' | awk 'BEGIN { printf("\\033[97m") } {status="\\033[31mFAIL \\033[97m"; if ($1 == "ABORT") { status="\\033[35mFATAL\\033[97m" } else if ($1 == "302") { status="\\033[92mPASS \\033[97m";} print status ": TEST#62 adding 16 ips";}' && sleep 4`);
        app.add_test_curl(null, `-s --data-raw 'ips=1.1.1.1' -H "Cookie: wgg=fb24984a693317d803763f0ac0e4cb69f25680803ddaf190af396a6663773bfb;" -v -o /dev/null 2>&1 | (egrep "< HTTP" || echo ABORT ABORT ABORT ABORT ABORT) | awk '{print $3}' | tr '\\n' ' ' | tr '\\r' ' ' | awk 'BEGIN { printf("\\033[97m") } {status="\\033[31mFAIL \\033[97m"; if ($1 == "ABORT") { status="\\033[35mFATAL\\033[97m" } else if ($1 == "200") { status="\\033[92mPASS \\033[97m";} print status ": TEST#63 Acknowledging previous operation";}'`,"/rcack");
        app.add_test_curl(null, `-s --data-raw 'ips=3.0.0.1 3.0.0.2 3.0.0.3 3.0.0.4 3.0.0.5 3.0.0.6 3.0.0.7 3.0.0.8 3.0.0.9 3.0.0.10 3.0.0.11 3.0.0.12 3.0.0.13 3.0.0.14 3.0.0.15 3.0.0.16&op=add' -H "Cookie: wgg=fb24984a693317d803763f0ac0e4cb69f25680803ddaf190af396a6663773bfb;" -v -o /dev/null 2>&1 | (egrep "< HTTP" || echo ABORT ABORT ABORT ABORT ABORT) | awk '{print $3}' | tr '\\n' ' ' | tr '\\r' ' ' | awk 'BEGIN { printf("\\033[97m") } {status="\\033[31mFAIL \\033[97m"; if ($1 == "ABORT") { status="\\033[35mFATAL\\033[97m" } else if ($1 == "302") { status="\\033[92mPASS \\033[97m";} print status ": TEST#64 adding 16 ips";}' && sleep 4`);
        app.add_test_curl(null, `-s --data-raw 'ips=1.1.1.1' -H "Cookie: wgg=fb24984a693317d803763f0ac0e4cb69f25680803ddaf190af396a6663773bfb;" -v -o /dev/null 2>&1 | (egrep "< HTTP" || echo ABORT ABORT ABORT ABORT ABORT) | awk '{print $3}' | tr '\\n' ' ' | tr '\\r' ' ' | awk 'BEGIN { printf("\\033[97m") } {status="\\033[31mFAIL \\033[97m"; if ($1 == "ABORT") { status="\\033[35mFATAL\\033[97m" } else if ($1 == "200") { status="\\033[92mPASS \\033[97m";} print status ": TEST#65 Acknowledging previous operation";}'`,"/rcack");
        app.add_test_curl(null, `-s --data-raw 'ips=4.0.0.1 4.0.0.2 4.0.0.3 4.0.0.4 4.0.0.5 4.0.0.6 4.0.0.7 4.0.0.8 4.0.0.9 4.0.0.10 4.0.0.11 4.0.0.12 4.0.0.13 4.0.0.14 4.0.0.15 4.0.0.16&op=add' -H "Cookie: wgg=fb24984a693317d803763f0ac0e4cb69f25680803ddaf190af396a6663773bfb;" -v -o /dev/null 2>&1 | (egrep "< HTTP" || echo ABORT ABORT ABORT ABORT ABORT) | awk '{print $3}' | tr '\\n' ' ' | tr '\\r' ' ' | awk 'BEGIN { printf("\\033[97m") } {status="\\033[31mFAIL \\033[97m"; if ($1 == "ABORT") { status="\\033[35mFATAL\\033[97m" } else if ($1 == "302") { status="\\033[92mPASS \\033[97m";} print status ": TEST#66 adding 16 ips";}' && sleep 4`);
        app.add_test_curl(null, `-s --data-raw 'ips=1.1.1.1' -H "Cookie: wgg=fb24984a693317d803763f0ac0e4cb69f25680803ddaf190af396a6663773bfb;" -v -o /dev/null 2>&1 | (egrep "< HTTP" || echo ABORT ABORT ABORT ABORT ABORT) | awk '{print $3}' | tr '\\n' ' ' | tr '\\r' ' ' | awk 'BEGIN { printf("\\033[97m") } {status="\\033[31mFAIL \\033[97m"; if ($1 == "ABORT") { status="\\033[35mFATAL\\033[97m" } else if ($1 == "200") { status="\\033[92mPASS \\033[97m";} print status ": TEST#67 Acknowledging previous operation";}'`,"/rcack");
        app.add_test_curl(null, `-s --data-raw 'ips=5.0.0.1 5.0.0.2 5.0.0.3 5.0.0.4 5.0.0.5 5.0.0.6 5.0.0.7 5.0.0.8 5.0.0.9 5.0.0.10 5.0.0.11 5.0.0.12 5.0.0.13 5.0.0.14 5.0.0.15 5.0.0.16&op=add' -H "Cookie: wgg=fb24984a693317d803763f0ac0e4cb69f25680803ddaf190af396a6663773bfb;" -v -o /dev/null 2>&1 | (egrep "< HTTP" || echo ABORT ABORT ABORT ABORT ABORT) | awk '{print $3}' | tr '\\n' ' ' | tr '\\r' ' ' | awk 'BEGIN { printf("\\033[97m") } {status="\\033[31mFAIL \\033[97m"; if ($1 == "ABORT") { status="\\033[35mFATAL\\033[97m" } else if ($1 == "302") { status="\\033[92mPASS \\033[97m";} print status ": TEST#68 adding 16 ips";}' && sleep 4`);
        app.add_test_curl(null, `-s --data-raw 'ips=1.1.1.1' -H "Cookie: wgg=fb24984a693317d803763f0ac0e4cb69f25680803ddaf190af396a6663773bfb;" -v -o /dev/null 2>&1 | (egrep "< HTTP" || echo ABORT ABORT ABORT ABORT ABORT) | awk '{print $3}' | tr '\\n' ' ' | tr '\\r' ' ' | awk 'BEGIN { printf("\\033[97m") } {status="\\033[31mFAIL \\033[97m"; if ($1 == "ABORT") { status="\\033[35mFATAL\\033[97m" } else if ($1 == "200") { status="\\033[92mPASS \\033[97m";} print status ": TEST#69 Acknowledging previous operation";}'`,"/rcack");
        app.add_test_curl(null, `-s --data-raw 'ips=6.0.0.1 6.0.0.2 6.0.0.3 6.0.0.4 6.0.0.5 6.0.0.6 6.0.0.7 6.0.0.8 6.0.0.9 6.0.0.10 6.0.0.11 6.0.0.12 6.0.0.13 6.0.0.14 6.0.0.15 6.0.0.16&op=add' -H "Cookie: wgg=fb24984a693317d803763f0ac0e4cb69f25680803ddaf190af396a6663773bfb;" -v -o /dev/null 2>&1 | (egrep "< HTTP" || echo ABORT ABORT ABORT ABORT ABORT) | awk '{print $3}' | tr '\\n' ' ' | tr '\\r' ' ' | awk 'BEGIN { printf("\\033[97m") } {status="\\033[31mFAIL \\033[97m"; if ($1 == "ABORT") { status="\\033[35mFATAL\\033[97m" } else if ($1 == "302") { status="\\033[92mPASS \\033[97m";} print status ": TEST#70 adding 16 ips";}' && sleep 4`);
        app.add_test_curl(null, `-s --data-raw 'ips=1.1.1.1' -H "Cookie: wgg=fb24984a693317d803763f0ac0e4cb69f25680803ddaf190af396a6663773bfb;" -v -o /dev/null 2>&1 | (egrep "< HTTP" || echo ABORT ABORT ABORT ABORT ABORT) | awk '{print $3}' | tr '\\n' ' ' | tr '\\r' ' ' | awk 'BEGIN { printf("\\033[97m") } {status="\\033[31mFAIL \\033[97m"; if ($1 == "ABORT") { status="\\033[35mFATAL\\033[97m" } else if ($1 == "200") { status="\\033[92mPASS \\033[97m";} print status ": TEST#71 Acknowledging previous operation";}'`,"/rcack");
        app.add_test_curl(null, `-s --data-raw 'ips=7.0.0.1 7.0.0.2 7.0.0.3 7.0.0.4 7.0.0.5 7.0.0.6 7.0.0.7 7.0.0.8 7.0.0.9 7.0.0.10 7.0.0.11 7.0.0.12 7.0.0.13 7.0.0.14 7.0.0.15 7.0.0.16&op=add' -H "Cookie: wgg=fb24984a693317d803763f0ac0e4cb69f25680803ddaf190af396a6663773bfb;" -v -o /dev/null 2>&1 | (egrep "< HTTP" || echo ABORT ABORT ABORT ABORT ABORT) | awk '{print $3}' | tr '\\n' ' ' | tr '\\r' ' ' | awk 'BEGIN { printf("\\033[97m") } {status="\\033[31mFAIL \\033[97m"; if ($1 == "ABORT") { status="\\033[35mFATAL\\033[97m" } else if ($1 == "302") { status="\\033[92mPASS \\033[97m";} print status ": TEST#72 adding 16 ips";}' && sleep 4`);
        app.add_test_curl(null, `-s --data-raw 'ips=1.1.1.1' -H "Cookie: wgg=fb24984a693317d803763f0ac0e4cb69f25680803ddaf190af396a6663773bfb;" -v -o /dev/null 2>&1 | (egrep "< HTTP" || echo ABORT ABORT ABORT ABORT ABORT) | awk '{print $3}' | tr '\\n' ' ' | tr '\\r' ' ' | awk 'BEGIN { printf("\\033[97m") } {status="\\033[31mFAIL \\033[97m"; if ($1 == "ABORT") { status="\\033[35mFATAL\\033[97m" } else if ($1 == "200") { status="\\033[92mPASS \\033[97m";} print status ": TEST#73 Acknowledging previous operation";}'`,"/rcack");
        app.add_test_curl(null, `-s --data-raw 'ips=8.0.0.1 8.0.0.2 8.0.0.3 8.0.0.4 8.0.0.5 8.0.0.6 8.0.0.7 8.0.0.8 8.0.0.9 8.0.0.10 8.0.0.11 8.0.0.12 8.0.0.13 8.0.0.14 8.0.0.15 8.0.0.16&op=add' -H "Cookie: wgg=fb24984a693317d803763f0ac0e4cb69f25680803ddaf190af396a6663773bfb;" -v -o /dev/null 2>&1 | (egrep "< HTTP" || echo ABORT ABORT ABORT ABORT ABORT) | awk '{print $3}' | tr '\\n' ' ' | tr '\\r' ' ' | awk 'BEGIN { printf("\\033[97m") } {status="\\033[31mFAIL \\033[97m"; if ($1 == "ABORT") { status="\\033[35mFATAL\\033[97m" } else if ($1 == "302") { status="\\033[92mPASS \\033[97m";} print status ": TEST#74 adding 16 ips";}' && sleep 4`);
        app.add_test_curl(null, `-s --data-raw 'ips=1.1.1.1' -H "Cookie: wgg=fb24984a693317d803763f0ac0e4cb69f25680803ddaf190af396a6663773bfb;" -v -o /dev/null 2>&1 | (egrep "< HTTP" || echo ABORT ABORT ABORT ABORT ABORT) | awk '{print $3}' | tr '\\n' ' ' | tr '\\r' ' ' | awk 'BEGIN { printf("\\033[97m") } {status="\\033[31mFAIL \\033[97m"; if ($1 == "ABORT") { status="\\033[35mFATAL\\033[97m" } else if ($1 == "200") { status="\\033[92mPASS \\033[97m";} print status ": TEST#75 Acknowledging previous operation";}'`,"/rcack");
        app.add_test_curl(null, `-s --data-raw 'ips=9.0.0.1 9.0.0.2 9.0.0.3 9.0.0.4 9.0.0.5 9.0.0.6 9.0.0.7 9.0.0.8 9.0.0.9 9.0.0.10 9.0.0.11 9.0.0.12 9.0.0.13 9.0.0.14 9.0.0.15 9.0.0.16&op=add' -H "Cookie: wgg=fb24984a693317d803763f0ac0e4cb69f25680803ddaf190af396a6663773bfb;" -v -o /dev/null 2>&1 | (egrep "< HTTP" || echo ABORT ABORT ABORT ABORT ABORT) | awk '{print $3}' | tr '\\n' ' ' | tr '\\r' ' ' | awk 'BEGIN { printf("\\033[97m") } {status="\\033[31mFAIL \\033[97m"; if ($1 == "ABORT") { status="\\033[35mFATAL\\033[97m" } else if ($1 == "302") { status="\\033[92mPASS \\033[97m";} print status ": TEST#76 adding 16 ips";}' && sleep 4`);
        app.add_test_curl(null, `-s --data-raw 'ips=1.1.1.1' -H "Cookie: wgg=fb24984a693317d803763f0ac0e4cb69f25680803ddaf190af396a6663773bfb;" -v -o /dev/null 2>&1 | (egrep "< HTTP" || echo ABORT ABORT ABORT ABORT ABORT) | awk '{print $3}' | tr '\\n' ' ' | tr '\\r' ' ' | awk 'BEGIN { printf("\\033[97m") } {status="\\033[31mFAIL \\033[97m"; if ($1 == "ABORT") { status="\\033[35mFATAL\\033[97m" } else if ($1 == "200") { status="\\033[92mPASS \\033[97m";} print status ": TEST#77 Acknowledging previous operation";}'`,"/rcack");
        app.add_test_curl(null, `-s --data-raw 'ips=100.0.0.1 100.0.0.2 100.0.0.3 100.0.0.4 100.0.0.5 100.0.0.6 100.0.0.7 100.0.0.8 100.0.0.9 100.0.0.10 100.0.0.11 100.0.0.12 100.0.0.13 100.0.0.14 100.0.0.15 100.0.0.16&op=add' -H "Cookie: wgg=fb24984a693317d803763f0ac0e4cb69f25680803ddaf190af396a6663773bfb;" -v -o /dev/null 2>&1 | (egrep "< HTTP" || echo ABORT ABORT ABORT ABORT ABORT) | awk '{print $3}' | tr '\\n' ' ' | tr '\\r' ' ' | awk 'BEGIN { printf("\\033[97m") } {status="\\033[31mFAIL \\033[97m"; if ($1 == "ABORT") { status="\\033[35mFATAL\\033[97m" } else if ($1 == "302") { status="\\033[92mPASS \\033[97m";} print status ": TEST#78 adding 16 ips";}' && sleep 4`);
        app.add_test_curl(null, `-s --data-raw 'ips=1.1.1.1' -H "Cookie: wgg=fb24984a693317d803763f0ac0e4cb69f25680803ddaf190af396a6663773bfb;" -v -o /dev/null 2>&1 | (egrep "< HTTP" || echo ABORT ABORT ABORT ABORT ABORT) | awk '{print $3}' | tr '\\n' ' ' | tr '\\r' ' ' | awk 'BEGIN { printf("\\033[97m") } {status="\\033[31mFAIL \\033[97m"; if ($1 == "ABORT") { status="\\033[35mFATAL\\033[97m" } else if ($1 == "200") { status="\\033[92mPASS \\033[97m";} print status ": TEST#79 Acknowledging previous operation";}'`,"/rcack");
        app.add_test_curl(null, `-s --data-raw 'ips=11.0.0.1 11.0.0.2 11.0.0.3 11.0.0.4 11.0.0.5 11.0.0.6 11.0.0.7 11.0.0.8 11.0.0.9 11.0.0.10 11.0.0.11 11.0.0.12 11.0.0.13 11.0.0.14 11.0.0.15 11.0.0.16&op=add' -H "Cookie: wgg=fb24984a693317d803763f0ac0e4cb69f25680803ddaf190af396a6663773bfb;" -v -o /dev/null 2>&1 | (egrep "< HTTP" || echo ABORT ABORT ABORT ABORT ABORT) | awk '{print $3}' | tr '\\n' ' ' | tr '\\r' ' ' | awk 'BEGIN { printf("\\033[97m") } {status="\\033[31mFAIL \\033[97m"; if ($1 == "ABORT") { status="\\033[35mFATAL\\033[97m" } else if ($1 == "302") { status="\\033[92mPASS \\033[97m";} print status ": TEST#80 adding 16 ips";}' && sleep 4`);
        app.add_test_curl(null, `-s --data-raw 'ips=1.1.1.1' -H "Cookie: wgg=fb24984a693317d803763f0ac0e4cb69f25680803ddaf190af396a6663773bfb;" -v -o /dev/null 2>&1 | (egrep "< HTTP" || echo ABORT ABORT ABORT ABORT ABORT) | awk '{print $3}' | tr '\\n' ' ' | tr '\\r' ' ' | awk 'BEGIN { printf("\\033[97m") } {status="\\033[31mFAIL \\033[97m"; if ($1 == "ABORT") { status="\\033[35mFATAL\\033[97m" } else if ($1 == "200") { status="\\033[92mPASS \\033[97m";} print status ": TEST#81 Acknowledging previous operation";}'`,"/rcack");
        app.add_test_curl(null, `-s --data-raw 'ips=12.0.0.1 12.0.0.2 12.0.0.3 12.0.0.4 12.0.0.5 12.0.0.6 12.0.0.7 12.0.0.8 12.0.0.9 12.0.0.10 12.0.0.11 12.0.0.12 12.0.0.13 12.0.0.14 12.0.0.15 12.0.0.16&op=add' -H "Cookie: wgg=fb24984a693317d803763f0ac0e4cb69f25680803ddaf190af396a6663773bfb;" -v -o /dev/null 2>&1 | (egrep "< HTTP" || echo ABORT ABORT ABORT ABORT ABORT) | awk '{print $3}' | tr '\\n' ' ' | tr '\\r' ' ' | awk 'BEGIN { printf("\\033[97m") } {status="\\033[31mFAIL \\033[97m"; if ($1 == "ABORT") { status="\\033[35mFATAL\\033[97m" } else if ($1 == "302") { status="\\033[92mPASS \\033[97m";} print status ": TEST#82 adding 16 ips";}' && sleep 4`);
        app.add_test_curl(null, `-s --data-raw 'ips=1.1.1.1' -H "Cookie: wgg=fb24984a693317d803763f0ac0e4cb69f25680803ddaf190af396a6663773bfb;" -v -o /dev/null 2>&1 | (egrep "< HTTP" || echo ABORT ABORT ABORT ABORT ABORT) | awk '{print $3}' | tr '\\n' ' ' | tr '\\r' ' ' | awk 'BEGIN { printf("\\033[97m") } {status="\\033[31mFAIL \\033[97m"; if ($1 == "ABORT") { status="\\033[35mFATAL\\033[97m" } else if ($1 == "200") { status="\\033[92mPASS \\033[97m";} print status ": TEST#83 Acknowledging previous operation";}'`,"/rcack");
        app.add_test_curl(null, `-s --data-raw 'ips=13.0.0.1 13.0.0.2 13.0.0.3 13.0.0.4 13.0.0.5 13.0.0.6 13.0.0.7 13.0.0.8 13.0.0.9 13.0.0.10 13.0.0.11 13.0.0.12 13.0.0.13 13.0.0.14 13.0.0.15 13.0.0.16&op=add' -H "Cookie: wgg=fb24984a693317d803763f0ac0e4cb69f25680803ddaf190af396a6663773bfb;" -v -o /dev/null 2>&1 | (egrep "< HTTP" || echo ABORT ABORT ABORT ABORT ABORT) | awk '{print $3}' | tr '\\n' ' ' | tr '\\r' ' ' | awk 'BEGIN { printf("\\033[97m") } {status="\\033[31mFAIL \\033[97m"; if ($1 == "ABORT") { status="\\033[35mFATAL\\033[97m" } else if ($1 == "302") { status="\\033[92mPASS \\033[97m";} print status ": TEST#84 adding 16 ips";}' && sleep 4`);
        app.add_test_curl(null, `-s --data-raw 'ips=1.1.1.1' -H "Cookie: wgg=fb24984a693317d803763f0ac0e4cb69f25680803ddaf190af396a6663773bfb;" -v -o /dev/null 2>&1 | (egrep "< HTTP" || echo ABORT ABORT ABORT ABORT ABORT) | awk '{print $3}' | tr '\\n' ' ' | tr '\\r' ' ' | awk 'BEGIN { printf("\\033[97m") } {status="\\033[31mFAIL \\033[97m"; if ($1 == "ABORT") { status="\\033[35mFATAL\\033[97m" } else if ($1 == "200") { status="\\033[92mPASS \\033[97m";} print status ": TEST#85 Acknowledging previous operation";}'`,"/rcack");
        app.add_test_curl(null, `-s --data-raw 'ips=14.0.0.1 14.0.0.2 14.0.0.3 14.0.0.4 14.0.0.5 14.0.0.6 14.0.0.7 14.0.0.8 14.0.0.9 14.0.0.10 14.0.0.11 14.0.0.12 14.0.0.13 14.0.0.14 14.0.0.15 14.0.0.16&op=add' -H "Cookie: wgg=fb24984a693317d803763f0ac0e4cb69f25680803ddaf190af396a6663773bfb;" -v -o /dev/null 2>&1 | (egrep "< HTTP" || echo ABORT ABORT ABORT ABORT ABORT) | awk '{print $3}' | tr '\\n' ' ' | tr '\\r' ' ' | awk 'BEGIN { printf("\\033[97m") } {status="\\033[31mFAIL \\033[97m"; if ($1 == "ABORT") { status="\\033[35mFATAL\\033[97m" } else if ($1 == "302") { status="\\033[92mPASS \\033[97m";} print status ": TEST#86 adding 16 ips";}' && sleep 4`);
        app.add_test_curl(null, `-s --data-raw 'ips=1.1.1.1' -H "Cookie: wgg=fb24984a693317d803763f0ac0e4cb69f25680803ddaf190af396a6663773bfb;" -v -o /dev/null 2>&1 | (egrep "< HTTP" || echo ABORT ABORT ABORT ABORT ABORT) | awk '{print $3}' | tr '\\n' ' ' | tr '\\r' ' ' | awk 'BEGIN { printf("\\033[97m") } {status="\\033[31mFAIL \\033[97m"; if ($1 == "ABORT") { status="\\033[35mFATAL\\033[97m" } else if ($1 == "200") { status="\\033[92mPASS \\033[97m";} print status ": TEST#87 Acknowledging previous operation";}'`,"/rcack");
        app.add_test_curl(null, `-s --data-raw 'ips=15.0.0.1 15.0.0.2 15.0.0.3 15.0.0.4 15.0.0.5 15.0.0.6 15.0.0.7 15.0.0.8 15.0.0.9 15.0.0.10 15.0.0.11 15.0.0.12 15.0.0.13 15.0.0.14 15.0.0.15 15.0.0.16&op=add' -H "Cookie: wgg=fb24984a693317d803763f0ac0e4cb69f25680803ddaf190af396a6663773bfb;" -v -o /dev/null 2>&1 | (egrep "< HTTP" || echo ABORT ABORT ABORT ABORT ABORT) | awk '{print $3}' | tr '\\n' ' ' | tr '\\r' ' ' | awk 'BEGIN { printf("\\033[97m") } {status="\\033[31mFAIL \\033[97m"; if ($1 == "ABORT") { status="\\033[35mFATAL\\033[97m" } else if ($1 == "302") { status="\\033[92mPASS \\033[97m";} print status ": TEST#88 adding 16 ips";}' && sleep 4`);
        app.add_test_curl(null, `-s --data-raw 'ips=1.1.1.1' -H "Cookie: wgg=fb24984a693317d803763f0ac0e4cb69f25680803ddaf190af396a6663773bfb;" -v -o /dev/null 2>&1 | (egrep "< HTTP" || echo ABORT ABORT ABORT ABORT ABORT) | awk '{print $3}' | tr '\\n' ' ' | tr '\\r' ' ' | awk 'BEGIN { printf("\\033[97m") } {status="\\033[31mFAIL \\033[97m"; if ($1 == "ABORT") { status="\\033[35mFATAL\\033[97m" } else if ($1 == "200") { status="\\033[92mPASS \\033[97m";} print status ": TEST#89 Acknowledging previous operation";}'`,"/rcack");
        app.add_test_curl(null, `-s --data-raw 'ips=17.0.0.1 17.0.0.2 17.0.0.3 17.0.0.4 17.0.0.5 17.0.0.6 17.0.0.7 17.0.0.8 17.0.0.9 17.0.0.10 17.0.0.11 17.0.0.12 17.0.0.13 17.0.0.14 17.0.0.15 17.0.0.16&op=add' -H "Cookie: wgg=fb24984a693317d803763f0ac0e4cb69f25680803ddaf190af396a6663773bfb;" -v -o /dev/null 2>&1 | (egrep "< HTTP" || echo ABORT ABORT ABORT ABORT ABORT) | awk '{print $3}' | tr '\\n' ' ' | tr '\\r' ' ' | awk 'BEGIN { printf("\\033[97m") } {status="\\033[31mFAIL \\033[97m"; if ($1 == "ABORT") { status="\\033[35mFATAL\\033[97m" } else if ($1 == "401") { status="\\033[92mPASS \\033[97m";} print status ": TEST#92 reject extra IPs";}' && sleep 4`);
        app.add_test_curl(null, `-s --data-raw 'ips=0.0.0.1 0.0.0.2 0.0.0.3 0.0.0.4 0.0.0.5 0.0.0.6 0.0.0.7 0.0.0.8 0.0.0.9 0.0.0.10 0.0.0.11 0.0.0.12 0.0.0.13 0.0.0.14 0.0.0.15 0.0.0.16 1.0.0.1 1.0.0.2 1.0.0.3 1.0.0.4 1.0.0.5 1.0.0.6 1.0.0.7 1.0.0.8 1.0.0.9 1.0.0.10 1.0.0.11 1.0.0.12 1.0.0.13 1.0.0.14 1.0.0.15 1.0.0.16 2.0.0.1 2.0.0.2 2.0.0.3 2.0.0.4 2.0.0.5 2.0.0.6 2.0.0.7 2.0.0.8 2.0.0.9 2.0.0.10 2.0.0.11 2.0.0.12 2.0.0.13 2.0.0.14 2.0.0.15 2.0.0.16 3.0.0.1 3.0.0.2 3.0.0.3 3.0.0.4 3.0.0.5 3.0.0.6 3.0.0.7 3.0.0.8 3.0.0.9 3.0.0.10 3.0.0.11 3.0.0.12 3.0.0.13 3.0.0.14 3.0.0.15 3.0.0.16 4.0.0.1 4.0.0.2 4.0.0.3 4.0.0.4 4.0.0.5 4.0.0.6 4.0.0.7 4.0.0.8 4.0.0.9 4.0.0.10 4.0.0.11 4.0.0.12 4.0.0.13 4.0.0.14 4.0.0.15 4.0.0.16 5.0.0.1 5.0.0.2 5.0.0.3 5.0.0.4 5.0.0.5 5.0.0.6 5.0.0.7 5.0.0.8 5.0.0.9 5.0.0.10 5.0.0.11 5.0.0.12 5.0.0.13 5.0.0.14 5.0.0.15 5.0.0.16 6.0.0.1 6.0.0.2 6.0.0.3 6.0.0.4 6.0.0.5 6.0.0.6 6.0.0.7 6.0.0.8 6.0.0.9 6.0.0.10 6.0.0.11 6.0.0.12 6.0.0.13 6.0.0.14 6.0.0.15 6.0.0.16 7.0.0.1 7.0.0.2 7.0.0.3 7.0.0.4 7.0.0.5 7.0.0.6 7.0.0.7 7.0.0.8 7.0.0.9 7.0.0.10 7.0.0.11 7.0.0.12 7.0.0.13 7.0.0.14 7.0.0.15 7.0.0.16 8.0.0.1 8.0.0.2 8.0.0.3 8.0.0.4 8.0.0.5 8.0.0.6 8.0.0.7 8.0.0.8 8.0.0.9 8.0.0.10 8.0.0.11 8.0.0.12 8.0.0.13 8.0.0.14 8.0.0.15 8.0.0.16 9.0.0.1 9.0.0.2 9.0.0.3 9.0.0.4 9.0.0.5 9.0.0.6 9.0.0.7 9.0.0.8 9.0.0.9 9.0.0.10 9.0.0.11 9.0.0.12 9.0.0.13 9.0.0.14 9.0.0.15 9.0.0.16 100.0.0.1 100.0.0.2 100.0.0.3 100.0.0.4 100.0.0.5 100.0.0.6 100.0.0.7 100.0.0.8 100.0.0.9 100.0.0.10 100.0.0.11 100.0.0.12 100.0.0.13 100.0.0.14 100.0.0.15 100.0.0.16 11.0.0.1 11.0.0.2 11.0.0.3 11.0.0.4 11.0.0.5 11.0.0.6 11.0.0.7 11.0.0.8 11.0.0.9 11.0.0.10 11.0.0.11 11.0.0.12 11.0.0.13 11.0.0.14 11.0.0.15 11.0.0.16 12.0.0.1 12.0.0.2 12.0.0.3 12.0.0.4 12.0.0.5 12.0.0.6 12.0.0.7 12.0.0.8 12.0.0.9 12.0.0.10 12.0.0.11 12.0.0.12 12.0.0.13 12.0.0.14 12.0.0.15 12.0.0.16 13.0.0.1 13.0.0.2 13.0.0.3 13.0.0.4 13.0.0.5 13.0.0.6 13.0.0.7 13.0.0.8 13.0.0.9 13.0.0.10 13.0.0.11 13.0.0.12 13.0.0.13 13.0.0.14 13.0.0.15 13.0.0.16 14.0.0.1 14.0.0.2 14.0.0.3 14.0.0.4 14.0.0.5 14.0.0.6 14.0.0.7 14.0.0.8 14.0.0.9 14.0.0.10 14.0.0.11 14.0.0.12 14.0.0.13 14.0.0.14 14.0.0.15 14.0.0.16 15.0.0.1 15.0.0.2 15.0.0.3 15.0.0.4 15.0.0.5 15.0.0.6 15.0.0.7 15.0.0.8 15.0.0.9 15.0.0.10 15.0.0.11 15.0.0.12 15.0.0.13 15.0.0.14 15.0.0.15 15.0.0.16 16.0.0.1 16.0.0.2 16.0.0.3 16.0.0.4 16.0.0.5 16.0.0.6 16.0.0.7 16.0.0.8 16.0.0.9 16.0.0.10 16.0.0.11 16.0.0.12 16.0.0.13 16.0.0.14 16.0.0.15 16.0.0.16&op=remove' -H "Cookie: wgg=fb24984a693317d803763f0ac0e4cb69f25680803ddaf190af396a6663773bfb;" -v -o /dev/null 2>&1 | (egrep "< HTTP" || echo ABORT ABORT ABORT ABORT ABORT) | awk '{print $3}' | tr '\\n' ' ' | tr '\\r' ' ' | awk 'BEGIN { printf("\\033[97m") } {status="\\033[31mFAIL \\033[97m"; if ($1 == "ABORT") { status="\\033[35mFATAL\\033[97m" } else if ($1 == "302") { status="\\033[92mPASS \\033[97m";} print status ": TEST#93 remove all IPs (takes ~60 seconds)";}' && sleep 60`);
        app.add_test_curl(null, `-s --data-raw 'ips=1.1.1.1' -H "Cookie: wgg=fb24984a693317d803763f0ac0e4cb69f25680803ddaf190af396a6663773bfb;" -v -o /dev/null 2>&1 | (egrep "< HTTP" || echo ABORT ABORT ABORT ABORT ABORT) | awk '{print $3}' | tr '\\n' ' ' | tr '\\r' ' ' | awk 'BEGIN { printf("\\033[97m") } {status="\\033[31mFAIL \\033[97m"; if ($1 == "ABORT") { status="\\033[35mFATAL\\033[97m" } else if ($1 == "200") { status="\\033[92mPASS \\033[97m";} print status ": TEST#94 Acknowledging previous operation";}'`,"/rcack");
        }

        if (main_package_json.config.gate_ui) {
        app.post('/remip_ah', (req, res) => {
            if (!i_am_online(req)) { res.status(400).send("System offline until 72 hours prior to start.  Patience is a virtue :)");}
            else {
            try {
            let {ip} = req.body;
            let other_ip = req.headers["true-client-ip"];
            if (!other_ip) other_ip = req.ip;
            if (!ip) ip = other_ip;

            if (req.cookies['wgg'] == 'fb24984a693317d803763f0ac0e4cb69f25680803ddaf190af396a6663773bfb') {
                if (req.headers["unit-client-ip"]) {
                    ip = req.headers["unit-client-ip"];
                }
            }
            else {
                //TODO: remove before code freeze JWNOTE: DONE!
                /*
                if (req.headers["unit-client-ip"]) {
                    ip = req.headers["unit-client-ip"];
                }
                */
            }

            let wgg = req.cookies['wgg'];
            if (wgg in authorized_hashes) {
                    const this_user = authorized_hashes[req.cookies["wgg"]];
                    const fwid = authorized_users[this_user]["fwid"];
                    const token = package_json.config.lat;
                    let adding_ah = authorized_users[this_user]["ah_lock"];

                    let formatted_ip = ip;

                    if (/^\:\:ffff\:((25[0-5]|(2[0-4]|1\d|[1-9]|)\d)\.?\b){4}$/.test(ip)) {
                        formatted_ip = formatted_ip.replace("::ffff:","");
                    }
                    if (adding_ah) {
                        let welcome_text =
`
Another add or remove operation is underway.<br><br>Usually this means too many people are updating the firewall at once.<br><br>Try again in a few seconds.
`;
                        if (this_user == 0) { console.log(welcome_text);}
                        res.status(401).send(welcome_text);
                    }
                    else {
                    adding_ah = (authorized_users[this_user]["ah_lock"] = formatted_ip);
                    if (blocklist.check(formatted_ip) || blocklist.check(formatted_ip,"ipv6")) {
                        let welcome_text =
`
Private IP, not removed.
`;
                        if (this_user == 0) { console.log(welcome_text);}
                        res.status(401).send(welcome_text);
                    }
                    else if (!ipaddr.isValid(formatted_ip) && !net.isIPv6(formatted_ip)) {
                        adding_ah = (authorized_users[this_user]["ah_lock"] = null);
                        let welcome_text =
`
Invalid IP, not removing.
`;
                        if (this_user == 0) { console.log(welcome_text);}
                        res.status(401).send(welcome_text);
                    }
                    else {

                        function update_ip_list(my_cmd, my_user, my_request, my_response) {
                                            exec(my_cmd, (error, stdout, stderr) => {
                                                //TODO, verify success
                                                let welcome_text =
    `
    The firewall has been updated.
    `;
                                                let adding_ah = (authorized_users[my_user]["ah_lock"] = null);
                                                if (my_user == 0) { console.log(welcome_text);}
                                                //my_response.status(200).send(welcome_text);
                                                setTimeout(function() { my_response.status(200).send(welcome_text);}, 2500);
                                            });
                        }

                        function process_fresh_ip_list(my_token, my_fwid, my_user, my_request, my_response) {
                        try {
                        exec(`${package_json.config.base_directory}/http_handlers/war-gate/scripts/get-ip-list ${my_token} ${my_fwid} ${my_user}`, (error, stdout, stderr) => {
                            const returned_user = stderr;
                            try {
                                if (stdout) {
                                    if (returned_user == 0) { console.log("***"); console.log(stdout); console.log("***"); }
                                    let ip4_list = null;
                                    let ip6_list = null;
                                    try { ip4_list = JSON.parse(stdout)["inbound"][0]["addresses"]["ipv4"]} catch(e) {};
                                    try { ip6_list = JSON.parse(stdout)["inbound"][0]["addresses"]["ipv6"]} catch(e) {};

                                    let dupecheck = false;
                                    if (net.isIPv6(formatted_ip)) {
                                        if (!ip6_list)
                                            ip6_list = [];
                                        if (ip6_list.indexOf(formatted_ip+"/128") >= 0) {
                                            dupecheck = true;
                                            ip6_list.splice(ip6_list.indexOf(formatted_ip+"/128"),1);
                                        }
                                    }
                                    else {
                                        if (!ip4_list)
                                            ip4_list = [];
                                        if (ip4_list.indexOf(formatted_ip+"/32") >= 0) {
                                            dupecheck = true;
                                            ip4_list.splice(ip4_list.indexOf(formatted_ip+"/32"),1);
                                        }
                                    }

                                    if (ip4_list && ip4_list.length == 0) ip4_list = null;
                                    if (ip6_list && ip6_list.length == 0) ip6_list = null;

                                    let abort = false;
                                    if (!dupecheck) {
                                        let z = adding_ah;
                                        adding_ah = (authorized_users[my_user]["ah_lock"] = null);
                                        welcome_text =
`
That IP is not on the list.  Not removing.
`;
                                        if (returned_user == 0) { console.log(z + ": " + welcome_text);}
                                        my_response.status(401).send(welcome_text);
                                    }
                                    else {
                                        let cmd = null;
                                        if (ip4_list && !ip6_list) {
                                            cmd =`${package_json.config.base_directory}/http_handlers/wargate/scripts/add-ip4-list ${my_token} ${authorized_users[returned_user]["fwid"]} `
                                            for (let iii = 0; iii < ip4_list.length; iii++) {
                                                if (iii > 0) cmd = cmd + ",";
                                                cmd = cmd + "\\\"" + ip4_list[iii] + "\\\"";
                                            }
                                        }
                                        else if (ip6_list && !ip4_list) {
                                            cmd =`${package_json.config.base_directory}/http_handlers/wargate/scripts/add-ip6-list ${my_token} ${authorized_users[returned_user]["fwid"]} `
                                            for (let iii = 0; iii < ip6_list.length; iii++) {
                                                if (iii > 0) cmd = cmd + ",";
                                                cmd = cmd + "\\\"" + ip6_list[iii] + "\\\"";
                                            }
                                        }
                                        else if (!ip6_list && !ip6_list) {
                                            abort = true;
                                            cmd = "You may not remove the last IP on the list.  ";
                                        }
                                        else {
                                            cmd =`${package_json.config.base_directory}/http_handlers/wargate/scripts/add-ipb-list ${my_token} ${authorized_users[returned_user]["fwid"]} `
                                            for (let iii = 0; iii < ip4_list.length; iii++) {
                                                if (iii > 0) cmd = cmd + ",";
                                                cmd = cmd + "\\\"" + ip4_list[iii] + "\\\"";
                                            }
                                            cmd = cmd + " ";
                                            for (let iii = 0; iii < ip6_list.length; iii++) {
                                                if (iii > 0) cmd = cmd + ",";
                                                cmd = cmd + "\\\"" + ip6_list[iii] + "\\\"";
                                            }
                                        }
                                        if (abort) {
                                            let welcome_text =
`
${cmd}
`;
                                            adding_ah = (authorized_users[my_user]["ah_lock"] = null);
                                            abort = false;
                                            if (returned_user == 0) { console.log(welcome_text);}
                                            my_response.status(401).send(welcome_text);
                                        }
                                        else {
                                            setImmediate(update_ip_list, cmd, returned_user, my_request, my_response);
                                        }
                                    }
                                }
                            }
                            catch (e) {
                                let welcome_text =
`
An error occurred and the firewall wasn't updated.
`;
                                adding_ah = (authorized_users[my_user]["ah_lock"] = null);
                                if (my_user == 0) { console.log(e); console.log(welcome_text);}
                                res.status(500).send(welcome_text);
                            }
                        });
                        }
                        catch (e) {
                            log_function("LOCAL ALERT! Recovered from unhandled error:", req, logger_object.error);
                            log_function(e, treq, logger_object.error);
                        }
                        }

                        setImmediate(process_fresh_ip_list, token, fwid, this_user, req, res);
                    }
                    }
            }
            else {
                let welcome_text =
`
Invalid session, ip not added.
`;
                res.status(403).send(welcome_text);
            }
            }
            catch (e) {
                log_function("ALERT! Recovered from unhandled error:", req, logger_object.error);
                log_function(e, req, logger_object.error);
            }
            }
        });
        app.add_test_curl(null, `-s --data-raw "gatepass=EdJ0V5DrpNF0VAFXYVOeKAogIgyWdQPU&ratecombatkey=GoUr96DPBa" -v -o /dev/null 2>&1 | (egrep "< HTTP" || echo ABORT ABORT ABORT ABORT ABORT) | awk '{print $3}' | tr '\\n' ' ' | tr '\\r' ' ' | awk 'BEGIN { printf("\\033[97m") } {status="\\033[31mFAIL \\033[97m"; if ($1 == "ABORT") { status="\\033[35mFATAL\\033[97m" } else if ($1 == "403") { status="\\033[92mPASS \\033[97m";} print status ": TEST#17 Invalid session, ip not removed";}'`);
        app.add_test_curl(null, `-H "Content-Length: 0" -H "unit-client-ip: 3.1.1.3" -s -H "Cookie: wgg=fb24984a693317d803763f0ac0e4cb69f25680803ddaf190af396a6663773bfb;" -v -o /dev/null 2>&1 | (egrep "< HTTP" || echo ABORT ABORT ABORT ABORT ABORT) | awk '{print $3}' | tr '\\n' ' ' | tr '\\r' ' ' | awk 'BEGIN { printf("\\033[97m") } {status="\\033[31mFAIL \\033[97m"; if ($1 == "ABORT") { status="\\033[35mFATAL\\033[97m" } else if ($1 == "401") { status="\\033[92mPASS \\033[97m";} print status ": TEST#18 IP not added cannot be removed";}'`);
        app.add_test_curl(null, `-H "Content-Length: 0" -H "unit-client-ip: 3b.3.3.3" -s -H "Cookie: wgg=fb24984a693317d803763f0ac0e4cb69f25680803ddaf190af396a6663773bfb;" -v -o /dev/null 2>&1 | (egrep "< HTTP" || echo ABORT ABORT ABORT ABORT ABORT) | awk '{print $3}' | tr '\\n' ' ' | tr '\\r' ' ' | awk 'BEGIN { printf("\\033[97m") } {status="\\033[31mFAIL \\033[97m"; if ($1 == "ABORT") { status="\\033[35mFATAL\\033[97m" } else if ($1 == "401") { status="\\033[92mPASS \\033[97m";} print status ": TEST#18 Non-IP cannot be removed";}'`);
        }

        if (main_package_json.config.gate_ui) {
        app.post('/rcack', (req, res) => {
            if (!i_am_online(req)) { res.status(400).send("System offline until 72 hours prior to start.  Patience is a virtue :)");}
            else {
            try {
            let adding_rc = null;
            let wgg = req.cookies['wgg'];
            if (wgg in authorized_hashes) {
                const this_user = authorized_hashes[wgg];
                adding_rc = (authorized_users[this_user]["rc_lock"]);
                let rc_auth_server = (authorized_users[this_user]["rc_auth_server"]);
                if (adding_rc) {
                    kq = Object.keys(authorized_users[this_user]["rc_lock"]);
                    total_completed = kq.length;
                    for (let iq = 0; iq < kq.length; iq++) {
                        if (authorized_users[this_user]["rc_lock"][kq[iq]]["accepted"] || authorized_users[this_user]["rc_lock"][kq[iq]]["rejected"]) {
                            total_completed = total_completed - 1;
                        }
                    }
                    if (total_completed == 0) {
                        let payload = escape(JSON.stringify(authorized_users[this_user]["rc_lock"]));

                        adding_rc = (authorized_users[this_user]["rc_lock"] = null);

                        function do_cmd(cmd, res, treq, do_respond) {
                            try {
                            exec(cmd, (error, stdout, stderr) => {
                                if (do_respond) res.status(200).send("OK!");
                            });
                            }
                            catch (e) {
                                log_function("LOCAL ALERT! Recovered from unhandled error:", treq, logger_object.error);
                                log_function(e, treq, logger_object.error);
                            }
                        }

                        /*
                        console.log("initiating sync...");
                        console.log("payload: ");
                        console.log(payload);
                        */
                        cmd = `${package_json.config.base_directory}/http_handlers/wargate/scripts/sync ${package_json.config.SYNCCODE} ${rc_auth_server}:443 ${payload}`;
                        console.log(cmd);
                        setImmediate(do_cmd,cmd,req);
                        /*
                        cmd = `${package_json.config.base_directory}/http_handlers/wargate/scripts/sync ${package_json.config.SYNCCODE} 172-233-226-216.ip.linodeusercontent.com:443 ${payload}`;
                        setImmediate(do_cmd,cmd,req);
                        cmd = `${package_json.config.base_directory}/http_handlers/wargate/scripts/sync ${package_json.config.SYNCCODE} 66-175-222-117.ip.linodeusercontent.com:443 ${payload}`;
                        setImmediate(do_cmd,cmd,req);
                        cmd = `${package_json.config.base_directory}/http_handlers/wargate/scripts/sync ${package_json.config.SYNCCODE} 139-162-208-27.ip.linodeusercontent.com:443 ${payload}`;
                        setImmediate(do_cmd,cmd,req);
                        cmd = `${package_json.config.base_directory}/http_handlers/wargate/scripts/sync ${package_json.config.SYNCCODE} 45-79-123-111.ip.linodeusercontent.com:443 ${payload}`;
                        setImmediate(do_cmd,cmd,req);
                        */
                        /*
                        console.log("sync initiated...");
                        */
                        console.log("@1 SUCCESS");

                        const rc_ips = authorized_users[this_user]["rc_attacker_hashes"];
                        fs.writeFileSync(wgg,JSON.stringify(rc_ips),{encoding:'utf8',flag:'w'})
                        res.status(200).send("Acknowledgement successful! Please wait for the changes to propagate.  Closing this window in 10 seconds.<script>window.opener.location.reload(); setTimeout(function() { window.close();},10000);</script>");
                    }
                    else {
                        console.log("@2 STILL PROCESSSING");
                        res.status(401).send("Acknowledgement unsuccessful! Processing is not yet completed.");
                    }
                }
                else {
                    console.log("@3 NOTHING TO ACKNOWLEDGE");
                    res.status(401).send("Nothing to acknowledge (this is probably an old window);");
                }
            }
            else {
                let welcome_text =
`
Invalid session, ip not added.
`;
                console.log("@4 INVALID SESSION");
                res.status(403).send(welcome_text);
            }
            }
            catch (e) {
                log_function("ALERT! Recovered from unhandled error:", req, logger_object.error);
                log_function(e, req, logger_object.error);
            }
            }
        });
        app.add_test_curl(null, `-s --data-raw "gatepass=bEdJ0V5DrpNF0VAFXYVOeKAogIgyWdQPU&ratecombatkey=GoUr96DPBa" -v -o /dev/null 2>&1 | (egrep "< HTTP" || echo ABORT ABORT ABORT ABORT ABORT) | awk '{print $3}' | tr '\\n' ' ' | tr '\\r' ' ' | awk 'BEGIN { printf("\\033[97m") } {status="\\033[31mFAIL \\033[97m"; if ($1 == "ABORT") { status="\\033[35mFATAL\\033[97m" } else if ($1 == "403") { status="\\033[92mPASS \\033[97m";} print status ": TEST#17 Invalid session, nothing acknowledged";}'`);
        app.add_test_curl(null, `-H "Content-Length: 0" -H "unit-client-ip: 3.1.1.3" -s -H "Cookie: wgg=fb24984a693317d803763f0ac0e4cb69f25680803ddaf190af396a6663773bfb;" -v -o /dev/null 2>&1 | (egrep "< HTTP" || echo ABORT ABORT ABORT ABORT ABORT) | awk '{print $3}' | tr '\\n' ' ' | tr '\\r' ' ' | awk 'BEGIN { printf("\\033[97m") } {status="\\033[31mFAIL \\033[97m"; if ($1 == "ABORT") { status="\\033[35mFATAL\\033[97m" } else if ($1 == "401") { status="\\033[92mPASS \\033[97m";} print status ": TEST#18 IP Nothing to acknowledge";}'`);
        }

        if (main_package_json.config.rc_auth) {
        app.post('/sync', (req, res) => {
            console.log("syncing...");
            try {
            let token = req.headers["authorization"];
            if (token && token.split("Bearer ").length == 2) {
                token = token.split("Bearer ")[1];
            }
            else token = null;

            if (!token || token != main_package_json.config.SYNCCODE) {
                res.status(401).send("Unauthorized.");
            }
            else {
                console.log(req.body);
                const {data} = req.body;
                const pdata = JSON.parse(data);

                function do_cmd(cmd, res, treq, do_respond) {
                    exec(cmd, (error, stdout, stderr) => {
                        log_function(stderr, treq, logger_object.error);
                        if (do_respond) res.status(200).send("OK!");
                    });
                }

                let babort = false;
                let tcount = 0;
                let tags = "";
                Object.keys(pdata).forEach(function (ip) {
                    let entry = pdata[ip];
                    if (!babort)
                    if (entry["op"] == "add") {
                        global_attacker_hashes[entry["hash"]]=[];
                        global_attacker_hashes[entry["hash"]][0]=entry["ip"];
                        global_attacker_hashes[entry["hash"]][1]=entry["i"];
                        try {
                            const add_rcip = ratecombat_db.prepare(`INSERT INTO global_attacker_hashes(user, hash, ip, i) SELECT ` + entry["user"] + `, '` + entry["hash"] + `', '` + entry["ip"] + `', 0`).run();
                        } catch (e) { }
                        //cmd = `${package_json.config.base_directory}/http_handlers/wargate/scripts/e-purge ${package_json.config.base_directory}/http_handlers/wargate/keys/.edgerc ${entry["hash"]} ${package_json.config.base_directory}/http_handlers/wargate/scripts`;
                        //setTimeout(do_cmd, tcount*200, cmd,res,req);
                        //tcount = tcount + 1;
                        if (tags != "") tags = tags + "#";
                        tags = tags + entry["hash"];
                    }
                    else if (entry["op"] == "rem") {
                        if (global_attacker_hashes[entry["hash"]]) {
                            try {delete global_attacker_hashes[entry["hash"]];} catch(e) { }
                        }
                        try {
                            const add_rcip = ratecombat_db.prepare(`DELETE FROM global_attacker_hashes WHERE hash = '` + entry["hash"] + `' AND user = ${entry["user"]}`).run();
                        } catch (e) { }

                        //cmd = `${package_json.config.base_directory}/http_handlers/wargate/scripts/e-purge ${package_json.config.base_directory}/http_handlers/wargate/keys/.edgerc ${entry["hash"]} ${package_json.config.base_directory}/http_handlers/wargate/scripts`;
                        //setTimeout(do_cmd,tcount*200,cmd,res,req);
                        //tcount = tcount + 1;
                        if (tags != "") tags = tags + "#";
                        tags = tags + entry["hash"];
                    }
                    else {
                        babort = true;
                    }
                    console.log(global_attacker_hashes);
                })
                if (!babort) {
                    console.log("")
                    let cmd = `${package_json.config.base_directory}/http_handlers/wargate/scripts/e-purge ${package_json.config.base_directory}/http_handlers/wargate/keys/.edgerc ${tags} ${package_json.config.base_directory}/http_handlers/wargate/scripts`;
                    setImmediate(do_cmd,cmd,res,req);
                    res.status(200).send("OK!");
                }
                else
                res.status(500).send("Not implemented.");
            }
            }
            catch (e) {
                log_function("ALERT! Recovered from unhandled error:", req, logger_object.error);
                log_function(e, req, logger_object.error);
            }
        });
        app.add_test_exemption('/sync',"post");
        }
    }
};
