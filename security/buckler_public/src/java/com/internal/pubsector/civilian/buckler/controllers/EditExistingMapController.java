/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package com.internal.pubsector.civilian.buckler.controllers;

import com.internal.pubsector.civilian.buckler.Utilities.*;
import static com.internal.pubsector.civilian.buckler.Utilities.blankIfNull;
import static com.internal.pubsector.civilian.buckler.Utilities.firstElementOrNull;
import com.internal.pubsector.civilian.buckler.objects.ConnectionTestMap;
import com.internal.pubsector.civilian.buckler.managers.KeyManager;
import com.internal.pubsector.civilian.buckler.managers.TestManager;
import java.util.*;

/**
 *
 * @author jowilson
 */
public class EditExistingMapController implements ControllerInterface {
    TestManager manager = null;
    
    public Object go(Map<String, String[]> parameters) throws Exception {
        if (manager == null) {
            throw new Exception("Error! Manager object was not exposed to AddTestGroupController, cannot add test group!");
        }
        
        String edit = firstElementOrNull(parameters.get("edit"));
        if (edit == null || "".equals(edit)) {
            return null;
        }
        else {
            ConnectionTestMap editMe = manager.getTestMapById(edit);
            if (manager.getTestMapById(edit) == null) {
                if (manager.getTestGroupById(edit) == null) {
                    throw new Exception("edit must be a valid test map id, or a valid test scan id.");
                }
                else {
                    editMe = manager.getTestMapById(manager.getTestGroupById(edit).getTestGroupMapId());
                }
            }
            return editMe;
        }
    }
    
    public Boolean exposeTestManagerIfAllowed(TestManager m) {
        manager = m;
        return true;
    }
    
    public Boolean exposeKeyManagerIfAllowed(KeyManager k) {
        return false;
    }    
}
