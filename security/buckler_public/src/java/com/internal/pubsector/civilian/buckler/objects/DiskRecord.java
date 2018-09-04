/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package com.internal.pubsector.civilian.buckler.objects;

import java.io.BufferedWriter;
import java.io.File;
import java.io.FileWriter;
import java.io.BufferedReader;
import java.io.FileReader;
import com.internal.pubsector.civilian.buckler.Utilities;
import static com.internal.pubsector.civilian.buckler.Utilities.logInfo;

/**
 *
 * @author jowilson
 */
public class DiskRecord {
    String dirPath = null;
    String fileName = null;
    StringBuilder content = new StringBuilder("");
    boolean doCreateDir = false;
    
    public DiskRecord(String path, String name, String c, boolean i) {
        dirPath = path;
        fileName = name;
        if (c != null) {
            content = new StringBuilder(c);
        }
        doCreateDir = i;
    }
    
    public void writeMe() throws Exception {
        if (doCreateDir) {
            if (!(new File(dirPath).isDirectory())) {
                if (!(new File(dirPath).mkdir())) {
                    throw new Exception("Could not create directory: " + dirPath);
                }
            }
        }
        StringBuilder targetFile = new StringBuilder(dirPath);
        targetFile.append("/");
        targetFile.append(fileName);
        BufferedWriter writer = new BufferedWriter(new FileWriter(new File(targetFile.toString())));
        writer.write(content.toString());
        writer.close();
    }
}
