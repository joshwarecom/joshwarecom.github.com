import util, pprint, re, json, uuid, time, wx, os, gui, requests, urllib
from util import get_api_client, get_input_args, print_err, pprint_err

def reject_blank_switchkey():
    if (get_api_client().current_switchkey == None or get_api_client().current_switchkey == ""):
        util.die(-1,"--switchKey argument must not be blank for this command.")

def docmd_ACCOUNT_NAME():
    reject_blank_switchkey()
    parameters = {'accountSwitchKey': get_api_client().current_switchkey}

    json_data = get_api_client().httpCaller.getJSONResult('/papi/v1/groups', parameters)
    if ("accountName" in json_data and get_api_client().get_last_response_code() == 200):
        print (json_data["accountName"])
        return json_data

    print_err("Could not retrieve account name.\nStatus code: ")
    print_err(get_api_client().get_last_response_code())
    print_err("\nJSON response body:")
    print_err(get_api_client().get_last_endpoint_result().json());
    return json_data

def docmd_ACCOUNT_CONTRACTS():
    reject_blank_switchkey()
    parameters = {'accountSwitchKey': get_api_client().current_switchkey}
    json_data = get_api_client().httpCaller.getJSONResult('/papi/v1/contracts', parameters)
    if ("contracts" in json_data and get_api_client().get_last_response_code() == 200):
        try:
            items = json_data["contracts"]["items"]
            for item in items:
                print(item["contractId"].split("ctr_")[1] + " - " + item["contractTypeName"])
            return json_data
        except:
            print_err("Error while processing contract API response.\n")

    print_err("Could not retrieve account contracts.\nStatus code: ")
    print_err(get_api_client().get_last_response_code())
    print_err("\nJSON response body:")
    print_err(get_api_client().get_last_endpoint_result().json());
    return json_data

def docmd_ACCOUNT_GROUPS():
    reject_blank_switchkey()
    parameters = {'accountSwitchKey': get_api_client().current_switchkey}
    json_data = get_api_client().httpCaller.getJSONResult('/papi/v1/groups', parameters)
    if ("groups" in json_data and get_api_client().get_last_response_code() == 200):
        try:
            items = json_data["groups"]["items"]

            for item in items:
                contracts = item["contractIds"]
                contract_str = ""
                for c in contracts:
                    contract_str = "|" + urllib.parse.quote(c.split("ctr_")[1],safe=' ')
                print(urllib.parse.quote(item["groupId"].split("grp_")[1], safe=' ') + "|" + urllib.parse.quote(item["groupName"],safe=' ') + contract_str)
            return json_data
        except:
            print_err("Error while processing group API response.\n")

    print_err("Could not retrieve account groups.\nStatus code: ")
    print_err(get_api_client().get_last_response_code())
    print_err("\nJSON response body:")
    print_err(get_api_client().get_last_endpoint_result().json());
    return json_data

def addargs_ACCOUNT_PROPERTIES():
    get_input_args().parser.add_argument("--groupId", required=False, help="groupId", action="store", dest="groupid")
    get_input_args().parser.add_argument("--contractId", required=False, help="contractId", action="store", dest="contractid")

def docmd_ACCOUNT_PROPERTIES():
    reject_blank_switchkey()
    contractId = get_input_args().args.contractid
    groupId = get_input_args().args.groupid
    if (contractId == None or groupId == None):
        print_err("This command required two additional arguments: --contractId and --groupId")
        return None

    parameters = {'accountSwitchKey': get_api_client().current_switchkey,
                  'contractId': contractId,
                  'groupId': groupId
                  }
    json_data = get_api_client().httpCaller.getJSONResult('/papi/v1/properties', parameters)
    if (get_api_client().get_last_response_code() == 200):
        pprint.pprint(json_data);
        return json_data;

    print_err("Could not retrieve account groups.\nStatus code: ")
    print_err(get_api_client().get_last_response_code())
    print_err("\nJSON response body:")
    print_err(get_api_client().get_last_endpoint_result().json());
    return json_data

def addargs_PROPERTY_HOSTNAMES():
    get_input_args().parser.add_argument("--groupId", required=False, help="groupId", action="store", dest="groupid")
    get_input_args().parser.add_argument("--contractId", required=False, help="contractId", action="store", dest="contractid")
    get_input_args().parser.add_argument("--propertyId", required=False, help="propertyId", action="store", dest="propertyid")
    get_input_args().parser.add_argument("--versionId", required=False, help="versionId", action="store", dest="versionid")

def docmd_PROPERTY_HOSTNAMES():
    reject_blank_switchkey()
    contractId = get_input_args().args.contractid
    groupId = get_input_args().args.groupid
    propertyId = get_input_args().args.propertyid
    versionId = get_input_args().args.versionid

    if (contractId == None or groupId == None or propertyId == None or versionId == None):
        print_err("This command required four additional arguments: --contractId, --groupId, --propertyId and --versionId")
        return None

    parameters = {'accountSwitchKey': get_api_client().current_switchkey,
                  'contractId': contractId,
                  'groupId': groupId
                  }

    json_data = get_api_client().httpCaller.getJSONResult('/papi/v1/properties/%s/versions/%s/hostnames' % (propertyId, versionId), parameters)
    if ("hostnames" in json_data and get_api_client().get_last_response_code() == 200):
        items = json_data["hostnames"]["items"]
        for item in items:
            print(item["cnameFrom"])
        return json_data;

    print_err("Could not retrieve property hostnames.\nStatus code: ")
    print_err(get_api_client().get_last_response_code())
    print_err("\nJSON response body:")
    print_err(get_api_client().get_last_endpoint_result().json());
    return json_data


def addargs_PROPERTY_XML():
    get_input_args().parser.add_argument("--groupId", required=False, help="groupId", action="store", dest="groupid")
    get_input_args().parser.add_argument("--contractId", required=False, help="contractId", action="store", dest="contractid")
    get_input_args().parser.add_argument("--propertyId", required=False, help="propertyId", action="store", dest="propertyid")
    get_input_args().parser.add_argument("--versionId", required=False, help="versionId", action="store", dest="versionid")

def docmd_PROPERTY_XML():
    reject_blank_switchkey()
    contractId = get_input_args().args.contractid
    groupId = get_input_args().args.groupid
    propertyId = get_input_args().args.propertyid
    versionId = get_input_args().args.versionid

    if (contractId == None or groupId == None or propertyId == None or versionId == None):
        print_err("This command required four additional arguments: --contractId, --groupId, --propertyId and --versionId")
        return None

    parameters = {'accountSwitchKey': get_api_client().current_switchkey,
                  'contractId': contractId,
                  'groupId': groupId
                  }
    xml_data = get_api_client().httpCaller.getXMLResult('/papi/v1/properties/%s/versions/%s' % (propertyId, versionId), parameters)
    if (get_api_client().get_last_response_code() == 200):
        pprint.pprint(xml_data);
        return xml_data;

    print_err("Could not retrieve property XML.\nStatus code: ")
    print_err(get_api_client().get_last_response_code())
    print_err("\nJSON response body:")
    print_err(get_api_client().get_last_endpoint_result().json());
    return xml_data

def addargs_PROPERTY_JSON():
    get_input_args().parser.add_argument("--groupId", required=False, help="groupId", action="store", dest="groupid")
    get_input_args().parser.add_argument("--contractId", required=False, help="contractId", action="store", dest="contractid")
    get_input_args().parser.add_argument("--propertyId", required=False, help="propertyId", action="store", dest="propertyid")
    get_input_args().parser.add_argument("--versionId", required=False, help="versionId", action="store", dest="versionid")

def docmd_PROPERTY_JSON():
    reject_blank_switchkey()
    contractId = get_input_args().args.contractid
    groupId = get_input_args().args.groupid
    propertyId = get_input_args().args.propertyid
    versionId = get_input_args().args.versionid

    if (contractId == None or groupId == None or propertyId == None or versionId == None):
        print_err("This command required four additional arguments: --contractId, --groupId, --propertyId and --versionId")
        return None

    parameters = {'accountSwitchKey': get_api_client().current_switchkey,
                  'contractId': contractId,
                  'groupId': groupId
                  }
    json_data = get_api_client().httpCaller.getJSONResult('/papi/v1/properties/%s/versions/%s' % (propertyId, versionId), parameters)
    if (get_api_client().get_last_response_code() == 200):
        pprint.pprint(json_data);
        return json_data;

    print_err("Could not retrieve property JSON.\nStatus code: ")
    print_err(get_api_client().get_last_response_code())
    print_err("\nJSON response body:")
    print_err(get_api_client().get_last_endpoint_result().json());
    return json_data

def addargs_PROPERTY_RULES_JSON():
    get_input_args().parser.add_argument("--groupId", required=False, help="groupId", action="store", dest="groupid")
    get_input_args().parser.add_argument("--contractId", required=False, help="contractId", action="store", dest="contractid")
    get_input_args().parser.add_argument("--propertyId", required=False, help="propertyId", action="store", dest="propertyid")
    get_input_args().parser.add_argument("--versionId", required=False, help="versionId", action="store", dest="versionid")

def docmd_PROPERTY_RULES_JSON():
    reject_blank_switchkey()
    contractId = get_input_args().args.contractid
    groupId = get_input_args().args.groupid
    propertyId = get_input_args().args.propertyid
    versionId = get_input_args().args.versionid

    if (contractId == None or groupId == None or propertyId == None or versionId == None):
        print_err("This command required four additional arguments: --contractId, --groupId, --propertyId and --versionId")
        return None

    parameters = {'accountSwitchKey': get_api_client().current_switchkey,
                  'contractId': contractId,
                  'groupId': groupId,
                  'validateRules': 'false',
                  'validateMode': 'fast'
                  }
    json_data = get_api_client().httpCaller.getJSONResult('/papi/v1/properties/%s/versions/%s/rules' % (propertyId, versionId), parameters)
    if (get_api_client().get_last_response_code() == 200):
        pprint.pprint(json_data);
        return json_data;

    print_err("Could not retrieve property JSON.\nStatus code: ")
    print_err(get_api_client().get_last_response_code())
    print_err("\nJSON response body:")
    print_err(get_api_client().get_last_endpoint_result().json());
    return json_data

def docmd_GET_TEST_CATALOG_TEMPLATE():
    reject_blank_switchkey()
    parameters = {'accountSwitchKey': get_api_client().current_switchkey}

    json_data = get_api_client().httpCaller.getJSONResult('/test-management/v2/functional/test-catalog/template', parameters)
    if (get_api_client().get_last_response_code() == 200):
        pprint.pprint(json_data)
        return json_data

    print_err("Could not retrieve account name.\nStatus code: ")
    print_err(get_api_client().get_last_response_code())
    print_err("\nJSON response body:")
    print_err(get_api_client().get_last_endpoint_result().json());
    return json_data

def create_test_condition(client_profiles, caseids, requestid, jsonstr):
    reject_blank_switchkey()
    try:
        parameters = {'accountSwitchKey': get_api_client().current_switchkey
                      }

        time.sleep(.5)
        json_data = get_api_client().httpCaller.postAcceptingJSON(
            '/test-management/v2/functional/test-catalog/conditions', parameters, json.loads(jsonstr))
        conditionid = None
        try:
            conditionid = str(json_data["errors"][0]["existingEntities"][0]["conditionId"])
            print_err("Condition id success!\n")
        except:
            try:
                print_err(str(json_data["conditionId"]))
                conditionid = str(json_data["conditionId"])
                print_err("Condition id success!\n")
            except:
                print_err("Failed to verify successfully created condition id\n", color='red')
                pprint_err(json_data,color="yellow")
                print_err("\n")
        if (conditionid != None):
            print_err("Condition id is " + conditionid + "\n")
            print_err("Generating test cases...\n")

            testcases = []
            for profile in client_profiles:
                profileId = profile["clientProfileId"]
                thiscase = {}
                thiscase["testRequestId"] = requestid
                thiscase["conditionId"] = conditionid
                thiscase["clientProfileId"] = profileId
                testcases.append(thiscase)
            parameters = {'accountSwitchKey': get_api_client().current_switchkey}
            time.sleep(.5)
            json_data = get_api_client().httpCaller.postAcceptingJSON('/test-management/v2/functional/test-cases',
                                                                      parameters, testcases)
            caseid1 = None
            success1 = None
            failure1 = None
            try:
                caseid1 = str(json_data["failures"][0]["existingEntities"][0]["testCaseId"])
                print_err("Case id 1 success! " + caseid1 + "\n")
                failure1 = 1
            except:
                try:
                    caseid1 = str(json_data["successes"][0]["testCaseId"])
                    print_err("Case id 1 success! " + caseid1 + "\n")
                    success1 = 1
                except:
                    print_err("Failed to verify successfully created case id 1\n", color='red')
                    pprint_err(json_data,color='yellow')
            caseid2 = None
            try:
                caseid2 = str(json_data["failures"][0]["existingEntities"][1]["testCaseId"])
                print_err("Case id 2 success! " + caseid2 + "\n")
            except:
                try:
                    caseid2 = str(json_data["successes"][1]["testCaseId"])
                    print_err("Case id 2 success! " + caseid2 + "\n")
                except:
                    if (failure1 == None):
                        try:
                            caseid2 = str(json_data["failures"][0]["existingEntities"][0]["testCaseId"])
                        except:
                            print_err("Failed to verify successfully created case id 2\n", color='red')
                            pprint_err(json_data, color='yellow')
                    elif (success1 == None):
                        try:
                            caseid2 = str(json_data["successes"][0]["testCaseId"])
                        except:
                            print_err("Failed to verify successfully created case id 2\n", color='red')
                            pprint_err(json_data, color='yellow')
                    if (caseid2 != None):
                        print_err("Case id 2 success! " + caseid2 + "\n")
            if (caseid1 != None):
                caseids.append(caseid1)
            if (caseid2 != None):
                caseids.append(caseid2)
    except:
        print_err("ERROR! Exception occurred while creating test condition! Some tests may not have been created.\n", color="red")

    return caseids

def addargs_EXECUTE_PROPERTY_ATC_SCRIPTS():
    get_input_args().parser.add_argument("--groupId", required=False, help="groupId", action="store", dest="groupid")
    get_input_args().parser.add_argument("--contractId", required=False, help="contractId", action="store", dest="contractid")
    get_input_args().parser.add_argument("--propertyId", required=False, help="propertyId", action="store", dest="propertyid")
    get_input_args().parser.add_argument("--versionId", required=False, help="versionId", action="store", dest="versionid")
    get_input_args().parser.add_argument("--testSuiteName", required=False, help="testSuiteName", action="store", dest="testsuitename")
    get_input_args().parser.add_argument("--localFile", required=False, help="localFile", action="store", dest="localfile")
    get_input_args().parser.add_argument("--ui", required=False, help="ui", action="store_true", dest="ui")

def docmd_EXECUTE_PROPERTY_ATC_SCRIPTS():
    reject_blank_switchkey()
    contractId = get_input_args().args.contractid
    groupId = get_input_args().args.groupid
    propertyId = get_input_args().args.propertyid
    versionId = get_input_args().args.versionid
    testSuiteName = get_input_args().args.testsuitename
    ui = get_input_args().args.ui
    localFile = get_input_args().args.localfile

    testscripts = []

    if (ui):
        gui.showme()

    if (ui == False and (contractId == None or groupId == None or propertyId == None or versionId == None or testSuiteName == None)):
        print_err("This command required four additional arguments: --contractId, --groupId, --propertyId, --versionId and --testSuiteName")
        return None

    parameters = {'accountSwitchKey': get_api_client().current_switchkey}
    profiles_data = get_api_client().httpCaller.getJSONResult(
        '/test-management/v2/functional/client-profiles', parameters)

    parameters = {'accountSwitchKey': get_api_client().current_switchkey,
                  'contractId': contractId,
                  'groupId': groupId,
                  'validateRules': 'false',
                  'validateMode': 'fast'
                  }
    print_err("Downloading configuration JSON...\n")
    json_data = get_api_client().httpCaller.getJSONResult('/papi/v1/properties/%s/versions/%s/rules' % (propertyId, versionId), parameters)
    if (get_api_client().get_last_response_code() == 200):
        if localFile == None:
            tmp = re.findall("\"comments\" : \".*ATC!.*\"", get_api_client().get_last_endpoint_result().text)

            for txt in tmp:
                mgroup = re.findall('ATC!(.*?@.*?)@', txt)
                for m in mgroup:
                    found = m
                    details = found.split('@')
                    if (details[0] == "URL"):
                        try:
                            link = details[1]
                            f = requests.get(link)
                            lines = str(f.text).split("@\n")
                            for line in lines:
                                if (line != ""):
                                    testscripts.append(line)
                        except:
                            print_err("Exception occurred while downloading test scripts from URL: " + link + ", these test scripts were not added.",color="yellow")
                    else:
                        testscripts.append(found)
        else:
            try:
                print_err("Local file supplied, reading test scripts from " + localFile + "\n")
                text_file = open(localFile, "r")
                data = text_file.read()
                text_file.close()
                lines = data.split("@\n")
                for line in lines:
                    if (line != ""):
                        testscripts.append(line)
            except:
                print_err("ERROR! Exception ocurred while reading test scripts from local file.\n", color="red")

        if (len(testscripts) > 0):
            # generate suite and associate
            testsuite = {}
            testsuite["testSuiteName"] = f"{testSuiteName} {uuid.uuid4()}"
            testsuite[
                "testSuiteDescription"] = f"This test suite was automatically generated by the goatc script."
            testsuite["locked"] = False
            testsuite["stateful"] = False
            parameters = {'accountSwitchKey': get_api_client().current_switchkey
                          }

            generated = None
            try:
                generated = get_api_client().httpCaller.postAcceptingJSON('/test-management/v2/functional/test-suites',
                                                                      parameters, testsuite)
                newid = generated["testSuiteId"]
            except:
                print_err("\n")
                pprint_err(generated,color="yellow")
                print_err("\n")
                util.die(-1,"Exception while creating test suite.  Aborting.")

            for script in testscripts:
                instructions = script.split('#')
                if (len(instructions) < 2):
                    print_err("Skipping " + script + ", each script must have 1 request and at least 1 parameter.",color='red')
                else:
                    request = instructions[0].split('@')
                    if (len(request) != 2):
                        print_err("Skipping " + script + ", request syntax must be GET@URL#parameterlist",color='red')
                    else:
                        if (request[0] != "GET"):
                            print_err("Skipping " + script + ", only GET requests are supported at this time.",color='red')
                        else:
                            url = request[1]
                            added_request_headers = {}
                            modified_request_headers = {}
                            status = None
                            cpcode = None
                            sureroute = None
                            prefetch = None
                            redirect_status = None
                            redirect_location = None
                            gzip = None
                            nogzip = None
                            cache_duration = None
                            cache_interval = None
                            nostore = None
                            bypass = None
                            varis = {}
                            excludequery = None
                            headeris = {}
                            keycontains = []
                            keyomits = []
                            novarval = []
                            novar = []
                            noheader = []
                            dolog = []
                            nolog = []
                            secpolicy = None;
                            notd = None

                            print_err("URL is: " + url +"\n")
                            for i in range(1,len(instructions)):
                                if (instructions[i] == 'pragmas'):
                                    print_err("Adding pragma headers...\n")
                                    added_request_headers["Pragma"] = "akamai-x-cache-on, akamai-x-cache-remote-on, akamai-x-get-cache-key, akamai-x-get-request-id, akamai-x-get-true-cache-key, akamai-x-get-extracted-values"
                                elif (instructions[i] != '' and instructions[i][0] == '^'):
                                    print_err("Adding arbitrary header  " + instructions[i] + "\n")
                                    pair = instructions[i].split("=");
                                    if (len(pair) != 2):
                                        print_err("Skipping " + instructions[i] + ", syntax must be key=value",color='red')
                                    else:
                                        decoded = pair[1]
                                        decoded = decoded.replace("%3D","=")
                                        print_err("Continuing with " + pair[0][1:] + " = " + decoded + "\n")
                                        added_request_headers[pair[0][1:]] = decoded
                                elif (instructions[i] != '' and instructions[i][0] == '~'):
                                    print_err("Modifying arbitrary header  " + instructions[i] + "\n")
                                    pair = instructions[i].split("=");
                                    if (len(pair) != 2):
                                        print_err("Skipping " + instructions[i] + ", syntax must be key=value",color='red')
                                    else:
                                        decoded = pair[1]
                                        decoded = decoded.replace("%3D","=")
                                        print_err("Continuing with " + pair[0][1:] + " = " + decoded + "\n")
                                        modified_request_headers[pair[0][1:]] = decoded
                                elif (instructions[i] == "sureroute"):
                                    print_err("Adding sureroute test condition...\n")
                                    sureroute = 1
                                elif (instructions[i] == "prefetch"):
                                    print_err("Adding prefetch test condition...\n")
                                    prefetch = 1
                                elif (instructions[i] == "gzip"):
                                    print_err("Adding gzip test condition...\n")
                                    gzip = 1
                                elif (instructions[i] == "nogzip"):
                                    print_err("Adding nogzip test condition...\n")
                                    nogzip = 1
                                elif (instructions[i].startswith("status=")):
                                    pair = instructions[i].split("=")
                                    if (len(pair) != 2):
                                        print_err("Skipping " + instructions[i] + ", syntax must be key=value",color='red')
                                    else:
                                        print_err("Continuing with " + pair[0] + " = " + pair[1] + "\n")
                                        print_err("Adding status code test condition...\n")
                                        status = pair[1]
                                elif (instructions[i].startswith("cpcode=")):
                                    pair = instructions[i].split("=")
                                    if (len(pair) != 2):
                                        print_err("Skipping " + instructions[i] + ", syntax must be key=value",color='red')
                                    else:
                                        print_err("Continuing with " + pair[0] + " = " + pair[1] + "\n")
                                        print_err("Adding cp code code test condition...\n")
                                        cpcode = pair[1]
                                elif (instructions[i].startswith("redirect=")):
                                    pair = instructions[i].split("=")
                                    if (len(pair) != 2):
                                        print_err("Skipping " + instructions[i] + ", syntax must be key=value",color='red')
                                    else:
                                        print_err("Continuing with " + pair[0] + " = " + pair[1] + "\n")
                                        print_err("Adding redirect test condition...\n")
                                        redirect_pair = pair[1].split(",")
                                        if (len(redirect_pair) != 2):
                                            print_err("Skipping " + instructions[i] + ", syntax must be status,location",color='red')
                                        else:
                                            redirect_status = redirect_pair[0]
                                            redirect_location = redirect_pair[1]
                                elif (instructions[i].startswith("cache=")):
                                    pair = instructions[i].split("=")
                                    if (len(pair) != 2):
                                        print_err("Skipping " + instructions[i] + ", syntax must be key=value",color='red')
                                    else:
                                        print_err("Continuing with " + pair[0] + " = " + pair[1] + "\n")
                                        print_err("Adding cache test condition...\n")
                                        cache_pair = pair[1].split(",")
                                        if (len(cache_pair) != 2):
                                            print_err("Skipping " + instructions[i] + ", syntax must be duration,interval",color='red')
                                        else:
                                            cache_duration = cache_pair[0]
                                            cache_interval = cache_pair[1]
                                elif (instructions[i] == "nostore"):
                                    print_err("Adding nostore test condition...\n")
                                    nostore = 1
                                elif (instructions[i] == "bypass"):
                                    print_err("Adding bypass test condition...\n")
                                    bypass = 1
                                elif (instructions[i].startswith("var=")):
                                    pair = instructions[i].split("=")
                                    if (len(pair) != 2):
                                        print_err("Skipping " + instructions[i] + ", syntax must be key=value",color='red')
                                    else:
                                        print_err("Continuing with " + pair[0] + " = " + pair[1] + "\n")
                                        print_err("Adding variable test condition...\n")
                                        var_pair = pair[1].split("|")
                                        if (len(var_pair) != 2):
                                            print_err("Skipping " + instructions[i] + ", syntax must be name|value",color='red')
                                        else:
                                            varis[var_pair[0]] = var_pair[1]
                                elif (instructions[i].startswith("keycontains=")):
                                    pair = instructions[i].split("=")
                                    if (len(pair) != 2):
                                        print_err("Skipping " + instructions[i] + ", syntax must be key=value",color='red')
                                    else:
                                        print_err("Continuing with " + pair[0] + " = " + pair[1] + "\n")
                                        print_err("Adding keycontains test condition...\n")
                                        keycontains.append(pair[1])
                                elif (instructions[i].startswith("keyomits=")):
                                    pair = instructions[i].split("=")
                                    if (len(pair) != 2):
                                        print_err("Skipping " + instructions[i] + ", syntax must be key=value",color='red')
                                    else:
                                        print_err("Continuing with " + pair[0] + " = " + pair[1] + "\n")
                                        print_err("Adding keyomits test condition...\n")
                                        keyomits.append(pair[1])
                                elif (instructions[i] == "excludequery"):
                                    print_err("Adding excludequery test condition...\n")
                                    excludequery = 1
                                elif (instructions[i].startswith("headeris=")):
                                    pair = instructions[i].split("=")
                                    if (len(pair) != 2):
                                        print_err("Skipping " + instructions[i] + ", syntax must be key=value",color='red')
                                    else:
                                        print_err("Continuing with " + pair[0] + " = " + pair[1] + "\n")
                                        print_err("Adding headeris test condition...\n")
                                        header_pair = pair[1].split("|")
                                        if (len(header_pair) != 2):
                                            print_err("Skipping " + instructions[i] + ", syntax must be key|value",color='red')
                                        else:
                                            headeris[header_pair[0]] = header_pair[1]
                                elif (instructions[i].startswith("novarval=")):
                                    pair = instructions[i].split("=")
                                    if (len(pair) != 2):
                                        print_err("Skipping " + instructions[i] + ", syntax must be key=value",color='red')
                                    else:
                                        print_err("Continuing with " + pair[0] + " = " + pair[1] + "\n")
                                        print_err("Adding novarval test condition...\n")
                                        novarval.append(pair[1])
                                elif (instructions[i].startswith("novar=")):
                                    pair = instructions[i].split("=")
                                    if (len(pair) != 2):
                                        print_err("Skipping " + instructions[i] + ", syntax must be key=value",color='red')
                                    else:
                                        print_err("Continuing with " + pair[0] + " = " + pair[1] + "\n")
                                        print_err("Adding novar test condition...\n")
                                        novar.append(pair[1])
                                elif (instructions[i].startswith("noheader=")):
                                    pair = instructions[i].split("=")
                                    if (len(pair) != 2):
                                        print_err("Skipping " + instructions[i] + ", syntax must be key=value",color='red')
                                    else:
                                        print_err("Continuing with " + pair[0] + " = " + pair[1] + "\n")
                                        print_err("Adding noheader test condition...\n")
                                        noheader.append(pair[1])
                                elif (instructions[i].startswith("dolog=")):
                                    pair = instructions[i].split("=")
                                    if (len(pair) != 2):
                                        print_err("Skipping " + instructions[i] + ", syntax must be key=value",color='red')
                                    else:
                                        reject = None
                                        if (pair[1].startswith("cookies")):
                                            cookie_pair = pair[1].split("|")
                                            if (len(cookie_pair) != 2):
                                                print_err("Rejecting " + instructions[i] + ", syntax must be dolog=cookies|NAME")
                                                reject = 1
                                        if (reject == None):
                                            print_err("Continuing with " + pair[0] + " = " + pair[1] + "\n")
                                            print_err("Adding dolog test condition...\n")
                                            dolog.append(pair[1])
                                elif (instructions[i].startswith("nolog=")):
                                    pair = instructions[i].split("=")
                                    if (len(pair) != 2):
                                        print_err("Skipping " + instructions[i] + ", syntax must be key=value",color='red')
                                    else:
                                        print_err("Continuing with " + pair[0] + " = " + pair[1] + "\n")
                                        print_err("Adding nolog test condition...\n")
                                        nolog.append(pair[1])
                                elif (instructions[i].startswith("secpolicy=")):
                                    pair = instructions[i].split("=")
                                    if (len(pair) != 2):
                                        print_err("Skipping " + instructions[i] + ", syntax must be key=value",color='red')
                                    else:
                                        print_err("Continuing with " + pair[0] + " = " + pair[1] + "\n")
                                        print_err("Adding security policy name code test condition...\n")
                                        secpolicy = pair[1]
                                elif (instructions[i] == "notd"):
                                    print_err("Adding notd test condition...\n")
                                    notd = 1
                                else:
                                    print_err("Skipping unknown instruction: " + instructions[i] + "\n",color='red')

                            print_err("Tokens processed\n")
                            print_err("Generating test request: " + url + "\n")
                            #generate test requests
                            postarray = []

                            formatted_added_request_headers = ""
                            if (len(added_request_headers) >= 1):
                                position = 0
                                for header in added_request_headers:
                                    position = position + 1
                                    if (position > 1):
                                        formatted_added_request_headers = formatted_added_request_headers + ","
                                    formatted_added_request_headers = formatted_added_request_headers + f"""
                                        {{
                                            "headerName": "{header}",
                                            "headerValue": "{added_request_headers[header]}",
                                            "headerAction": "add"
                                        }}
                                    """

                            formatted_modified_request_headers = ""
                            if (len(modified_request_headers) >= 1):
                                position = 0
                                for header in modified_request_headers:
                                    position = position + 1
                                    if (position > 1):
                                        formatted_modified_request_headers = formatted_modified_request_headers + ","
                                    formatted_modified_request_headers = formatted_modified_request_headers + f"""
                                        {{
                                            "headerName": "{header}",
                                            "headerValue": "{modified_request_headers[header]}",
                                            "headerAction": "modify"
                                        }}
                                    """

                            if (formatted_added_request_headers != "" or formatted_modified_request_headers != ""):
                                formatted_added_request_headers = ""","requestHeaders": [""" + formatted_added_request_headers
                                formatted_modified_request_headers = formatted_modified_request_headers + """]"""

                            #FIXME this code is uglier than ugly
                            if ((formatted_added_request_headers != ""","requestHeaders": [""" and formatted_modified_request_headers != "]") and ((formatted_added_request_headers+formatted_modified_request_headers) != "")):
                                formatted_added_request_headers = formatted_added_request_headers + ","

                            postjson = f"""
                                {{
                                    "testRequestUrl": "{url}",
                                    "tags": [
                                        "goatc"
                                    ]
                                    {formatted_added_request_headers}
                                    {formatted_modified_request_headers}
                                }}
                            """

                            postarray.append(json.loads(postjson))
                            parameters = {'accountSwitchKey': get_api_client().current_switchkey
                                          }

                            json_data = get_api_client().httpCaller.postAcceptingJSON('/test-management/v2/functional/test-requests',
                                                                          parameters, postarray)
                            requestid = None
                            try:
                                requestid = str(json_data["failures"][0]["existingEntities"][0]["testRequestId"])
                                print_err("Request id success!\n")
                            except:
                                try:
                                    print_err(str(json_data["successes"][0]["testRequestId"]))
                                    requestid = str(json_data["successes"][0]["testRequestId"])
                                    print_err("Request id success!\n")
                                except:
                                    print_err("Failed to verify successfully created test id",color='red')
                            if (requestid != None):
                                print_err("Request id is " + requestid + "\n")
                                caseids = []

                                #status code condition and case
                                if (status != None):
                                    print_err("Generating status code test condition, status == " + status + "\n")
                                    pattern_RESPONSE_STATUS = "{\"conditionNodeId\": 1, \"values\": [\"response_code\"], \"conditionNode\": {\"conditionNodeId\": 2, \"values\": [\"is_one_of\"], \"conditionNode\": {\"conditionNodeId\": 3, \"values\": [" + status + "]}}}"
                                    postjson = f"{{ \"condition\": {pattern_RESPONSE_STATUS} }}"

                                    create_test_condition(profiles_data, caseids, requestid, postjson)

                                #cp code condition and case
                                if (cpcode != None):
                                    print_err("Generating cp code test condition, cpcode == " + cpcode + "\n")
                                    pattern_CPCODE = "{\"conditionNodeId\": 1, \"values\": [\"cp_code\"], \"conditionNode\": {\"conditionNodeId\": 23, \"values\": [\"is\"], \"conditionNode\": {\"conditionNodeId\": 9, \"values\": [" + cpcode + "]}}}"
                                    postjson = f"{{ \"condition\": {pattern_CPCODE} }}"

                                    create_test_condition(profiles_data, caseids, requestid, postjson)

                                #sureroute condition and case
                                if (sureroute != None):
                                    print_err("Generating sureroute test condition, sureroute is enabled\n")
                                    pattern_SUREROUTE = "{\"conditionNodeId\": 1, \"values\": [\"sure_route\"], \"conditionNode\": {\"conditionNodeId\": 14, \"values\": [\"is_enabled\"]}}"
                                    postjson = f"{{ \"condition\": {pattern_SUREROUTE} }}"

                                    create_test_condition(profiles_data, caseids, requestid, postjson)

                                #prefetch condition and case
                                if (prefetch != None):
                                    print_err("Generating prefetch test condition, prefetch is enabled\n")
                                    pattern_PREFETCH = "{\"conditionNodeId\": 1, \"values\": [\"prefetch_objects\"], \"conditionNode\": {\"conditionNodeId\": 20, \"values\": [\"is_triggered\"]}}"
                                    postjson = f"{{ \"condition\": {pattern_PREFETCH} }}"

                                    create_test_condition(profiles_data, caseids, requestid, postjson)

                                #redirect condition and case
                                if (redirect_status != None):
                                    decoded = redirect_location
                                    decoded = decoded.replace("%3D", "=")

                                    print_err("Generating redirect test condition, redirect_status == " + redirect_status + ", redirect_location == " + decoded + "\n")
                                    pattern_REDIRECT = "{\"conditionNodeId\": 1,\"values\": [\"redirect\"],\"conditionNode\": {\"conditionNodeId\": 2,\"values\": [\"is_one_of\"],\"conditionNode\": {\"conditionNodeId\": 13,\"values\": [" + redirect_status + "],\"conditionNode\": {\"conditionNodeId\": 18,\"values\": [\"location\"],\"conditionNode\": {\"conditionNodeId\": 23,\"values\": [\"is\" ],\"conditionNode\": {\"conditionNodeId\": 4,\"values\": [\"" + decoded + "\"], \"conditionNode\": null }}}}}}"
                                    postjson = f"{{ \"condition\": {pattern_REDIRECT} }}"

                                    create_test_condition(profiles_data, caseids, requestid, postjson)

                                #gzip condition and case
                                if (gzip != None):
                                    print_err("Generating gzip test condition, response is gzipped\n")
                                    pattern_GZIP = "{\"conditionNodeId\": 1, \"values\": [\"last_mile_acceleration\"], \"conditionNode\": {\"conditionNodeId\": 22, \"values\": [\"is_gzipped\"]}}"
                                    postjson = f"{{ \"condition\": {pattern_GZIP} }}"

                                    create_test_condition(profiles_data, caseids, requestid, postjson)

                                #nozip condition and case
                                if (nogzip != None):
                                    print_err("Generating nogzip test condition, response is not gzipped\n")
                                    pattern_GZIP = "{\"conditionNodeId\": 1, \"values\": [\"last_mile_acceleration\"], \"conditionNode\": {\"conditionNodeId\": 22, \"values\": [\"is_not_gzipped\"]}}"
                                    postjson = f"{{ \"condition\": {pattern_GZIP} }}"

                                    create_test_condition(profiles_data, caseids, requestid, postjson)

                                #cache condition and case
                                if (cache_duration != None):
                                    print_err("Generating cache test condition, cache_duration == " + cache_duration + ", cache_interval == " + cache_interval + "\n")
                                    pattern_CACHE = "{\"conditionNodeId\": 1, \"values\": [\"caching_option\"], \"conditionNode\": {\"conditionNodeId\": 23, \"values\": [\"is\"], \"conditionNode\": {\"conditionNodeId\": 10, \"values\": [\"cache\"], \"conditionNode\": {\"conditionNodeId\": 11, \"values\": [\"" + cache_interval + "\"], \"conditionNode\": {\"conditionNodeId\": 9, \"values\": [" + cache_duration + "]}}}}}"
                                    postjson = f"{{ \"condition\": {pattern_CACHE} }}"

                                    create_test_condition(profiles_data, caseids, requestid, postjson)

                                #nostore condition and case
                                if (nostore != None):
                                    print_err("Generating nostore test condition, cache is nostore\n")
                                    pattern_NO_STORE = "{\"conditionNodeId\": 1, \"values\": [\"caching_option\"], \"conditionNode\": {\"conditionNodeId\": 23, \"values\": [\"is\"], \"conditionNode\": {\"conditionNodeId\": 10, \"values\": [\"no-store\"]}}}"
                                    postjson = f"{{ \"condition\": {pattern_NO_STORE} }}"

                                    create_test_condition(profiles_data, caseids, requestid, postjson)

                                #bypass condition and case
                                if (bypass != None):
                                    print_err("Generating bypass test condition, cache is bypass\n")
                                    pattern_BYPASS = "{\"conditionNodeId\": 1, \"values\": [\"caching_option\"], \"conditionNode\": {\"conditionNodeId\": 23, \"values\": [\"is\"], \"conditionNode\": {\"conditionNodeId\": 10, \"values\": [\"bypass-cache\"]}}}"
                                    postjson = f"{{ \"condition\": {pattern_BYPASS} }}"

                                    create_test_condition(profiles_data, caseids, requestid, postjson)

                                #var condition and case
                                if (len(varis) > 0):
                                    for var in varis:

                                        decoded = varis[var]
                                        decoded = decoded.replace("%3D","=")
                                        print_err("Generating varis test conditions, var " + var + " == " + decoded + "\n")

                                        pattern_VAR = "{\"conditionNodeId\": 1, \"values\": [\"variable\"], \"conditionNode\": {\"conditionNodeId\": 4, \"values\": [\"" + var + "\"], \"conditionNode\": {\"conditionNodeId\": 5, \"values\": [\"has_a_value\"], \"conditionNode\": {\"conditionNodeId\": 7, \"values\": [\"equals\"], \"conditionNode\": {\"conditionNodeId\": 4, \"values\": [\"" + decoded + "\"]}}}}}"
                                        postjson = f"{{ \"condition\": {pattern_VAR} }}"

                                        create_test_condition(profiles_data, caseids, requestid, postjson)

                                #keycontains condition and case
                                if (len(keycontains) > 0):
                                    for ckey in keycontains:

                                        decoded = ckey
                                        decoded = decoded.replace("%3D", "=")

                                        print_err("Generating keycontains test condition, keycontains == " + ckey + "\n")
                                        pattern_KEYCONTAINS = "{\"conditionNodeId\": 1, \"values\": [\"response_header\"], \"conditionNode\": {\"conditionNodeId\": 4, \"values\": [\"X-Cache-Key\"], \"conditionNode\": {\"conditionNodeId\": 5, \"values\": [\"has_a_value\"], \"conditionNode\": {\"conditionNodeId\": 7, \"values\": [\"contains\"], \"conditionNode\": {\"conditionNodeId\": 4, \"values\": [\"" + decoded + "\"]}}}}}"
                                        postjson = f"{{ \"condition\": {pattern_KEYCONTAINS} }}"

                                        create_test_condition(profiles_data, caseids, requestid, postjson)

                                #keyomits condition and case
                                if (len(keyomits) > 0):
                                    for ckey in keyomits:

                                        decoded = ckey
                                        decoded = decoded.replace("%3D", "=")

                                        print_err("Generating keyomits test condition, keyomits == " + ckey + "\n")
                                        pattern_KEYOMITS = "{\"conditionNodeId\": 1, \"values\": [\"response_header\"], \"conditionNode\": {\"conditionNodeId\": 4, \"values\": [\"X-Cache-Key\"], \"conditionNode\": {\"conditionNodeId\": 5, \"values\": [\"has_a_value\"], \"conditionNode\": {\"conditionNodeId\": 7, \"values\": [\"does_not_contain\"], \"conditionNode\": {\"conditionNodeId\": 4, \"values\": [\"" + decoded + "\"]}}}}}"
                                        postjson = f"{{ \"condition\": {pattern_KEYOMITS} }}"

                                        create_test_condition(profiles_data, caseids, requestid, postjson)

                                #excludequery condition and case
                                if (excludequery != None):
                                    print_err("Generating excludequery test condition\n")
                                    pattern_EXCLUDEQUERY = "{\"conditionNodeId\": 1, \"values\": [\"cache_key_query_parameters\"], \"conditionNode\": {\"conditionNodeId\": 19, \"values\": [\"not_included\"]}}"
                                    postjson = f"{{ \"condition\": {pattern_EXCLUDEQUERY} }}"

                                    create_test_condition(profiles_data, caseids, requestid, postjson)

                                #headeris condition and case
                                if (len(headeris) > 0):
                                    for header in headeris:

                                        decoded = headeris[header]
                                        decoded = decoded.replace("%3D","=")

                                        print_err("Generating headeris test conditions, header " + header + " == " + decoded + "\n")
                                        pattern_KEYCONTAINS = "{\"conditionNodeId\": 1, \"values\": [\"response_header\"], \"conditionNode\": {\"conditionNodeId\": 4, \"values\": [\""+header+"\"], \"conditionNode\": {\"conditionNodeId\": 5, \"values\": [\"has_a_value\"], \"conditionNode\": {\"conditionNodeId\": 7, \"values\": [\"equals\"], \"conditionNode\": {\"conditionNodeId\": 4, \"values\": [\"" + decoded + "\"]}}}}}"
                                        postjson = f"{{ \"condition\": {pattern_KEYCONTAINS} }}"

                                        create_test_condition(profiles_data, caseids, requestid, postjson)

                                #novarval condition and case
                                if (len(novarval) > 0):
                                    for nvar in novarval:
                                        print_err("Generating novarval test condition, novarval == " + nvar + "\n")
                                        pattern_NOVARVAL = "{\"conditionNodeId\": 1, \"values\": [\"variable\"], \"conditionNode\": {\"conditionNodeId\": 4, \"values\": [\"" + nvar + "\"], \"conditionNode\": {\"conditionNodeId\": 5, \"values\": [\"has_no_value\"]}}}"
                                        postjson = f"{{ \"condition\": {pattern_NOVARVAL} }}"

                                        create_test_condition(profiles_data, caseids, requestid, postjson)

                                #novar condition and case
                                if (len(novar) > 0):
                                    for nvar in novar:
                                        print_err("Generating novar test condition, novarval == " + nvar + "\n")
                                        pattern_NOVAR = "{\"conditionNodeId\": 1, \"values\": [\"variable\"], \"conditionNode\": {\"conditionNodeId\": 4, \"values\": [\"" + nvar + "\"], \"conditionNode\": {\"conditionNodeId\": 5, \"values\": [\"does_not_exist\"]}}}"
                                        postjson = f"{{ \"condition\": {pattern_NOVAR} }}"

                                        create_test_condition(profiles_data, caseids, requestid, postjson)

                                #noheader condition and case
                                if (len(noheader) > 0):
                                    for nheader in noheader:
                                        print_err("Generating noheader test condition, noheader == " + nheader + "\n")
                                        pattern_NOHEADER = "{\"conditionNodeId\": 1, \"values\": [\"response_header\"], \"conditionNode\": {\"conditionNodeId\": 4, \"values\": [\"" + nheader + "\"], \"conditionNode\": {\"conditionNodeId\": 5, \"values\": [\"does_not_exist\"]}}}"
                                        postjson = f"{{ \"condition\": {pattern_NOHEADER} }}"

                                        create_test_condition(profiles_data, caseids, requestid, postjson)

                                #dolog condition and case
                                if (len(dolog) > 0):
                                    for log in dolog:
                                        print_err("Generating dolog test condition, dolog == " + log + "\n")

                                        if (log.startswith("cookies")):
                                            log_pair = log.split("|")
                                            pattern_DOLOG = "{\"conditionNodeId\": 1,\"values\": [\"log_request_details\"],\"conditionNode\": {\"conditionNodeId\": 15,\"values\": [\"cookies\"],\"conditionNode\": {\"conditionNodeId\": 24,\"values\": [\"logged\"],\"conditionNode\": {\"conditionNodeId\": 17,\"values\": [\""+log_pair[1]+"\"]}}}}"
                                            postjson = f"{{ \"condition\": {pattern_DOLOG} }}"
                                        else:
                                            pattern_DOLOG = "{\"conditionNodeId\": 1,\"values\": [\"log_request_details\"],\"conditionNode\": {\"conditionNodeId\": 15,\"values\": [\"" + log + "\"],\"conditionNode\": {\"conditionNodeId\": 16,\"values\": [\"is_logged\"]}}}"
                                            postjson = f"{{ \"condition\": {pattern_DOLOG} }}"

                                        create_test_condition(profiles_data, caseids, requestid, postjson)

                                #dolog condition and case
                                if (len(nolog) > 0):
                                    for log in nolog:
                                        print_err("Generating nolog test condition, nolog == " + log + "\n")
                                        if (log == "cookies"):
                                            pattern_NOLOG = "{\"conditionNodeId\": 1,\"values\": [\"log_request_details\"],\"conditionNode\": {\"conditionNodeId\": 15,\"values\": [\"" + log + "\"],\"conditionNode\": {\"conditionNodeId\": 24,\"values\": [\"not_logged\"]}}}"
                                        else:
                                            pattern_NOLOG = "{\"conditionNodeId\": 1,\"values\": [\"log_request_details\"],\"conditionNode\": {\"conditionNodeId\": 15,\"values\": [\"" + log + "\"],\"conditionNode\": {\"conditionNodeId\": 16,\"values\": [\"is_not_logged\"]}}}"
                                        postjson = f"{{ \"condition\": {pattern_NOLOG} }}"

                                        create_test_condition(profiles_data, caseids, requestid, postjson)

                                #sec policy condition and case
                                if (secpolicy != None):
                                    print_err("Generating secpolicy test condition, secpolicy == " + secpolicy + "\n")
                                    pattern_SECPOLICY = "{\"conditionNodeId\": 1, \"values\": [\"policy_name\"], \"conditionNode\": {\"conditionNodeId\": 23, \"values\": [\"is\"], \"conditionNode\": {\"conditionNodeId\": 4, \"values\": [\"" + secpolicy + "\"]}}}"
                                    postjson = f"{{ \"condition\": {pattern_SECPOLICY} }}"

                                    create_test_condition(profiles_data, caseids, requestid, postjson)

                                #notd condition and case
                                if (notd != None):
                                    print_err("Generating notd test condition, tiered dist is not enabled\n")
                                    pattern_NOTD = "{\"conditionNodeId\": 1, \"values\": [\"tiered_distribution\"], \"conditionNode\": {\"conditionNodeId\": 14, \"values\": [\"is_not_enabled\"]}}"
                                    postjson = f"{{ \"condition\": {pattern_NOTD} }}"

                                    create_test_condition(profiles_data, caseids, requestid, postjson)

                                #conditions and cases done
                                suiteids = []
                                for case in caseids:
                                    suiteids.append(case)
                                if (len(suiteids) > 0):
                                    parameters = {'accountSwitchKey': get_api_client().current_switchkey
                                                  }
                                    addcases = get_api_client().httpCaller.postAcceptingJSON(f'/test-management/v2/functional/test-suites/{newid}/associations/test-cases/associate',
                                                                                  parameters, suiteids)

                                    print_err("Results of test case association:\n")
                                    print_err(get_api_client().get_last_endpoint_result().json());
                                    time.sleep(.5)

                                else:
                                    print_err("No valid test cases found in script, none will be generated.")
                            else:
                                pprint.pprint(json_data)
            return testscripts

    print_err("No test scripts found, none executed.")
    return None

def docmd_LIST_GOATC_TEST_SUITES():
    reject_blank_switchkey()
    parameters = {'accountSwitchKey': get_api_client().current_switchkey}

    json_data = get_api_client().httpCaller.getJSONResult('/test-management/v2/functional/test-suites?includeRecentlyDeleted=false', parameters)
    listme = []
    if (get_api_client().get_last_response_code() == 200):
        for item in json_data:
            for key in item.keys():
                if (key == "testSuiteDescription"):
                    if (item[key] == 'This test suite was automatically generated by the goatc script.'):
                        listme.append(item)
        pprint.pprint(listme)
        return listme

    print_err("Could not retrieve list of test suites.\nStatus code: ")
    print_err(get_api_client().get_last_response_code())
    print_err("\nJSON response body:")
    print_err(get_api_client().get_last_endpoint_result().json());
    return json_data

def docmd_REMOVE_GOATC_TEST_SUITES():
    parameters = {'accountSwitchKey': get_api_client().current_switchkey}

    json_data = get_api_client().httpCaller.getJSONResult('/test-management/v2/functional/test-suites?includeRecentlyDeleted=false', parameters)
    listme = []
    if (get_api_client().get_last_response_code() == 200):
        for item in json_data:
            for key in item.keys():
                if (key == "testSuiteDescription"):
                    if (item[key] == 'This test suite was automatically generated by the goatc script.'):
                        listme.append(item)
        for item in listme:
            json_data = get_api_client().httpCaller.deleteAcceptingJSON(
                f'/test-management/v2/functional/test-suites/{item["testSuiteId"]}?deleteChildResources=false', parameters)
            pprint.pprint(json_data)
        return listme

    print_err("Could not retrieve list of test suites.\nStatus code: ")
    print_err(get_api_client().get_last_response_code())
    print_err("\nJSON response body:")
    print_err(get_api_client().get_last_endpoint_result().json());
    return json_data

def addargs_SHOW_GOATC_UI():
    get_input_args().parser.add_argument("--groupId", required=False, help="groupId", action="store", dest="groupid", default="")
    get_input_args().parser.add_argument("--contractId", required=False, help="contractId", action="store", dest="contractid", default="")
    get_input_args().parser.add_argument("--propertyId", required=False, help="propertyId", action="store", dest="propertyid", default="")
    get_input_args().parser.add_argument("--versionId", required=False, help="versionId", action="store", dest="versionid", default="")
    get_input_args().parser.add_argument("--testSuiteName", required=False, help="testSuiteName", action="store", dest="testsuitename", default="")

def docmd_SHOW_GOATC_UI():
    contractId = get_input_args().args.contractid
    groupId = get_input_args().args.groupid
    propertyId = get_input_args().args.propertyid
    versionId = get_input_args().args.versionid
    testSuiteName = get_input_args().args.testsuitename
    gui.showme()