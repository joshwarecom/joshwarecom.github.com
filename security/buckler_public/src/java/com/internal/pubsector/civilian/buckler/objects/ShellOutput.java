/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package com.internal.pubsector.civilian.buckler.objects;

/**
 *
 * @author jowilson
 */
public class ShellOutput {
    String stdoutString = "";
    String stderrString = "";
    Integer exitCode = new Integer(-999);
    
    public ShellOutput(String out, String err, Integer exit) {
        stdoutString = out;
        stderrString = err;
        exitCode = exit;
    }
    
    public String getStdout() {
        return stdoutString;
    }
    
    public String getStderr() {
        return stderrString;
    }
    
    public int getExitCode() {
        return exitCode;
    }
    
}
