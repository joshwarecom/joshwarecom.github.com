/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package com.internal.pubsector.civilian.buckler.controllers;

import com.internal.pubsector.civilian.buckler.managers.KeyManager;
import com.internal.pubsector.civilian.buckler.managers.TestManager;
import static com.internal.pubsector.civilian.buckler.Utilities.blankIfNull;
import static com.internal.pubsector.civilian.buckler.Utilities.firstElementOrNull;
import com.internal.pubsector.civilian.buckler.models.CommanderModel;
import com.internal.pubsector.civilian.buckler.objects.ShellOutput;
import java.util.Map;

/**
 *
 * @author jowilson
 */
public class DoSnailScanController implements ControllerInterface {
    public Object go(Map<String, String[]> parameters) throws Exception {        
        String cidrList = blankIfNull(firstElementOrNull(parameters.get("cidrList")));
        String[] listArray = cidrList.split(" ");
        return go(listArray);
    }
    
    public Object go(String[] cidrList) throws Exception {
        if (cidrList == null || cidrList.length == 0) {
            throw new Exception("cidrList array must not be null or 0 length.");
        }
        return CommanderModel.doSnailScan(cidrList);
    }
    
    public Boolean exposeTestManagerIfAllowed(TestManager m) {
        return false;
    }
    
    public Boolean exposeKeyManagerIfAllowed(KeyManager k) {
        return false;
    }    
}
