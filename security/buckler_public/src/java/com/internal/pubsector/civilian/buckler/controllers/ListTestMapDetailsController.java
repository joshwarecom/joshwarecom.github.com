/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package com.internal.pubsector.civilian.buckler.controllers;

import static com.internal.pubsector.civilian.buckler.Utilities.firstElementOrNull;
import com.internal.pubsector.civilian.buckler.Utilities;
import com.internal.pubsector.civilian.buckler.managers.KeyManager;
import com.internal.pubsector.civilian.buckler.managers.TestManager;
import com.internal.pubsector.civilian.buckler.models.ListTestMapDetailsModel;
import com.internal.pubsector.civilian.buckler.objects.ConnectionTestMap;
import java.util.Map;

/**
 *
 * @author jowilson
 */
public class ListTestMapDetailsController implements ControllerInterface {
    TestManager manager = null;

    public Object go(Map<String, String[]> parameters) throws Exception {
        String id = firstElementOrNull(parameters.get("id"));
        if (id == null || "".equals(id)) {
            throw new Exception("id must not be blank or null.");
        }
        ConnectionTestMap map = manager.getTestMapById(id);
        if (map == null) {
            throw new Exception("id must be a valid existing test map id");
        }
        ListTestMapDetailsModel model = new ListTestMapDetailsModel(map);
        return model.getTestMapDetails();
    }
    
    public Boolean exposeTestManagerIfAllowed(TestManager m) {
        manager = m;
        return true;
    }
    
    public Boolean exposeKeyManagerIfAllowed(KeyManager k) {
        return false;
    }
    
}
