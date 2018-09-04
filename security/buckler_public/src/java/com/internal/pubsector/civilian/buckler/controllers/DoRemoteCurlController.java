/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package com.internal.pubsector.civilian.buckler.controllers;

import com.internal.pubsector.civilian.buckler.managers.TestManager;
import com.internal.pubsector.civilian.buckler.managers.KeyManager;
import static com.internal.pubsector.civilian.buckler.Utilities.firstElementOrNull;
import com.internal.pubsector.civilian.buckler.models.CommanderModel;
import com.internal.pubsector.civilian.buckler.objects.ShellOutput;
import java.util.Map;

/**
 *
 * @author jowilson
 */
public class DoRemoteCurlController implements ControllerInterface {
    public Object go(Map<String, String[]> parameters) throws Exception {
        String internalIp = firstElementOrNull(parameters.get("internalIp"));
        String originIp = firstElementOrNull(parameters.get("originIp"));
        String hostHeader = firstElementOrNull(parameters.get("hostHeader"));
        String requestPath = firstElementOrNull(parameters.get("requestPath"));
        String tmp = firstElementOrNull(parameters.get("ssl"));
        String port = firstElementOrNull(parameters.get("port"));

        Boolean ssl = false;
        if (tmp != null) {
            ssl = true;
        }
        
        return go(internalIp, originIp, hostHeader, requestPath, ssl, port);
    }
    
    public Object go(String internalIp, String originIp, String hostHeader, String requestPath, boolean ssl, String port) throws Exception {
        ShellOutput output = CommanderModel.doRemoteCurl(internalIp, originIp, hostHeader, requestPath, ssl, port);
        return output;
    }    
    
    public Boolean exposeTestManagerIfAllowed(TestManager m) {
        return false;
    }

    public Boolean exposeKeyManagerIfAllowed(KeyManager k) {
        return false;
    }
}
