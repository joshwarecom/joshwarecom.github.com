<%-- 
    Document   : testindex
    Created on : Jan 28, 2016, 12:57:44 PM
    Author     : jowilson
--%>
<%@page import="com.internal.pubsector.civilian.buckler.SupportedControllers"%>
<%@page import="static com.internal.pubsector.civilian.buckler.Dispatcher.getDispatchURL"%>
<%@page contentType="text/html" pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <title>Index of Test Functions</title>
    </head>
    <body>
        <h1>Index of Test Functions...</h1>
        <ul>
            <li><a href="<%=getDispatchURL(SupportedControllers.testcommands, request)%>">Generate Syntax for Common Commands</a><br><br></li>
            <li>Do Remote Curl w/ Default Key:
                <ul>
                    <form action="<%=getDispatchURL(SupportedControllers.doremotecurl, request)%>" method="POST">
                    <li>internal IP: <input type="input" name="internalIp" value="165.254.92.145"></li>
                    <li>Origin IP: <input type="input" name="originIp" value="31.170.162.12"></li>
                    <li>Host Header: <input type="input" name="hostHeader" value="luckydukes.com"></li>
                    <li>Request path: <input type="input" name="requestPath" value="/"></li>
                    <li>SSL? <input type="checkbox" name="ssl"></li>
                    <li><input type="submit" name="submit" value="go!"></li>
                    </form>
                </ul><br><br>
            </li>     
            <li>Do Remote Echo (Key Test):
                <ul>
                    <form action="<%=getDispatchURL(SupportedControllers.doremoteecho, request)%>" method="POST">
                    <li>Login name: <input type="input" name="loginName" value="jowilson"></li>
                    <li>Key file: <input type="input" name="keyFile" value="/usr/local/apache-tomcat-7.0.34/.ssh/sym.key.deployed"></li>
                    <li><input type="submit" name="submit" value="go!"></li>
                    </form>
                </ul><br><br>
            </li>
            <li>Do Remote Sql2 (Query Test):
                <ul>
                    <form action="<%=getDispatchURL(SupportedControllers.doremotesql2, request)%>" method="POST">
                    <li>SQL Query: <input type="input" name="sql" value="select distinct(service) from maprule_info where maprule_id = 5352"></li>
                    <li><input type="submit" name="submit" value="go!"></li>
                    </form>
                </ul><br><br>
            </li>
            <li>Do Snail Scan:
                <ul>
                    <form action="<%=getDispatchURL(SupportedControllers.dosnailscan, request)%>" method="POST">
                    <li>Space delimited cidr list: <input type="input" name="cidrList" value=""></li>
                    <li><input type="submit" name="submit" value="go!"></li>
                    </form>
                </ul><br><br>
            </li>
            
        </ul>
    </body>
</html>
