const process = require("process");
const fs = require("fs");
const path = require("path");
const os = require("os")
const c = require('ansi-colors');
const deepmerge = require("deepmerge");
const { exec } = require("child_process");
const { execSync } = require("child_process");
const { spawn } = require("child_process");
const { ArgumentParser } = require('argparse');

const package_json = require('./package.json');
let tmp = null;

try {
    tmp = require(package_json.config.wss_package_path);
}
catch (e) {
    console.log(`wss-terminal-commands configuration error!\n\nCould not load the wss main-project package.json file.\n\nMake sure the value of wss_package_path is correct and try again.\n`);
    console.log("Error trace:");
    console.log(e);
    process.exit(-1);
}
const main_package_json = tmp;

const parser = new ArgumentParser({
    formatter_class: require('argparse').RawTextHelpFormatter
});
if (process.argv.length == 2) {
    process.argv[2] = '-h';
    console.log(
c.yellow(`The ${process.argv[1].split("/").pop()} command requires arguments; either use one of the following shortcuts:

${process.argv[1].split("/").pop()} dbg - quickly launch main-project/index.js for local dev and debugging with default package.json settings
${process.argv[1].split("/").pop()} bds - build, deploy and start the application locally with dev.package.json.patch settings applied)
${process.argv[1].split("/").pop()} MACRONAME - use the command parameters from a macro named MACRONAME loaded from cli-macros.json
`)+`
or follow the full syntx instructions below:
`
)
}
if (process.argv.length > 2) {
    if (process.argv[2][0] != '-') {
        let cmd = process.argv[1].split("/").pop();
        let param = process.argv[2];
        let patches = []
        for (ii = 3; ii < process.argv.length; ii++) {
            if (process.argv[ii].indexOf("=") > 0) {
                patches.push("--var");
                patches.push(process.argv[ii]);
            }
        }
        switch (cmd) {
            case `${process.argv[1].split("/").pop()}`:
                switch (param) {
                    case "bds":
                        process.argv[2] = '--cmd';
                        process.argv[3] = 'bds';
                        process.argv[4] = '--env';
                        process.argv[5] = 'dev';
                        process.argv[6] = '--sys';
                        process.argv[7] = 'local';
                        process.argv.length = 8;
                        break;
                    case "dbg":
                        process.argv[2] = '--cmd';
                        process.argv[3] = 'dbg';
                        process.argv[4] = '--var';
                        process.argv[5] = 'gate_ui=true';
                        process.argv[6] = '--var';
                        process.argv[7] = 'rc_auth=true';
                        process.argv.length = 8;
                        break;


        try {
            const add_account = flagdb.prepare(`INSERT INTO flag_states(account, solvedFlags, hintIndex) SELECT '` + akey + `', '` + accounts[akey][0] + `', '` + accounts[akey][1] + `'`).run();

            account_id = akey.split("/")[0]
            if (!(app.account_list.indexOf(account_id) >= 0)) {
              app.account_list.push(account_id);
            }

        } catch (e) {
            if (e["code"] == "SQLITE_CONSTRAINT_UNIQUE") { }
            else throw(e);
        }

                    case "stop":
                        process.argv[2] = '--cmd';
                        process.argv[3] = 'stop';
                        process.argv.length = 4;
                        break;
                    default:
                        const macro_json = require(`${main_package_json.config.base_directory}/cli-macros.json`);
                        try {
                            macro = null;
                            eval(`macro = macro_json.config.cli_macros.${param};`);
                            if (macro) {
                              ma = macro.split("\t");
                              for (mi = 2; (mi-2) < ma.length; mi++) {
                                process.argv[mi] = ma[mi-2];
                              }
                              process.argv.length = mi;
                            }
                            else {
                                console.log(`Shortcut '${param}' not supported!`);
                                process.exit(-7);
                            }
                        }
                        catch (e) {
                            console.log(e);
                            console.log(`Shortcut '${param}' not supported!`);
                            process.exit(-6);
                        }
                        break;
                }
                break;
            default:
                console.log(`Command '${cmd}' not supported!`);
                process.exit(-5);
                break;
        }
        if (patches.length > 0) {
            for (ii = 0; ii < patches.length; ii++) {
                process.argv.push(patches[ii]);
            }
        }
    }
    if (process.argv[2][0] == '-') {
        parser.add_argument("--var", {help: "add or update a package.json value before executing, example: '--var config.primary_clear_port=9090' ", action: "append",
                                         dest: "patch"});
        const required_args = parser.add_argument_group({ title: 'required arguments'});
        required_args.add_argument("--cmd", {choices: ["bds", "stop", "dbg"],
                                         help: "the cli command to execute [default: bds]", action: "store",
                                         dest: "cmd", default: "bds"});
        required_args.add_argument("--env", {choices: ["dev", "prod"],
                                         help: "the environment settings for this deployment [default: dev]", action: "store",
                                         dest: "env", default: "dev"});
        required_args.add_argument("--sys", {choices: ["local", "remote"],
                                         help: "deploy locally or to a remote system  [default: local]", action: "store",
                                         dest: "sys", default: "local"});
        required_args.add_argument("--prc", {choices: ["fg", "bg"],
                                         help: "run the process in the foreground of the terminal or as a background process  [default: fg]", action: "store",
                                         dest: "prc", default: "fg"});
        tmp = parser.parse_args();
    }
}
const args = tmp;

var operation = null;
function set_operation() {
    try {
    switch (args.cmd) {
        case "dbg":
            operation = debug_start;
            break;
        case "bds":
            operation = env_bds;
            break;
        case "stop":
            operation = env_stop;
            break;
        default:
            console.log(`'${args.cmd}' command not supported.`);
            process.exit(-7);
            break;
    }
    } catch(e) { return e;}
}
let tmp_e = set_operation();

if (tmp_e) {
    console.log("An error ocurred while processing the command.  Check syntax and try again.\n");
    console.log("Error trace:");
    console.log(e.trace);
    process.exit(-4);
}
else if (!operation) {
    console.log("Invalid command.\n")
    process.exit(-5);
}

try {
    tmp = main_package_json.config.base_directory + main_package_json.config.log_directory;
    if (!fs.lstatSync(tmp).isDirectory()) throw new Error("Log directory does not exist or is not a directory.");
}
catch (e) {
    console.log(`main-project error!\n\nMake sure the base_directory and log_directory are configured correctly and try again.\n\n`);
    console.log("Error trace:");
    console.log(e);
    process.exit(-2);
}
const log_directory = tmp;

const winston = require('winston');
try {
    let tmp_tll = null;
    let tmp_fll = null;
    if (main_package_json.config.terminal_log_level && main_package_json.config.terminal_log_level != "silent")
        tmp_tll = main_package_json.config.terminal_log_level;
    if (main_package_json.config.file_log_level && main_package_json.config.file_log_level != "silent") {
        tmp_fll = main_package_json.config.file_log_level;
    }
    tmp = {
        transports: [
        ],
        format: winston.format.combine(
            winston.format.timestamp({
               format: 'YYYY-MM-DD-HH:mm:ss'
           }),
           winston.format.printf(info => `${[info.timestamp]}\t${info.level}\t${info.message}`),
        )
    };
    if (tmp_fll)
        tmp.transports.push(
                new winston.transports.File({
                filename: log_directory + '/wss-terminal-commands.log',
                level: tmp_fll
            }));

    if (tmp_tll)
        tmp.transports.push(
                new winston.transports.Console({
                level: tmp_tll
            }));
    if (!tmp.transports.length) {
        throw new Error("No non-silent log levels configured.");
    }
}
catch (e) {
    console.log(`logging configuration error!\n\nMake sure there is at least one non-silent log level option configured correctly.\n`);
    console.log("Error trace:");
    console.log(e);
    process.exit(-3);
}
const log_configuration = tmp;
const logger = winston.createLogger(log_configuration);

function ignore_ctrlC() {
    logger.info(c.bgBlue("Terminal event: ctrl-c ignored by child process.  The parent process should terminate presently."));
}

function debug_start() {
    console.log(c.yellow("Debug Starting..."));
    process.on('SIGTERM', ignore_ctrlC);
    process.on('SIGINT', ignore_ctrlC);

    tmp = main_package_json;
    try {
    const local_debug_json_patch = require(`${main_package_json.config.base_directory}/local-debug.patch.package.json`);
    const updated_package_json = deepmerge(main_package_json, local_debug_json_patch);
    tmp = updated_package_json;
    } catch(e) {}
    const debug_package_json = tmp;

    spawn(`node ${debug_package_json.config.base_directory}/index.js`, {
      stdio: 'inherit',
      shell: true
    });
    console.log(c.magenta("Launching browser in 0.5 seconds."));
    setTimeout(function(){execSync(`open https://${debug_package_json.config.hostname}:${debug_package_json.config.primary_secure_port}`,{stdio: 'inherit'})}, 500, 0);
}

function env_build() {
    console.log(c.red(`Env Building: ${args.env}...`));
    updated_package_json = JSON.parse(JSON.stringify(main_package_json));

    const env_json_patch = require(`${main_package_json.config.base_directory}/${args.env}.patch.package.json`);
    updated_package_json = deepmerge(updated_package_json, env_json_patch);

    let verve = {}
    for (i = 3; i < process.argv.length; i++) {
        pair = process.argv[i].split("=");
        if (pair.length == 2) {
            verve[pair[0]] = pair[1];
        }
    }
    v_keys = Object.keys(verve);
    for (v_key of v_keys) {
        if ((/^config\.[a-zA-Z0-9_\.]+$/.test(v_key))) {
            if ((/^\"?[a-zA-Z0-9_\.]+\"?$/.test(verve[v_key]))) {
                if (v_key != "config.base_directory")
                    eval("updated_package_json." + v_key + "="+verve[v_key]+";");
            }
        }
    }

    files = fs.readdirSync(updated_package_json.config.base_directory + "/build");
    for (const file of files) {
      if (!fs.lstatSync(path.join(updated_package_json.config.base_directory + "/build", file)).isDirectory()) {
        fs.unlinkSync(path.join(updated_package_json.config.base_directory + "/build", file));
      }
      else {
        fs.rmSync(path.join(updated_package_json.config.base_directory + "/build", file), { recursive: true });
      }
    }
    try {
        if (updated_package_json.config.base_directory) {
            updated_package_json.config.base_directory = updated_package_json.config.base_directory + "/build/" + args.env;
            fs.mkdirSync(updated_package_json.config.base_directory, { recursive: true });

            deployed_package_json = updated_package_json;
            if (args.sys == 'remote') {
                deployed_package_json = JSON.parse(JSON.stringify(updated_package_json));
                deployed_package_json.config.base_directory = `/root/${args.env}-${process.argv[1].split("/").pop()}`;
            }
            fs.writeFileSync(main_package_json.config.base_directory + `/build/${args.env}/package.json`, JSON.stringify(deployed_package_json, null, 2));
            fs.mkdirSync(updated_package_json.config.base_directory + "/logs", { recursive: true });

            fs.writeFileSync(main_package_json.config.base_directory + `/build/${args.env}/start`,
`
nohup node index.js &
`);
            fs.writeFileSync(main_package_json.config.base_directory + `/build/${args.env}/stop`,
`
#!/bin/bash
echo "IMPORTANT: Before stopping this service, you must log on as the user and make sure all Rate Combat IPs are removed.  Have you done this?"
read -p "Enter YES (in all caps) to confirm >" affirmation
if [ "$affirmation" = "YES" ]; then
  echo "Attempting to send graceful shutdown kill code..."
  SUCCESS=\`curl https://127.0.0.1/${updated_package_json.config.KILLCODE} -k 2>&1 | grep "Shutting down" | wc -l | awk '{print $1}'\`
  if [ $SUCCESS -eq 1 ]
  then
    echo "Success!"
  else
    echo Signal failed! Log on to the server to investigate.
  fi
else
  echo You must enter YES to stop the service.  The service has not been stopped.
fi
`);

            fs.writeFileSync(main_package_json.config.base_directory + `/build/${args.env}/force-stop`,
`
#!/bin/bash
echo "Attempting to send graceful shutdown kill code..."
SUCCESS=\`curl https://127.0.0.1/${updated_package_json.config.KILLCODE} -k 2>&1 | grep "Shutting down" | wc -l | awk '{print $1}'\`
if [ $SUCCESS -eq 1 ]
then
  echo "Success!"
else
  echo Signal failed! Log on to the server to investigate.
fi
`);


            execSync(`chmod 777  ${main_package_json.config.base_directory}/build/${args.env}/start`,{stdio: 'inherit'});
            execSync(`chmod 777  ${main_package_json.config.base_directory}/build/${args.env}/stop`,{stdio: 'inherit'});
            execSync(`chmod 777  ${main_package_json.config.base_directory}/build/${args.env}/force-stop`,{stdio: 'inherit'});

            execSync(`cd ${updated_package_json.config.base_directory}/../..; echo node_modules/$'\\n'tls/$'\\n'http_handlers/${updated_package_json.config.http_handler}'\\n'index.js'\\n' | cat | zip -r -@ ${updated_package_json.config.base_directory + `/${args.env}-${process.argv[1].split("/").pop()}.zip; cd ${updated_package_json.config.base_directory}; zip -u ${args.env}-${process.argv[1].split("/").pop()}.zip package.json start stop force-stop logs;`}`,{stdio: 'inherit'});
        }
        else throw new Error("No base directory configured.");
    }
    catch(e) {
        console.log("Unexpected error!");
        console.log("Error trace:");
        console.log(e);
        process.exit(-4);
    }
}

//const hack_addr = "172.233.226.216"; //auth //dev
//const hack_addr = "66.175.222.117"; //auth
//const hack_addr = "139.162.208.27"; //auth
//const hack_addr = "45.79.123.111"; //auth
//const hack_addr = "172.233.0.79"; //auth
//const hack_addr = "139.144.207.131"; //auth
//const hack_addr = "172.233.200.27"; //gate //dev
const hack_addr = "172.233.233.16"; //gate
//const hack_addr = "45.79.105.195"; //gate
//const hack_addr = "212.111.42.247"; //gate
//const hack_addr = "172.105.35.42"; //gate
//const hack_addr = "172.233.0.80"; //gate
//const hack_addr = "172.232.105.94"; //gate - arbitrary


function env_deploy() {
    console.log(c.cyan(`Env Deploying: ${args.env}...`));
    if (args.sys == 'remote') {
        addr = hack_addr;
        id = "root";
        pw = "[REDACTED]";
        src = `${main_package_json.config.base_directory}/build/${args.env}/${args.env}-${process.argv[1].split("/").pop()}.zip`
        dest = `/root/${args.env}-${process.argv[1].split("/").pop()}/`;

        pre_cleanup = `${main_package_json.config.base_directory}/util/pre-cleanup ${addr} ${id} ${pw} "${dest}"`;
        console.log(pre_cleanup);
        execSync(pre_cleanup, {
          stdio: 'inherit',
          shell: true
        });

        scp = `${main_package_json.config.base_directory}/util/scp ${addr} ${id} ${pw} ${src} "${dest}"`;
        console.log(scp);
        execSync(scp, {
          stdio: 'inherit',
          shell: true
        });

        unzip = `${main_package_json.config.base_directory}/util/unzip ${addr} ${id} ${pw} "${dest}" "${args.env}-${process.argv[1].split("/").pop()}.zip"`;
        console.log(unzip);
        execSync(unzip, {
          stdio: 'inherit',
          shell: true
        });
    }
    else if (args.sys == 'local') {
        execSync(`cd ${main_package_json.config.base_directory}/build/${args.env}; unzip ${args.env}-${process.argv[1].split("/").pop()}.zip; rm ${args.env}-${process.argv[1].split("/").pop()}.zip;`,{stdio: 'inherit'});
    }
    else {
        console.log("ERROR! Unsupported sys value: "+args.sys);
    }
}

function env_start() {
    bg = false;
    try {
        if (args.prc == "bg") {
            bg = true;
        }
    } catch (e) {}
    console.log(c.yellow(`Env Starting: ${args.env}...`));
    if (!bg) {
        if (args.sys == 'remote') {
            console.log("REMOTE LAUNCH");
            addr = hack_addr;
            id = "root";
            pw = "[REDACTED]";
            src = `${main_package_json.config.base_directory}/build/${args.env}/${args.env}-${process.argv[1].split("/").pop()}.zip`
            dest = `/root/${args.env}-${process.argv[1].split("/").pop()}/`;
            start_fg = `${main_package_json.config.base_directory}/util/start-fg ${addr} ${id} ${pw} "${dest}"`;

            const env_package_json = require(`${main_package_json.config.base_directory}/build/${args.env}/package.json`);
            execSync(`open https://${env_package_json.config.hostname}:${env_package_json.config.primary_secure_port}`);
            console.log(start_fg);
            execSync(start_fg, {
              stdio: 'inherit',
              shell: true
            });
        }
        else if (args.sys == 'local') {
            process.on('SIGTERM', ignore_ctrlC);
            process.on('SIGINT', ignore_ctrlC);
            spawn(`node ${main_package_json.config.base_directory}/build/${args.env}/index.js`, {
              stdio: 'inherit',
              shell: true
            });
        }
        else {
            console.log("ERROR! Unsupported sys value: "+args.sys);
        }
    }
    else {
        execSync(`nohup node ${main_package_json.config.base_directory}/build/${args.env}/index.js &`,{stdio: 'inherit'});
    }
    if (args.sys == 'local') {
        const env_package_json = require(`${main_package_json.config.base_directory}/build/${args.env}/package.json`);
        console.log(c.magenta("Launching browser in 3 seconds."));
        setTimeout(function(){execSync(`open https://${env_package_json.config.hostname}:${env_package_json.config.primary_secure_port}`,{stdio: 'inherit'})}, 3000, 0);
    }
}

function env_stop() {
    console.log(c.green(`Env Stopping: ${args.env}...`));
    const env_package_json = require(`${main_package_json.config.base_directory}/build/${args.env}/package.json`);
    console.log(`curl https://127.0.0.1:${env_package_json.config.primary_secure_port}/${env_package_json.config.KILLCODE} -k`);
    execSync(`curl https://127.0.0.1:${env_package_json.config.primary_secure_port}/${env_package_json.config.KILLCODE} -k`,{stdio: 'inherit'});
}

function env_bds() {
    console.log(c.magenta("Cycle starting..."));
    env_build();
    env_deploy();
    env_start();
}

function go() {
    if (operation) {
        operation();
    }
}
exports.default = go;
exports.logger = logger;