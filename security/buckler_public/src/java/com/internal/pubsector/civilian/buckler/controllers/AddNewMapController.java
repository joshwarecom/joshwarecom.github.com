/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package com.internal.pubsector.civilian.buckler.controllers;

import static com.internal.pubsector.civilian.buckler.Utilities.firstElementOrNull;
import static com.internal.pubsector.civilian.buckler.Utilities.blankIfNull;
import com.internal.pubsector.civilian.buckler.managers.KeyManager;
import com.internal.pubsector.civilian.buckler.managers.TestManager;
import com.internal.pubsector.civilian.buckler.objects.ConnectionTestMap;
import java.net.InetAddress;
import java.util.Map;
import java.util.List;
import java.util.ArrayList;

/**
 *
 * @author jowilson
 */
public class AddNewMapController  implements ControllerInterface {

    TestManager manager = null;
    
    public Object go(Map<String, String[]> parameters) throws Exception {
        if (manager == null) {
            throw new Exception("Error! Manager object was not exposed to AddNewMapController, cannot add test map!");
        }
        
        String edit = firstElementOrNull(parameters.get("edit"));
        if (edit != null && !"".equals(edit)) {
            if (manager.getTestMapById(edit) == null) {
                if (manager.getTestGroupById(edit) == null) {
                    throw new Exception("edit must be a valid test map id, or a valid test scan id.");
                }
                else {
                    edit = manager.getTestGroupById(edit).getTestGroupMapId();
                }
            }            
        }
        else {
            edit = null;
        }

        String internalLogin = firstElementOrNull(parameters.get("internalLogin"));
        String mapName = firstElementOrNull(parameters.get("mapName"));
        String network = firstElementOrNull(parameters.get("network"));
        String mapruleId = firstElementOrNull(parameters.get("mapruleId"));
        String extractFromManualCIDRs = firstElementOrNull(parameters.get("extractFromManualCIDRs"));
        String includeManualGhostIPs = firstElementOrNull(parameters.get("includeManualGhostIPs"));
        String includeCurrentQueriedGhostIPs = firstElementOrNull(parameters.get("includeCurrentQueriedGhostIPs"));
        String includeFutureQueriedGhostIPs = firstElementOrNull(parameters.get("includeFutureQueriedGhostIPs"));
        
        String manualGhostIPList = firstElementOrNull(parameters.get("manualGhostIPList"));
        String manualGhostCIDRList = firstElementOrNull(parameters.get("manualGhostCIDRList"));
        String extractedGhostIPList = firstElementOrNull(parameters.get("extractedGhostIPList"));
        String mapNotes = blankIfNull(firstElementOrNull(parameters.get("mapNotes")));
        
        String[] finalManualGhostIpList = null;
        InetAddress[] validatedManualGhostInetAddresses = null;
        
        String[] finalExtractedGhostIpList = null;
        InetAddress[] validatedExtractedGhostInetAddresses = null;
        
        List<InetAddress> allValidatedAddresses = new ArrayList<InetAddress>();

        if ("".equals(internalLogin)) {
            throw new Exception("internalLogin must not be blank or null.");
        }
        
        if ("".equals(mapName)) {
            throw new Exception("mapName must not be blank or null.");
        }
        
        if (!"freeflow".equals(network)) {
            if (!"essl".equals(network)) {
                throw new Exception("network must freeflow or essl.");
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

        if (!"yes".equals(extractFromManualCIDRs))
            if (!"yes".equals(includeManualGhostIPs))
                if (!"yes".equals(includeCurrentQueriedGhostIPs))
                    if (!"yes".equals(includeFutureQueriedGhostIPs))
                    {
                        throw new Exception("'yes' must be selected for at least one of the following: queryGhostCIDRList, includeManualGhostIPs, includeCurrentQueriedGhostIPs, includeFutureQueriedGhostIPs");
                    }
        
        if ("yes".equals(includeManualGhostIPs)) {
            if ("".equals(manualGhostIPList)) {
                throw new Exception("if includeManualGhostIPs is 'yes', manualGhostIPList must not be null or blank.");
            }            
            try {
                String[] validManualGhostIpList = manualGhostIPList.split(" ");
                if (validManualGhostIpList.length <= 0) {
                    throw new Exception("Zero entries found in manualGhostIpList.");
                }
                for (int i = 0; i < validManualGhostIpList.length; i++) {
                    InetAddress validManualGhostOriginIp = InetAddress.getByName(validManualGhostIpList[i]);
                }
                finalManualGhostIpList = validManualGhostIpList;

                validatedManualGhostInetAddresses = new InetAddress[finalManualGhostIpList.length];            
                for (int i = 0; i < finalManualGhostIpList.length; i++) {
                    validatedManualGhostInetAddresses[i] = InetAddress.getByName(finalManualGhostIpList[i]);
                    allValidatedAddresses.add(validatedManualGhostInetAddresses[i]);
                }

            } catch (Exception e) {
                throw new Exception("manualGhostIpList does not appear to be a space delimited list of valid ips: " + e.getMessage(), e);
            }
        }        
        
        if ("yes".equals(extractFromManualCIDRs)) {
            if ("".equals(extractedGhostIPList)) {
                throw new Exception("if extractFromManualCIDRs is 'yes', extractedGhostIPList must not be null or blank.");
            }
            if ("".equals(manualGhostCIDRList)) {
                throw new Exception("if extractFromManualCIDRs is 'yes', manualGhostCIDRList must not be null or blank.");
            }            
            try {
                String[] validExtractedGhostIpList = extractedGhostIPList.split(" ");
                if (validExtractedGhostIpList.length <= 0) {
                    throw new Exception("Zero entries found in extractedGhostIPList.");
                }
                for (int i = 0; i < validExtractedGhostIpList.length; i++) {
                    InetAddress validExtractedGhostOriginIp = InetAddress.getByName(validExtractedGhostIpList[i]);
                }
                finalExtractedGhostIpList = validExtractedGhostIpList;

                validatedExtractedGhostInetAddresses = new InetAddress[finalExtractedGhostIpList.length];            
                for (int i = 0; i < finalExtractedGhostIpList.length; i++) {
                    validatedExtractedGhostInetAddresses[i] = InetAddress.getByName(finalExtractedGhostIpList[i]);
                    allValidatedAddresses.add(validatedExtractedGhostInetAddresses[i]);
                }                
            } catch (Exception e) {
                throw new Exception("extractedGhostIPList does not appear to be a space delimited list of valid ips: " + e.getMessage(), e);
            }
        }
        
        if ("yes".equals(includeCurrentQueriedGhostIPs)) {
            throw new Exception("Sorry, includeCurrentQueriedGhostIPs not yet implemented.");
        }        
        
        if ("yes".equals(includeFutureQueriedGhostIPs)) {
            throw new Exception("Sorry, includeFutureQueriedGhostIPs not yet implemented.");
        }
        
        InetAddress[] finalAddressList = new InetAddress[allValidatedAddresses.size()];
        for (int i = 0; i < finalAddressList.length; i++) {
            finalAddressList[i] = allValidatedAddresses.get(i);
        }
                
        boolean success = manager.addNewValidatedTestMap(internalLogin, mapName, extractFromManualCIDRs.equals("yes"), includeManualGhostIPs.equals("yes"), includeCurrentQueriedGhostIPs.equals("yes"), includeFutureQueriedGhostIPs.equals("yes"), manualGhostIPList, manualGhostCIDRList, extractedGhostIPList, "", "", "", "", finalAddressList, network, mapruleId, edit, mapNotes);
        if (!success) {
            throw new Exception("Could not add new test map.");
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
