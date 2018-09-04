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
public class DoRemoteSql2Controller implements ControllerInterface {
    public Object go(Map<String, String[]> parameters) throws Exception {        
        String sql = firstElementOrNull(parameters.get("sql"));
        return go(sql);
    }
    
    public Object go(String sql) throws Exception {
        if ("".equals(blankIfNull(sql))) {
            throw new Exception("Sql cannot be null or blank.");
        }
        ShellOutput output = CommanderModel.doRemoteSql2(sql);
        return output;
    }
    
    public Boolean exposeTestManagerIfAllowed(TestManager m) {
        return false;
    }
    
    public Boolean exposeKeyManagerIfAllowed(KeyManager k) {
        return false;
    }    
}
