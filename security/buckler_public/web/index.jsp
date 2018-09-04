<%@page import="com.internal.pubsector.civilian.buckler.SupportedControllers"%>
<%@page import="com.internal.pubsector.civilian.buckler.Dispatcher"%>
<%response.sendRedirect(Dispatcher.getDispatchURL(SupportedControllers.launch, request));%>)