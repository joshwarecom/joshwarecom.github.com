/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package com.internal.pubsector.civilian.buckler.controllers;

import com.internal.pubsector.civilian.buckler.managers.KeyManager;
import com.internal.pubsector.civilian.buckler.managers.TestManager;
import com.internal.pubsector.civilian.buckler.models.ListTestMapsModel;
import com.internal.pubsector.civilian.buckler.objects.*;

import java.util.Map;
import java.util.Hashtable;

/**
 *
 * @author jowilson
 */
public class ListTestMapsController implements ControllerInterface {
    TestManager manager = null;

    public Object go(Map<String, String[]> parameters) throws Exception {
        ListTestMapsModel model = new ListTestMapsModel(manager.getMasterTestMapList());
        return model.getTestMapPairs();
    }
    
    public Boolean exposeTestManagerIfAllowed(TestManager m) {
        manager = m;
        return true;
    }
    
    public Boolean exposeKeyManagerIfAllowed(KeyManager k) {
        return false;
    }
}
