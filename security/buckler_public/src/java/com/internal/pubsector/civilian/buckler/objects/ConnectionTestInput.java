/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package com.internal.pubsector.civilian.buckler.objects;

/**
 *
 * @author jowilson
 */
public class ConnectionTestInput {
    String ghostIp = null;
    String originIp = null;
    Integer originPort = null;
    String hostHeader = null;
    String requestPath = null;
    Boolean ssl = null;    
    
    public ConnectionTestInput(String g, String o, Integer port, String h, String p, Boolean s) {
        ghostIp = g;
        originIp = o;
        originPort = port;
        hostHeader = h;
        requestPath = p;
        ssl = s;
    }
    
    public String getGhostIp() { return ghostIp;}
    public String getOriginIp() { return originIp;}
    public String getOriginPort() { if (originPort != null) return originPort.toString(); else return ""; };
    public String getHostHeader() { return hostHeader;}
    public String getRequestPath() { return requestPath;}
    public Boolean getSSL() { return ssl;}
}
