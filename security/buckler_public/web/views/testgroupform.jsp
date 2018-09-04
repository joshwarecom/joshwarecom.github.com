<%-- 
    Document   : testgroupform
    Created on : Apr 9, 2016, 11:01:17 AM
    Author     : jowilson
--%>

<%@page contentType="text/html" pageEncoding="UTF-8"%>
<%@page import="com.internal.pubsector.civilian.buckler.SupportedControllers"%>
<%@page import="static com.internal.pubsector.civilian.buckler.Dispatcher.getDispatchURL"%>
<%@page import="com.internal.pubsector.civilian.buckler.objects.ListMapPair"%>
<%@page import="static com.internal.pubsector.civilian.buckler.Utilities.htmlEncode"%>
<%@page import="java.util.*"%>

<!DOCTYPE html>
<html>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <title>Test Scan Form</title>
        <script>
            /*
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
                e1 = document.getElementsByName("includeConfiguredMap");
                e2 = document.getElementsByName("enterManualIpList");
                                
                if (e1 != null) e1v = e1[0].checked;
                if (e2 != null) e2v = e2[0].checked;

                n1 = "includeConfiguredMap";
                n2 = "enterManualIpList";
                
                for (j = 1; j <= 2; j++) {
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
                    default:
                }
                alert(str);
            }
            */
        </script>        
    </head>
    <body>
        <h1>Start a New Scan</h1>        
        <%
            ListMapPair lmp = (ListMapPair)request.getAttribute("@modelOutput");
            List<String> orderedKeys = lmp.getList();
            Map<String, String> data = lmp.getMap();
            StringBuilder html = new StringBuilder("");
            
            if (orderedKeys.size() == 0) {
                html.append("<i>no maps are currently created</i>");
            } else {
                html.append("<select name=\"mapId\"><option value=\"\"></option>");
                for (int i = 0; i < orderedKeys.size(); i++) {
                    html.append("<option value=\"");
                    html.append(orderedKeys.get(i));
                    html.append("\">");
                    html.append(htmlEncode(data.get(orderedKeys.get(i))));
                    html.append("</option>");
                }
                html.append("</select>");
            }
        %>
        <form action="<%=getDispatchURL(SupportedControllers.addtestgroup, request)%>" method="POST">
        <table>
            <tr>
                <td>Select a Ghost Group:</td><td><%=html.toString()%></td>
            </tr>        
            <tr>
                <td></td><td>(these are created with the <a href="<%=getDispatchURL(SupportedControllers.mapeditor, request)%>" target="_top">Ghost Group Editor</a>)</td>
            </tr>            
            <tr><td colspan="2"><hr></td></tr>                        
            <tr>
                <td colspan="2">Origin IPs (space delimited)</td>
            </tr>
            <tr>
                <td colspan="2">
                    <textarea cols="65" rows="15" name="originIpList"></textarea>
                </td>
            </tr>
            <tr>
                <td>Origin port:</td><td><input type="text" size="61" name="originPort"></td>
            </tr>
            <tr>
                <td>Host header:</td><td><input type="text" size="61" name="hostHeader"></td>
            </tr>
            <tr>
                <td>Request path:</td><td><input type="text" size="61" name="requestPath"></td>
            </tr>
            <tr>
                <td>SSL?</td><td><input type="checkbox" size="61" name="ssl"></td>
            </tr>
            <tr><td colspan="2"><hr></td></tr>            
            <!--
            <tr><td colspan="2">Include preconfigured ghost ip map created with the Map Editor? <input type="radio" name="includeConfiguredMap" value="no" checked onclick="toggleRowVisibility('includeConfiguredMap',false);"> no <input type="radio" name="includeConfiguredMap" value="yes" onclick="toggleRowVisibility('includeConfiguredMap',true);"> yes</td></tr>            
            <tr id="includeConfiguredMapOutput" style="display: none;"><td colspan="2"><b>Selection box goes here...</b></td></tr>            
            <tr><td colspan="2"><hr></td></tr>
            -->
            <!--
            <tr><td colspan="2">Enter manual ghost ip list? <input type="radio" name="enterManualIpList" value="no" checked onclick="toggleRowVisibility('enterManualIpList',false);"> no <input type="radio" name="enterManualIpList" value="yes" onclick="toggleRowVisibility('enterManualIpList',true);"> yes</td></tr>            
            <tr id="enterManualIpListLabel" style="display: none;"><td colspan="2">Manual ghost ips (space delimited):</td></tr>            
            <tr id="enterManualIpListText" style="display: none;">
                <td colspan="2">
                    <textarea cols="65" rows="15" name="ghostIpList"></textarea>
                </td>
            </tr>
            -->
            <tr>
                <td>Test Scan Name:</td><td><input type="text" size="61" name="testGroupName"></td>
            </tr>            
            <tr>
                <td colspan="2">
                    <p align="right">
                        <input type="submit" value="Add Test">
                    </p>
                </td>
            </tr>
        </table>
        </form>
    </body>
</html>
