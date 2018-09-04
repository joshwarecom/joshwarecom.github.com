/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package com.internal.pubsector.civilian.buckler.controllers;
import static com.internal.pubsector.civilian.buckler.Utilities.firstElementOrNull;
import com.internal.pubsector.civilian.buckler.managers.KeyManager;
import com.internal.pubsector.civilian.buckler.managers.TestManager;
import com.internal.pubsector.civilian.buckler.objects.*;
import java.net.InetAddress;
import java.util.ArrayList;
import java.util.Date;

import java.util.Map;
import java.util.Hashtable;

/**
 *
 * @author jowilson
 */
public class AbortTestGroupController implements ControllerInterface {
    TestManager manager = null;

    public Object go(Map<String, String[]> parameters) throws Exception {
        if (manager == null) {
            throw new Exception("Error! Manager object was not exposed to AddTestGroupController, cannot abort test group!");
        }
        
        String id = firstElementOrNull(parameters.get("id"));
        ConnectionTestGroup testGroup = null;
        
        if (id == null || "".equals(id)) {
            throw new Exception("id must not be blank or null.");
        }
        else if ((testGroup=manager.getTestGroupById(id)) == null) {
            throw new Exception("id must be a valid test group id");
        }
        
        if (manager.abortExistingTestGroup(id) == false) {
            throw new Exception("error: could not abort test group");
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
