/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package com.internal.pubsector.civilian.buckler.models;

import com.internal.pubsector.civilian.buckler.Utilities;
import com.internal.pubsector.civilian.buckler.objects.ShellOutput;
import com.internal.pubsector.civilian.buckler.cmd.Sql2;
import com.internal.pubsector.civilian.buckler.cmd.Curl;
import com.internal.pubsector.civilian.buckler.cmd.Nsh;
import com.internal.pubsector.civilian.buckler.cmd.Ssh;
import java.io.*;
import java.util.concurrent.TimeoutException;
import java.util.List;
import java.util.ArrayList;
import java.net.InetAddress;
import com.internal.pubsector.civilian.buckler.managers.KeyManager;
import com.internal.pubsector.civilian.buckler.managers.OverrideManager;

/**
 *
 * @author jowilson
 */
public class CommanderModel implements ModelInterface {
    //static final String defaultLoginName = "jowilson";
    //static final String defaultKeyFile = "/usr/local/apache-tomcat-7.0.34/.ssh/sym.key.deployed";
    static final String defaultHostName = "lsg";
    
    public static String getTrueHostName() throws Exception {
        return Utilities.valueIfBlank(Utilities.blankIfNull(OverrideManager.getOverrideLsgHost()),defaultHostName);
    }
    
    public static ShellOutput doList(String target, boolean longFormat) throws Exception {
        StringBuilder cmd = new StringBuilder("ls");
        cmd.append(" -l ");
        cmd.append(target);
        Utilities.logInfo("List cmd: " + cmd.toString());
        return shellExecute(cmd.toString(), 3000);
    }
        
    public static List<String> doSnailScan(String[] cidrList) throws Exception {
        List ipList = new ArrayList<InetAddress>();
        for (int i = 0; i < cidrList.length; i++) {
            String[] rawIPList = Utilities.getIpsFromCidr(cidrList[i]);
            for (int j = 0; j < rawIPList.length; j++) {
                try {                    
                    ShellOutput tmp = doRemoteSnailEcho(rawIPList[j],KeyManager.getExtractedLoginName(), KeyManager.getSymKeyPath(), getTrueHostName());
                    Utilities.logInfo("tmp: " + tmp);
                    if (tmp != null) {
                        Utilities.logInfo("tmp stdout: " + tmp.getStdout());
                        if (tmp.getStdout() != null) {
                            if (tmp.getStdout().contains("no host specified")) {
                                ipList.add(rawIPList[j]);
                                j = rawIPList.length;
                            }
                        }
                    }
                } catch (Exception e) {
                    //ignore exceptions; if cidrlist is malformed, just leave it
                    //throw new Exception(e);
                }                
            }
        }
        return ipList;
    }
    
    private static ShellOutput doRemoteSnailEcho(String internalIp, String loginName, String keyFile, String hostName) throws Exception {
        String cmd = "ping";
        String nsh = Nsh.getNshCommand(internalIp, cmd);
        String ssh = Ssh.getSshCommand(loginName, keyFile, hostName, nsh);
        return shellExecute(ssh,3000);
    }
    
    public static ShellOutput doRemoteSql2(String sql) throws Exception {
        return doRemoteSql2(sql, KeyManager.getExtractedLoginName(), KeyManager.getSymKeyPath(), getTrueHostName());
    }    
    
    private static ShellOutput doRemoteSql2(String sql, String loginName, String keyFile, String hostName) throws Exception {
        String query = Sql2.getSql2Command(sql);
        String ssh = Ssh.getSshCommand(loginName, keyFile, hostName, query, true);
        return shellExecute(ssh, 60000);
    }    
        
    public static ShellOutput doRemoteCurl(String internalIp, String originIp, String hostHeader, String requestPath, Boolean ssl, String port) throws Exception {
        return doRemoteCurl(internalIp, originIp, hostHeader, requestPath, ssl, port, KeyManager.getExtractedLoginName(), KeyManager.getSymKeyPath(), getTrueHostName());
    }

    private static ShellOutput doRemoteCurl(String internalIp, String originIp, String hostHeader, String requestPath, Boolean ssl, String port, String loginName, String keyFile, String hostName) throws Exception {
        String curl = Curl.getCurlCommand(originIp, hostHeader, requestPath, ssl, port);
        String nsh = Nsh.getNshCommand(internalIp, curl);
        String ssh = Ssh.getSshCommand(loginName, keyFile, hostName, nsh);
        return shellExecute(ssh);
    }

    public static ShellOutput doRemoteEcho(String loginName, String keyFile) throws Exception {
        return doRemoteEcho(loginName, keyFile, getTrueHostName());
    }

    private static ShellOutput doRemoteEcho(String loginName, String keyFile, String hostName) throws Exception {
        String echo = "echo Successful echo.";
        String ssh = Ssh.getSshCommand(loginName, keyFile, hostName, echo, true);
        return shellExecute(ssh);
    }    
    
    private static ShellOutput shellExecute(String cmd) throws Exception {
        return shellExecute(cmd, 0);
    }    
    
    private static ShellOutput shellExecute(String cmd, long timeout) throws Exception {
        Runtime run = Runtime.getRuntime();
        Process pr = run.exec(cmd);
        Integer exitCode = null;

        if (timeout > 0 || timeout < 0) {
            Worker worker = new Worker(pr);
            worker.start();
            Utilities.logInfo("Started...");
            try {
                Utilities.logInfo("Joining...");
                worker.join(timeout);
                Utilities.logInfo("Joined...");
                if (worker.exit != null) 
                    exitCode = new Integer(worker.exit);
                else {
                    Utilities.logInfo("Throwing...");
                    pr.destroy();
                    throw new TimeoutException();
                }
            } catch(InterruptedException ex) {
                Utilities.logInfo("Interrupted...");
                worker.interrupt();
                Thread.currentThread().interrupt();
                pr.destroy();
                throw ex;
            }        
        }
        else {
            pr.waitFor();
            exitCode = new Integer(pr.exitValue());
        }
        
        BufferedReader buf = new BufferedReader( new InputStreamReader( pr.getInputStream() ) ) ;
        BufferedReader err = new BufferedReader( new InputStreamReader( pr.getErrorStream() ) ) ;
        String line;
        StringBuilder output = new StringBuilder("");

        while ((line = buf.readLine()) != null) {
            output.append(line);
            output.append("\n");
        }
        String finalStdout = output.toString();
        
        output = new StringBuilder("");
        while ((line = err.readLine()) != null) {
            output.append(line);
            output.append("\n");
        }            
        String finalStderr = output.toString();
        
        pr.destroy();
        return new ShellOutput(finalStdout, finalStderr, exitCode);
    }
    
    private static class Worker extends Thread {
        private final Process process;
        private Integer exit;
        private Worker(Process process) {
            this.process = process;
        }
        
        public void run() {
            try { 
                exit = process.waitFor();
            } catch (InterruptedException ignore) {
                return;
            }
        }  
    }    
    
}
