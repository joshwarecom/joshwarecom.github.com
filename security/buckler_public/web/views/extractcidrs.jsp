<%-- 
    Document   : extractcidrs
    Created on : May 14, 2016, 11:42:20 AM
    Author     : jowilson
--%>

<%@page contentType="text/html" pageEncoding="UTF-8"%>
<%@page import="java.util.*"%>
<%@page import="static com.internal.pubsector.civilian.buckler.Dispatcher.getLoadingAnimationURL"%>
<!DOCTYPE html>
<html>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <title>Extracting Ghost IPs from CIDRs...</title>
        <script>
            function submitExtractionForm() {
                loadingAnimation = document.getElementById("loadingAnimation");
                if (loadingAnimation != null) {
                    loadingAnimation.style.display = "block";
                }
                whichForm = document.getElementById('extractionForm');
                whichForm.submit();
            }
        </script>
    </head>
    <body onload="init();" bgcolor="#FFFFFF">
        <%
        if ("get".equalsIgnoreCase(request.getMethod())) {
        %>
        <form method="POST" id="extractionForm">
        <input type="hidden" value="" name="cidrList">
        <input type="hidden" value="1" name="step">
        </form>        
        <script>
            function init() {
                openerDocument = window.top.getOpenerDocument();
                manualCIDRList = openerDocument.getElementsByName('manualGhostCIDRList')[0].value;
                
                setMe = document.getElementsByName("cidrList")[0];
                setMe.value = manualCIDRList;
                
                submitExtractionForm();
            }
        </script>        
        <%
        } else if ("post".equalsIgnoreCase(request.getMethod())) {
            if ("1".equals(request.getParameter("step"))) {    
                List<String> ipList = (List<String>)request.getAttribute("@modelOutput");
                StringBuilder sb = new StringBuilder("");
                if (ipList != null) {
                for (int i = 0; i < ipList.size(); i++) {
                    if (i > 0) sb.append(" ");
                        sb.append(ipList.get(i));
                    }
                }                
        %>
                Step 1 of 2 successful: CIDR blocks expanded to <%=ipList.size()%> possible IP addresses.<br><br>
                Executing remote query in 3 seconds, this can take several minutes...<br>
                <center><div id="loadingAnimation" style="display: none;"><img src="<%=getLoadingAnimationURL(request)%>"></div></center>
                <form method="POST" id="extractionForm">
                <input type="hidden" value="" name="ipList">
                <input type="hidden" value="" name="mapruleId">
                <input type="hidden" value="" name="network">        
                <input type="hidden" value="2" name="step">
                </form>                
                <script>
                    function init() {
                        openerDocument = window.top.getOpenerDocument();                
                        openerDocument.rawIpList = "<%=sb.toString()%>";
                        openerDocument.getElementsByName("extractedGhostIPList")[0].value = openerDocument.rawIpList;

                        setMe = document.getElementsByName("ipList")[0]
                        setMe.value = openerDocument.rawIpList;

                        network = openerDocument.getElementsByName('network')[0];
                        if (network.checked) {
                            network = "freeflow";
                        }
                        else {
                            network = "essl";
                        }

                        setMe = document.getElementsByName("network")[0];
                        setMe.value = network;

                        mapruleId = openerDocument.getElementsByName('mapruleId')[0].value;
                        setMe = document.getElementsByName("mapruleId")[0];
                        setMe.value = mapruleId;

                        setTimeout("submitExtractionForm()", 3000);
                    }
                </script>
        <%
            } else if ("2".equals(request.getParameter("step"))) {
                List<String> ipList = (List<String>)request.getAttribute("@modelOutput");
                StringBuilder sb = new StringBuilder("");
                if (ipList != null) {
                for (int i = 0; i < ipList.size(); i++) {
                    if (i > 0) sb.append(" ");
                        sb.append(ipList.get(i));
                    }
                }      
                
                if (!"".equals(sb.toString())) {
            %>
                Step 2 of 2 successful - query returned <%=ipList.size()%> IPs.<br><br>
                
                <div id="message"></div>
                <script>
                    function init() {
                        openerDocument = window.top.getOpenerDocument();                
                        openerDocument.getElementsByName("extractedGhostIPList")[0].value = "<%=sb.toString()%>";
                        
                        manualCIDRList = openerDocument.getElementsByName('manualGhostCIDRList')[0].value;
                        extractedIPList = openerDocument.getElementsByName("extractedGhostIPList")[0].value;
                        
                        cidrArray = manualCIDRList.split(" ");
                        ipArray = extractedIPList.split(" ");
                        uniqueCidrs = Array();
                        returnedCidrs = Array();
                        missingList = Array();

                        for(i = 0; i < ipArray.length; i++) {
                            tmp = ipArray[i].substr(0,ipArray[i].lastIndexOf(".")+1);
                            if (returnedCidrs[tmp] == null) {
                                returnedCidrs[tmp] = ipArray[i];
                            }                            
                            ipArray[i] = tmp;
                        }

                        for(i = 0; i < cidrArray.length; i++) {
                            tmp = cidrArray[i].substr(0,cidrArray[i].lastIndexOf(".")+1);
                            if (uniqueCidrs[tmp] == null) {
                                uniqueCidrs[tmp] = cidrArray[i];
                                if (returnedCidrs[tmp] == null) {
                                    missingList[missingList.length] = cidrArray[i];
                                }                                
                            }
                            cidrArray[i] = tmp;                            
                        }
                        
                        if (missingList.length == 0) {
                            msg = "Window closing in 5 seconds.";
                            document.getElementById("message").innerHTML = msg;
                            setTimeout("window.top.close()", 5000);
                        }
                        else {
                            mapruleId = parseInt(openerDocument.getElementsByName('mapruleId')[0].value);
                            msg = "WARNING: no regions were found for the following CIDRs<br><hr><ul>";
                            for (i = 0; i < missingList.length; i++) {
                                msg += "<li>" + missingList[i] + "</li>";
                            }
                            msg += "</ul><br>";
                            msg += "Consider adding IPs for these CIDRs manually; they may possibly be found at:<br>";
                            msg += "<a href=\"https://www.nocc.internal.com/mapzone.cgi?id=" + mapruleId + "\" target=\"_blank\">https://www.nocc.internal.com/mapzone.cgi?id=" + mapruleId + "</a><br><br>";
                            msg += "<a href=\"javascript:window.top.close();\">Close this window when you are ready to continue.</a>";
                            document.getElementById("message").innerHTML = msg;                            
                        }
                    }
                </script>
            <%
                } else {
%>
                Step 2 of 2: ERROR - query returned no regions for those CIDRs.<br><br>
                Retrying in 30 seconds...<br><br>
                <center><div id="loadingAnimation" style="display: none;"><img src="<%=getLoadingAnimationURL(request)%>"></div></center>
                <form method="POST" id="extractionForm">
                <input type="hidden" value="" name="ipList">
                <input type="hidden" value="" name="mapruleId">
                <input type="hidden" value="" name="network">        
                <input type="hidden" value="2" name="step">
                </form>                                
                <script>
                    function init() {
                        openerDocument = window.top.getOpenerDocument();                

                        setMe = document.getElementsByName("ipList")[0]
                        setMe.value = openerDocument.rawIpList;

                        network = openerDocument.getElementsByName('network')[0];
                        if (network.checked) {
                            network = "freeflow";
                        }
                        else {
                            network = "essl";
                        }

                        setMe = document.getElementsByName("network")[0];
                        setMe.value = network;

                        mapruleId = openerDocument.getElementsByName('mapruleId')[0].value;
                        setMe = document.getElementsByName("mapruleId")[0];
                        setMe.value = mapruleId;
                        setTimeout("submitExtractionForm()", 30000);
                    }
                </script>
<%
                }
            }
            %>
        <%  
        }
        else {
        %>
        Request method <%=request.getMethod()%> not supported on this function.        
        <script>
            function init() {
            }
        </script>
        <%
        }
        %>
    </body>
</html>
