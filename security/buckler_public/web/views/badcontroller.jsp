<%-- 
    Document   : badcontroller
    Created on : Jan 28, 2016, 1:12:50 PM
    Author     : jowilson
--%>
<%@page import="static com.internal.pubsector.civilian.buckler.Utilities.sanitizeName"%>
<%@page contentType="text/html" pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <title>Bad Controller</title>
    </head>
    <body>
        <h1>"<%=sanitizeName(request.getParameter("extraInfo"))%>" is not a valid controller.</h1>
    </body>
</html>
