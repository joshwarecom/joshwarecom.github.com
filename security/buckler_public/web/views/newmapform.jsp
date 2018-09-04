<%-- 
    Document   : newmapform
    Created on : Apr 24, 2016, 11:58:59 AM
    Author     : jowilson
--%>
<%@page import="com.internal.pubsector.civilian.buckler.Utilities"%>
<%@page import="com.internal.pubsector.civilian.buckler.SupportedControllers"%>
<%@page import="com.internal.pubsector.civilian.buckler.objects.ConnectionTestMap"%>
<%@page import="com.internal.pubsector.civilian.buckler.Utilities.*"%>
<%@page import="static com.internal.pubsector.civilian.buckler.Dispatcher.getDispatchURL"%>
<%@page contentType="text/html" pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <title>Add/Edit Ghost Group</title>
        <script>
            var editWarn = false;
            
            function toggleRowVisibility(name, visibility) {
                e1 = document.getElementById(name + "Label");
                e2 = document.getElementById(name + "Text");
                e3 = document.getElementById(name + "Button");
                e4 = document.getElementById(name + "OutputLabel");
                e5 = document.getElementById(name + "Output");
                for (i = 1; i <= 5; i++) {
                    eval("e = e" + i);
                    if (e != null) {
                        if (visibility) {
                            e.style.display = 'table-row';
                        }
                        else {
                            e.style.display = 'none';
                        }
                    }
                }                
            }
            
            function initRowVisibility() {
                e1 = document.getElementsByName("extractFromManualCIDRs");
                e2 = document.getElementsByName("includeManualGhostIPs");
                e3 = document.getElementsByName("includeCurrentQueriedGhostIPs");
                e4 = document.getElementsByName("includeFutureQueriedGhostIPs");
                                
                if (e1 != null) e1v = e1[0].checked;
                if (e2 != null) e2v = e2[0].checked;
                if (e3 != null) e3v = e3[0].checked;
                if (e4 != null) e4v = e4[0].checked;

                n1 = "manualCidrList";
                n2 = "manualIpList";
                n3 = "currentIpList";
                n4 = "futureIpList";
                
                for (j = 1; j <= 4; j++) {
                    eval("e = e" + j + "v");
                    eval("n = n" + j);
                    if (e != null && n != null) {
                        toggleRowVisibility(n, !e);
                    }
                }
            }
            
            function showDisabledMsg(who) {
                var str = who.name + " cannot be edited directly.";
                switch (who.name) {
                    case "extractedGhostIPList":
                        str = "extractedGhostIPList cannot be edited directly; to change it, enter different CIDRs above and click 'Extract.'"; break;
                    case "currentGhostIPList":
                        str = "currentGhostIPList cannot be edited directly; to change it, enter a source map and click 'Run Query'"; break;
                    case "futureGhostIPList":
                        str = "futureGhostIPList cannot be edited directly; to change it, enter a source map and click 'Run Query'"; break;
                    case "queryGhostCIDRList":                        
                        str = "Not yet implemented."; break;
                    case "queryCurrentGhostIPList":                        
                        str = "Not yet implemented."; break;
                    case "queryFutureGhostIPList":                        
                        str = "Not yet implemented."; break;
                    default:
                }
                alert(str);
            }
            
            function extractCIDRs(who, overrideMsg) {
                var msg = 'Click Yes to continue, otherwise Cancel.  Extracting the CIDRs may take a few moments.';
                if (overrideMsg != null) msg = overrideMsg;
                if (confirm(msg))
                var w = window.open("<%=getDispatchURL(SupportedControllers.viewwrapper, request)%>&view=extractcidrs", "Extracting Ghost IPs from CIDRs...", "location=0,status=1,scrollbars=1,resizable=no,left=" + (screen.width/2 - (400/2)) + ", top=" + (screen.height/2 - (300/2)) + ", width=400,height=300,menubar=no,toolbar=no");
                w.focus();
            }
            
            function checkExtractedIPs(who) {
                e1 = document.getElementsByName("extractedGhostIPList");
                if (e1 != null) {
                    ips = prettify(e1[0].value);
                    cidrs = new Array();
                    ipArray = ips.split(" ");
                    badBlocks = 0;
                    for (i = 0; i < ipArray.length; i++) {
                        tmpIpBytes = ipArray[i].split(".");
                        tmpIpPrefix = tmpIpBytes[0] + "." + tmpIpBytes[1]+ "." + tmpIpBytes[2];
                        if (cidrs[""+tmpIpPrefix] == undefined) cidrs[""+tmpIpPrefix] = 1;
                        else cidrs[""+tmpIpPrefix]++;
                        if (cidrs[""+tmpIpPrefix] == 256) badBlocks++;
                    }
                    if (badBlocks > 0) {
                        alert("ERROR! The IPs extracted from CIDRs appear to be invalid.  To continue, set 'Extract ghost ips from CIDRs' to 'No' and use 'Include manual ghost ips' instead.");
                        return false;
                    }
                }
                return true;
            }            
            
            function prettify(str) {
                str = str.trim();
                str = str.replace(/\n/g, ' ');
                str = str.replace(/\r/g, ' ');                
                str = str.replace(/\t/g, ' ');
                while (str.indexOf('  ') >= 0) {
                    str = str.replace(/  /g, ' ');
                }
                return str;
            }
        </script>
    </head>
    <%
    ConnectionTestMap map = (ConnectionTestMap)(request.getAttribute("@modelOutput"));
    String title="Create a New Ghost Group";
    String submit = "Add this Ghost Group";
    String id = null;
    if (map != null) id = map.getMapId();
    
    String freeflowChecked = "";
    String esslChecked = "";
    
    String numericId = "";
    String internalLogin = "";
    String descriptiveMapName = "";
    String mapNotes = "";
    
    String extractFromCIDRsCheckedNo = "checked";    
    String extractFromCIDRsCheckedYes = "";
    String cidrList = "";
    String extractedIpList = "";
    
    String includeManualIPsCheckedNo = "checked";    
    String includeManualIPsCheckedYes = "";
    String ipList = "";
    String defaultEditWarnValue = "false";
    String tryAutoExtract = "false";

    if (map != null) {
        title = "Edit an Existing Ghost Group";
        submit = "Update this Ghost Group";
        
        if (map.isNetworkESSL()) {
            esslChecked = "checked";
        }
        else {
            freeflowChecked = "checked";
        }
        
        numericId = Utilities.htmlEncode(map.getMapruleId());
        internalLogin = Utilities.htmlEncode(map.getinternalLogin());
        descriptiveMapName = Utilities.htmlEncode(map.getMapName());
        mapNotes = Utilities.htmlEncode(Utilities.blankIfNull(map.getMapNotes()));
        
        if (map.didIncludeExtractedGhostIPs()) {
            extractFromCIDRsCheckedNo = "";    
            extractFromCIDRsCheckedYes = "checked";
            cidrList = map.getManualCIDRList();
            extractedIpList = map.getExtractedIPList();
            defaultEditWarnValue = "true";
        }

        if (map.didIncludeManualGhostIPs()) {
            includeManualIPsCheckedNo = "";    
            includeManualIPsCheckedYes = "checked";
            ipList = map.getManualIPList();
        }
        
        if ("true".equalsIgnoreCase(request.getParameter("autoExtract"))) {
            tryAutoExtract = "true";
        }
    }
    %>
    <body onload="initRowVisibility(); editWarn = <%=defaultEditWarnValue%>; tryAutoExtract = <%=tryAutoExtract%>; if (tryAutoExtract) { if (document.getElementsByName('extractedGhostIPList')[0].value != '') { extractCIDRs(this, 'Click Yes to continue refreshing the CIDRs, otherwise Cancel.  Extracting the CIDRs may take a few moments.'); } else { alert('CIDRs cannot be extracted because there are no CIDRs entered.\nTo add CIDRs, select Yes for \'Extract ghost ips from CIDRs\'');} }">
        <h1><%=title%></h1>
        <form action="<%=getDispatchURL(SupportedControllers.addnewmap, request)%>" method="POST" onsubmit="return checkExtractedIPs(this);">
        <%
        if (id != null) {
        %>
            <input type="hidden" name="edit" value="<%=id%>">
        <%
        }
        if (numericId == null || "".equals(numericId)) {
            numericId = "";
        }
        %>
        <table>
            <tr><td width="155">Network: </td><td><input type="radio" name="network" value="freeflow" <%=freeflowChecked%>> freeflow <input type="radio" name="network" value="essl" <%=esslChecked%>> essl</td></tr>
            <tr><td width="155">Numeric maprule id:</td><td><input type="text" name="mapruleId" value="<%=numericId%>"></td></tr>
            <tr><td colspan="2"><hr></td></tr>            
            <tr><td width="220">Your internal login: </td><td><input type="text" name="internalLogin" value="<%=internalLogin%>"></td></tr>
            <tr><td width="155">Descriptive map name: </td><td><input type="text" name="mapName" size="55" value="<%=descriptiveMapName%>"></td></tr>
            <tr><td colspan="2">Notes:</td></tr>
            <tr><td colspan="2"><textarea name="mapNotes" cols="75" rows="8"><%=mapNotes%></textarea><br><br></td></tr>
            <tr><td colspan="2"><hr></td></tr>
            <tr><td width="185">Extract ghost ips from CIDRs?</td><td><input type="radio" name="extractFromManualCIDRs" value="no" <%=extractFromCIDRsCheckedNo%> onclick="toggleRowVisibility('manualCidrList',false);"> no <input type="radio" name="extractFromManualCIDRs" value="yes" onclick="toggleRowVisibility('manualCidrList',true);" <%=extractFromCIDRsCheckedYes%>> yes</td></tr>
            <tr style="display: none;" id="manualCidrListLabel"><td colspan="2">Manual ghost CIDR list (space delimited):<br><br>
            <font size="-1"><b>1) Enter/paste the CIDRs below and 2) click 'Extract'.</b><br><br>NOTE: If you edit this field after extracting CIDRs, you'll need to Extract again.</font></td></tr>
            <tr style="display: none;" id="manualCidrListText"><td colspan="2"><textarea name="manualGhostCIDRList" cols="75" rows="8" onchange="document.getElementsByName('extractedGhostIPList')[0].value = ''; e = document.getElementsByName('manualGhostCIDRList')[0]; e.value = prettify(e.value);" onclick="if (document.getElementsByName('extractedGhostIPList')[0].value != '') { if (editWarn == true) { alert('NOTE: if you edit this field now, you will need to Extract the CIDRs again.'); editWarn = false;}}"><%=cidrList%></textarea></td></tr>
            <tr style="display: none;" id="manualCidrListButton"><td colspan="2" align="right"><input type="button" style="width:75px;" name="queryGhostCIDRList" value="Extract" onclick="editWarn = true; e = document.getElementsByName('manualGhostCIDRList')[0]; e.value = prettify(e.value); extractCIDRs(this);"> <input type="button" style="width:75px;" name="queryGhostCIDRList" value="Reset" onclick="if (confirm('Are you sure you wish to reset the CIDRs input fields?')) { document.getElementsByName('extractedGhostIPList')[0].value = ''; document.getElementsByName('manualGhostCIDRList')[0].value = '';}"></td></tr>
            <tr style="display: none;" id="manualCidrListOutputLabel"><td colspan="2">Extracted ghost IP list:</td></tr>
            <tr style="display: none;" id="manualCidrListOutput"><td colspan="2"><textarea name="extractedGhostIPList" cols="75" rows="8" readonly style="background-color: #ECE5B6;" onclick="if (document.getElementsByName('extractedGhostIPList')[0].value == '') showDisabledMsg(this);"><%=extractedIpList%></textarea><br><br></td></tr>
            <tr><td width="185">Include manual ghost ips?</td><td><input type="radio" name="includeManualGhostIPs" value="no" <%=includeManualIPsCheckedNo%> onclick="toggleRowVisibility('manualIpList',false);"> no <input type="radio" name="includeManualGhostIPs" value="yes" <%=includeManualIPsCheckedYes%> onclick="toggleRowVisibility('manualIpList',true);"> yes</td></tr>
            <tr style="display: none;" id="manualIpListLabel"><td colspan="2">Manual ghost ip list (space delimited):</td></tr>
            <tr style="display: none;" id="manualIpListText"><td colspan="2"><textarea name="manualGhostIPList" cols="75" rows="8" onchange="e = document.getElementsByName('manualGhostIPList')[0]; e.value = prettify(e.value);"><%=ipList%></textarea></td></tr>
            <tr><td width="185">Include current queried ghost ips?</td><td><input type="radio" name="includeCurrentQueriedGhostIPs" value="no" checked onclick="toggleRowVisibility('currentIpList',false);"> no <input type="radio" name="includeCurrentQueriedGhostIPs" value="yes" onclick="toggleRowVisibility('currentIpList',true);"> yes <i><b>(not yet implemented)</b></i></td></tr>
            <tr style="display: none;" id="currentIpListLabel"><td colspan="2">Current queried ghost ip list (space delimited):</td></tr>
            <tr style="display: none;" id="currentIpListButton"><td colspan="2" align="right"><input type="text" name="currentSourceMap" size="25" value="&lt;enter source map&gt;"><input type="button" style="width:75px;" name="queryCurrentGhostIPList" value="Run Query" onclick="showDisabledMsg(this);"></td></tr>
            <tr style="display: none;" id="currentIpListText"><td colspan="2"><textarea name="currentGhostIPList" cols="75" rows="8" readonly style="background-color: #ECE5B6;" onclick="showDisabledMsg(this);"></textarea></td></tr>
            <tr><td width="185">Include future queried ghost ips?</td><td><input type="radio" name="includeFutureQueriedGhostIPs" value="no" checked onclick="toggleRowVisibility('futureIpList',false);"> no <input type="radio" name="includeFutureQueriedGhostIPs" value="yes" onclick="toggleRowVisibility('futureIpList',true);"> yes <i><b>(not yet implemented)</b></i></td></tr>
            <tr style="display: none;" id="futureIpListLabel"><td colspan="2">Future queried ghost ip list (space delimited):</td></tr>
            <tr style="display: none;" id="futureIpListButton"><td colspan="2" align="right"><input type="text" name="futureSourceMap" size="25" value="&lt;enter source map&gt;"><input type="button" style="width:75px;" name="queryFutureGhostIPList" value="Run Query" onclick="showDisabledMsg(this);"></td></tr>
            <tr style="display: none;" id="futureIpListText"><td colspan="2"><textarea name="futureGhostIPList" cols="75" rows="8" readonly style="background-color: #ECE5B6;" onclick="showDisabledMsg(this);"></textarea></td></tr>
            <tr><td colspan="2"><hr></td></tr>
            <tr><td colspan="2" align="right"><input type="submit" name="saveAndExit" value="<%=submit%>"></td></tr>            
        </table>
        </form>
    </body>
</html>
