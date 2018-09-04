/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package com.internal.pubsector.civilian.buckler.objects;

import com.internal.pubsector.civilian.buckler.Utilities;
import com.internal.pubsector.civilian.buckler.models.ModelInterface;
import com.internal.pubsector.civilian.buckler.objects.ConnectionTest;
import com.internal.pubsector.civilian.buckler.objects.DiskRecord;
import java.util.UUID;
import java.util.ArrayList;
import java.util.Date;
import java.util.Hashtable;
import java.util.List;

/**
 *
 * @author jowilson
 */
public class ConnectionTestGroup implements ModelInterface {
    UUID testGroupId = UUID.randomUUID();
    String testGroupName = null;
    String testGroupMapId = null;
    ConnectionTest[] tests = null;
    Hashtable<String, ConnectionTest> connectionTestMap = new Hashtable<String, ConnectionTest>();
    boolean saved = false;
    boolean userAborted = false;
    String start = "";
    String end = "";
    
    public ConnectionTestGroup(String name, String mapId, ArrayList<ConnectionTest> ts, String st) {
        testGroupName = name;
        testGroupMapId = mapId;
        tests = new ConnectionTest[ts.size()];
        for (int i = 0; i < tests.length; i++) {
            tests[i] = ts.get(i);
            connectionTestMap.put(tests[i].getTestId(), tests[i]);
        }
        start = st;
    }
    
    public String getStart() {
        return start;
    }    

    public String getEnd() {
        return end;
    }    
    
    public void setEnd(String s) {
        end = s;
    }    

    public String getTestGroupName() {
        return testGroupName;
    }

    public String getTestGroupMapId() {
        return testGroupMapId;
    }

    public String getTestGroupId() {
        return testGroupId.toString();
    }
    
    public void setTestGroupId(String id) {
        testGroupId = UUID.fromString(id);
    }
    
    public Integer getConnectionTestCount() {
        return new Integer(tests.length);
    }
    
    public ConnectionTest getTestByIndex(int i) {
        if (i >= 0 && i < tests.length) {
            return tests[i];
        }
        return null;
    }
    
    public ConnectionTest getTestById(String id) {
        return connectionTestMap.get(id);
    }
    
    public void markSaved() {
        saved = true;
    }    

    public void markUnsaved() {
        saved = false;
    }
    
    public boolean isSaved() {
        return saved;
    }
    
    public void markAborted() {
        userAborted = true;
    }    

    public void markUnaborted() {
        userAborted = false;
    }
    
    public boolean isAborted() {
        return userAborted;
    }

    public List<DiskRecord> exportToDiskRecords(String rootPath) {
        StringBuilder targetPath = new StringBuilder(rootPath);
        boolean doCreateDir = true;
        targetPath.append("/");
        targetPath.append(getTestGroupId());
        
        String targetFile = "group.idlist";
        String targetDataFile = "group.data";
        
        StringBuilder content = new StringBuilder("");
        
        for (int i = 0; i < tests.length; i++) {
            content.append(tests[i].getTestId());
            content.append("\n");
        }
        
        ArrayList<DiskRecord> testRecords = new ArrayList<DiskRecord>();
        
        DiskRecord groupRecord = new DiskRecord(targetPath.toString(), targetFile, content.toString(), doCreateDir);        
        testRecords.add(groupRecord);
        
        content = new StringBuilder("");
        content.append("name=");
        content.append(getTestGroupName());
        content.append("\nmapId=");
        content.append(getTestGroupMapId());
        content.append("\nstart=");
        content.append(start);
        content.append("\nend=");
        content.append(end);

        DiskRecord groupDataRecord = new DiskRecord(targetPath.toString(), targetDataFile, content.toString(), doCreateDir);
        testRecords.add(groupDataRecord);
        
        //DiskRecord[] testRecords = new DiskRecord[tests.length+1];
        //testRecords[0] = groupRecord;
        for (int i = 1; i <= tests.length; i++) {
            //testRecords[i] = tests[i-1].exportToDiskRecord(targetPath.toString());
            List<DiskRecord> tmpTestRecords = tests[i-1].exportToDiskRecords(targetPath.toString());
            for (int j = 0; j < tmpTestRecords.size(); j++) {
                testRecords.add(tmpTestRecords.get(j));
            }
        }
        
        return testRecords;
    }
    
    public DiskRecord exportGroupDataRecordOnly(String rootPath) {
        StringBuilder targetPath = new StringBuilder(rootPath);
        boolean doCreateDir = true;
        targetPath.append("/");
        targetPath.append(getTestGroupId());
        
        String targetDataFile = "group.data";
        
        StringBuilder content = new StringBuilder("");
        
        for (int i = 0; i < tests.length; i++) {
            content.append(tests[i].getTestId());
            content.append("\n");
        }
                
        content = new StringBuilder("");
        content.append("name=");
        content.append(getTestGroupName());
        content.append("\nmapId=");
        content.append(getTestGroupMapId());
        content.append("\nstart=");
        content.append(start);
        content.append("\nend=");
        content.append(end);

        DiskRecord groupDataRecord = new DiskRecord(targetPath.toString(), targetDataFile, content.toString(), doCreateDir);
        return groupDataRecord;
    }    
        
}
