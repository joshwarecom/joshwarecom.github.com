/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package com.internal.pubsector.civilian.buckler.controllers;

import static com.internal.pubsector.civilian.buckler.Utilities.firstElementOrNull;
import com.internal.pubsector.civilian.buckler.managers.KeyManager;
import com.internal.pubsector.civilian.buckler.managers.TestManager;
import com.internal.pubsector.civilian.buckler.models.ViewTestLogsModel;
import com.internal.pubsector.civilian.buckler.objects.ConnectionTestGroup;
import com.internal.pubsector.civilian.buckler.objects.ConnectionTest;
import java.util.Map;

/**
 *
 * @author jowilson
 */
public class ViewTestLogsController implements ControllerInterface {
    TestManager manager = null;    
    
    public Object go(Map<String, String[]> parameters) throws Exception {
        String groupId = firstElementOrNull(parameters.get("groupId"));
        if (groupId == null || "".equals(groupId)) {
            throw new Exception("groupId must not be blank or null.");
        }

        String testId = firstElementOrNull(parameters.get("testId"));
        if (testId == null || "".equals(testId)) {
            throw new Exception("testId must not be blank or null.");
        }
        
        ConnectionTestGroup group = manager.getTestGroupById(groupId);
        if (group == null) {
            throw new Exception("groupId must be a valid existing test group id");
        }
        
        ConnectionTest test = group.getTestById(testId);
        if (test == null) {
            throw new Exception("testId must be a valid test belong to group id " + groupId);            
        }
        
        ViewTestLogsModel model = new ViewTestLogsModel(test);
        return model.getTestLogs();
    }
    

    public Boolean exposeTestManagerIfAllowed(TestManager m) {
        manager = m;
        return true;
    }
    
    public Boolean exposeKeyManagerIfAllowed(KeyManager k) {
        return false;
    }
    
}
