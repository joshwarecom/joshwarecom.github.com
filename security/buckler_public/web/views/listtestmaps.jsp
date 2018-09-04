<%-- 
    Document   : listtestmaps
    Created on : Apr 25, 2016, 3:31:40 PM
    Author     : jowilson
--%>
<%@page import="java.util.*"%>
<%@page import="com.internal.pubsector.civilian.buckler.objects.*"%>
<%@page import="static com.internal.pubsector.civilian.buckler.Dispatcher.getDispatchURL"%>
<%@page import="com.internal.pubsector.civilian.buckler.SupportedControllers"%>
<%@page import="java.net.InetAddress"%>
<%@page contentType="text/html" pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <title>List Existing Ghost Groups</title>
    </head>
    <body>
        <h1>Current List of Ghost Groups</h1>
        <table border="1">
            <tr><td width="75">owner</td><td width="200">name</td><td width="200">sample ip list</td><td>id</td><tr>
        <%
            ListMapPair pair = (ListMapPair)request.getAttribute("@modelOutput");
            List list = pair.getList();
            
            for (int i = 0; i < list.size(); i++) {
                ConnectionTestMap map = (ConnectionTestMap)pair.getMap().get(list.get(i));
                String owner = map.getinternalLogin();
                String name = map.getMapName();
                String abbrlist = "<none>";
                InetAddress[] addresses = map.getMasterGhostIPList();
                if (addresses != null) {
                    for (int j = 0; j < 4 && j < addresses.length; j++) {
                        abbrlist += addresses[j].getHostAddress();
                        abbrlist += " ";
                    }
                }
        %>
            <tr><td><%=owner%></td><td><%=name%></td><td><%=abbrlist%></td><td><a href="<%=getDispatchURL(SupportedControllers.newmapform, request)%>&edit=<%=list.get(i)%>"><%=list.get(i)%></a></td></tr>
        <%
            }
        %>
        </table>
    </body>
</html>
