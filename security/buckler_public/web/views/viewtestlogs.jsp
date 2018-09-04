<%-- 
    Document   : viewtestlogs
    Created on : Apr 23, 2016, 1:44:51 PM
    Author     : jowilson
--%>
<%@page import="java.util.*"%>
<%@page contentType="text/html" pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <title>View Test Logs</title>
    </head>
    <body>
        <%
            Hashtable table = (Hashtable)request.getAttribute("@modelOutput");  
            String stderr = (String)table.get("stderr");
            String stdout = (String)table.get("stdout");
            String verboseOutput = (String)table.get("verboseOutput");
            String status = (String)table.get("status");
            String resolution = (String)table.get("resolution");            
            String id = (String)table.get("id");
        %>
        <h1>ID: <%=id%></h1>
        <table>
            <tr><td>Test Status:</td><td><%=status%></td></tr>
            <tr><td>Test Resolution:</td><td><%=resolution%></td></tr>
            <tr><td>Stdout logs:</td><td></td></tr>
            <tr><td colspan="2"><textarea rows="22" cols="110"><%=stdout%></textarea></td></tr>
            <tr><td>Stderr logs:</td><td></td></tr>
            <tr><td colspan="2"><textarea rows="22" cols="110"><%=stderr%></textarea></td></tr>
            <tr><td>Verbose output logs:</td><td></td></tr>
            <tr><td colspan="2"><textarea rows="22" cols="110"><%=verboseOutput%></textarea></td></tr>
        </table>
    </body>
</html>
