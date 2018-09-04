<%-- 
    Document   : doremotecurl
    Created on : Jan 29, 2016, 11:08:55 AM
    Author     : jowilson
--%>

<%@page contentType="text/html" pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <title>Do Remote Echo</title>
    </head>
    <body>
        <h1>Do Remote Echo</h1>
        <textarea rows="22" cols="110"><%=request.getAttribute("@modelOutput")%></textarea>
    </body>
</html>
