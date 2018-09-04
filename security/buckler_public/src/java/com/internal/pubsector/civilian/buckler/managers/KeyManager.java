/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package com.internal.pubsector.civilian.buckler.managers;

import com.internal.pubsector.civilian.buckler.Utilities;
import com.internal.pubsector.civilian.buckler.models.CommanderModel;

/**
 *
 * @author jowilson
 */
public class KeyManager {
    
    static String symKeyPath = null;
    static String extractedLoginName = null;
    static boolean initialized = false;
    static Exception e = null;
    
    public static void init(String skp) throws Exception {
        String tmp = OverrideManager.getOverrideSymKeyPath();
        if (tmp != null) {
            symKeyPath = tmp;
        }
        else {
            symKeyPath = skp;
        }
        
        if (!OverrideManager.isInitialized()) {
            throw (e=(new Exception("OverrideManager must be initialized before KeyManager.")));            
        }
        
        tmp = OverrideManager.getOverrideLoginName();
        if (tmp != null) {
            extractedLoginName = tmp;
        }
        Utilities.logInfo("Test change...\n");
        Utilities.logInfo("Listing key sym path:\n");
        String keyEntry = Utilities.blankIfNull(CommanderModel.doList(symKeyPath, true).getStdout());
        Utilities.logInfo(keyEntry);
        String[] entryComponents = keyEntry.split(" ");
        String keyTarget = "";
        if (entryComponents.length >= 10) {
            keyTarget = entryComponents[9];
        }
        if (!"".equals(keyTarget)) {
            Utilities.logInfo("Target of symbolic key link: " + keyTarget);
            String[] keyComponents = keyTarget.split("/");
            if (keyComponents.length >= 3) {
                if (extractedLoginName == null) {
                    extractedLoginName = keyComponents[2];
                }
                else {
                    Utilities.logInfo("Overridden loginName:" + extractedLoginName + "\n");
                }
                Utilities.logInfo("Key path is: " + getSymKeyPath());
                Utilities.logInfo("Login name is: " + getExtractedLoginName());
            }
            else {
                if (extractedLoginName == null) {
                    throw (e=(new Exception("Cannot extract user name from key target components (" + keyTarget + "), application cannot initialize.")));
                }
            }
            
        }
        else {
            Utilities.logInfo("Key sym link has no target! Abort.");
            throw (e=(new Exception("Key is not loaded correctly; application cannot initialize.")));
        }
        initialized = true;
    }
    
    public static boolean isInitialized() {
        return initialized;
    }
    
    public static Exception getException() {
        return e;
    }
    
    public static String getExtractedLoginName() {
        return extractedLoginName;
    }
    
    public static String getSymKeyPath() {
        return symKeyPath;
    }
    
}
