/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package com.internal.pubsector.civilian.buckler.objects;
import java.util.Date;

/**
 *
 * @author jowilson
 */
public class ConnectionTestOutput {
    public static enum Statuses {
        PENDING,
        SUCCESSFUL,
        GHOST_CONNECTION_FAILED,
        ORIGIN_CONNECTION_FAILED,
        USER_ABORTED,
        UNHANDLED_EXCEPTION
    }
    
    Statuses status = null;
    StringBuilder verboseOutput = null;
    ShellOutput shellOutput = null;
    
    public Statuses setStatus(Statuses s) {
        return (status = s);
    }
    
    public Statuses setStatus(String s) {
        try {
            Statuses newStatus = Statuses.valueOf(s);
            return (status = newStatus);
        } catch (Exception e) {
            return (status = null);
        }
    }
    
    public Statuses getStatus() {
        return status;
    }
    
    public ShellOutput getShellOutput() {
        return shellOutput;
    }
    
    public void setShellOutput(ShellOutput so) {
        shellOutput = so;
    }
    
    public String setVerboseOutput(String str) {
        return (verboseOutput = new StringBuilder(str)).toString();
    }
    
    public String appendVerboseOutput(String str) {
        if (verboseOutput != null) {
            return verboseOutput.append(str).toString();
        }
        else {
            return setVerboseOutput(str).toString();
        }
    }
    
    public String getVerboseOutput() {
        if (verboseOutput != null) {
            return verboseOutput.toString();
        }
        else return null;
    }
    
    public String getPrintableStatus() {
        if (status == null) return "<null>";
        return (status.toString());
    }    
}
