<%-- 
    Document   : aborttestgroup
    Created on : Jun 12, 2014, 3:57:21 PM
    Author     : jowilson
--%>

<%@page contentType="text/html" pageEncoding="UTF-8"%>
<%@page import="com.internal.pubsector.civilian.buckler.SupportedControllers"%>
<%@page import="static com.internal.pubsector.civilian.buckler.Dispatcher.getDispatchURL"%>

<!DOCTYPE html>
<html>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <title>Abort Test Group</title>
    </head>
    <body>
        <h1>Test group aborted successfully.</h1>
        <a href="<%=getDispatchURL(SupportedControllers.listtestgroups, request)%>" target="appPage">Click Here to List All Scans</a>
    </body>
</html>


