<%-- 
    Document   : doremotecurl
    Created on : Jan 29, 2016, 11:08:55 AM
    Author     : jowilson
--%>
<%@page import="com.internal.pubsector.civilian.buckler.objects.ShellOutput"%>
<%@page contentType="text/html" pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <title>Do Remote Curl</title>
    </head>
    <body>
        <h1>Do Remote Curl</h1>
        <%
            ShellOutput output = (ShellOutput)request.getAttribute("@modelOutput");
            String str = "";
            if (output != null) {
                str = output.getStdout();
            }
        %>
        <textarea rows="22" cols="110"><%=str%></textarea>
    </body>
</html>
