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
        <title>Launch Menu</title>
    </head>
    <body>
        <font size="+1">Ghost Group Editor</font>
        <ul>
            <li><a href="<%=getDispatchURL(SupportedControllers.newmapform, request)%>" target="appPage">Create a Ghost Group</a></li>
            <li><a href="<%=getDispatchURL(SupportedControllers.listtestmaps, request)%>" target="appPage">List Ghost Groups</a><br><br></li>
            <li><a href="<%=getDispatchURL(SupportedControllers.launch, request)%>" target="_top">Exit Editor</a></li>
        </ul>
    </body>
</html>
