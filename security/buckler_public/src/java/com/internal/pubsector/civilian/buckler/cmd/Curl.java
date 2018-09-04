/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package com.internal.pubsector.civilian.buckler.cmd;

import com.internal.pubsector.civilian.buckler.managers.OverrideManager;

/**
 *
 * @author jowilson
 */
public class Curl {
    public static String getCurlCommand(String originIp, String hostHeader, String requestPath, Boolean ssl, String port) throws Exception {
        return getCurlCommand(originIp, hostHeader, requestPath, ssl, port, false, "-k -v --devnull", "\"");
    }
    
    private static String getCurlCommand(String originIp, String hostHeader, String requestPath, Boolean ssl, String port, Boolean sendPragmaHeaders, String flags, String quoteCharacter) throws Exception {
        if (quoteCharacter == null) {
            quoteCharacter = "\"";
        }
        
        StringBuilder sb = new StringBuilder("curl ");
        if (flags != null) {
            sb.append(flags);
        }
        
        sb.append(" ");
        sb.append(quoteCharacter);
        sb.append("http");
        
        if (ssl) {
            sb.append("s");
        }
        
        sb.append("://");
        sb.append(originIp);
        
        if (port != null && !"".equals(port)) {
            sb.append(":");
            sb.append(port);
        }
        
        sb.append(requestPath);
        sb.append(quoteCharacter);
        sb.append(" -H ");
        sb.append(quoteCharacter);
        sb.append("Host:");
        
        if (!"off".equals(OverrideManager.getHeaderSpaceChar())) {
            sb.append(" ");
        }
        
        sb.append(hostHeader);
        sb.append(quoteCharacter);
        
        if (sendPragmaHeaders) {
            sb.append(" -H ");
            sb.append(quoteCharacter);
            String pragmas = "Pragma: internal-x-cache-on, internal-x-cache-remote-on, internal-x-check-cacheable, internal-x-get-cache-key, internal-x-get-extracted-values, internal-x-get-nonces, internal-x-get-ssl-client-session-id, internal-x-get-true-cache-key, internal-x-serial-no";
            if ("off".equals(OverrideManager.getHeaderSpaceChar())) {
                pragmas = pragmas.replaceAll(" ", "");
            }
            sb.append(pragmas);
            sb.append(quoteCharacter);
        }
        
        return sb.toString();
    }
}
