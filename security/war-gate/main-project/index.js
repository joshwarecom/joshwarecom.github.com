const express = require('express')
const morgan = require('morgan')
const fs = require('fs')
const https = require('https')
const http = require('http')
const deepmerge = require("deepmerge");
const serve_index = require('serve-index')
const cookie_parser = require('cookie-parser')
const body_parser = require('body-parser')
const dotenv_config = require('dotenv').config();

const app = express()
app.disable('x-powered-by');

const shared_handler_data = {};

let tmp = null;
try {
    tmp = require("./package.json");
}
catch (e) {
    console.log(`main-package error - could not import settings from package.json; make sure it is correctly formatted and try again\n`);
    console.log("Error trace:");
    console.log(e);
    process.exit(-1);
}

try {
const local_debug_json_patch = require(`${tmp.config.base_directory}/local-debug.patch.package.json`);
const updated_package_json = deepmerge(tmp, local_debug_json_patch);
tmp = updated_package_json;
} catch(e) {}
const main_package_json = JSON.parse(JSON.stringify(tmp));

try {
    tmp = main_package_json.config.base_directory + main_package_json.config.log_directory;
    if (!fs.lstatSync(tmp).isDirectory()) throw new Error("Log directory does not exit or is not a directory.");
}
catch (e) {
    console.log(`main-project error!\n\nMake sure the base_directory and log_directory are configured correctly and try again.\n\n`);
    console.log("Error trace:");
    console.log(e);
    process.exit(-2);
}
shared_handler_data["main_package_json"] = main_package_json;

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
                filename: log_directory + '/main-project.log',
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
function log_for_web(msg, req, func) {
    if (!func) func = logger.info;
    if (req) {
        msg = req.socket.remoteAddress + " - " + msg;
    }
    return func(msg);
}

const morgan_component = morgan(
  ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" :response-time ms',
  {
    stream: {
      // Configure Morgan to use our custom logger with the http severity
      write: (message) => logger.http(message.trim()),
    },
  }
);
app.use(morgan_component);

const ratecombat_db = require('better-sqlite3')(main_package_json.config.base_directory + `/http_handlers/war-gate/db/rate-combat.db`,{fileMustExist: true});
shared_handler_data["ratecombat_db"] = ratecombat_db;

app.use(body_parser.json());
app.use(body_parser.urlencoded({ extended: true }));
app.use(cookie_parser());

const KILLCODE = main_package_json.config.KILLCODE;
const TESTCODE = main_package_json.config.TESTCODE;
const TOGGLEON = main_package_json.config.TOGGLEON;
const TOGGLEOFF = main_package_json.config.TOGGLEOFF;

const secure_port = main_package_json.config.primary_secure_port;
const clear_port = main_package_json.config.primary_clear_port;

const sec_server = https.createServer({
    key: fs.readFileSync(main_package_json.config.base_directory + "/tls/key.pem"),
    cert: fs.readFileSync(main_package_json.config.base_directory + "/tls/cert.pem"),},app)
    .listen(secure_port, () => {
    logger.info(`HTTP Server running on port ${secure_port}`);});
sec_server.timeout = 5000;

if (main_package_json.config.rc_auth) {
    const clear_server = http.createServer(app).listen(clear_port, () => {
        logger.info(`HTTP Server running on port ${clear_port}`);
    });
    clear_server.timeout = 5000;
}

function killCode(res, req) {
    log_for_web("Remote kill code received", req, logger.info);
    res.status(200).send("Shutting down server.");
    shutDown();
}

app.test_curls = [];
app.test_curl_hash = {};
app.test_exemptions = {};
app.add_test_curl = function(query_string = null, other_params = null, override_path = null, override_method = null) {
  route = app._router.stack[app._router.stack.length-1];
  if (override_path != null) urlpath = override_path;
  else urlpath = route["route"]["path"];
  hashkey = urlpath;
  if (query_string) urlpath = urlpath + "?" + query_string;
  if (override_method != null) method = override_method;
  else method = route["route"]["stack"][0]["method"];
  hashkey = hashkey + "|" + method;
  if (method != "get") method = " -X " + method.toUpperCase();
  else method = "";
  if (other_params) other_params = " " + other_params;
  else other_params = "";
  app.test_curl_hash[hashkey] = true;
  app.test_curls.push(`curl "https://${main_package_json.config.HOST}:${secure_port}${urlpath}" ${method} ${other_params}`);
}
app.add_test_exemption = function(path, method) {
    app.test_exemptions[path + "|" + method] = true;
}

app.get('/'+TESTCODE, (req, res) => {
    let output = "";
    for (i = 0; i < app.test_curls.length; i++) {
        output = output + app.test_curls[i] + "\n";
    }
    res.send(output);
})
app.add_test_exemption('/' + TESTCODE,"get");

app.get('/' + KILLCODE, (req, res) => {
    try {
        if ((req.socket.remoteAddress+"").indexOf("127.0.0.1") == ((req.socket.remoteAddress+"").length - 9)) {
            killCode(res, req);
        }
        else {
            res.status(403).send("Access denied.");
        }
    }
    catch (e) {
        log_for_web(e, req, logger.error);
    }
})
app.add_test_exemption('/' + KILLCODE,"get");

app.get('/' + TOGGLEON, (req, res) => {
    shared_handler_data["main_package_json"].config.mode_toggle = true;
    res.send(""+shared_handler_data["main_package_json"].config.mode_toggle);
})
app.add_test_exemption('/' + TOGGLEON,"get");

app.get('/' + TOGGLEOFF, (req, res) => {
    shared_handler_data["main_package_json"].config.mode_toggle = false;
    res.send(""+shared_handler_data["main_package_json"].config.mode_toggle);
})
app.add_test_exemption('/' + TOGGLEOFF,"get");

const http_handler_gets = require(main_package_json.config.base_directory+'/http_handlers/'+main_package_json.config.http_handler+'/GET.js');
http_handler_gets.init(app, log_for_web, logger, shared_handler_data, main_package_json);

const http_handler_posts = require(main_package_json.config.base_directory+'/http_handlers/'+main_package_json.config.http_handler+'/POST.js');
http_handler_posts.init(app, log_for_web, logger, shared_handler_data, main_package_json);

const http_handler_others = require(main_package_json.config.base_directory+'/http_handlers/'+main_package_json.config.http_handler+'/OTHERS.js');
http_handler_others.init(app, log_for_web, logger, shared_handler_data, main_package_json);

failure = false;
for (i = 0; i < app._router.stack.length; i++) {
    route = app._router.stack[i];
    if (route["name"] == "bound dispatch") {
        urlpath = route["route"]["path"];
        method = route["route"]["stack"][0]["method"];
        if (!app.test_curl_hash[urlpath+"|"+method]) {
            if (!app.test_exemptions[urlpath+"|"+method]) {
                logger.error("Error! No test curl was configured for the following url:method:\n" + urlpath + ":" + method + "\n\nThis is not allowed.  Most likely the tests need to added to /includes/templates.*.js.  Aborting...");
                failure = true;
                break;
            }
        }
    }
}

if (!failure) {
if (main_package_json.config.gate_ui) {
    app.use(['/'], express.static(main_package_json.config.base_directory+'/http_handlers/'+main_package_json.config.http_handler+'/wwwroot'), serve_index(main_package_json.config.base_directory+'/http_handlers/'+main_package_json.config.http_handler+'/wwwroot', {'icons': true}));
    app.use(function(req, res) {
        logger.warn("404 request detected, returning 200.");
        logger.warn(req);
        text =
        `
        File not found.  Redirecting in 3 seconds.
        <script>
            setTimeout(function(){ window.location = '/welcome';}, 3000, 0);
        </script>
        `;
        res.status(200).send(text);
    });
    app.use(function(error, req, res, next) {
        text =
        `
        5XX Error!  Redirecting in 3 seconds.
        <script>
            setTimeout(function(){ window.location = '/welcome';}, 3000, 0);
        </script>
        `;
        logger.warn(req);
        logger.error(error);
        res.status(200).send(text);
    });
}
}
else shutDown();

function ctrlC() {
    logger.info("Ctrl-C detected at terminal!");
    shutDown();
}

function ctrlC() {
    logger.info("Ctrl-C detected at terminal!");
    shutDown();
}
function shutDown() {
    logger.info('Shutting down gracefully.');
    logger.info('Exiting in 0.5 seconds...');
    setTimeout(process.exit, 500, 0);
}
process.on('SIGTERM', ctrlC);
process.on('SIGINT', ctrlC);