#!/usr/bin/env python3
import util, pprint

#initialize main python module
debugmsg = util.print_err
die = util.die
util.set_default_verbosity(1)
hashlib_seed = 'illuminATC'

#error codes and messages; use only 0 or positive integers.
err_success = [0,"Success"]
err_unexplained_failure = [1,"Unexplained failure."]
err_bad_status_code = [2,"Bad status code returned"]

def initialize_arguments():
    #add builtin library arguments
    args = util.ApiArguments(__doc__, autoparse=False)

    #add any additional required arguments here before parsing
    #example:
    #args.required_args.add_argument("--REQUIRED", required=True, help="REQUIRED ARGUMENT", action="store", dest="REQUIRED")

    #add any additional optional arguments here before parsing
    #example:
    #args.parser.add_argument("--OPTIONAL", required=False, help="OPTIONAL", action="store", dest="OPTIONAL")

    args.parse_args()
    return args

def getAccountName(client):
    parameters = {'accountSwitchKey': client.current_switchkey}
    json_data = client.httpCaller.getJSONResult('/papi/v1/groups', parameters)
    if ("accountName" in json_data and client.get_last_response_code() == 200):
        return json_data["accountName"]
    return None

if __name__ == "__main__":
    try:
        arguments = initialize_arguments()
        client = util.ApiClient(switchkey=arguments.switchkey, edgerc=arguments.edgerc, section=arguments.section)

        name = getAccountName(client)
        if (name == None):
            print("Could not retrieve account name.\nStatus code: ")
            print(client.get_last_response_code())
            print("\nJSON response body:")
            pprint.pprint(client.get_last_endpoint_result().json());
        else:
            print(name)

    finally:
        util.cleanup()
