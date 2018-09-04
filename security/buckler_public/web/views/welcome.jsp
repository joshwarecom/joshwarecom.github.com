<%-- 
    Document   : index
    Created on : Jan 28, 2016, 11:47:01 AM
    Author     : jowilson
--%>

<%@page contentType="text/html" pageEncoding="UTF-8"%>
<%@page import="static com.internal.pubsector.civilian.buckler.Dispatcher.getDispatchURL"%>
<%@page import="com.internal.pubsector.civilian.buckler.SupportedControllers"%>

<!DOCTYPE html>
<html>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <title>JSP Page</title>
    </head>
    <body>
        <h1>Buckler v1.0a</h1>
        <ul>
            <li><a href="<%=getDispatchURL("Invalid Controller", request)%>">Test Invalid Controller Name</li>            
            <li><a href="<%=request.getContextPath()%>/Dispatcher">Test Missing Controller Name (Null Pointer Exception Expected)</li>                        
            <li><a href="<%=getDispatchURL(SupportedControllers.testindex, request)%>">Index of Other Test Functions</li>
            <li><a href="<%=getDispatchURL(SupportedControllers.launch, request)%>">Main Menu!</li>
        </ul>        
    </body>
</html>
