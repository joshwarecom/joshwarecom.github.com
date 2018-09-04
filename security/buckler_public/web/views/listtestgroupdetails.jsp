<%-- 
    Document   : listtestgroupdetails
    Created on : Apr 9, 2016, 2:53:44 PM
    Author     : jowilson
--%>
<%@page import="com.internal.pubsector.civilian.buckler.Utilities"%>
<%@page import="static com.internal.pubsector.civilian.buckler.Utilities.htmlEncode"%>
<%@page import="com.internal.pubsector.civilian.buckler.Utilities.*"%>
<%@page import="com.internal.pubsector.civilian.buckler.objects.*"%>
<%@page import="com.internal.pubsector.civilian.buckler.SupportedControllers"%>
<%@page import="static com.internal.pubsector.civilian.buckler.Dispatcher.getDispatchURL"%>
<%@page import="java.util.*"%>
<%@page contentType="text/html" pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <title>Test Group Details</title>
    </head>
    <body>
        <%
            TestGroupDetailsArrayList list = (TestGroupDetailsArrayList)request.getAttribute("@modelOutput");        
            String sortBy = Utilities.blankIfNull(request.getParameter("sortby"));
            String order = Utilities.blankIfNull(request.getParameter("order"));
            boolean nosort = false;
            
            if (sortBy == null || "".equals(sortBy)) {
                nosort = true;
            }
            
            if (!"asc".equalsIgnoreCase(order) && !"desc".equalsIgnoreCase(order)) {
                order = "asc";
            }
            if (!"resolution".equalsIgnoreCase(sortBy)) {
                sortBy = "resolution";
            }
        %>
        <h1>ID: <%=htmlEncode(request.getParameter("id"))%></h1>
        <font size="+2"><b>ghost group id: <%=htmlEncode(list.getTestGroupMapId())%></b></font><br>
        <font size="+1"><b>scan start timestamp: <%=htmlEncode(Utilities.valueIfBlank(Utilities.blankIfNull(list.getStart()),"<unknown>"))%></b></font><br>
        <font size="+1"><b>scan end timestamp: <%=htmlEncode(Utilities.valueIfBlank(Utilities.blankIfNull(list.getEnd()),"<unknown>"))%></b></font><br>
        <br><br>
            <%
                Hashtable<String, Integer> sortableHash = new Hashtable<String, Integer>();
                ArrayList<Hashtable> srcList = new ArrayList<Hashtable>();
                for (int i = 0; i < list.size(); i++) {
                    Hashtable table = (Hashtable)list.get(i);
                    sortableHash.put(table.get(sortBy).toString()+"_"+i, new Integer(i));
                    srcList.add(table);
                }
                ArrayList sortedIndex = new ArrayList(sortableHash.keySet()); 
                
                if (!nosort) {
                    Collections.sort(sortedIndex);
                    if ("desc".equalsIgnoreCase(order)) {
                        Collections.reverse(sortedIndex);
                    }
                }
                Hashtable<String,String> nextOrder = new Hashtable<String,String>();                
                String nextSort = ("asc".equalsIgnoreCase(order)) ? "desc" : "sort";
                if (!nosort) {
                    nextOrder.put(sortBy, nextSort);
                }
            %>
        <table>
            <tr><td width="45">ghost</td><td width="45">origin</td><td width="45">port</td><td width="45">host</td><td width="45">path</td><td>ssl</td><td width="200">testid</td><td width="55">status</td><td><a href="<%=getDispatchURL(SupportedControllers.listtestgroupdetails, request)%>&id=<%=list.getTestGroupId()%>&sortby=resolution&order=<%=Utilities.blankIfNull(nextOrder.get("resolution"))%>">resolution</a></td><td>link to logs</td></tr>
            <%
                for (int i = 0; i < sortedIndex.size(); i++) {
                    Integer index = sortableHash.get(sortedIndex.get(i));
                    Hashtable table = srcList.get(index.intValue());
            %>
            <tr>
                <td><font size="-2"><%=table.get("ghostIp")%></font></td><td><font size="-2"><%=table.get("originIp")%></font></td><td><font size="-2"><%=table.get("originPort")%></font></td><td><font size="-2"><%=table.get("hostHeader")%></font></td><td><font size="-2"><%=table.get("requestPath")%></font></td><td><font size="-2"><%=table.get("ssl")%></font></td><td><font size="-2"><%=table.get("testId")%></font></td><td><font size="-2"><%=table.get("status")%></font></td><td><font size="-2"><%=table.get("resolution")%></font></td><td><font size="-2"><a href="<%=getDispatchURL(SupportedControllers.viewtestlogs, request)%>&groupId=<%=htmlEncode((String)table.get("groupId"))%>&testId=<%=htmlEncode((String)table.get("testId"))%>"><b>logs</b></a></font></td>
            </tr>
            <%
                }
            %>
                
        </table>
    </body>
</html>
