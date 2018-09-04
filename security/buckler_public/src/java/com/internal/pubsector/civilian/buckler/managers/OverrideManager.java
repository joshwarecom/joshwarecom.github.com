/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package com.internal.pubsector.civilian.buckler.managers;

import com.internal.pubsector.civilian.buckler.Utilities;
import com.internal.pubsector.civilian.buckler.models.CommanderModel;
import java.io.File;
import java.io.FileNotFoundException;
import java.util.Hashtable;
import java.util.Scanner;

/**
 *
 * @author jowilson
 */
public class OverrideManager {
    
    static boolean initialized = false;
    static Exception e = null;
    static Hashtable<String, String> dataTable = new Hashtable<String, String>();
    
    public static void init(String skp) throws Exception {
        
        String[] overrideFiles = Utilities.blankIfNull(skp).split(",");
        for (int i = 0; i < overrideFiles.length; i++) {
            try {
            File tmpFile = null;
            Scanner tmpScanner = null;
            
            tmpFile = new File(overrideFiles[i]);
            tmpScanner = new Scanner( tmpFile );
            tmpScanner.useDelimiter("\\A");
            String fileData = tmpScanner.next();
            tmpScanner.close();
            tmpFile = null;
            
            String[] data = fileData.split("\n");
            for (int j = 0; j < data.length; j++) {
                if (!"".equals(data[j])) {
                    String[] keyValue = data[j].split("=");
                    if (keyValue.length < 2) {
                        dataTable.put(keyValue[0], "");
                    }
                    else {
                        dataTable.put(keyValue[0], Utilities.blankIfNull(keyValue[1]));
                    }
                }
            }
            } catch (FileNotFoundException e) {
            //ignore FileNotFoundException;
            }
        }
        initialized = true;
    }
    
    public static boolean isInitialized() {
        return initialized;
    }
    
    public static Exception getException() {
        return e;
    }
    
    public static String getOverrideLoginName() {
        return dataTable.get("loginName");
    }
    
    public static String getOverrideSymKeyPath() {
        return dataTable.get("symKeyPath");
    }

    public static String getOverrideLsgHost() {
        return dataTable.get("lsgHost");
    }        
    
    public static String getHeaderSpaceChar() {
        return dataTable.get("headerSpaceChar");
    }        
    
}
