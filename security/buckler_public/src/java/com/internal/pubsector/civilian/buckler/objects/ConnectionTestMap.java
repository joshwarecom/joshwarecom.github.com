/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package com.internal.pubsector.civilian.buckler.objects;

import java.net.InetAddress;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
/**
 *
 * @author jowilson
 */
public class ConnectionTestMap {
    UUID mapId = UUID.randomUUID();
    String internalLogin = "";
    String descriptiveMapName = "";
    String mapNotes = "";
    
    boolean extractedFromCIDRs = false;
    boolean includedManualGhosts = false;
    boolean queriedCurrentGhosts = false;
    boolean queriedFutureGhosts = false;
    
    String network = "";
    String mapruleId = "";
    String manualIPList = "";
    String manualCIDRList = "";
    String extractedIPList = "";
    String currentSourceMap = "";
    String queriedCurrentIPList = "";
    String futureSourceMap = "";
    String queriedFutureIPList = "";    
    
    InetAddress[] masterGhostIPList = null;
    boolean saved = false;    
    
    public ConnectionTestMap(String inputLogin, String inputMapName, boolean inputExtracted, boolean inputManual, boolean inputCurrent, boolean inputFuture, String inputManualIPList, String inputManualCIDRList, String inputExtractedIPList, String inputCurrentSourceMap, String inputQueriedCurrentIPList, String inputFutureSourceMap, String inputQueriedFutureIPList, InetAddress[] inputMasterGhostIPList, String inputNetwork, String inputMaprule, String notes) {
        internalLogin = inputLogin;
        descriptiveMapName = inputMapName;
        extractedFromCIDRs = inputExtracted;
        includedManualGhosts = inputManual;
        queriedCurrentGhosts = inputCurrent;
        queriedFutureGhosts = inputFuture;
        manualIPList = inputManualIPList;
        manualCIDRList = inputManualCIDRList;
        extractedIPList = inputExtractedIPList;
        currentSourceMap = inputCurrentSourceMap;
        queriedCurrentIPList = inputQueriedCurrentIPList;
        futureSourceMap = inputFutureSourceMap;
        queriedFutureIPList = inputQueriedFutureIPList;    
        masterGhostIPList = inputMasterGhostIPList;
        network = inputNetwork;
        mapruleId = inputMaprule;
        mapNotes = notes;
    }
    
    public void setMapId(UUID id) {
        mapId = id;
    }
    
    public void setMapId(String str) {
        mapId = UUID.fromString(str);
    }

    public String getMapId() {
        return mapId.toString();
    }
    
    public String getMapName() {
        return descriptiveMapName;
    }
    
    public String getMapNotes() {
        return mapNotes;
    }

    public InetAddress[] getMasterGhostIPList() {
        return masterGhostIPList;
    }
    
    public String getinternalLogin() { return internalLogin; }
    
    public boolean didIncludeManualGhostIPs() {
        return includedManualGhosts;
    }
    public String getManualIPList() { return manualIPList; }
    
    public boolean didIncludeExtractedGhostIPs() {
        return extractedFromCIDRs;
    }
    public String getExtractedIPList() { return extractedIPList; }
    public String getManualCIDRList() { return manualCIDRList; }    
    
    public void markSaved() {
        saved = true;
    }

    public void markUnsaved() {
        saved = false;
    }
    
    public boolean isSaved() {
        return saved;
    }        
    
    public List<DiskRecord> exportToDiskRecords(String rootPath) {
        StringBuilder targetPath = new StringBuilder(rootPath);
        boolean doCreateDir = true;
        targetPath.append("/");
        targetPath.append(getMapId());
        
        String targetDataFile = "map.data";
        String targetManualIpsFile = "manualIPList.data";
        String targetManualCIDRsFile = "manualCIDRList.data";
        String targetExtractedIpsFile = "extractedIPList.data";
        String targetGhostIpsFile = "masterGhostIPList.data";
        String targetNotesFile = "notes.data";
        
        StringBuilder content = new StringBuilder("");
                
        ArrayList<DiskRecord> testRecords = new ArrayList<DiskRecord>();
                
        content = new StringBuilder("");
        content.append("mapname=");
        content.append(getMapName());
        content.append("\n");
        content.append("login=");
        content.append(getinternalLogin());
        content.append("\n");
        content.append("didIncludeManualGhostIPs=");
        content.append(didIncludeManualGhostIPs());
        content.append("\n");
        content.append("didIncludeExtractedGhostIPs=");
        content.append(didIncludeExtractedGhostIPs());
        content.append("\n");
        
        if (network != null) {
            content.append("network=");
            content.append(getNetwork());
            content.append("\n");
        }
        if (mapruleId != null) {
            content.append("mapruleId=");
            content.append(getMapruleId());
            content.append("\n");
        }
        
        DiskRecord mapDataRecord = new DiskRecord(targetPath.toString(), targetDataFile, content.toString(), doCreateDir);
        testRecords.add(mapDataRecord);
        
        DiskRecord manualIPRecord = new DiskRecord(targetPath.toString(), targetManualIpsFile, getManualIPList(), doCreateDir);
        testRecords.add(manualIPRecord);
        
        DiskRecord manualCIDRRecord = new DiskRecord(targetPath.toString(), targetManualCIDRsFile, getManualCIDRList(), doCreateDir);
        testRecords.add(manualCIDRRecord);

        DiskRecord extractedIPRecord = new DiskRecord(targetPath.toString(), targetExtractedIpsFile, getExtractedIPList(), doCreateDir);
        testRecords.add(extractedIPRecord);

        DiskRecord notesRecord = new DiskRecord(targetPath.toString(), targetNotesFile, getMapNotes(), doCreateDir);
        testRecords.add(notesRecord);
        
        StringBuilder masterIpStr = new StringBuilder("");
        for (int i = 0; i < getMasterGhostIPList().length; i++) {
            if (i > 0) masterIpStr.append(" ");
            masterIpStr.append(getMasterGhostIPList()[i].getHostAddress());
        }
        DiskRecord ghostIPRecord = new DiskRecord(targetPath.toString(), targetGhostIpsFile, masterIpStr.toString(), doCreateDir);
        testRecords.add(ghostIPRecord);
        return testRecords;
    }
    
    public String getNetwork() {
        return network;
    }
    
    public boolean isNetworkESSL() {
        return "essl".equals(network);
    }
    
    public void setNetwork(String s) {
        network = s;
    }
    
    public String getMapruleId() {
        return mapruleId;
    }

    public void setMapruleId(String str) {
        mapruleId = str;
    }

}

