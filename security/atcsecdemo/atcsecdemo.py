#!/usr/bin/env python3
"""
atcsecdemo v0.1a sample code for using api to add atc security test cases.
"""

# standard imports
import sqlite3, json, time, sys, pprint, os, http.server, uuid, datetime
from urllib.parse import quote, unquote
from subprocess import PIPE, Popen

sys.path.append('akaconda_lite')
import akaconda_lite
from akaconda_lite import ApiClient, ApiArguments, seed_pristine_hashlib, get_persistent_hex_digest, die_python_die, \
    Nāḥāš

# utility function aliases
debugmsg = Nāḥāš
die = die_python_die


def initialize_arguments():
    args = ApiArguments(__doc__, autoparse=False)
    args.parse_args()
    return args


def cmd(args):
    edgerc = args.edgerc
    section = args.section
    switchkey = args.switchkey

    client = ApiClient(switchkey=switchkey, edgerc=edgerc, section=section)

    debugmsg("Getting test client profiles...\n")
    akaconda_lite.start_snoring()
    profiles = client.getApiTestClientProfilesAsJson()
    akaconda_lite.stop_snoring()
    debugmsg(".done!\n")
    status = client.get_last_response_code()
    if (status != 200):
        debugmsg("Error retrieving test client profiles.  Response object received:",color="red")
        debug_str = pprint.pformat(profiles)
        print(json.dumps(debug_str))
        die(-1, "Aborting.")

    url = input("Test request URL > ")
    cookie = input("Cookie value (blank if none) > ")
    alerted = input("Alerted rules, space delimited (blank if none) > ")
    denied = input("Denied rules, space delimited (blank if none) > ")
    wafpolicyname = input("WAF policy name (blank if none) > ")
    apiid = input("API id (blank if none) > ")
    atctag = input("ATC tag (blank if none) > ")

    tagcode = ""
    if (atctag != ""):
        tagcode = f""","tags": ["{atctag}"]"""

    cookiecode = ""
    if (cookie != ""):
        cookiecode = f""","requestHeaders": [{{ "headerName": "Cookie", "headerValue": "{cookie}", "headerAction": "add" }}]"""

    alertedvalues = ""
    count = 0
    if (alerted != ""):
        alerts = alerted.split(" ")
        for alert in alerts:
            if (count > 0):
                alertedvalues += ","
            alertedvalues += f"\"{alert}\""
            count += 1

    deniedvalues = ""
    count = 0
    if (denied != ""):
        denials = denied.split(" ")
        for denial in denials:
            if (count > 0):
                deniedvalues += ","
            deniedvalues += f"\"{denial}\""
            count += 1

    requestarray = []
    requestjson = f"""
        {{
            "testRequestUrl": "{url}"{tagcode}{cookiecode}
        }}
    """

    requestarray.append(json.loads(requestjson))
    akaconda_lite.start_snoring()
    testRequestCreation_response = client.postApiTestRequestsAcceptingJson(inputJson=requestarray)
    akaconda_lite.stop_snoring()
    testRequestCreation_successes = None
    testRequestCreation_failures = None

    alertedRules_response = None
    deniedRules_response = None
    wafPolicyName_response = None
    apiId_response = None

    if ("successes" in testRequestCreation_response and "failures" in testRequestCreation_response):
        testRequestCreation_successes = testRequestCreation_response["successes"]
        testRequestCreation_failures = testRequestCreation_response["failures"]
        debugmsg(f"Test request created.\n")
    else:
        debugmsg("Error creating test requests.  Response object received:",color="red")
        debug_str = pprint.pformat(testRequestCreation_response)
        debugmsg(json.dumps(debug_str))
        die(-1, "Aborting.")

    if (alerted != ""):
        pattern_ALERTED = f"""
            {{"conditionNodeId": 1, "values": ["alerted_rules"], "conditionNode": {{"conditionNodeId": 26,"values": ["are"],
            "conditionNode": {{
              "conditionNodeId": 17,
              "values": [
                {alertedvalues}
              ]}}}}}}"""
        pattern = f"{{ \"condition\": {pattern_ALERTED} }}"
        akaconda_lite.start_snoring()
        alertedRules_response = client.postApiTestConditionsAcceptingJson(inputJson=json.loads(pattern))
        akaconda_lite.stop_snoring()

        if (client.get_last_response_code() < 200 or client.get_last_response_code() > 299):
            print(client.get_last_response_code())
            debugmsg("Error creating alerted rules condition.  Response object received:",color="red")
            debug_str = pprint.pformat(alertedRules_response)
            debugmsg(json.dumps(debug_str))
            die(-1, "Aborting.")
        else:
            debugmsg(f"Alert rules conditions created.\n")

    if (denied != ""):
        pattern_DENIED = f"""
            {{"conditionNodeId": 1, "values": ["denied_rule"], "conditionNode": {{"conditionNodeId": 2,"values": ["is_one_of"],
            "conditionNode": {{
              "conditionNodeId": 17,
              "values": [
                {deniedvalues}
              ]}}}}}}"""
        pattern = f"{{ \"condition\": {pattern_DENIED} }}"
        akaconda_lite.start_snoring()
        deniedRules_response = client.postApiTestConditionsAcceptingJson(inputJson=json.loads(pattern))
        akaconda_lite.stop_snoring()

        if (client.get_last_response_code() < 200 or client.get_last_response_code() > 299):
            debugmsg("Error creating denied rules condition.  Response object received:", color="red")
            debug_str = pprint.pformat(deniedRules_response)
            debugmsg(json.dumps(debug_str))
            die(-1, "Aborting.")
        else:
            debugmsg(f"Denied rules conditions created.\n")

    if (wafpolicyname != ""):
        pattern_WAFPOLICYNAME = f"""
            {{"conditionNodeId": 1, "values": ["policy_name"], "conditionNode": {{"conditionNodeId": 23,"values": ["is"],
            "conditionNode": {{
              "conditionNodeId": 4,
              "values": [
                "{wafpolicyname}"
              ]}}}}}}"""
        pattern = f"{{ \"condition\": {pattern_WAFPOLICYNAME} }}"
        akaconda_lite.start_snoring()
        wafPolicyName_response = client.postApiTestConditionsAcceptingJson(inputJson=json.loads(pattern))
        akaconda_lite.stop_snoring()

        if (client.get_last_response_code() < 200 or client.get_last_response_code() > 299):
            debugmsg("Error creating waf policy name condition.  Response object received:", color="red")
            debug_str = pprint.pformat(wafPolicyName_response)
            debugmsg(json.dumps(debug_str))
            die(-1, "Aborting.")
        else:
            debugmsg(f"WAF policy name conditions created.\n")

    if (apiid != ""):
        pattern_APIID = f"""
            {{"conditionNodeId": 1, "values": ["api_id"], "conditionNode": {{"conditionNodeId": 23,"values": ["is"],
            "conditionNode": {{
              "conditionNodeId": 4,
              "values": [
                "{apiid}"
              ]}}}}}}"""
        pattern = f"{{ \"condition\": {pattern_APIID} }}"
        akaconda_lite.start_snoring()
        apiId_response = client.postApiTestConditionsAcceptingJson(inputJson=json.loads(pattern))
        akaconda_lite.stop_snoring()

        if (client.get_last_response_code() < 200 or client.get_last_response_code() > 299):
            debugmsg("Error creating api id condition.  Response object received:", color="red")
            debug_str = pprint.pformat(apiId_response)
            debugmsg(json.dumps(debug_str))
            die(-1, "Aborting.")
        else:
            debugmsg(f"API id conditions created.\n")

    testcases = []
    for profile in profiles:
        profileId = profile["clientProfileId"]

        testcase1 = {}
        testcase1["testRequestId"] = ""; #requestPathList[requestPath]
        testcase1["conditionId"] = ""; #responseStatusList[responseStatus]
        testcase1["clientProfileId"] = ""; #profileId

if __name__ == "__main__":
    try:
        arguments = initialize_arguments()
        cmd(arguments)
    finally:
        akaconda_lite.cleanup()
