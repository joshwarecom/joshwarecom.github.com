<%-- 
    Document   : launchmenu
    Created on : Apr 12, 2016, 3:10:15 PM
    Author     : jowilson
--%>
<%@page import="com.internal.pubsector.civilian.buckler.SupportedControllers"%>
<%@page import="static com.internal.pubsector.civilian.buckler.Dispatcher.getDispatchURL"%>
<%@page contentType="text/html" pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <title>Main Menu</title>
    </head>
    <body>
        <font size="+1">Main Menu</font>
        <ul>
            <li><a href="<%=getDispatchURL(SupportedControllers.mapeditor, request)%>" target="_top">Edit Ghost Groups</a><br><br></li>
            <li><a href="<%=getDispatchURL(SupportedControllers.testgroupform, request)%>" target="appPage">Start New Scan</a></li>
            <li><a href="<%=getDispatchURL(SupportedControllers.listtestgroups, request)%>" target="appPage">List All Scans</a><br><br></li>
        </ul>
        <br>
        <font size="+1">Admin Menu</font>
        <ul>
            <li><a href="<%=getDispatchURL(SupportedControllers.welcome, request)%>" target="_top"><font size="-1">Internal Tests</font></a><br><br></li>
        </ul>
    </body>
</html>
