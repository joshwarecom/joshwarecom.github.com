#standard imports
import sys, traceback, threading, time, urllib, os, requests, argparse, hashlib, pprint
from termcolor import colored
from akamai.edgegrid import EdgeGridAuth, EdgeRc
from configparser import ConfigParser
from urllib import parse

#global variables, NOT thread safe
do_snore = 0                            #toggles whether or not the app should being snoring audibly while idle
default_verbosity = 0                   #toggles detail level of debug messages
pristine_hashlib = hashlib.sha256()     #for checking the integrity of data and detecting updates
default_edgerc = os.path.expanduser('~/.edgerc')
default_section = os.path.expanduser('default')
api_client = None
input_args = None

#internal module error codes, use only negative integers
err_internal = [-1,"Internal error."]

def set_default_verbosity(v):
    '''Set to -1 for silence, 0 for minimal error messages, 1 for detailed messages; -2 is a special value, do not use it'''
    if v == -2:
        die(err_internal[0],'Never set verbosity to -2')
    global default_verbosity
    default_verbosity = v

def get_default_verbosity():
    '''Access the current verbosity value'''
    global default_verbosity
    return default_verbosity

def print_err(str, verbosity = -2, color='default'):
    '''Helper function prints to stderr if verbosity is >= 0 '''
    if verbosity == -2:
        verbosity = get_default_verbosity()
    if verbosity >= 0:
        if (color == 'default'):
            print (str, file=sys.stderr, end = '')
        else:
            print (colored(str,color), file=sys.stderr, end = '')
        sys.stderr.flush()

def pprint_err(obj, verbosity = -2, color='default'):
    print_err(pprint.pformat(obj),verbosity,color)

def die(error, msg, verbosity=-2):
    '''Throws exception with helpful error message and numeric exit code available to the shell.  If verbosity is 0, suppress the stack trace.  If verbosity < 0, print no information, only return exit code.'''
    if verbosity == -2:
        verbosity = get_default_verbosity()
    try:
        raise Exception(msg)
    except:
        exc_type, exc_value, exc_traceback = sys.exc_info()
        if verbosity == 0:
            traceback.print_exception(exc_type,exc_value,None,limit=0, file=sys.stderr)
        else:
            if verbosity > 0:
                traceback.print_exc(file=sys.stderr)
        sys.exit(error)

def start_snoring():
    '''Crude progress indicator for long operations so that the user knows the script isn't just hanging.'''
    global do_snore
    if do_snore == 0:
        do_snore = 1
        t = threading.Thread(target=keep_snoring)
        t.start()

def stop_snoring():
    '''Crude progress indicator for long operations so that the user knows the script isn't just hanging.'''
    global do_snore
    if do_snore == 1:
        do_snore = -1
        while do_snore == -1:
            time.sleep(1)

def keep_snoring():
    '''Crude progress indicator for long operations so that the user knows the script isn't just hanging.'''
    global do_snore
    while do_snore == 1:
        print_err(".",get_default_verbosity(),'yellow')
        time.sleep(1)
    if do_snore != 1:
        do_snore = 0

def is_snoring():
    '''Crude progress indicator for long operations so that the user knows the script isn't just hanging.'''
    global do_snore
    return do_snore

def cleanup():
    '''Snip any loose threads before exiting'''
    stop_snoring()

def seed_pristine_hashlib(seed):
    '''use this function once at the beginning of execution to consistently salt the hashes generated by this library'''
    pristine_hashlib.update(seed.encode())

def get_persistent_hex_digest(data):
    '''retrieve an md5 hash without modifying the hashlib that generated it'''
    sprout = pristine_hashlib.copy()
    sprout.update(data.encode())
    return sprout.hexdigest()

class SimpleEdgeGridHttpCaller:
    '''Minimal class for calling Akamai APIs'''

    def __init__(self, session, baseurl):
        self.session = session
        self.baseurl = baseurl
        return None

    def urlJoin(self, url, path):
        return parse.urljoin(url, path)

    def doGet(self, endpoint, parameters=None,headers=None):
        path = endpoint
        endpoint_result = None
        while endpoint_result == None:
            try:
                endpoint_result = self.session.get(parse.urljoin(self.baseurl, path), headers=headers, params=parameters)
            except:
                print_err("Exception while calling web service!  Pausing 5 seconds and trying again...",color="red")
                time.sleep(5)
                endpoint_result = None
        self.last_status_code = endpoint_result.status_code
        self.last_endpoint_result = endpoint_result
        return endpoint_result

    def getXMLResult(self, endpoint, parameters=None):
        headers = {'Accept': 'text/xml'}
        return self.doGet(endpoint, parameters, headers).text

    def getJSONResult(self, endpoint, parameters=None):
        headers = {'Accept': 'application/json'}
        return self.doGet(endpoint, parameters, headers).json()

    def doPost(self, endpoint, parameters=None,headers=None,payload=None):
        path = endpoint
        endpoint_result = None
        while endpoint_result == None:
            try:
                endpoint_result = self.session.post(parse.urljoin(self.baseurl, path), json=payload, headers=headers, params=parameters);
            except:
                print_err("Exception while calling web service!  Pausing 5 seconds and trying again...", color="red")
                time.sleep(5)
                endpoint_result = None
        self.last_status_code = endpoint_result.status_code
        self.last_endpoint_result = endpoint_result
        return endpoint_result

    def postAcceptingJSON(self, endpoint, parameters=None, payload=None):
        headers = {'Accept': 'application/json'}
        return self.doPost(endpoint, parameters, headers, payload).json()

    def doDelete(self, endpoint, parameters=None,headers=None,payload=None):
        path = endpoint
        endpoint_result = None
        while endpoint_result == None:
            try:
                endpoint_result = self.session.delete(parse.urljoin(self.baseurl, path), json=payload, headers=headers, params=parameters);
            except:
                print_err("Exception while calling web service!  Pausing 5 seconds and trying again...", color="red")
                time.sleep(5)
                endpoint_result = None
        self.last_status_code = endpoint_result.status_code
        self.last_endpoint_result = endpoint_result
        return endpoint_result

    def deleteAcceptingJSON(self, endpoint, parameters=None, payload=None):
        headers = {'Accept': 'application/json'}
        return self.doDelete(endpoint, parameters, headers, payload).json()

    def put(self, endpoint, parameters=None,headers=None,payload=None):
        path = endpoint

        endpoint_result = None
        while endpoint_result == None:
            try:
                endpoint_result = self.session.put(parse.urljoin(self.baseurl, path), data=payload, headers=headers, params=parameters);
            except:
                print_err("Exception while calling web service!  Pausing 5 seconds and trying again...", color="red")
                time.sleep(5)
                endpoint_result = None

        self.last_status_code = endpoint_result.status_code
        return endpoint_result

class ApiArguments:
    '''Simple class for handling script arguments'''

    def __init__(self, short_description, standard_arguments=True, autoparse=True):
        self.parser = argparse.ArgumentParser(description=short_description)
        if standard_arguments:
            # Override default section in .edgerc
            self.parser.add_argument("--section", required=False, help="override default .edgerc section", action="store", dest="section")
            self.parser.add_argument("--edgerc", required=False, help="override default .edgerc file path", action="store", dest="edgerc")

            self.debug_flags = self.parser.add_mutually_exclusive_group()
            self.debug_flags.add_argument("-D", "--debug", help="verbose error output", action="store_true", dest="debug")
            self.debug_flags.add_argument("-S", "--silent", help="suppress all error output", action="store_true", dest="silent")
            self.debug_flags.add_argument("-X", "--explain", help="provide a detailed explanation of the supplied 'cmd'", action="store_true", dest="explain")

            self.required_args = self.parser.add_argument_group('required arguments')

            self.switchkeyarg = self.required_args.add_argument("--switchKey", required=False, help="account switchkey", action="store", dest="switchkey", default="")

            if autoparse == True:
                self.parse_args()

    def parse_args(self):
            self.args, self.unknown = self.parser.parse_known_args()
            if self.args.debug:
                set_default_verbosity(1)
            if self.args.silent:
                set_default_verbosity(-1)
            self.section = default_section if not self.args.section else self.args.section
            self.edgerc = default_edgerc if not self.args.edgerc else self.args.edgerc
            self.switchkey = None if not self.args.switchkey else self.args.switchkey

            if self.section:
                if "\"" in self.section or "\n" in self.section or "\r" in self.section:
                    die(ERR_InternalError,"--section argument must not contain special characters.")

class SimpleEdgeGridConfig:
    '''Minimal class for HTTP API authentication'''

    def __init__(self, edgerc=default_edgerc, section=default_section ):

        arguments = {}

        config_file = edgerc

        if os.path.isfile(config_file):
            config = ConfigParser()
            config.read_file(open(config_file))
            if not config.has_section(section):
                err_msg = "ERROR: No section named %s was found in your %s file\n" % (section, config_file)
                die(err_internal[0], err_msg)
            for key, value in config.items(section):
                # ConfigParser lowercases magically
                if key not in arguments or arguments[key] == None:
                    arguments[key] = value
        else:
            err_msg = ".edgerc configuration file not found at path: " + config_file
            die(err_internal[0], err_msg)

        for option in arguments:
            setattr(self, option, arguments[option])

        self.create_base_url()

    def create_base_url(self):
        self.base_url = "https://%s" % self.host

class ApiClient:
    '''Simple class that loads credentials and calls web services'''

    def get_last_response_code(self):
        return self.httpCaller.last_status_code

    def get_last_endpoint_result(self):
        return self.httpCaller.last_endpoint_result

    def __init__(self, edgerc=os.path.expanduser('~/.edgerc'), section="default", switchkey=None):
        self.session = requests.Session()
        self.current_switchkey = None
        self.refresh(edgerc,section,switchkey)

    def update_parameters(self,switchkey=None):
        if switchkey != None:
            self.current_switchkey = switchkey

    def refresh(self, edgerc=os.path.expanduser('~/.edgerc'), section="default", switchkey=None):
        self.current_edgerc = edgerc
        self.current_section = section
        self.config = SimpleEdgeGridConfig(edgerc=self.current_edgerc,section=self.current_section)
        self.session.auth = EdgeGridAuth(client_token=self.config.client_token, client_secret=self.config.client_secret,
                                access_token=self.config.access_token)
        self.baseurl = '%s://%s/' % ('https', self.config.host)
        self.httpCaller = SimpleEdgeGridHttpCaller(self.session, self.baseurl)
        self.update_parameters(switchkey=switchkey)

def set_api_client(c):
    global api_client
    api_client = c

def get_api_client():
    global api_client
    return api_client

def set_input_args(a):
    global input_args
    input_args = a

def get_input_args():
    global input_args
    return input_args
