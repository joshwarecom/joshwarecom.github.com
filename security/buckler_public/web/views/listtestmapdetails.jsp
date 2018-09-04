<%-- 
    Document   : listtestmapdetails
    Created on : Apr 25, 2016, 3:46:21 PM
    Author     : jowilson
--%>

<%@page import="static com.internal.pubsector.civilian.buckler.Dispatcher.getDispatchURL"%>
<%@page import="com.internal.pubsector.civilian.buckler.SupportedControllers"%>
<%@page import="java.util.*"%>
<%@page import="java.net.InetAddress"%>
<%@page contentType="text/html" pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <title>Ghost Group Details</title>
    </head>
    <body>
        <h1>Ghost Group Details</h1>
        <%
            Hashtable table = (Hashtable)request.getAttribute("@modelOutput");
            InetAddress[] masterGhostIpList = (InetAddress[])table.get("masterGhostIPList");
        %>
        <table>
            <tr><td>Name:</td><td><%=table.get("mapName")%></td></tr>
            <tr><td>Id:</td><td><%=table.get("mapId")%></td></tr>
            <tr><td>Owner:</td><td><%=table.get("internalLogin")%></td></tr>
            <tr><td>Network:</td><td><%=table.get("network")%></td></tr>
            <tr><td>Maprule id</td><td><%=table.get("mapruleId")%></td></tr>
            <tr><td colspan="2">Complete ghost ip list:</td></tr>
            <tr><td colspan="2"><textarea cols="75" rows="15"><%
                if (masterGhostIpList != null) {
                    for (int i = 0; i < masterGhostIpList.length; i++) {
                        InetAddress addr = masterGhostIpList[i];
                        if (i > 0) out.print(" ");
                        out.print(addr.getHostAddress());
                    }
                }
            %></textarea></td></tr>
            <tr><td>Entered manual ips?</td><td><%=table.get("didIncludeManualGhostIPs")%></td></tr>
            <%if (new Boolean(""+table.get("didIncludeManualGhostIPs"))) {%>
            <tr><td colspan="2"><textarea cols="75" rows="12"><%=table.get("manualGhostIPList")%></textarea></td></tr>
            <%}%>
            <tr><td>Extracted from CIDRs?</td><td><%=table.get("didIncludeExtractedGhostIPs")%></td></tr>            
            <%if (new Boolean(""+table.get("didIncludeExtractedGhostIPs"))) {%>
            <tr><td colspan="2"><textarea cols="75" rows="6"><%=table.get("manualCIDRList")%></textarea></td></tr>            
            <tr><td colspan="2"><textarea cols="75" rows="12"><%=table.get("extractedGhostIPList")%></textarea></td></tr>            
            <%}%>
        </table>
    </body>
</html>
