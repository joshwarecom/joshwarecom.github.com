<%-- 
    Document   : testindex
    Created on : Jan 28, 2016, 12:57:44 PM
    Author     : jowilson
--%>
<%@page import="com.internal.pubsector.civilian.buckler.cmd.*"%>
<%@page contentType="text/html" pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <title>Test Commands</title>
    </head>
    <body>
        <h1>Generated Syntax for Common Commands</h1>
        <ul>
            <li>HTTP CURL: <%=Curl.getCurlCommand("31.170.162.12", "luckydukes.com", "/", false, "80")%></li>
            <li>HTTPS CURL: <%=Curl.getCurlCommand("31.170.162.12", "luckydukes.com", "/", true, "80")%></li>
            <li>Remote NSH Echo: <%=Nsh.getNshCommand("165.254.92.145", "echo Hello, NSH")%></li>            
            <li>Remote NSH HTTP Curl: <%=Nsh.getNshCommand("165.254.92.145", Curl.getCurlCommand("31.170.162.12", "luckydukes.com", "/", false, "80"))%></li>                        
            <li>SSH -&gt; Remote NSH HTTP Curl via LSG: <%=Ssh.getSshCommand("jowilson", "/usr/local/apache-tomcat-7.0.34/.ssh/sym.key.deployed", "lsg-west", Nsh.getNshCommand("165.254.92.145", Curl.getCurlCommand("31.170.162.12", "luckydukes.com", "/", false, "80")))%></li>
        </ul>
    </body>
</html>
