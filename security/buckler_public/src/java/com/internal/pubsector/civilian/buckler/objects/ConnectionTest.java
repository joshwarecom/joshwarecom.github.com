/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package com.internal.pubsector.civilian.buckler.objects;

import com.internal.pubsector.civilian.buckler.Utilities;
import com.internal.pubsector.civilian.buckler.controllers.DoRemoteCurlController;
import static com.internal.pubsector.civilian.buckler.Utilities.logInfo;
import java.util.List;
import java.util.ArrayList;
import java.util.UUID;

/**
 *
 * @author jowilson
 */
public class ConnectionTest extends Thread {
    public static enum Statuses {
        ACTIVE,
        RESOLVED
    }
    
    UUID testId = UUID.randomUUID();
    ConnectionTestInput input = null;
    ConnectionTestOutput output = null;
    Statuses status = null;
    boolean abortMe = false;
    
    public ConnectionTest(ConnectionTestInput i, ConnectionTestOutput o) {
        input = i;
        output = o;
    }
    
    public ConnectionTest(ConnectionTestInput i) {
        input = i;
        output = new ConnectionTestOutput();
    }    
    
    public String getTestId() {
        return testId.toString();
    }
    
    public void setTestId(String id) {
        testId = UUID.fromString(id);
    }
    
    public ConnectionTestInput getInputs() {
        return input;
    }
    
    public ConnectionTestOutput getOutputs() {
        return output;
    }

    public boolean isAborted() {
        return (abortMe == true);
    }

    public void doAbortMe() {
        abortMe = true;
    }

    public boolean isActive() {
        return (status == Statuses.ACTIVE);
    }

    public boolean isResolved() {
        return (status == Statuses.RESOLVED);
    }
    
    public String getPrintableStatus() {
        if (status == null) return "<null>";
        return (status.toString());
    }
    
    public boolean isNullStatus() {
        return (status == null);
    }
    
    public Statuses setStatus(String s) {
        try {
            Statuses newStatus = Statuses.valueOf(s);
            return (status = newStatus);
        } catch (Exception e) {
            return (status = null);
        }
    }
    
    public void run() {
        if (abortMe) {
            status = Statuses.RESOLVED;
            output.status = ConnectionTestOutput.Statuses.USER_ABORTED;
        }
        else {
            status = Statuses.ACTIVE;
            output.status = ConnectionTestOutput.Statuses.PENDING;
            try {
                DoRemoteCurlController curlController = new DoRemoteCurlController();
                output.appendVerboseOutput("RemoteCurl object instantiated...\n");
                ShellOutput shellOutput = (ShellOutput)(curlController.go(input.getGhostIp(), input.getOriginIp(), input.getHostHeader(), input.getRequestPath(), input.getSSL(), input.getOriginPort()));
                output.setShellOutput(shellOutput);
                if (shellOutput.getStdout().contains("About to connect() to ")) {
                    if (shellOutput.getStdout().contains("Connected to ")) {
                        output.status = ConnectionTestOutput.Statuses.SUCCESSFUL;
                    }
                    else if (shellOutput.getStdout().contains("... connected\n")) {
                        output.status = ConnectionTestOutput.Statuses.SUCCESSFUL;
                    }
                    else if (shellOutput.getStdout().contains("successfully set certificate verify locations")) {
                        output.status = ConnectionTestOutput.Statuses.SUCCESSFUL;
                    }                
                    else {
                        output.status = ConnectionTestOutput.Statuses.ORIGIN_CONNECTION_FAILED;
                    }
                }
                else if (shellOutput.getStdout().contains("Request failed")){
                    output.status = ConnectionTestOutput.Statuses.ORIGIN_CONNECTION_FAILED;
                }
                else {
                    output.status = ConnectionTestOutput.Statuses.GHOST_CONNECTION_FAILED;
                }
                output.appendVerboseOutput("RemoteCurl object finished...\n");
            } catch (Exception e) {
                output.appendVerboseOutput("RemoteCurl exception: " + e.getMessage() + "\nStack trace:\n");
                output.appendVerboseOutput(Utilities.getStackTrace(e));
                output.status = ConnectionTestOutput.Statuses.UNHANDLED_EXCEPTION;
            }
            status = Statuses.RESOLVED;
        }
    }
    
    public List<DiskRecord>  exportToDiskRecords(String rootPath) {
        StringBuilder targetPath = new StringBuilder(rootPath);
        boolean doCreateDir = false;
        targetPath.append("/");
        
        String targetFile = getTestId() + ".data";
        
        StringBuilder content = new StringBuilder("");
        
        content.append("status=");
        if (status != null) {
            content.append(status.toString());
        }
        content.append("\n");
        
        content.append("ghostIp=");
        content.append(input.getGhostIp());
        content.append("\n");
        
        content.append("originIp=");
        content.append(input.getOriginIp());
        content.append("\n");
        
        content.append("originPort=");
        content.append(input.getOriginPort());
        content.append("\n");
        
        content.append("hostHeader=");
        content.append(input.getHostHeader());
        content.append("\n");

        content.append("requestPath=");
        content.append(input.getRequestPath());
        content.append("\n");

        content.append("ssl=");
        content.append(input.getSSL().toString());
        content.append("\n");
        
        content.append("exitCode=");
        if (output != null) {
            if (output.getShellOutput() != null) 
            content.append(output.getShellOutput().exitCode);
        }
        content.append("\n");        
        
        content.append("resolution=");
        content.append(output.getPrintableStatus());
        content.append("\n");        
        
        String targetVerboseFile = getTestId() + ".verbose";
        String targetStdoutFile = getTestId() + ".stdout";
        String targetStderrFile = getTestId() + ".stderr";
        
        String stdoutOutput = "";
        String stderrOutput = "";
        
        if (output != null) {
            if (output.getShellOutput() != null) {
                if (output.getShellOutput().getStdout() != null) {
                    stdoutOutput = output.getShellOutput().getStdout();
                }
                if (output.getShellOutput().getStderr() != null) {
                    stderrOutput = output.getShellOutput().getStderr();
                }                
            }
        }
        
        DiskRecord verboseDiskRecord = new DiskRecord(targetPath.toString(), targetVerboseFile, output.getVerboseOutput(), doCreateDir);
        DiskRecord stdoutDiskRecord = new DiskRecord(targetPath.toString(), targetStdoutFile, stdoutOutput, doCreateDir);
        DiskRecord stderrDiskRecord = new DiskRecord(targetPath.toString(), targetStderrFile, stderrOutput, doCreateDir);
        DiskRecord testDiskRecord = new DiskRecord(targetPath.toString(), targetFile, content.toString(), doCreateDir);
        
        List<DiskRecord> diskRecordList = new ArrayList<DiskRecord>();
        diskRecordList.add(testDiskRecord);
        diskRecordList.add(stdoutDiskRecord);
        diskRecordList.add(stderrDiskRecord);
        diskRecordList.add(verboseDiskRecord);
        return diskRecordList;
    }
   
}
