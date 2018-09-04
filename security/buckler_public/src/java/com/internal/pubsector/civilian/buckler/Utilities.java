/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package com.internal.pubsector.civilian.buckler;

import org.apache.commons.net.util.SubnetUtils;
import org.apache.commons.net.util.SubnetUtils.SubnetInfo;
import java.io.*;
import java.util.logging.*;

/**
 *
 * @author jowilson
 */
public class Utilities {
    final static Logger logger = Logger.getLogger(Utilities.class.toString());
        
    private static String[] getIpsFromCidr(String cidr, Boolean inclusiveHostCount) throws Exception {
	SubnetUtils utils = new SubnetUtils(cidr);
        utils.setInclusiveHostCount(inclusiveHostCount);
	SubnetInfo info = utils.getInfo();
        return info.getAllAddresses();
    } 

    public static String[] getIpsFromCidr(String cidr) throws Exception {
        return getIpsFromCidr(cidr, true);
    }
        
    public static String blankIfNull(String input) throws Exception {
        if (input == null) { 
            return "";
        }
        return input;
    }

    public static String valueIfNull(String input, String value) throws Exception {
        if (input == null) { 
            return value;
        }
        return input;
    }
    
    public static String valueIfBlank(String input, String value) throws Exception {
        if ("".equals(input)) { 
            return value;
        }
        return input;
    }

    public static String firstElementOrNull(String[] input) throws Exception {
        if (input != null) {
            if (input.length > 0) {
                return input[0];
            }
        }
        return null;
    }
    
    public static String sanitizeName(String input) throws Exception {
        return blankIfNull(input).replaceAll("[^A-Za-z0-9]", "");
    }
    
    public static String htmlEncode(String s)
    {
        StringBuffer out = new StringBuffer();
        for(int i=0; i<s.length(); i++)
        {
            char c = s.charAt(i);
            if(c > 127 || c=='"' || c=='<' || c=='>')
            {
               out.append("&#"+(int)c+";");
            }
            else
            {
                out.append(c);
            }
        }
        return out.toString();
    }
    
    public static String getStackTrace(Throwable aThrowable) {
        final Writer result = new StringWriter();
        final PrintWriter printWriter = new PrintWriter(result);
        aThrowable.printStackTrace(printWriter);
        return result.toString();
    }       
    
    public static void log(Level level, String str) {
        logger.log(level, str);
    }
    
    public static void logInfo(String str) {
        logger.log(Level.INFO, str);
    }    

    public static void logWarning(String str) {
        logger.log(Level.WARNING, str);
    }    

    public static void logSevere(String str) {
        logger.log(Level.SEVERE, str);
    }    
}
