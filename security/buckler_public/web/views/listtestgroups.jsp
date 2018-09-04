<%-- 
    Document   : listtestgroups
    Created on : Apr 9, 2016, 1:17:50 PM
    Author     : jowilson
--%>
<%@page import="static com.internal.pubsector.civilian.buckler.Dispatcher.getDispatchURL"%>
<%@page import="static com.internal.pubsector.civilian.buckler.Dispatcher.getGhostFailureIconURL"%>
<%@page import="static com.internal.pubsector.civilian.buckler.Dispatcher.getOriginFailureIconURL"%>
<%@page import="static com.internal.pubsector.civilian.buckler.Dispatcher.getPendingIconURL"%>
<%@page import="static com.internal.pubsector.civilian.buckler.Dispatcher.getSuccessIconURL"%>
<%@page import="static com.internal.pubsector.civilian.buckler.Dispatcher.getActionIconURL"%>
<%@page import="static com.internal.pubsector.civilian.buckler.Dispatcher.getAbortIconURL"%>
<%@page import="static com.internal.pubsector.civilian.buckler.Utilities.htmlEncode"%>
<%@page import="com.internal.pubsector.civilian.buckler.SupportedControllers"%>
<%@page import="com.internal.pubsector.civilian.buckler.objects.*"%>
<%@page import="java.util.*"%>
<%@page contentType="text/html" pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <title>List Scans</title>
        <script lang="javascript">
            function showActionMenu(id, clear) {
                if (!clear) {
                    if (document.previousMenuDiv != null) {
                        document.previousMenuDiv.innerHTML = "";
                        document.previousMenuDivId = null;
                    }
                    menuDiv = document.getElementById("menuPlaceHolder_" + id);
                    if (menuDiv != null) {
                        menuDiv.innerHTML = "<table border=\"1\" cellspacing=\"0\" cellpadding=\"0\" width=\"255\"><tr><td><font size=\"-1\">Select an action</font></td></tr><tr><td><a href=\"javascript:if(target=confirmRerun(document.previousMenuDivId)){ window.location=target;}\">Re-run this scan</a></td></tr><tr><td><a href=\"javascript:if(target=confirmEditGhostGroup(document.previousMenuDivId)){ window.location=target;}\">Edit this Ghost Group</a></td></tr><tr><td><a href=\"javascript:if(target=confirmRefreshCIDRs(document.previousMenuDivId)){ window.location=target;}\">Refresh Ghost Group CIDRs</a></td></tr><tr><td><a href=\"javascript:showActionMenu(document.previousMenuDivId, true)\">Cancel action</a></td></tr></table>";
                        document.previousMenuDiv = menuDiv;
                        document.previousMenuDivId = id;
                    }
                }
                else {
                    if (document.previousMenuDiv != null) {
                        document.previousMenuDiv.innerHTML = "";
                    }                    
                    document.previousMenuDivId = null;
                    btn = document.getElementById("actionGroupButton_" + id);
                    if (btn != null) {
                        btn.checked = false;
                    }
                }
            }
            
            function confirmRerun(id) {
                if (confirm("Are you sure you wish to re-run scan id " + id + "?")) {
                    return "<%=getDispatchURL(SupportedControllers.addtestgroup, request)%>&cloneId=" + id;
                }
            }

            function confirmEditGhostGroup(id) {
                if (confirm("Are you sure you wish to edit the ghost group for scan id " + id + "?")) {
                    return "<%=getDispatchURL(SupportedControllers.newmapform, request)%>&edit=" + id;
                }
            }
            
            function confirmRefreshCIDRs(id) {
                return "<%=getDispatchURL(SupportedControllers.newmapform, request)%>&edit=" + id + "&autoExtract=true";
            }            

            function clearSelectedActionGroupButtons() {
                list = document.getElementsByName("actionGroup");
                for (i = 0; i < list.length; i++) {
                    list[i].checked = false;
                }
            }
        </script>
    </head>
    <body onload="showActionMenu(document.previousMenuDivId, true); clearSelectedActionGroupButtons();">
        <%
            Hashtable testGroups = (Hashtable)request.getAttribute("@modelOutput");            
        %>    
        <h1>Pending Test Scans</h1>
        <table border="1">
            <tr><td>id</td><td>name</td><td>abort?</td></tr>
        <%
            ListMapPair pendingListMapPair = (ListMapPair)testGroups.get("@pending");
            ArrayList pendingList = (ArrayList)pendingListMapPair.getList();
            Hashtable pendingMap = (Hashtable)pendingListMapPair.getMap();
            for (int i = 0; i < pendingList.size(); i++) {
        %>
        <tr><td><a href="<%=getDispatchURL(SupportedControllers.listtestgroupdetails, request)%>&id=<%=htmlEncode(pendingList.get(i).toString())%>"><%=pendingList.get(i)%></a></td><td><%=pendingMap.get(pendingList.get(i))%></td><td><a href="<%=getDispatchURL(SupportedControllers.aborttestgroup, request)%>&id=<%=htmlEncode(pendingList.get(i).toString())%>"><img src="<%=getAbortIconURL(request)%>" title="Click to abort scan"></a></td></tr>
        <%
            }
        %>
        </table>
        <h1>Active Test Scans <a href="<%=getDispatchURL(SupportedControllers.listtestgroups, request)%>" target="appPage">[Refresh List]</a></h1>
        <table border="1">
            <tr><td>id</td><td>name</td><td>resolved</td><td><img src="<%=getGhostFailureIconURL(request)%>" title="Ghost connection failure"></td><td><img src="<%=getOriginFailureIconURL(request)%>" title="Origin connection failure"></td><td><img src="<%=getSuccessIconURL(request)%>" title="Successes"></td><td><img src="<%=getPendingIconURL(request)%>" title="Pending or other status"></td><td>abort?</td></tr>
        <%
            ListMapPair activeListMapPair = (ListMapPair)testGroups.get("@active");
            ArrayList activeList = (ArrayList)activeListMapPair.getList();
            Hashtable activeMap = (Hashtable)activeListMapPair.getMap();
            for (int i = 0; i < activeList.size(); i++) {
                String trColor = "";
                String ghost = (String)activeMap.get(activeList.get(i)+"@ghostCount");
                String origin = (String)activeMap.get(activeList.get(i)+"@originCount");                
                String aborted = (String)activeMap.get(activeList.get(i)+"@aborted");                
                if (!"".equals(ghost) && !"0".equals(ghost)) {
                    ghost = "<font color=\"#FF0000\"><b>" + ghost + "</b></font>";
                }
                if (!"".equals(origin) && !"0".equals(origin)) {
                    origin = "<font color=\"#FF0000\"><b>" + origin + "</b></font>";
                }

                String abortCode = "<a href=\""+getDispatchURL(SupportedControllers.aborttestgroup, request)+"&id="+htmlEncode(activeList.get(i).toString())+"\"><img src=\""+getAbortIconURL(request)+"\" title=\"Click to abort scan\"></a>";
                if ("true".equals(aborted)) {
                    trColor = "bgcolor=\"C48189\" ";
                    abortCode = "...";
                }
        %>
            <tr <%=trColor%>><td><a href="<%=getDispatchURL(SupportedControllers.listtestgroupdetails, request)%>&id=<%=htmlEncode(activeList.get(i).toString())%>"><%=activeList.get(i)%></a></td><td><%=activeMap.get(activeList.get(i))%></td><td><%=activeMap.get(activeList.get(i)+"@resolvedCount")%></td><td><%=ghost%></td><td><%=origin%></td><td><%=activeMap.get(activeList.get(i)+"@successCount")%></td><td><%=activeMap.get(activeList.get(i)+"@pendingCount")%></td><td><%=abortCode%></td></tr>
        <%
            }
        %>
        </table>
        <h1>Resolved Test Scans</h1>
        <table border="0" cellspacing="0" cellpadding="0"><tr><td valign="top">        
        <table width="900" border="1" cellspacing="2" cellpadding="2">
            <tr><td height="36" width="335">id</td><td width="450">name</td><td>resolved</td><td><img src="<%=getGhostFailureIconURL(request)%>" title="Ghost connection failure"></td><td><img src="<%=getOriginFailureIconURL(request)%>" title="Origin connection failure"></td><td><img src="<%=getSuccessIconURL(request)%>" title="Successes"></td><td><img src="<%=getPendingIconURL(request)%>" title="Pending or other status"></td><td><img src="<%=getActionIconURL(request)%>" title="Select a scan to perform an action."></td></tr>
        <%
            ListMapPair resolvedListMapPair = (ListMapPair)testGroups.get("@resolved");
            ArrayList resolvedList = (ArrayList)resolvedListMapPair.getList();
            Hashtable resolvedMap = (Hashtable)resolvedListMapPair.getMap();
            for (int i = 0; i < resolvedList.size(); i++) {
                String ghost = (String)resolvedMap.get(resolvedList.get(i)+"@ghostCount");
                String origin = (String)resolvedMap.get(resolvedList.get(i)+"@originCount");                
                if (!"".equals(ghost) && !"0".equals(ghost)) {
                    ghost = "<font color=\"#FF0000\"><b>" + ghost + "</b></font>";
                }
                if (!"".equals(origin) && !"0".equals(origin)) {
                    origin = "<font color=\"#FF0000\"><b>" + origin + "</b></font>";
                }
        %>
        <tr><td height="25"><a href="<%=getDispatchURL(SupportedControllers.listtestgroupdetails, request)%>&id=<%=htmlEncode(resolvedList.get(i).toString())%>"><%=resolvedList.get(i)%></a></td><td><%=resolvedMap.get(resolvedList.get(i))%></td><td><%=resolvedMap.get(resolvedList.get(i)+"@resolvedCount")%></td><td><%=ghost%></td><td><%=origin%></td><td><%=resolvedMap.get(resolvedList.get(i)+"@successCount")%></td><td><%=resolvedMap.get(resolvedList.get(i)+"@pendingCount")%></td><td><input type="radio" name="actionGroup" id="actionGroupButton_<%=htmlEncode(resolvedList.get(i).toString())%>" value="<%=htmlEncode(resolvedList.get(i).toString())%>" onclick="showActionMenu(this.value);"></td></tr>
        <%
            }
        %>
        </table>
        </td>
        <td valign="top">
            <table border="0" cellspacing="2" cellpadding="2">
                <tr><td width="29" height="36"> </td></tr>
                <%
                    for (int i = 0; i < resolvedList.size(); i++) {
                        %>
                        <tr><td height="27"><div id="menuPlaceHolder_<%=htmlEncode(resolvedList.get(i).toString())%>"></div></td></tr>
                        <%
                    }
                %>                
            </table>
        </td>
        </tr></table>
    </body>
</html>
