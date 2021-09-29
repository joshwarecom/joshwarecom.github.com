#!/usr/bin/env python3

'''
goatc v0.1a

Detailed Description:
Primary purpose of this script:
generate ATC test cases from scripts stored in the rule Notes fields of the configuration to be tested, and associate them to a test suite.

example usage:
./goatc.py --cmd EXECUTE_PROPERTY_ATC_SCRIPTS --switchKey B-3-U3XNPI --contractId 3-U3Y8U4 --groupId 62925 --propertyId 408901 --version 3 --testSuiteName breaktheinternet.scoe-sil.net.xml-v3

Regression test scripts should be pasted into the Notes field of the configuration, and have the following syntax:
ATC![METHOD]@[URL]#[keyword1]#[keyword2]#[keywordetc]@

Example test script #1: status code = 200, netstorage cache key, query parameters excluded:
ATC!GET@https://breaktheinternet.scoe-sil.net/200.html#status=200#keycontains=/scoesil.download.akamai.com/#excludequery@

Example test script group #2: siteFailover=true sets cookie properly, and siteFailover cookie correctly breaks forward connection
ATC!GET@https://breaktheinternet.scoe-sil.net/failoverTest/?siteFailover=true#redirect=302,https://breaktheinternet.scoe-sil.net/failoverTest/#headeris=Set-Cookie|siteFailover%3Dtrue; secure; HttpOnly@
ATC!GET@https://breaktheinternet.scoe-sil.net/failoverTest/#^Cookie=siteFailover%3Dtrue;#status=503@

For a very good example of a comprehensive set of test scripts, see configuration:
prod-ssl-mchb.hrsa.gov.xml v42

Currently Supported keywords:
pragmas
Description: add basic pragma headers to request

^[headerName]=[headerValue]
Description: add request header [headerName] to request with [headerValue]

~[headerName]=[headerValue]
Description: modify existing request header [headerName] and use [headerValue] instead.

sureroute
Description: test if sureroute was triggered by request

prefetch
Description: test if prefetching was triggered by request.

gzip
Description: test if response was gzipped

nogzip
Description: test if response was NOT gzipped

status=[STATUS]
Description: test if response status code equals [STATUS]

cpcode=[CPCODE]
Description: test if cp code of request equals [CPCODE]

redirect=[STATUS],[LOCATION]
Description: confirm response was a redirect with specified STATUS and LOCATION values.

cache=[DURATION],[INTERVAL]
Description: confirm cache TTL is expcted DURATION and INTERVAL

nostore
Description: confirm cache TTL is nostore

var=[NAME]|[VALUE]
Description: confirm variable was set with given [NAME] and [VALUE]

keycontains=[STRING]
Description: confirm X-Cache-Key header contains [STRING]

keyomits=[STRING]
Description: confirm X-Cache-Key header does not contain [STRING]

excludequery
Description: confirm query parametere are excluded from cache key.

headeris=[HEADERNAME]|[HEADERVALUE]
Description: confirm response header [HEADERNAME] has value [HEADERVALUE]

novarval=[VARNAME]
Description: confirm variable [VARNAME] exists and has no value.

novar=[VARNAME]
Description: confirm variable [VARNAME] does not exist.

noheader=[HEADERNAME]
Description: confirm response header [HEADERNAME] does not exist.

dolog=[DATATYPE]
Description: confirm [DATATYPE] will be logged.  Currently supported datatypes:
accept_language_header
host_header
custom_data
referrer_header
user_agent_header
cookies|[COOKIENAME]

nolog=[DATATYPE]
Description: confirm [DATATYPE] will NOT be logged.  Currently supported datatypes:
accept_language_header
host_header
custom_data
referrer_header
user_agent_header
cookies

secpolicy=[POLICY NAME]
Description: confirm security policy named [POLICY NAME] applied to the request.

Secondary purpose of this script:
quick implementation of arbitrary API functions. See "supported_commands" list for available commands.
'''

import util, pprint, commands

#initialize main python module
debugmsg = util.print_err
die = util.die
util.set_default_verbosity(1)
hashlib_seed = 'goATC'
api_client = None

#error codes and messages; use only 0 or positive integers.
err_success = [0,"Success"]
err_unexplained_failure = [1,"Unexplained failure."]
err_bad_status_code = [2,"Bad status code returned"]
err_invalid_command = [3,"Invalid command."]

#index of commands supported by this script
supported_commands = [
    ["ACCOUNT_NAME",
     "Simply lookup and print the account name for the supplied switchKey."],
    ["ACCOUNT_CONTRACTS",
     "List the contracts associated with the supplied switchKey."],
    ["ACCOUNT_GROUPS",
     "List the configurations associated with the supplied switchKey."],
    ["ACCOUNT_PROPERTIES",
     "List the configurations associated with the supplied switchKey, contract, and group."],
    ["PROPERTY_HOSTNAMES",
     "Download list of hostnames."],
    ["PROPERTY_XML",
     "Download configuration metadata as XML."],
    ["PROPERTY_JSON",
     "Download configuration metadata as JSON."],
    ["PROPERTY_RULES_JSON",
     "Download configuration version metadata as JSON."],
    ["GET_TEST_CATALOG_TEMPLATE",
     "Download the ATC test catalog template"],
    ["EXECUTE_PROPERTY_ATC_SCRIPTS",
     "Download the list of ATC test scripts saved to the comments of given property version and execute them.  For the experimental GUI version, supplly the --ui argument.  To supply test script from a local file, supply --localFile /path/to/file."],
    ["LIST_GOATC_TEST_SUITES",
     "Download the list of ATC test suites that were automatically generated by this script."],
    ["REMOVE_GOATC_TEST_SUITES",
     "Remove the ATC test suites that were automatically generated by this script."],
    ["SHOW_GOATC_UI",
     "Show experimental GUI for parameterizing this script."]
]
current_command_index = -1

def initialize_arguments():
    #add builtin library arguments
    args = util.ApiArguments(__doc__, autoparse=False)

    #generate help text for supported commands
    cmd_list = ""
    for pair in supported_commands:
        if (cmd_list != ""):
            cmd_list = cmd_list + ", "
        cmd_list = cmd_list + pair[0]
    args.required_args.add_argument("--cmd", required=False,
                                         help="supported commands: " + cmd_list,
                                         action="store", dest="command", default="SHOW_GOATC_UI")

    #parse arguments
    args.parse_args()

    #make sure command entered is valid
    valid_command = 0
    global current_command_index
    for pair in supported_commands:
        current_command_index = current_command_index + 1
        if args.args.command.lower() == pair[0].lower():
            valid_command = 1
            break
    if (valid_command == 0):
        die(err_invalid_command[0],args.args.command + " is not a valid command.  Valid commands are: " + cmd_list)

    return args

if __name__ == "__main__":
    try:
        util.set_input_args(initialize_arguments())

        if (util.get_input_args().args.explain):
            print("Explanation for the " + supported_commands[current_command_index][0] + " command: \n\n" + supported_commands[current_command_index][1])
        else:
            util.set_api_client(util.ApiClient(switchkey=util.get_input_args().switchkey, edgerc=util.get_input_args().edgerc, section=util.get_input_args().section))
            arg_fname = "addargs_" + supported_commands[current_command_index][0];
            if (hasattr(commands, arg_fname)):
                f = getattr(commands, arg_fname)
                f()
                util.get_input_args().parse_args()
            fname = "docmd_" + supported_commands[current_command_index][0];
            f = getattr(commands, fname)
            f()

    finally:
        util.cleanup()
