import util, wx, time, threading, pprint, os, urllib
from util import get_api_client, get_input_args, print_err, pprint_err
from subprocess import Popen, PIPE

goatc_buttons = []
property_dialog = None
listbox_groupid = None
label_groupid = None
label_populatedgroupid = None
listbox_populatedgroupid_locked = False
listbox_propertyid = None
label_populatedpropertyid = None
listbox_populatedpropertyid_locked = False


class SelectPropertyDialog(wx.Dialog):
    def go(self, flag):
        if (flag == False):
            self.Close()
        else:
            wx.MessageBox("Wait for the current operation to complete before continuing.")

    def __init__(self):
        wx.Dialog.__init__(self, None, title="Select Other Property",style=(~wx.CLOSE_BOX))
        self.SetSize(size=(400,400))
        other_hidden_label = wx.StaticText(self, label="", pos=(0, 0))
        other_hidden_label.Hide()
        groupbtn = wx.Button(self, label="Get Group IDs", pos=(275,10))
        groupbtn.Bind(wx.EVT_BUTTON, populate_group_id_nonblocking)

        global txtctrl_switchkey
        label_currentkey = wx.StaticText(self, label="Current Switch Key: " + txtctrl_switchkey.GetValue(), pos=(10, 10))
        global label_populatedgroupid
        label_populatedgroupid = wx.StaticText(self, label="", pos=(10, 16))
        global listbox_populatedgroupid_locked

        label_getproperties = wx.StaticText(self, label="Property ID List:", pos=(10, 185))
        global label_populatedpropertyid
        label_populatedpropertyid = wx.StaticText(self, label="...", pos=(10, 190))
        global listbox_populatedpropertyid_locked
        propertybtn = wx.Button(self, label="Get Property IDs", pos=(265,185))
        global listbox_propertyid
        listbox_propertyid = wx.ListBox(self, pos=(10, 205), size=(375,150))
        propertybtn.Bind(wx.EVT_BUTTON, populate_property_id_nonblocking)

        gobtn = wx.Button(self, label="Go!", pos=(300,355))
        gobtn.Bind(wx.EVT_BUTTON, lambda event: self.go(listbox_populatedgroupid_locked))
        global property_dialog
        property_dialog = self
        global listbox_groupid
        listbox_groupid = wx.ListBox(self, pos=(10, 31), size=(375,150))


        window.Bind(wx.EVT_TIMER, lambda evt, temp=other_hidden_label: update_continuously(evt, temp))

def select_other_property(e):
    global txtctrl_switchkey
    if (txtctrl_switchkey.GetValue() == ""):
        wx.MessageBox("You must enter a switch key to select a property.")
    else:
        dlg = SelectPropertyDialog()
        dlg.ShowModal()
        window.Unbind(wx.EVT_TIMER)
        dlg.Destroy()
        return False

def reset_form(e):
    global button_test_pragmas
    button_test_pragmas.SetValue(False)
    for button in goatc_buttons:
        button.reset()

class GoatcButton(wx.Button):
    toggled = False
    default_label = ""
    default_prefix = ""

    def reset(self):
        self.SetLabel(self.default_label)
        self.toggled = False
        self.SetOwnForegroundColour(wx.BLACK)

    def toggle_binary_test_condition(self,e):
        if (self.toggled):
            self.reset()
        else:
            self.SetLabel(self.default_prefix)
            self.SetOwnForegroundColour(wx.GREEN)
            self.toggled = True

    def toggle_integral_test_condition(self,e):
        if (self.toggled):
            self.toggled = False
            self.SetLabel(self.default_label)
            self.SetOwnForegroundColour(wx.BLACK)
        else:
            dialog = wx.TextEntryDialog(self, "Enter integer value",
                                        "Test Condition", "", wx.OK | wx.CANCEL)
            if dialog.ShowModal() == wx.ID_OK:
                try:
                    number = int(dialog.GetValue())
                    self.SetOwnForegroundColour(wx.GREEN)
                    self.toggled = True
                    self.SetLabel(self.default_prefix+"=" + dialog.GetValue())
                except:
                    wx.MessageBox("Invalid value, only integers allowed.", "Error")
            dialog.Destroy()

    def toggle_int_comma_string_condition(self,e):
        if (self.toggled):
            self.toggled = False
            self.SetLabel(self.default_label)
            self.SetOwnForegroundColour(wx.BLACK)
        else:
            dialog = wx.TextEntryDialog(self, "Enter INT,STRING (an integer, followed by a comma, and then thext)",
                                        "Test Condition", "", wx.OK | wx.CANCEL)
            if dialog.ShowModal() == wx.ID_OK:
                try:
                    str = dialog.GetValue()
                    contents = str.split(",")
                    number = int(contents[0])
                    text = contents[1]
                    self.SetOwnForegroundColour(wx.GREEN)
                    self.toggled = True
                    self.SetLabel(self.default_prefix+"=" + contents[0] + "," + text)
                except:
                    wx.MessageBox("Invalid value, only integers allowed.", "Error")
            dialog.Destroy()

    def toggle_integral_y_or_n_condition(self,e):
        if (self.toggled):
            self.toggled = False
            self.SetLabel(self.default_label)
            self.SetOwnForegroundColour(wx.BLACK)
        else:
            dialog = wx.TextEntryDialog(self, "Enter Y or N",
                                        "Test Condition", "", wx.OK | wx.CANCEL)
            if dialog.ShowModal() == wx.ID_OK:
                txt = (dialog.GetValue()).upper()
                if (txt == "Y" or txt == "N"):
                    self.SetOwnForegroundColour(wx.GREEN)
                    self.toggled = True
                    self.SetLabel(self.default_prefix+"=" + txt)
                else:
                    wx.MessageBox("Invalid value, only Y or N allowed.", "Error")
            dialog.Destroy()

    def toggle_string_condition(self,e):
        if (self.toggled):
            self.toggled = False
            self.SetLabel(self.default_label)
            self.SetOwnForegroundColour(wx.BLACK)
        else:
            dialog = wx.TextEntryDialog(self, "Enter text string",
                                        "Test Condition", "", wx.OK | wx.CANCEL)
            if dialog.ShowModal() == wx.ID_OK:
                txt = dialog.GetValue()
                self.SetOwnForegroundColour(wx.GREEN)
                self.toggled = True
                self.SetLabel(self.default_prefix+"=" + txt)
            dialog.Destroy()

    def __init__(self, panel, label, pos, size, default_bind = True):
        super().__init__(panel, label=label, pos=pos, size=size)
        self.default_label = self.GetLabel()
        self.default_prefix = self.default_label.split("=")[0]
        self.SetOwnForegroundColour(wx.BLACK)
        goatc_buttons.append(self)
        if (default_bind == True):
            self.Bind(wx.EVT_BUTTON, lambda event: self.toggle_binary_test_condition(event))
        elif (default_bind == "Integer"):
            self.Bind(wx.EVT_BUTTON, lambda event: self.toggle_integral_test_condition(event))
        elif (default_bind == "Integer,String"):
            self.Bind(wx.EVT_BUTTON, lambda event: self.toggle_int_comma_string_condition(event))
        elif (default_bind == "YorN"):
            self.Bind(wx.EVT_BUTTON, lambda event: self.toggle_integral_y_or_n_condition(event))
        elif (default_bind == "String"):
            self.Bind(wx.EVT_BUTTON, lambda event: self.toggle_string_condition(event))

snoring_threads = {}
window = None

hidden_label = None
label_populatedaccountname = None
label_populatedaccountname_locked = False
txtctrl_switchkey = None
txtctrl_contractid = None
combo_contractid = None
label_populatedcontractid = None
combo_populatedcontractid_locked = False
txtctrl_groupid = None
label_groupid = None
label_populatedgroupid = None
combo_populatedgroupid_locked = False
button_test_pragmas = None

def update_continuously(evt, l):
    if (l != None):
        p = l.GetPosition()
        p.x = p.x + 1
        p.y = p.y + 1
        if (p.y > 10):
            p.x = 0
            p.y = 0
        l.SetPosition((p.x,p.y))
        return None;

def snore_continuously(l):
    l.SetLabel("")
    while l in snoring_threads:
        try:
            x = l.GetLabel()
            x = "." + x
            if (x == "..........."):
                x = ""
            l.SetLabel(x)
            time.sleep(.5)
        except:
            time.sleep(.5)

def populate_property_id_nonblocking(arg=None):
    global listbox_groupid
    global listbox_propertyid
    listbox_propertyid.Hide()
    listbox_propertyid.Show()
    if (listbox_groupid.GetSelection() == wx.NOT_FOUND):
        wx.MessageBox("You must select a group id first.")
        return None
    t = threading.Thread(target=populate_property_id)
    t.start()

def populate_property_id():
    global property_dialog
    global listbox_propertyid
    global listbox_populatedpropertyid_locked
    global label_populatedpropertyid

    str = (listbox_groupid.GetString(listbox_groupid.GetSelection()))
    strlist = str.split("\t")
    if (len(strlist) < 3):
        wx.MessageBox("ERROR! Invalid selection.")
        return None

    selectgroup = None
    contractlist = []
    count = 0
    for ctr in strlist:
        count = count + 1
        if (count == 1):
            selectgroup = ctr
        if (count >= 3):
            contractlist.append(ctr)
    pprint.pprint(contractlist)

    if (listbox_populatedpropertyid_locked == True):
       return False

    listbox_populatedpropertyid_locked = True
    listbox_propertyid.Disable()

    t = None
    if (label_populatedpropertyid in snoring_threads):
       snoring_threads.pop(label_populatedpropertyid)
       t.join()

    t = threading.Thread(target=snore_continuously, args=[label_populatedpropertyid])
    snoring_threads[label_populatedpropertyid] = t
    t.start()

    file_path = os.path.realpath('goatc.py')
    full_output = "\n"

    for ctr in contractlist:
        cmd = file_path + " --cmd ACCOUNT_PROPERTIES --switchKey " + txtctrl_switchkey.GetValue() + " --groupId " + selectgroup + " --contractId " + ctr
        p = Popen(cmd, stdout=PIPE, stderr=PIPE, shell=True)
        stdout, stderr = p.communicate()
        full_output = full_output + stdout.decode("utf-8") + "\n"

    snoring_threads.pop(label_populatedpropertyid)
    t.join()

    listbox_propertyid.Hide()
    listbox_propertyid.Show()
    count = 0
    try:
       if (stderr.decode("utf-8") != ""):
           label_populatedpropertyid.SetLabel("")
           listbox_propertyid.Clear()
           listbox_propertyid.Disable()
           wx.MessageBox(stderr.decode("utf-8"),"An Error Occurred");
       else:
           listbox_propertyid.Clear()
           groups = full_output.split("\n")
           for group in groups:
               if (group != ""):
                   count = count + 1
                   listbox_propertyid.Append((group.replace("|","\t")))
                   listbox_propertyid.Enable()
    finally:
        listbox_populatedpropertyid_locked = False
        label_populatedpropertyid.SetLabel("")

    return True

def populate_group_id_nonblocking(arg=None):
    global listbox_groupid
    listbox_groupid.Hide()
    listbox_groupid.Show()
    t = threading.Thread(target=populate_group_id)
    t.start()

def populate_group_id():
    global property_dialog
    global listbox_groupid
    global listbox_populatedgroupid_locked

    if (listbox_populatedgroupid_locked == True):
        return False

    listbox_populatedgroupid_locked = True
    listbox_groupid.Disable()

    t = None
    if (label_populatedgroupid in snoring_threads):
        snoring_threads.pop(label_populatedgroupid)
        t.join()

    t = threading.Thread(target=snore_continuously, args=[label_populatedgroupid])
    snoring_threads[label_populatedgroupid] = t
    t.start()

    file_path = os.path.realpath('goatc.py')
    cmd = file_path + " --cmd ACCOUNT_GROUPS --switchKey " + txtctrl_switchkey.GetValue();

    p = Popen(cmd, stdout=PIPE, stderr=PIPE, shell=True)
    stdout, stderr = p.communicate()

    snoring_threads.pop(label_populatedgroupid)
    t.join()

    listbox_groupid.Hide()
    listbox_groupid.Show()
    count = 0
    try:
        if (stderr.decode("utf-8") != ""):
            label_populatedgroupid.SetLabel("")
            listbox_groupid.Clear()
            listbox_groupid.Disable()
            wx.MessageBox(stderr.decode("utf-8"),"An Error Occurred");
        else:
            listbox_groupid.Clear()
            groups = stdout.decode("utf-8").split("\n")
            for group in groups:
                if (group != ""):
                    count = count + 1
                    listbox_groupid.Append(urllib.parse.unquote(group.replace("|","\t")))
                    listbox_groupid.Enable()
    finally:
        listbox_populatedgroupid_locked = False
        label_populatedgroupid.SetLabel("")

    return True

def populate_contract_id_nonblocking(arg=None):
    global txtctrl_contractid
    global combo_contractid
    txtctrl_contractid.Hide()
    txtctrl_contractid.Show()
    combo_contractid.Hide()
    combo_contractid.Show()
    t = threading.Thread(target=populate_contract_id)
    t.start()

def populate_contract_id():
    global window
    global combo_contractid
    global combo_populatedcontractid_locked
    if (combo_populatedcontractid_locked == True):
        return False

    combo_populatedcontractid_locked = True
    combo_contractid.Disable()

    t = None
    if (label_populatedcontractid in snoring_threads):
        snoring_threads.pop(label_populatedcontractid)
        t.join()

    t = threading.Thread(target=snore_continuously, args=[label_populatedcontractid])
    snoring_threads[label_populatedcontractid] = t
    t.start()

    file_path = os.path.realpath('goatc.py')
    cmd = file_path + " --cmd ACCOUNT_CONTRACTS --switchKey " + txtctrl_switchkey.GetValue();

    p = Popen(cmd, stdout=PIPE, stderr=PIPE, shell=True)
    stdout, stderr = p.communicate()

    snoring_threads.pop(label_populatedcontractid)
    t.join()

    combo_contractid.Hide()
    combo_contractid.Show()

    try:
        if (stderr.decode("utf-8") != ""):
            label_populatedcontractid.SetLabel("")
            combo_contractid.Clear()
            combo_contractid.Disable()
            wx.MessageBox(stderr.decode("utf-8"),"An Error Occurred");
        else:
            combo_contractid.Clear()
            combo_contractid.Disable()
            contracts = stdout.decode("utf-8").split("\n")
            for contract in contracts:
                if (contract != ""):
                    combo_contractid.Append(contract)
                    combo_contractid.Enable()
            try:
                combo_contractid.SetSelection(0)
            finally:
                label_populatedcontractid.SetLabel("")
    finally:
        combo_populatedcontractid_locked = False
    return True


def populate_account_name_nonblocking(arg=None):
    global txtctrl_switchkey
    txtctrl_switchkey.Hide()
    txtctrl_switchkey.Show()
    t = threading.Thread(target=populate_account_name)
    t.start()

def populate_account_name():
    global window
    global label_populatedaccountname
    global label_populatedaccountname_locked
    if (label_populatedaccountname_locked == True):
        return False

    label_populatedaccountname_locked = True
    t = None
    if (label_populatedaccountname in snoring_threads):
        snoring_threads.pop(label_populatedaccountname)
        t.join()

    t = threading.Thread(target=snore_continuously, args=[label_populatedaccountname])
    snoring_threads[label_populatedaccountname] = t
    t.start()

    file_path = os.path.realpath('goatc.py')
    cmd = file_path + " --cmd ACCOUNT_NAME --switchKey " + txtctrl_switchkey.GetValue();

    p = Popen(cmd, stdout=PIPE, stderr=PIPE, shell=True)
    stdout, stderr = p.communicate()

    snoring_threads.pop(label_populatedaccountname)
    t.join()

    if (stderr.decode("utf-8") != ""):
        label_populatedaccountname.SetLabel("")
        wx.MessageBox(stderr.decode("utf-8"),"An Error Occurred");
    else:
        label_populatedaccountname.SetLabel(stdout.decode("utf-8"))
    label_populatedaccountname_locked = False
    return True

def showme():
    contractId = get_input_args().args.contractid
    if (contractId == None):
        contractId = ""
    groupId = get_input_args().args.groupid
    if (groupId == None):
        groupId = ""
    propertyId = get_input_args().args.propertyid
    if (propertyId == None):
        propertyId = ""
    versionId = get_input_args().args.versionid
    if (versionId == None):
        versionId = ""

    app = wx.App()

    global window
    window = wx.Frame(None, title="GOATC UI", size=(650, 475), pos=(50,50))
    panel = wx.Panel(window)

    global hidden_label
    hidden_label = wx.StaticText(panel, label="", pos=(0, 0))
    hidden_label.Hide()

    window.timer = wx.Timer(window)
    window.timer.Start(100)
    #window.Bind(wx.EVT_TIMER, lambda evt, temp = hidden_label: update_continuously(evt, temp))

    #button_accountname = wx.Button(panel, label="Account Name               ", pos=(125, 10), size=(105,20), style=wx.BU_LEFT)
    #button_accountname.Bind(wx.EVT_BUTTON, populate_account_name_nonblocking)
    global txtctrl_switchkey
    current_key = get_api_client().current_switchkey
    if current_key == None:
        current_key = ""
    txtctrl_switchkey = wx.TextCtrl(panel, value=current_key, pos=(10, 30))
    label_switchkey = wx.StaticText(panel, label="Switch Key", pos=(10, 10))
    #global label_populatedaccountname
    #label_populatedaccountname = wx.StaticText(panel, label="* click [Account Name]", pos=(125, 30))

    label_contractid = wx.StaticText(panel, label="Contract Id", pos=(10, 60))
    #button_contractid = wx.Button(panel, label="Contract Id List              ", pos=(125, 60), size=(130,20), style=wx.BU_LEFT)
    #button_contractid.Bind(wx.EVT_BUTTON, populate_contract_id_nonblocking)
    global txtctrl_contractid
    txtctrl_contractid = wx.TextCtrl(panel, value=contractId, pos=(10, 80))
    #global combo_contractid
    #combo_contractid = wx.ComboBox(panel, 1, style=wx.CB_DROPDOWN | wx.CB_READONLY, size=(125,25), pos=(125,79))
    #combo_contractid.Append("* click [Contract Id List]")
    #combo_contractid.SetSelection(0)
    #combo_contractid.Disable()
    #global label_populatedcontractid
    #label_populatedcontractid = wx.StaticText(panel, label="", pos=(125, 92))

    global label_groupid
    label_groupid = wx.StaticText(panel, label="Group Id", pos=(10, 110))
    global txtctrl_groupid
    txtctrl_groupid = wx.TextCtrl(panel, value=groupId, pos=(10, 130))
    #button_groupid = wx.Button(panel, label="Group Id List              ", pos=(125, 110), size=(130,20), style=wx.BU_LEFT)
    #button_groupid.Bind(wx.EVT_BUTTON, populate_group_id_nonblocking)
    #global combo_groupid
    #combo_groupid = wx.ComboBox(panel, 1, style=wx.CB_DROPDOWN | wx.CB_READONLY, size=(125,25), pos=(125,129))
    #combo_groupid.Append("* click [Group Id List]")
    #combo_groupid.SetSelection(0)
    #combo_groupid.Disable()
    #global label_populatedgroupid
    #label_populatedgroupid = wx.StaticText(panel, label="", pos=(125, 142))

    label_propertyid = wx.StaticText(panel, label="Property Id", pos=(10, 160))
    txtctrl_propertyid = wx.TextCtrl(panel, value=propertyId, pos=(10, 180))

    label_propertyid = wx.StaticText(panel, label="Version Id", pos=(10, 210))
    txtctrl_propertyid = wx.TextCtrl(panel, value=versionId, pos=(10, 230))

    button_propertyselector = wx.Button(panel, label="Select Other\nProperty", pos=(10, 260), size=(105,40))
    button_propertyselector.SetFont(wx.Font(10, wx.FONTFAMILY_DEFAULT, wx.FONTSTYLE_NORMAL, wx.FONTWEIGHT_NORMAL))
    button_propertyselector.Bind(wx.EVT_BUTTON, select_other_property)

    button_propertyselector = wx.Button(panel, label="Use This\nProperty", pos=(10, 300), size=(105,40))
    button_propertyselector.SetFont(wx.Font(10, wx.FONTFAMILY_DEFAULT, wx.FONTSTYLE_NORMAL, wx.FONTWEIGHT_NORMAL))

    button_accountinfo = wx.Button(panel, label="Show Helpful\nInformation", pos=(10, 340), size=(105,40))
    button_accountinfo.SetFont(wx.Font(10, wx.FONTFAMILY_DEFAULT, wx.FONTSTYLE_NORMAL, wx.FONTWEIGHT_NORMAL))

    label_cfgfile = wx.StaticText(panel, label="Configuration file:", pos=(130, 10))
    label_cfgfilevalue = wx.StaticText(panel, label="[click Use This Property]", pos=(240, 10))

    label_vars = wx.StaticText(panel, label="Vars:", pos=(130, 264+10))
    list_vars = wx.ListBox(panel, 1, style=wx.LB_MULTIPLE, size=(225,60), pos=(130,280+10))
    button_equalsvar = wx.Button(panel, label="Equals", pos=(165, 21+10), size=(48,500))
    button_equalsvar = wx.Button(panel, label="Equals", pos=(165, 21+10), size=(48,500))
    button_equalsvar.SetFont(wx.Font(10, wx.FONTFAMILY_DEFAULT, wx.FONTSTYLE_NORMAL, wx.FONTWEIGHT_NORMAL))
    button_novar = wx.Button(panel, label="NoVAR", pos=(213, 21+10), size=(48,500))
    button_novar.SetFont(wx.Font(10, wx.FONTFAMILY_DEFAULT, wx.FONTSTYLE_NORMAL, wx.FONTWEIGHT_NORMAL))
    button_noval = wx.Button(panel, label="NoVAL", pos=(261, 21+10), size=(48,500))
    button_noval.SetFont(wx.Font(10, wx.FONTFAMILY_DEFAULT, wx.FONTSTYLE_NORMAL, wx.FONTWEIGHT_NORMAL))
    button_delvar = wx.Button(panel, label="D", pos=(308, 21+10), size=(25,500))
    button_delvar.SetFont(wx.Font(10, wx.FONTFAMILY_DEFAULT, wx.FONTSTYLE_NORMAL, wx.FONTWEIGHT_NORMAL))
    button_clrvar = wx.Button(panel, label="C", pos=(332, 21+10), size=(23,500))
    button_clrvar.SetFont(wx.Font(10, wx.FONTFAMILY_DEFAULT, wx.FONTSTYLE_NORMAL, wx.FONTWEIGHT_NORMAL))


    label_rsphdrs = wx.StaticText(panel, label="Rsp hdrs:", pos=(360, 264+10))
    list_rsphdrs = wx.ListBox(panel, 1, style=wx.LB_MULTIPLE, size=(230,60), pos=(360,280+10))
    button_addrsphdr = wx.Button(panel, label="Add", pos=(420, 21+10), size=(40,500))
    button_addrsphdr.SetFont(wx.Font(10, wx.FONTFAMILY_DEFAULT, wx.FONTSTYLE_NORMAL, wx.FONTWEIGHT_NORMAL))
    button_missrsphdr = wx.Button(panel, label="Miss", pos=(460, 21+10), size=(40,500))
    button_missrsphdr.SetFont(wx.Font(10, wx.FONTFAMILY_DEFAULT, wx.FONTSTYLE_NORMAL, wx.FONTWEIGHT_NORMAL))
    button_delrsphdr = wx.Button(panel, label="Del", pos=(500, 21+10), size=(40,500))
    button_delrsphdr.SetFont(wx.Font(10, wx.FONTFAMILY_DEFAULT, wx.FONTSTYLE_NORMAL, wx.FONTWEIGHT_NORMAL))
    button_clearrsphdr = wx.Button(panel, label="Clear", pos=(540, 21+10), size=(50,500))
    button_clearrsphdr.SetFont(wx.Font(10, wx.FONTFAMILY_DEFAULT, wx.FONTSTYLE_NORMAL, wx.FONTWEIGHT_NORMAL))

    label_hostnames = wx.StaticText(panel, label="Hostnames:", pos=(130, 32))
    label_populatedhostnames = wx.StaticText(panel, label="...", pos=(130, 37))
    list_hostnames = wx.ListBox(panel, 1, style=wx.LB_MULTIPLE, size=(225,75), pos=(130,53))
    button_hostnames = wx.Button(panel, label="Unselect All", pos=(210, 21), size=(145,40))
    button_hostnames.SetFont(wx.Font(10, wx.FONTFAMILY_DEFAULT, wx.FONTSTYLE_NORMAL, wx.FONTWEIGHT_NORMAL))

    label_hostnames = wx.StaticText(panel, label="Req hdrs:", pos=(360, 32))
    #label_populatedheaders = wx.StaticText(panel, label="...", pos=(360, 37))
    list_headers = wx.ListBox(panel, 1, style=wx.LB_MULTIPLE, size=(230,75), pos=(360,53))
    button_addheader = wx.Button(panel, label="Add", pos=(420, 21), size=(40,40))
    button_addheader.SetFont(wx.Font(10, wx.FONTFAMILY_DEFAULT, wx.FONTSTYLE_NORMAL, wx.FONTWEIGHT_NORMAL))
    button_modheader = wx.Button(panel, label="Mod", pos=(460, 21), size=(40,40))
    button_modheader.SetFont(wx.Font(10, wx.FONTFAMILY_DEFAULT, wx.FONTSTYLE_NORMAL, wx.FONTWEIGHT_NORMAL))
    button_delheader = wx.Button(panel, label="Del", pos=(500, 21), size=(40,40))
    button_delheader.SetFont(wx.Font(10, wx.FONTFAMILY_DEFAULT, wx.FONTSTYLE_NORMAL, wx.FONTWEIGHT_NORMAL))
    button_clearheader = wx.Button(panel, label="Clear", pos=(540, 21), size=(50,40))
    button_clearheader.SetFont(wx.Font(10, wx.FONTFAMILY_DEFAULT, wx.FONTSTYLE_NORMAL, wx.FONTWEIGHT_NORMAL))

    button_test_status = GoatcButton(panel, label="STATUS=___", pos=(130, 120), size=(80, 40), default_bind="Integer")
    button_test_status.SetFont(wx.Font(10, wx.FONTFAMILY_DEFAULT, wx.FONTSTYLE_NORMAL, wx.FONTWEIGHT_NORMAL))

    button_test_cpcode = GoatcButton(panel, label="CPCODE=__________", pos=(210, 120), size=(120, 40), default_bind="Integer")
    button_test_cpcode.SetFont(wx.Font(10, wx.FONTFAMILY_DEFAULT, wx.FONTSTYLE_NORMAL, wx.FONTWEIGHT_NORMAL))

    button_test_sureroute = GoatcButton(panel, label="SUREROUTE", pos=(330, 120), size=(80, 40))
    button_test_sureroute.SetFont(wx.Font(10, wx.FONTFAMILY_DEFAULT, wx.FONTSTYLE_NORMAL, wx.FONTWEIGHT_NORMAL))

    button_test_sureroute = GoatcButton(panel, label="PREFETCH", pos=(410, 120), size=(80, 40))
    button_test_sureroute.SetFont(wx.Font(10, wx.FONTFAMILY_DEFAULT, wx.FONTSTYLE_NORMAL, wx.FONTWEIGHT_NORMAL))

    button_test_gzip = GoatcButton(panel, label="GZIP", pos=(490, 120), size=(40, 40))
    button_test_gzip.SetFont(wx.Font(10, wx.FONTFAMILY_DEFAULT, wx.FONTSTYLE_NORMAL, wx.FONTWEIGHT_NORMAL))

    button_test_nostore = GoatcButton(panel, label="NOSTOR", pos=(530, 120), size=(60, 40))
    button_test_nostore.SetFont(wx.Font(10, wx.FONTFAMILY_DEFAULT, wx.FONTSTYLE_NORMAL, wx.FONTWEIGHT_NORMAL))

    button_test_redirect = GoatcButton(panel, label="REDIRECT=___,_________________________________________________________", pos=(130, 142), size=(360, 40),default_bind="Integer,String")
    button_test_redirect.SetFont(wx.Font(10, wx.FONTFAMILY_DEFAULT, wx.FONTSTYLE_NORMAL, wx.FONTWEIGHT_NORMAL))

    button_test_cache = GoatcButton(panel, label="CACHE=__,______", pos=(490, 142), size=(100, 40),default_bind="Integer,String")
    button_test_cache.SetFont(wx.Font(10, wx.FONTFAMILY_DEFAULT, wx.FONTSTYLE_NORMAL, wx.FONTWEIGHT_NORMAL))

    button_test_bypass = GoatcButton(panel, label="BYPASS", pos=(130, 164), size=(60, 40))
    button_test_bypass.SetFont(wx.Font(10, wx.FONTFAMILY_DEFAULT, wx.FONTSTYLE_NORMAL, wx.FONTWEIGHT_NORMAL))

    button_test_exclude = GoatcButton(panel, label="EXCLUDEPARAMS", pos=(190, 164), size=(100, 40))
    button_test_exclude.SetFont(wx.Font(10, wx.FONTFAMILY_DEFAULT, wx.FONTSTYLE_NORMAL, wx.FONTWEIGHT_NORMAL))

    button_test_logrefer = GoatcButton(panel, label="LOGREFER=_", pos=(290, 164), size=(80, 40),default_bind="YorN")
    button_test_logrefer.SetFont(wx.Font(10, wx.FONTFAMILY_DEFAULT, wx.FONTSTYLE_NORMAL, wx.FONTWEIGHT_NORMAL))

    button_test_loghost = GoatcButton(panel, label="LOGHOST=_", pos=(370, 164), size=(75, 40),default_bind="YorN")
    button_test_loghost.SetFont(wx.Font(10, wx.FONTFAMILY_DEFAULT, wx.FONTSTYLE_NORMAL, wx.FONTWEIGHT_NORMAL))

    button_test_loglang = GoatcButton(panel, label="LOGLANG=_", pos=(445, 164), size=(75, 40),default_bind="YorN")
    button_test_loglang.SetFont(wx.Font(10, wx.FONTFAMILY_DEFAULT, wx.FONTSTYLE_NORMAL, wx.FONTWEIGHT_NORMAL))

    button_test_keycontains = GoatcButton(panel, label="KEYCONTAINS=_________________________________________________________", pos=(130, 186), size=(360, 40),default_bind="String")
    button_test_keycontains.SetFont(wx.Font(10, wx.FONTFAMILY_DEFAULT, wx.FONTSTYLE_NORMAL, wx.FONTWEIGHT_NORMAL))

    button_test_logcook = GoatcButton(panel, label="LOGCUSTOM=_", pos=(490, 164), size=(100, 83),default_bind="YorN")
    button_test_logcook.SetFont(wx.Font(10, wx.FONTFAMILY_DEFAULT, wx.FONTSTYLE_NORMAL, wx.FONTWEIGHT_NORMAL))

    button_test_logcook = GoatcButton(panel, label="LOGCOOKIES=_", pos=(490, 208), size=(100, 40),default_bind="YorN")
    button_test_logcook.SetFont(wx.Font(10, wx.FONTFAMILY_DEFAULT, wx.FONTSTYLE_NORMAL, wx.FONTWEIGHT_NORMAL))

    button_test_keyomits = GoatcButton(panel, label="KEYOMITS=_________________________________________________________", pos=(130, 208), size=(360, 40),default_bind="String")
    button_test_keyomits.SetFont(wx.Font(10, wx.FONTFAMILY_DEFAULT, wx.FONTSTYLE_NORMAL, wx.FONTWEIGHT_NORMAL))

    button_test_hardcode = GoatcButton(panel, label="HARDCODE=_________________________________________________________", pos=(130, 230), size=(360, 40),default_bind="String")
    button_test_hardcode.SetFont(wx.Font(10, wx.FONTFAMILY_DEFAULT, wx.FONTSTYLE_NORMAL, wx.FONTWEIGHT_NORMAL))

    button_test_secpolicy = GoatcButton(panel, label="SECPOL=________", pos=(490, 208), size=(100, 40),default_bind="String")
    button_test_secpolicy.SetFont(wx.Font(10, wx.FONTFAMILY_DEFAULT, wx.FONTSTYLE_NORMAL, wx.FONTWEIGHT_NORMAL))

    button_test_notd = GoatcButton(panel, label="NOTD", pos=(490, 230), size=(100, 40))
    button_test_notd.SetFont(wx.Font(10, wx.FONTFAMILY_DEFAULT, wx.FONTSTYLE_NORMAL, wx.FONTWEIGHT_NORMAL))

    voffset = 25
    label_paths = wx.StaticText(panel, label="Request path (not including hostname):", pos=(130, 355))
    txtctrl_path = wx.TextCtrl(panel, value="/", pos=(375, 353), size=(215,22))

    button_addtest = wx.Button(panel, label="Update Test Script List", pos=(130, 380+voffset), size=(170, 40))
    button_addtest.SetFont(wx.Font(10, wx.FONTFAMILY_DEFAULT, wx.FONTSTYLE_NORMAL, wx.FONTWEIGHT_NORMAL))
    button_cleartest = wx.Button(panel, label="Reset Form", pos=(300, 380+voffset), size=(100, 40))
    button_cleartest.SetFont(wx.Font(10, wx.FONTFAMILY_DEFAULT, wx.FONTSTYLE_NORMAL, wx.FONTWEIGHT_NORMAL))
    button_cleartest.Bind(wx.EVT_BUTTON, reset_form)

    button_savetest = wx.Button(panel, label="Save", pos=(400, 380+voffset), size=(40, 40))
    button_savetest.SetFont(wx.Font(10, wx.FONTFAMILY_DEFAULT, wx.FONTSTYLE_NORMAL, wx.FONTWEIGHT_NORMAL))
    button_copytest = wx.Button(panel, label="Copy", pos=(440, 380+voffset), size=(40, 40))
    button_copytest.SetFont(wx.Font(10, wx.FONTFAMILY_DEFAULT, wx.FONTSTYLE_NORMAL, wx.FONTWEIGHT_NORMAL))
    button_runtest = wx.Button(panel, label="Load", pos=(480, 380+voffset), size=(40, 40))
    button_runtest.SetFont(wx.Font(10, wx.FONTFAMILY_DEFAULT, wx.FONTSTYLE_NORMAL, wx.FONTWEIGHT_NORMAL))
    button_goatc = wx.Button(panel, label="GO ATC!", pos=(520, 380+voffset), size=(70, 40))
    button_goatc.SetFont(wx.Font(10, wx.FONTFAMILY_DEFAULT, wx.FONTSTYLE_NORMAL, wx.FONTWEIGHT_NORMAL))

    combo_templates = wx.ComboBox(panel, 1, style=wx.CB_DROPDOWN | wx.CB_READONLY, size=(325,25), pos=(130,358+voffset))
    button_templates = wx.Button(panel, label="Apply Template Instead", pos=(460, 350+voffset), size=(130, 40))
    button_templates.SetFont(wx.Font(10, wx.FONTFAMILY_DEFAULT, wx.FONTSTYLE_NORMAL, wx.FONTWEIGHT_NORMAL))

    global button_test_pragmas
    button_test_pragmas = wx.CheckBox(panel, label="PRAGMAS", pos=(522, 164), size=(95, 40))
    button_test_pragmas.SetFont(wx.Font(10, wx.FONTFAMILY_DEFAULT, wx.FONTSTYLE_NORMAL, wx.FONTWEIGHT_NORMAL))

    window.Show(True)

    app.MainLoop()

    while len(snoring_threads) > 0:
        try:
            for t in snoring_threads:
                th = snoring_threads.pop(t)
                th.join()
        except:
            print_err("Cleaning up threads...\n")
    util.die(0, "UI window closed.  Exiting gracefully.")
