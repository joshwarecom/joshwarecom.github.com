<%-- 
    Document   : addnewmap
    Created on : Apr 25, 2016, 11:24:36 AM
    Author     : jowilson
--%>

<%@page contentType="text/html" pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html>
    <head>
        <%
        String title = "Add New Ghost Group";
        String text = "Ghost Group added successfully.";
        if (request.getParameter("edit") != null) {
            title = "Update Existing Ghost Group";
            text = "Ghost Group updated successfully.";
        }
        %>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <title><%=title%></title>
    </head>
    <body>
        <h1><%=text%></h1>
    </body>
</html>
