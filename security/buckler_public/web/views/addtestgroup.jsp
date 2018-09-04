<%-- 
    Document   : addtestgroup
    Created on : Apr 8, 2016, 10:59:07 PM
    Author     : jowilson
--%>
<%@page contentType="text/html" pageEncoding="UTF-8"%>
<%@page import="com.internal.pubsector.civilian.buckler.SupportedControllers"%>
<%@page import="static com.internal.pubsector.civilian.buckler.Dispatcher.getDispatchURL"%>
<!DOCTYPE html>
<html>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <title>Add Test Scan</title>
    </head>
    <body>
        <h1>Test scan added successfully.</h1>
        <a href="<%=getDispatchURL(SupportedControllers.listtestgroups, request)%>" target="appPage">Click Here to List All Scans</a>
    </body>
</html>
