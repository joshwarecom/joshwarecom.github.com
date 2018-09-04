<%-- 
    Document   : launch
    Created on : Apr 12, 2016, 3:08:59 PM
    Author     : jowilson
--%>
<%@page import="com.internal.pubsector.civilian.buckler.SupportedControllers"%>
<%@page import="static com.internal.pubsector.civilian.buckler.Dispatcher.getDispatchURL"%>
<%@page contentType="text/html" pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <title>Welcome to Buckler v1.0a</title>
    </head>
<frameset cols="22%,78%">
  <frame src="<%=getDispatchURL(SupportedControllers.launchmenu, request)%>">
  <frame name="appPage" src="static/splash.html">
</frameset> 
</html>
