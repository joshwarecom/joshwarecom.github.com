/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package com.internal.pubsector.civilian.buckler.controllers;

import com.internal.pubsector.civilian.buckler.managers.KeyManager;
import com.internal.pubsector.civilian.buckler.managers.TestManager;
import com.internal.pubsector.civilian.buckler.models.TestGroupFormModel;
import com.internal.pubsector.civilian.buckler.objects.*;

import java.util.Map;
import java.util.Hashtable;

/**
 *
 * @author jowilson
 */
public class TestGroupFormController implements ControllerInterface {
    TestManager manager = null;

    public Object go(Map<String, String[]> parameters) throws Exception {
        TestGroupFormModel model = new TestGroupFormModel(manager.getMasterTestMapList());
        return new ListMapPair(model.getOrderedKeys(), model.getData());
    }
    
    public Boolean exposeTestManagerIfAllowed(TestManager m) {
        manager = m;
        return true;
    }
    
    public Boolean exposeKeyManagerIfAllowed(KeyManager k) {
        return false;
    }
}
