/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package com.internal.pubsector.civilian.buckler.controllers;

import static com.internal.pubsector.civilian.buckler.Utilities.firstElementOrNull;
import com.internal.pubsector.civilian.buckler.models.CommanderModel;
import com.internal.pubsector.civilian.buckler.objects.ShellOutput;
import com.internal.pubsector.civilian.buckler.objects.ConnectionTest;
import com.internal.pubsector.civilian.buckler.managers.TestManager;
import com.internal.pubsector.civilian.buckler.managers.KeyManager;
import com.internal.pubsector.civilian.buckler.objects.ConnectionTestGroup;
import com.internal.pubsector.civilian.buckler.objects.ConnectionTestMap;
import java.net.InetAddress;

import java.util.Date;
import java.util.Map;
import java.util.ArrayList;
import org.apache.commons.net.util.SubnetUtils;

/**
 *
 * @author jowilson
 */
public class AddTestGroupController implements ControllerInterface {
    TestManager manager = null;
    
    public Object go(Map<String, String[]> parameters) throws Exception {
        if (manager == null) {
            throw new Exception("Error! Manager object was not exposed to AddTestGroupController, cannot add test group!");
        }
        
        String cloneId = firstElementOrNull(parameters.get("cloneId"));
        String mapId = firstElementOrNull(parameters.get("mapId"));
        String originIpList = firstElementOrNull(parameters.get("originIpList"));
        String originPort = firstElementOrNull(parameters.get("originPort"));        
        String hostHeader = firstElementOrNull(parameters.get("hostHeader"));
        String requestPath = firstElementOrNull(parameters.get("requestPath"));
        String inputSSL = firstElementOrNull(parameters.get("ssl"));
        String testGroupName = firstElementOrNull(parameters.get("testGroupName"));
        
        String[] finalGhostIpList = null;
        String[] finalOriginIpList = null;        
        InetAddress[] validatedGhostInetAddresses = null;
        InetAddress[] validatedOriginInetAddresses = null;
        Integer validatedOriginPort = null;
        String validatedHostHeader = null;
        String validatedRequestPath = null;
        Boolean validatedSSL = false;
        String validatedTestGroupName = null;
        String validatedMapId = null;
        
        if (cloneId == null || "".equals(cloneId)) {
            if (mapId == null || "".equals(mapId)) {
                throw new Exception("mapId must not be blank or null.");
            }
            else if (manager.getMasterTestMapTable().get(mapId) == null) {
                throw new Exception("mapId must be valid configured map id.");
            }
            if (originIpList == null || "".equals(originIpList)) {
                throw new Exception("originIp must not be blank or null.");
            }
            if (originPort == null || "".equals(originPort)) {
                throw new Exception("originPort must not be blank or null.");
            }
            if (hostHeader == null || "".equals(hostHeader)) {
                throw new Exception("hostHeader must not be blank or null.");
            }
            if (requestPath == null || "".equals(requestPath)) {
                throw new Exception("requestPath must not be blank or null.");
            }
            if (testGroupName == null || "".equals(testGroupName)) {
                throw new Exception("testGroupName must not be blank or null.");
            }        


            try {
                String[] validOriginIpList = originIpList.split(" ");
                if (validOriginIpList.length <= 0) {
                    throw new Exception("Zero entries found in originIpList.");
                }
                for (int i = 0; i < validOriginIpList.length; i++) {
                    InetAddress validOriginIp = InetAddress.getByName(validOriginIpList[i]);
                }
                finalOriginIpList = validOriginIpList;

                validatedOriginInetAddresses = new InetAddress[finalOriginIpList.length];            
                for (int i = 0; i < finalOriginIpList.length; i++) {
                    validatedOriginInetAddresses[i] = InetAddress.getByName(finalOriginIpList[i]);
                }

            } catch (Exception e) {
                throw new Exception("originIpList does not appear to be a space delimited list of valid ips: " + e.getMessage(), e);
            }

            try {
                Integer validOriginPort = Integer.parseInt(originPort);
                validatedOriginPort = new Integer(validOriginPort);
            } catch (Exception e) {
                throw new Exception("originPort does not appear to be a valid integer: " + e.getMessage(), e);
            }

            try {
                ConnectionTestMap map = manager.getMasterTestMapTable().get(mapId);
                validatedGhostInetAddresses = map.getMasterGhostIPList();
            } catch (Exception e) {
                throw new Exception("ghostIpList could not be extracted from map id (" + mapId + "): " + e.getMessage(), e);
            }

            validatedHostHeader = hostHeader;
            validatedRequestPath = requestPath;
            if (inputSSL != null) {
                validatedSSL = true;
            }

            validatedTestGroupName = testGroupName;
            validatedMapId = mapId;
        }
        else {
            ConnectionTestGroup group = manager.getTestGroupById(cloneId);
            if (group == null) {
                throw new Exception("cloneId must be a valid existing test group id");
            }
            
            mapId = group.getTestGroupMapId();
            if (mapId == null) {
                throw new Exception("no mapId associated with that cloneId (cloneId=" + cloneId + ")");
            }
            ConnectionTestMap map = manager.getTestMapById(mapId);
            if (map == null) {
                throw new Exception("no valid mapId associated with that cloneId (cloneId=" + cloneId + ", mapId=" + mapId + ")");
            }
            validatedMapId = mapId;
            validatedGhostInetAddresses = map.getMasterGhostIPList();
            
            ConnectionTest test = group.getTestByIndex(0);
            if (test == null) {
                throw new Exception("no completed tests associated with that cloneId (cloneId=" + cloneId + ")");
            }
            
            originPort = test.getInputs().getOriginPort();
            try {
                Integer validOriginPort = Integer.parseInt(originPort);
                validatedOriginPort = new Integer(validOriginPort);
            } catch (Exception e) {
                throw new Exception("originPort does not appear to be a valid integer: " + e.getMessage(), e);
            }
            
            validatedHostHeader = test.getInputs().getHostHeader();
            validatedRequestPath = test.getInputs().getRequestPath();
            validatedSSL = (test.getInputs().getSSL()==true);
            validatedTestGroupName = group.getTestGroupName();
            
            ArrayList<InetAddress> uniqueOriginIPs = new ArrayList<InetAddress>();
            for (int i = 0; i < group.getConnectionTestCount(); i++)
            {
                InetAddress tmp = InetAddress.getByName(group.getTestByIndex(i).getInputs().getOriginIp());
                if (!uniqueOriginIPs.contains(tmp)) {
                    uniqueOriginIPs.add(tmp);
                }
            }
            validatedOriginInetAddresses = new InetAddress[uniqueOriginIPs.size()];
            for (int i = 0; i < validatedOriginInetAddresses.length; i++) {
                validatedOriginInetAddresses[i] = uniqueOriginIPs.get(i);
            }            
        }
        
        boolean success = manager.addNewValidatedTestGroup(validatedOriginInetAddresses, validatedOriginPort, validatedHostHeader, validatedRequestPath, validatedSSL.booleanValue(), validatedGhostInetAddresses, validatedTestGroupName, validatedMapId, new Date().toString());
        if (!success) {
            throw new Exception("Could not add new test group.");
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
