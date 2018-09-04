/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package com.internal.pubsector.civilian.buckler.controllers;

import com.internal.pubsector.civilian.buckler.Utilities;
import static com.internal.pubsector.civilian.buckler.Utilities.firstElementOrNull;
import static com.internal.pubsector.civilian.buckler.Utilities.blankIfNull;
import com.internal.pubsector.civilian.buckler.managers.KeyManager;
import com.internal.pubsector.civilian.buckler.managers.TestManager;
import com.internal.pubsector.civilian.buckler.models.ExtractCidrsModel;
import com.internal.pubsector.civilian.buckler.objects.*;
import java.net.InetAddress;
import java.util.concurrent.TimeoutException;
import java.util.Map;
import java.util.Hashtable;
import java.util.List;
import java.util.ArrayList;


/**
 *
 * @author jowilson
 */
public class ExtractCidrsController implements ControllerInterface {
    TestManager manager = null;
    final int maxCidrCount = 6144;
    final int maxCidrChunks = 2;

    public Object go(Map<String, String[]> parameters) throws Exception {
        if (manager == null) {
            throw new Exception("Test manager is not properly exposed to ExtractCidrsController; cannot expand CIDRs.");
        }
        
        String cidrList = firstElementOrNull(parameters.get("cidrList"));
        String ipList = firstElementOrNull(parameters.get("ipList"));
        String mapruleId = firstElementOrNull(parameters.get("mapruleId"));
        String network = firstElementOrNull(parameters.get("network"));
        String[] ipListGroups = null;
                        
        if (cidrList != null) {
            String[] strArray = cidrList.split(" ");
            try {
                ExtractCidrsModel model = new ExtractCidrsModel(strArray);
                List<String> validatedIps = model.getValidatedIpList();
                return validatedIps;
            }
            catch (Exception e) {
                throw new Exception("cidrList does not appear to be a space delimited list of CIDR blocks: " + e.getMessage(), e);
            }
        }
        else if (ipList != null) {
            
            String[] strArray = ipList.split(" ");
            if (strArray.length > maxCidrCount) {
                throw new Exception("Too many CIDRs in ipList; max = " + maxCidrCount + ".");
            }
            
            try {
                for (int i = 0; i < strArray.length; i++) {
                    InetAddress validIp = InetAddress.getByName(strArray[i]);
                }
            }
            catch (Exception e) {
                throw new Exception("ipList does not appear to be a space delimited list of IPs: " + e.getMessage(), e);
            }
            
            int cidrChunks = maxCidrCount/maxCidrChunks;
            int remainder = maxCidrCount-(maxCidrChunks*cidrChunks);      

                ipListGroups = new String[maxCidrChunks+(remainder > 0 ? 1 : 0)];
                for (int i = 0; i < ipListGroups.length; i++) {
                    ipListGroups[i] = "";
                    for (int j = 0; j < cidrChunks; j++) {
                        if (((i * cidrChunks) + j) < strArray.length) {
                            ipListGroups[i] += strArray[(i * cidrChunks) + j];
                            if (((i * cidrChunks) + j) < (strArray.length-1) && (j < (cidrChunks-1))) {
                                ipListGroups[i] += ", ";
                            }
                        }
                    }
                    if (i == ipListGroups.length) {
                        if (remainder != 0) {
                            ipListGroups[i+1] = "";                            
                            for (int j = 0; j < remainder; j++) {
                                if ((((i+1) * cidrChunks) + j) < strArray.length) {
                                    ipListGroups[i+1] += strArray[((i+1) * cidrChunks) + j];
                                    if ((((i+1) * cidrChunks) + j) < (strArray.length-1) && (j < (remainder-1))) {
                                        ipListGroups[i+1] += ", ";
                                    }
                                }
                            }                            
                        }
                    }
                }
                        
            if ("".equals(mapruleId)) {
                throw new Exception("mapruleId must not be blank or null.");
            }
            else {
                try {
                    Integer.parseInt(mapruleId);
                } catch (Exception e) {
                    throw new Exception("mapruleId must be an integer: " + e.getMessage(), e);
                }
            }

            if (!"freeflow".equals(network)) {
                if (!"essl".equals(network)) {
                    throw new Exception("network must freeflow or essl.");
                }
            }

            List<String> outputList = new ArrayList<String>();
            List<String> regionList = new ArrayList<String>();
            
            //run the queries twice so that it has time to warm up and return complete data
            for (int k = 0; k < 2; k++) {
            for (int j = 0; j < ipListGroups.length; j++) {
            if (!"".equals(ipList=Utilities.blankIfNull(ipListGroups[j]))) {

            DoRemoteSql2Controller sql2Controller = new DoRemoteSql2Controller();
                
            String serviceIdentifier = "W";
            if ("essl".equals(network)) {
                serviceIdentifier = "S";
            }            
                                
            StringBuilder query = new StringBuilder("select ghostip, physregion, service from ghostinfo where suspendflag = 0 and suspend_level = 0 and connections > 0 and ghostip in (");
            query.append(ipList);
            query.append(") and service = '");
            query.append(serviceIdentifier);
            query.append("' group by ghostip");
                
            Utilities.logInfo("***" + query.toString() + "***");
                
            ShellOutput queryOutput = null;
            try {
                queryOutput = (ShellOutput)sql2Controller.go(query.toString());
            } catch (TimeoutException e) {
                //ignore timeout exception, just leave queryTimeout as null;
                Utilities.logInfo("***TIMEOUT EXCEPTION CAUGHT***");
            }
            
            if (queryOutput != null) {
                String stdOut = queryOutput.getStdout();
                Utilities.logInfo("Stdout is: " + stdOut);
                Utilities.logInfo("Stderr is: " + queryOutput.getStderr());
                if (stdOut != null) {
                    if (!stdOut.contains("\n0 rows selected")) {
                        if (stdOut.contains(" rows selected")) {
                            String[] lines = stdOut.split("\n");
                            if (lines.length > 4) {
                                for (int i = 2; i < (lines.length - 2); i++) {
                                    String tmp = lines[i].replaceAll("\t"," ");
                                    tmp = tmp.trim();
                                    while (tmp.contains("  ")) tmp = tmp.replaceAll("  ", " ");
                                    Utilities.logInfo("Processing: *" + tmp + "*");
                                    String[] tmpArray = tmp.split(" ");
                                    if (!regionList.contains(tmpArray[1])) {
                                        outputList.add(tmpArray[0]);
                                        regionList.add(tmpArray[1]);
                                    }
                                }
                            }
                        }
                    }
                }
            }
            }
            Thread.sleep(5000);
            }
            Thread.sleep(5000);
            }
            if (outputList.size() > 0)
                return outputList;
        }
        return null;
    }
    
    public Boolean exposeTestManagerIfAllowed(TestManager m) {
        manager = m;
        return true;
    }
    
    public Boolean exposeKeyManagerIfAllowed(KeyManager k) {
        return false;
    }
}
