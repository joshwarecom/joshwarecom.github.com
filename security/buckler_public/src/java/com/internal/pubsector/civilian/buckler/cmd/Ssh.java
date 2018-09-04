/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package com.internal.pubsector.civilian.buckler.cmd;

/**
 *
 * @author jowilson
 */
public class Ssh {
    
    private static String getSshCommand(String loginName, String keyFilePath, String hostName, String childCommand, String flags, Boolean verbose) throws Exception {        
        if (childCommand == null || "".equals(childCommand)) {
            throw new Exception("getSshCommand: childCommand argument may not be null or blank.");
        }
        else if (!childCommand.matches("[=`a-zA-Z0-9 \\./\\\\\\-\\:'\",_\\(\\)\\>]+")) {
            throw new Exception("getSshCommand regex failed [=`a-zA-Z0-9 \\./\\\\\\-\\:'\",_\\(\\)\\>]+; illegal characters in childCommand parameter: " + childCommand);
        }
        
        if (hostName == null || "".equals(hostName)) {
            throw new Exception("getSshCommand: hostName may not be null or blank.");
        }
        
        if (loginName == null || "".equals(loginName)) {
            throw new Exception("getSshCommand: loginName may not be null or blank.");
        }

        if (keyFilePath == null || "".equals(keyFilePath)) {
            throw new Exception("getSshCommand: keyFilePath may not be null or blank.");
        }

        StringBuilder sb = new StringBuilder("ssh ");
        if (flags != null) {
            sb.append(flags);
            sb.append(" ");
        }
        
        if (verbose) {
            sb.append("-vvv ");
        }
        
        sb.append("-l ");
        sb.append(loginName);
        sb.append(" ");
        sb.append("-i ");
        sb.append(keyFilePath);
        sb.append(" ");

        sb.append(hostName);
        sb.append(" ");
        sb.append(childCommand);
        return sb.toString();
    }
    
    public static String getSshCommand(String loginName, String keyFilePath, String hostName, String childCommand) throws Exception {
        return getSshCommand(loginName, keyFilePath, hostName, childCommand, "-ttq2A -o UserKnownHostsFile=/dev/null -o StrictHostKeyChecking=no", false);
    }    
    
    public static String getSshCommand(String loginName, String keyFilePath, String hostName, String childCommand, boolean verbose) throws Exception {
        return getSshCommand(loginName, keyFilePath, hostName, childCommand, "-ttq2A -o UserKnownHostsFile=/dev/null -o StrictHostKeyChecking=no", verbose);
    }    
    
}
