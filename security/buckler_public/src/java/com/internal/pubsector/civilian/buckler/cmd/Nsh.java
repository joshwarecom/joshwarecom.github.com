/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package com.internal.pubsector.civilian.buckler.cmd;

/**
 *
 * @author jowilson
 */
public class Nsh {
    
    final static String localNshPath = "/usr/local/internal/bin/nsh";
    
    public static String getNshCommand(String internalIp, String childCommand) throws Exception {
        return getNshCommand(internalIp, childCommand, localNshPath);        
    }
    
    private static String getNshCommand(String internalIp, String childCommand, String overrideNshPath) throws Exception {
        if (childCommand == null || "".equals(childCommand)) {
            throw new Exception("getNshCommand: childCommand argument may not be null or blank.");
        }
        else if (!childCommand.matches("[a-zA-Z0-9 \\./\\\\\\-\\:'\",_]+")) {
            throw new Exception("getNshCommand regex failed [a-zA-Z0-9 \\./\\\\\\-\\:'\",_]+; illegal characters in childCommand parameter: " + childCommand);
        }
        
        StringBuilder sb;
        if (overrideNshPath != null) {
            sb = new StringBuilder(overrideNshPath);
        }
        else {
            sb = new StringBuilder("nsh");
        }
        sb.append(" ");
        sb.append(internalIp);
        sb.append(" ");
        sb.append(childCommand);
        return sb.toString();
    }
}
