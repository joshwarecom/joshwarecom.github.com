/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package com.internal.pubsector.civilian.buckler.controllers;

import com.internal.pubsector.civilian.buckler.managers.TestManager;
import com.internal.pubsector.civilian.buckler.managers.KeyManager;
import java.util.Map;

/**
 *
 * @author jowilson
 */
public interface ControllerInterface {
    public Object go(Map<String, String[]> parameters) throws Exception;

    public Boolean exposeTestManagerIfAllowed(TestManager m);
    public Boolean exposeKeyManagerIfAllowed(KeyManager k);
}
