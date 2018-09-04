/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package com.internal.pubsector.civilian.buckler.managers;

import com.internal.pubsector.civilian.buckler.Utilities;
import static com.internal.pubsector.civilian.buckler.Utilities.logInfo;
import com.internal.pubsector.civilian.buckler.objects.*;
import java.net.InetAddress;

import java.util.concurrent.atomic.AtomicBoolean;
import java.util.*;
import java.util.logging.Level;
import java.io.File;
import java.io.FileWriter;
import java.io.BufferedWriter;

/**
 *
 * @author jowilson
 */
public class TestManager extends Thread {
    List<ConnectionTestMap> masterTestMapList = Collections.synchronizedList(new ArrayList<ConnectionTestMap>());    
    Map<String, ConnectionTestMap> masterTestMapTable = Collections.synchronizedMap(new Hashtable<String, ConnectionTestMap>());    
    
    List<ConnectionTestGroup> pendingConnectionTestGroupQueue = Collections.synchronizedList(new ArrayList<ConnectionTestGroup>());
    List<ConnectionTestGroup> activeConnectionTestGroups = Collections.synchronizedList(new ArrayList<ConnectionTestGroup>());
    List<ConnectionTestGroup> resolvedConnectionTestGroups = Collections.synchronizedList(new ArrayList<ConnectionTestGroup>());

    Map<String, ConnectionTestGroup> masterTestGroupMap = Collections.synchronizedMap(new Hashtable<String, ConnectionTestGroup>());
    List<String> masterTestGroupIdList = Collections.synchronizedList(new ArrayList<String>());

    List<ConnectionTest> masterThreadList = Collections.synchronizedList(new ArrayList<ConnectionTest>());
    //Map<String, List<Thread>> threadsPerOrigin = Collections.synchronizedMap(new Hashtable<String, List<Thread>>());
    
    final static int tickTimeInMs = 1000;
    final static int maxThreads = 9;
    AtomicBoolean finished = new AtomicBoolean(false);
    AtomicBoolean gracefulStop = new AtomicBoolean(false);
    
    String dataRootPath = null;
    String wwwRootPath = null;
    AtomicBoolean lockDataRootPath = new AtomicBoolean(false);
    AtomicBoolean lockWwwRootPath = new AtomicBoolean(false);
    
    Exception e = null;
    boolean initialized = false;
    
    public Exception getException() {
        return e;
    }
    
    public boolean isInitialized() {
        return initialized;
    }
    
    public void terminate() {
        finished.set(true);
    }
    
    public Boolean addNewValidatedTestMap(String internalLogin, String descriptiveMapName, boolean extractedFromCIDRs, boolean includedManualGhosts, boolean queriedCurrentGhosts, boolean queriedFutureGhosts, String manualIPList, String manualCIDRList, String extractedIPList, String currentSourceMap, String queriedCurrentIPList, String futureSourceMap, String queriedFutureIPList, InetAddress[] masterGhostIPList, String net, String maprule, String notes) {    
        return addNewValidatedTestMap(internalLogin, descriptiveMapName, extractedFromCIDRs, includedManualGhosts, queriedCurrentGhosts, queriedFutureGhosts, manualIPList, manualCIDRList, extractedIPList, currentSourceMap, queriedCurrentIPList, futureSourceMap, queriedFutureIPList, masterGhostIPList, net, maprule, null, notes);
    }
    
    public Boolean addNewValidatedTestMap(String internalLogin, String descriptiveMapName, boolean extractedFromCIDRs, boolean includedManualGhosts, boolean queriedCurrentGhosts, boolean queriedFutureGhosts, String manualIPList, String manualCIDRList, String extractedIPList, String currentSourceMap, String queriedCurrentIPList, String futureSourceMap, String queriedFutureIPList, InetAddress[] masterGhostIPList, String net, String maprule, String replacementId, String notes) {
        ConnectionTestMap newTestMap = new ConnectionTestMap(internalLogin, descriptiveMapName, extractedFromCIDRs, includedManualGhosts, queriedCurrentGhosts, queriedFutureGhosts, manualIPList, manualCIDRList, extractedIPList, currentSourceMap, queriedCurrentIPList, futureSourceMap, queriedFutureIPList, masterGhostIPList, net, maprule, notes);
        if (replacementId != null && !"".equals(replacementId)) {
            newTestMap.setMapId(replacementId);
            ConnectionTestMap oldTestMap = masterTestMapTable.get(replacementId);
            if (oldTestMap != null) {
                masterTestMapList.remove(oldTestMap);
                masterTestMapTable.remove(replacementId);
            }
        }
        masterTestMapList.add(newTestMap);
        masterTestMapTable.put(newTestMap.getMapId(), newTestMap);
        
        try { saveAllStatesToDataRoot(); } catch (Exception e) { logInfo("Exception " + e.getLocalizedMessage() + ", " + Utilities.getStackTrace(e));};        
        return true;
    }
    
    public List<ConnectionTestMap> getMasterTestMapList() {
        return masterTestMapList;
    }

    public Map<String, ConnectionTestMap> getMasterTestMapTable() {
        return masterTestMapTable;
    }
    
    public ConnectionTestMap getTestMapById(String id) {
        return masterTestMapTable.get(id);
    }    
    
    public Boolean addNewValidatedTestGroup(InetAddress[] originIpList, Integer originPort, String hostHeader, String requestPath, boolean ssl, InetAddress[] ghostIpList, String testGroupName, String testGroupMapId, String start) {
        ArrayList<ConnectionTest> testArray = new ArrayList<ConnectionTest>();
        for (int i = 0; i < originIpList.length; i++) {
            for (int j = 0; j < ghostIpList.length; j++) {
                ConnectionTestInput input = new ConnectionTestInput(ghostIpList[j].getHostAddress(), originIpList[i].getHostAddress(), originPort, hostHeader, requestPath, ssl);
                ConnectionTest test = new ConnectionTest(input);
                testArray.add(test);
            }
        }
        ConnectionTestGroup testGroup = new ConnectionTestGroup(testGroupName, testGroupMapId, testArray, start);
        pendingConnectionTestGroupQueue.add(testGroup);
        masterTestGroupIdList.add(testGroup.getTestGroupId());
        masterTestGroupMap.put(testGroup.getTestGroupId(), testGroup);
        
        try { saveAllStatesToDataRoot(); } catch (Exception e) { logInfo("Exception " + e.getLocalizedMessage() + ", " + Utilities.getStackTrace(e));};
        return true;
    }
    
    public Boolean abortExistingTestGroup(String testGroupId) {
        ConnectionTestGroup testGroup = getTestGroupById(testGroupId);
        if (testGroup != null) {
            for (int i = 0; i < testGroup.getConnectionTestCount(); i++) {
                ConnectionTest test = testGroup.getTestByIndex(i);
                test.doAbortMe();
            }
            testGroup.markAborted();
            try { saveAllStatesToDataRoot(); } catch (Exception e) { logInfo("Exception " + e.getLocalizedMessage() + ", " + Utilities.getStackTrace(e));};
            return true;
        }
        else {
            return false;
        }
    }    
    
    public List<ConnectionTestGroup> getPendingConnectionTestGroupQueue() {
        return pendingConnectionTestGroupQueue;
    }
    
    public List<ConnectionTestGroup> getActiveConnectionTestGroups() {
        return activeConnectionTestGroups;
    }

    public List<ConnectionTestGroup> getResolvedConnectionTestGroups() {
        return resolvedConnectionTestGroups;
    }
    
    public ConnectionTestGroup getTestGroupById(String id) {
        return masterTestGroupMap.get(id);
    }
    
    private boolean doProcessNextPendingConnectionTestGroup() {
        if (pendingConnectionTestGroupQueue.size() > 0) {
            ConnectionTestGroup ctg = pendingConnectionTestGroupQueue.get(0);
            pendingConnectionTestGroupQueue.remove(ctg);
            activeConnectionTestGroups.add(ctg);
            return true;
        }
        return false;
    }
    
    public void run() {
        try { 
            while (!finished.get()) {
                Thread.sleep(tickTimeInMs);
                
                //move any pendingTest groups which are 100% resolved to active queue
                //do this is chunks of 16 groups so as not to slow down app startup signifanctly when there are
                //many pending groups.
                ArrayList<ConnectionTestGroup> activateUs = new ArrayList<ConnectionTestGroup>();                
                for (int i = 0; i < pendingConnectionTestGroupQueue.size() && i < 16; i++) {
                    ConnectionTestGroup pendingGroup = pendingConnectionTestGroupQueue.get(i);
                    logInfo("Pendinggroup: " + pendingGroup.getTestGroupId());
                    int resolvedCount = 0;
                    for (int j = 0; j < pendingGroup.getConnectionTestCount(); j++) {
                        ConnectionTest pendingTest = pendingGroup.getTestByIndex(j);
                        if (pendingTest.isResolved() || pendingTest.isAborted()) {
                            resolvedCount++;
                        }
                    }                    
                    if (resolvedCount == pendingGroup.getConnectionTestCount()) {
                        activateUs.add(pendingGroup);                        
                    }
                }          
                for (int i = 0; i < activateUs.size(); i++) {
                    ConnectionTestGroup activateGroup = activateUs.get(i);
                    pendingConnectionTestGroupQueue.remove(activateGroup);
                    activeConnectionTestGroups.add(activateGroup);
                }
                
                //move any activeTest groups which are 100% resolved to resolved queue
                ArrayList<ConnectionTestGroup> resolveUs = new ArrayList<ConnectionTestGroup>();                
                for (int i = 0; i < activeConnectionTestGroups.size(); i++) {
                    ConnectionTestGroup activeGroup = activeConnectionTestGroups.get(i);
                    logInfo("Activegroup: " + activeGroup.getTestGroupId());
                    int resolvedCount = 0;
                    for (int j = 0; j < activeGroup.getConnectionTestCount(); j++) {
                        ConnectionTest activeTest = activeGroup.getTestByIndex(j);
                        if (activeTest.isResolved()) {
                            resolvedCount++;
                            List<DiskRecord> records = activeTest.exportToDiskRecords(dataRootPath + "/testgroups/pending/" + activeGroup.getTestGroupId());
                            for (int k = 0; k < records.size(); k++) {
                                DiskRecord rec = records.get(k);
                                rec.writeMe();
                            }
                        }
                    }
                    
                    logInfo("Resolved count " + resolvedCount + ", " + activeGroup.getConnectionTestCount());
                    
                    if (resolvedCount == activeGroup.getConnectionTestCount()) {
                        resolveUs.add(activeGroup);   
                        activeGroup.setEnd((new Date()).toString());
                    }
                }
                
                for (int i = 0; i < resolveUs.size(); i++) {
                    ConnectionTestGroup resolvedGroup = resolveUs.get(i);
                    activeConnectionTestGroups.remove(resolvedGroup);
                    resolvedConnectionTestGroups.add(resolvedGroup);
                    logInfo("Moving resolvedGroup: " + resolvedGroup.getTestGroupId());
                    File src = new File(dataRootPath + "/testgroups/pending/" + resolvedGroup.getTestGroupId());
                    File dest = new File(dataRootPath + "/testgroups/resolved/" + resolvedGroup.getTestGroupId());
                    src.renameTo(dest);
                    DiskRecord updateMe = resolvedGroup.exportGroupDataRecordOnly(dataRootPath + "/testgroups/resolved/");
                    updateMe.writeMe();
                }

                //remove any resolved threads from the masterThreadList after saving them to disk
                ArrayList<ConnectionTest> removeUs = new ArrayList<ConnectionTest>();
                for (int i = 0; i < masterThreadList.size(); i++) {
                    ConnectionTest activeTest = masterThreadList.get(i);
                    if (activeTest.isResolved()) {
                        removeUs.add(activeTest);
                    }
                }
                for (int i = 0; i < removeUs.size(); i++) {
                    masterThreadList.remove(removeUs.get(i));
                }
                
                int openSlots = maxThreads - masterThreadList.size();  
                //logInfo(openSlots + " open thread slots available.");
                
                if (openSlots > 0) {
                    //logInfo("Allocating threads from active tests to open slots...");
                    //first allocate threads from the currently active list
                    for (int i = 0; i < activeConnectionTestGroups.size() && openSlots > 0; i++) {
                        ConnectionTestGroup activeGroup = activeConnectionTestGroups.get(i);
                        for (int j = 0; j < activeGroup.getConnectionTestCount() && openSlots > 0; j++) {
                            ConnectionTest activeTest = activeGroup.getTestByIndex(j);
                            if (!activeTest.isActive() && !activeTest.isResolved()) {
                                masterThreadList.add(activeTest);
                                activeTest.start();
                                logInfo("Thread allocated...");
                                while (activeTest.isNullStatus()) {
                                    Thread.sleep(100);
                                }
                                logInfo("Thread active...");
                                openSlots--;
                            }
                        }
                    }
                }
                
                if (openSlots > 0) {                    
                    //logInfo(openSlots + " open slots still available.");
                    if (doProcessNextPendingConnectionTestGroup()) {
                        logInfo("Moved pending test in queue to active tests...");
                    }
                }
            }
            gracefulStop.set(true);
        } catch (Exception e) {
            logInfo("Exception occurred, TestManager exiting abruptly.");
            logInfo(Utilities.getStackTrace(e));
            terminate();
            return;
        }
    }
    
    public TestManager(String dataroot, String webroot) throws Exception {
        dataRootPath = dataroot;
        wwwRootPath = webroot;
        importSavedStatesFromDataRoot();
        initialized = true;
    }
    
    private void savePendingTestGroups() throws Exception {
        if (dataRootPath == null) {
            logInfo("Could not save pending test groups, dataRootPath is null.");
            return;
        }
        for (int i = 0; i < pendingConnectionTestGroupQueue.size(); i++) {
            ConnectionTestGroup ctg = pendingConnectionTestGroupQueue.get(i);
            logInfo("Might save " + ctg.getTestGroupId() + " to " + dataRootPath);
            if (!ctg.isSaved()) {
                logInfo("Saving " + dataRootPath + "/" + ctg.getTestGroupId());
                List<DiskRecord> records = ctg.exportToDiskRecords(dataRootPath + "/testgroups/pending");
                for (int j = 0; j < records.size(); j++) {
                    DiskRecord rec = records.get(j);
                    rec.writeMe();
                }
                ctg.markSaved();
            }
        }
    }
    
    private void saveUnsavedTestMaps() throws Exception {
        if (dataRootPath == null) {
            logInfo("Could not save unsaved test maps, dataRootPath is null.");
            return;
        }
        for (int i = 0; i < masterTestMapList.size(); i++) {
            ConnectionTestMap map = masterTestMapList.get(i);
            logInfo("Might save " + map.getMapId() + " to " + dataRootPath);
            if (!map.isSaved()) {
                logInfo("Saving " + dataRootPath + "/" + map.getMapId());
                List<DiskRecord> records = map.exportToDiskRecords(dataRootPath + "/scanmaps");
                for (int j = 0; j < records.size(); j++) {
                    DiskRecord rec = records.get(j);
                    rec.writeMe();
                }
                map.markSaved();
            }
        }
    }

    /*
     * @FIXME: WARNING: use of SPLIT will become problematic if = is entered for any inputs, 
     */
    private void importPendingTestGroups() throws Exception {    
        if (dataRootPath == null) {
            logInfo("Could not import pending test groups, dataRootPath is null.");
            return;
        }
        File pendingGroupsDir = new File(dataRootPath + "/testgroups/pending");
        File[] listOfFiles = pendingGroupsDir.listFiles();
        for (int i = 0; i < listOfFiles.length; i++) {            
            String groupDataFilePath = dataRootPath + "/testgroups/pending/" + listOfFiles[i].getName() + "/group.data";
            String idListFilePath = dataRootPath + "/testgroups/pending/" + listOfFiles[i].getName() + "/group.idlist";
            
            File tmpFile = null;
            Scanner tmpScanner = null;
            
            tmpFile = new File(groupDataFilePath);
            tmpScanner = new Scanner( tmpFile );
            tmpScanner.useDelimiter("\\A");
            String groupData = tmpScanner.next();
            tmpScanner.close();
            tmpFile = null;
            
            String[] data = groupData.split("\n");
            Hashtable<String, String> dataTable = new Hashtable<String, String>();
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
            
            ArrayList<ConnectionTest> tests = new ArrayList<ConnectionTest>();
            tmpScanner = new Scanner( new File(idListFilePath) ).useDelimiter("\\A");
            String idList = tmpScanner.next();
            tmpScanner.close();
            String[] ids = idList.split("\n");
            for (int j = 0; j < ids.length; j++) {
                if (!"".equals(ids[j])) {
                    Hashtable<String, String> testTable = new Hashtable<String, String>();
                    String testDataFilePath = dataRootPath + "/testgroups/pending/" + listOfFiles[i].getName() + "/" + ids[j] + ".data";
                    String testVerboseFilePath = dataRootPath + "/testgroups/pending/" + listOfFiles[i].getName() + "/" + ids[j] + ".verbose";
                    String testStdoutFilePath = dataRootPath + "/testgroups/pending/" + listOfFiles[i].getName() + "/" + ids[j] + ".stdout";
                    String testStderrFilePath = dataRootPath + "/testgroups/pending/" + listOfFiles[i].getName() + "/" + ids[j] + ".stderr";

                    tmpFile = new File(testDataFilePath);
                    tmpScanner = new Scanner(tmpFile);
                    String testDataString = tmpScanner.useDelimiter("\\A").next();
                    tmpScanner.close();
                    String[] testData = testDataString.split("\n");
                    for (int k = 0; k < testData.length; k++) {
                        String[] keyValue = testData[k].split("=");
                        if (keyValue.length < 2) {
                            testTable.put(keyValue[0], "");
                        }
                        else {
                            testTable.put(keyValue[0],  Utilities.blankIfNull(keyValue[1]));
                        }

                    }
                    
                    String testVerboseString = "";
                    String testStdoutString = "";
                    String testStderrString = "";
                    
                    tmpFile = new File(testVerboseFilePath);
                    if (tmpFile.length() > 0) {
                    tmpScanner = new Scanner(tmpFile).useDelimiter("\\A");
                    testVerboseString = tmpScanner.next();                    
                    tmpScanner.close();
                    }
                    tmpFile = null;

                    tmpFile = new File(testStdoutFilePath);
                    if (tmpFile.length() > 0) {
                    tmpScanner = new Scanner( tmpFile ).useDelimiter("\\A");
                    testStdoutString = tmpScanner.next();
                    tmpScanner.close();
                    }
                    tmpFile = null;
                    
                    tmpFile = new File(testStderrFilePath);
                    if (tmpFile.length() > 0) {
                    tmpScanner = new Scanner( tmpFile ).useDelimiter("\\A");
                    testStderrString = tmpScanner.next();
                    tmpScanner.close();
                    }
                    tmpFile = null;
                    
                    ConnectionTestInput input = new ConnectionTestInput(testTable.get("ghostIp"), testTable.get("originIp"), Integer.parseInt(testTable.get("originPort")), testTable.get("hostHeader"), testTable.get("requestPath"), Boolean.valueOf(testTable.get("ssl")));
                    ConnectionTestOutput output = new ConnectionTestOutput();
                    
                    String exitCode = testTable.get("exitCode");
                    Integer integralCode = null;
                    if (!"".equals(Utilities.blankIfNull(exitCode))) {
                        integralCode = Integer.parseInt(exitCode);
                    }
                    ShellOutput shell = new ShellOutput(testStdoutString, testStderrString, integralCode);
                    output.setShellOutput(shell);
                    output.setVerboseOutput(testVerboseString);
                    output.setStatus(testTable.get("resolution"));
                    ConnectionTest test = new ConnectionTest(input, output);
                    test.setStatus(testTable.get("status"));
                    test.setTestId(ids[j]);
                    tests.add(test);
                }
            }
            
            if (dataTable.get("start") == null) {
                dataTable.put("start", "unknown");
            }
            ConnectionTestGroup ctg = new ConnectionTestGroup(dataTable.get("name"), dataTable.get("mapId"), tests, dataTable.get("start"));
            ctg.setTestGroupId(listOfFiles[i].getName());
            ctg.markSaved();
            
            pendingConnectionTestGroupQueue.add(ctg);
            masterTestGroupIdList.add(ctg.getTestGroupId());
            masterTestGroupMap.put(ctg.getTestGroupId(), ctg);        
        }        
    }
    
    /*
     * @FIXME: WARNING: use of SPLIT will become problematic if = is entered for any inputs, 
     */
    private void importResolvedTestGroups() throws Exception {    
        if (dataRootPath == null) {
            logInfo("Could not import resolved test groups, dataRootPath is null.");
            return;
        }
        File pendingGroupsDir = new File(dataRootPath + "/testgroups/resolved");
        File[] listOfFiles = pendingGroupsDir.listFiles();
        for (int i = 0; i < listOfFiles.length; i++) {            
            String groupDataFilePath = dataRootPath + "/testgroups/resolved/" + listOfFiles[i].getName() + "/group.data";
            String idListFilePath = dataRootPath + "/testgroups/resolved/" + listOfFiles[i].getName() + "/group.idlist";
            
            Scanner tmpScanner = null;
            tmpScanner = new Scanner( new File(groupDataFilePath) ).useDelimiter("\\A");
            String groupData = tmpScanner.next();
            tmpScanner.close();
            String[] data = groupData.split("\n");
            Hashtable<String, String> dataTable = new Hashtable<String, String>();
            for (int j = 0; j < data.length; j++) {
                if (!"".equals(data[j])) {
                    String[] keyValue = data[j].split("=");
                    String value = "";
                    if (keyValue.length > 1) value = keyValue[1];
                    dataTable.put(keyValue[0], value);
                }
            }
            
            ArrayList<ConnectionTest> tests = new ArrayList<ConnectionTest>();
            String idList = new Scanner( new File(idListFilePath) ).useDelimiter("\\A").next();
            String[] ids = idList.split("\n");
            for (int j = 0; j < ids.length; j++) {
                if (!"".equals(ids[j])) {
                    Hashtable<String, String> testTable = new Hashtable<String, String>();
                    String testDataFilePath = dataRootPath + "/testgroups/resolved/" + listOfFiles[i].getName() + "/" + ids[j] + ".data";
                    String testVerboseFilePath = dataRootPath + "/testgroups/resolved/" + listOfFiles[i].getName() + "/" + ids[j] + ".verbose";
                    String testStdoutFilePath = dataRootPath + "/testgroups/resolved/" + listOfFiles[i].getName() + "/" + ids[j] + ".stdout";
                    String testStderrFilePath = dataRootPath + "/testgroups/resolved/" + listOfFiles[i].getName() + "/" + ids[j] + ".stderr";
                    
                    Scanner tmp = null;
                    File tmpFile = null;                    

                    tmpFile = new File(testDataFilePath);
                    tmp = new Scanner (tmpFile);
                    String testDataString = tmp.useDelimiter("\\A").next();
                    tmp.close();
                    String[] testData = testDataString.split("\n");
                    for (int k = 0; k < testData.length; k++) {
                        String[] keyValue = testData[k].split("=");
                        if (keyValue.length < 2) {
                            testTable.put(keyValue[0], "");
                        }
                        else {
                            String value = "";
                            if (keyValue.length > 1) value = keyValue[1];
                            testTable.put(keyValue[0],  value);
                        }

                    }
                    
                    String testVerboseString = "";
                    String testStdoutString = "";
                    String testStderrString = "";
                                        
                    tmpFile = new File(testVerboseFilePath);
                    if (tmpFile.length() > 0) {
                        tmp = new Scanner( tmpFile );
                        testVerboseString = tmp.useDelimiter("\\A").next();                    
                        tmp.close();
                    }
                    tmpFile = null;
                    
                    tmpFile = new File(testStdoutFilePath);
                    if ( tmpFile.length() > 0) {           
                        tmp = new Scanner( tmpFile );
                        testStdoutString = tmp.useDelimiter("\\A").next();
                        tmp.close();
                    }
                    tmpFile = null;
                    
                    tmpFile = new File(testStderrFilePath);
                    if (tmpFile.length() > 0) {
                        tmp = new Scanner( tmpFile );
                        testStderrString = tmp.useDelimiter("\\A").next();
                        tmp.close();
                    }
                    tmpFile = null;
                    
                    ConnectionTestInput input = new ConnectionTestInput(testTable.get("ghostIp"), testTable.get("originIp"), Integer.parseInt(testTable.get("originPort")), testTable.get("hostHeader"), testTable.get("requestPath"), Boolean.valueOf(testTable.get("ssl")));
                    ConnectionTestOutput output = new ConnectionTestOutput();
                    
                    String exitCode = testTable.get("exitCode");
                    Integer integralCode = null;
                    if (!"".equals(Utilities.blankIfNull(exitCode))) {
                        integralCode = Integer.parseInt(exitCode);
                    }
                    ShellOutput shell = new ShellOutput(testStdoutString, testStderrString, integralCode);
                    output.setShellOutput(shell);
                    output.setVerboseOutput(testVerboseString);
                    output.setStatus(testTable.get("resolution"));
                    ConnectionTest test = new ConnectionTest(input, output);
                    test.setStatus(testTable.get("status"));
                    test.setTestId(ids[j]);
                    tests.add(test);
                }
            }
            
            ConnectionTestGroup ctg = new ConnectionTestGroup(dataTable.get("name"), dataTable.get("mapId"), tests, dataTable.get("start"));
            ctg.setTestGroupId(listOfFiles[i].getName());
            ctg.markSaved();
            
            resolvedConnectionTestGroups.add(ctg);
            masterTestGroupIdList.add(ctg.getTestGroupId());
            masterTestGroupMap.put(ctg.getTestGroupId(), ctg);        
        }
    }    
    
    /*
     * @FIXME: WARNING: use of SPLIT will become problematic if = is entered for any inputs, 
     */
    private void importSavedTestMaps() throws Exception {    
        if (dataRootPath == null) {
            logInfo("Could not import saved test maps, dataRootPath is null.");
            return;
        }
        File pendingGroupsDir = new File(dataRootPath + "/scanmaps");
        File[] listOfFiles = pendingGroupsDir.listFiles();
        for (int i = 0; i < listOfFiles.length; i++) {            
            String mapDataFilePath = dataRootPath + "/scanmaps/" + listOfFiles[i].getName() + "/map.data";
            String manualIpListFilePath = dataRootPath + "/scanmaps/" + listOfFiles[i].getName() + "/manualIPList.data";
            String manualCIDRListFilePath = dataRootPath + "/scanmaps/" + listOfFiles[i].getName() + "/manualCIDRList.data";
            String extractedIpListFilePath = dataRootPath + "/scanmaps/" + listOfFiles[i].getName() + "/extractedIPList.data";
            String ghostIpListFilePath = dataRootPath + "/scanmaps/" + listOfFiles[i].getName() + "/masterGhostIPList.data";
            String notesFilePath = dataRootPath + "/scanmaps/" + listOfFiles[i].getName() + "/notes.data";
            
            String mapData = new Scanner( new File(mapDataFilePath) ).useDelimiter("\\A").next();
            String[] data = mapData.split("\n");
            Hashtable<String, String> dataTable = new Hashtable<String, String>();
            for (int j = 0; j < data.length; j++) {
                if (!"".equals(data[j])) {
                    String[] keyValue = data[j].split("=");
                    dataTable.put(keyValue[0], Utilities.blankIfNull(keyValue[1]));
                }
            }
            
            String manualIpData = "";
            String manualCIDRData = "";
            String extractedIpData = "";
            String ghostIpData = "";
            String notesData = "";
            
            if (new File(manualIpListFilePath).length() > 0)
            manualIpData = new Scanner( new File(manualIpListFilePath) ).useDelimiter("\\A").next();
            
            if (new File(manualCIDRListFilePath).length() > 0)
            manualCIDRData = new Scanner( new File(manualCIDRListFilePath) ).useDelimiter("\\A").next();

            if (new File(extractedIpListFilePath).length() > 0)
            extractedIpData = new Scanner( new File(extractedIpListFilePath) ).useDelimiter("\\A").next();
            
            if (new File(ghostIpListFilePath).length() > 0)
            ghostIpData = new Scanner( new File(ghostIpListFilePath) ).useDelimiter("\\A").next();
            
            if (new File(notesFilePath).length() > 0)
            notesData = new Scanner( new File(notesFilePath) ).useDelimiter("\\A").next();
            dataTable.put("mapnotes", Utilities.blankIfNull(notesData));

            String[] ghostIpList = ghostIpData.split(" ");
            InetAddress[] ghostAddresses = new InetAddress[ghostIpList.length];
            for (int j = 0; j < ghostAddresses.length; j++) {
                ghostAddresses[j] = InetAddress.getByName(ghostIpList[j]);
            }
            
            ConnectionTestMap map = new ConnectionTestMap(dataTable.get("login"), dataTable.get("mapname"), Boolean.valueOf(dataTable.get("didIncludeExtractedGhostIPs")), Boolean.valueOf(dataTable.get("didIncludeManualGhostIPs")), false, false, manualIpData, manualCIDRData, extractedIpData, "", "", "", "", ghostAddresses, dataTable.get("network"), dataTable.get("mapruleId"), dataTable.get("mapnotes"));
            map.setMapId(listOfFiles[i].getName());
            map.markSaved();
            
            masterTestMapList.add(map);
            masterTestMapTable.put(map.getMapId(), map);
        }        
    }
    
    
    public boolean saveAllStatesToDataRoot() throws Exception {
        if (lockDataRootPath.compareAndSet(false, true)) {
            savePendingTestGroups();
            saveUnsavedTestMaps();
            lockDataRootPath.set(false);
            return true;
        }
        else {
            Utilities.logInfo("Could not save states, data root path currently locked.");
            return false;
        }
    }
    
    public void importSavedStatesFromDataRoot() throws Exception {
        importPendingTestGroups();
        importResolvedTestGroups();
        importSavedTestMaps();
    }
}
