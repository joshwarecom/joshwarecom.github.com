<%-- 
    Document   : viewwrapper
    Created on : May 16, 2016, 10:27:36 AM
    Author     : jowilson
--%>

<%@page contentType="text/html" pageEncoding="UTF-8"%>
<%@page import="static com.internal.pubsector.civilian.buckler.Dispatcher.getDispatchURL"%>
<!DOCTYPE html>
<html style="height: 85%;">
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <title>View Wrapper</title>
        <script>
            function getOpenerDocument() {
                return window.opener.document;
            }
            
            function incrementTimer() {
                document.getElementById("timeSlot").innerHTML++;
                setTimeout("incrementTimer()", 1000);
            }
            
        </script>        
    </head>
    <body bgcolor="#000000" style="height: 100%;" onload="incrementTimer();">
        <div style="height: 100%; width: 100%;">
            <iframe src="<%=getDispatchURL(request.getParameter("view"), request)%>" style="width: 100%; height: 100%;">
        </iframe>
        </div>
        <div style="margin-top: 5px;" align="right">
            <font color="#FFFFFF" id="timeSlot">0</font>
        </div>
    </body>
</html>
