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
public class DoRemoteEchoController implements ControllerInterface {
    public Object go(Map<String, String[]> parameters) throws Exception {        
        String keyFile = firstElementOrNull(parameters.get("keyFile"));
        String loginName = firstElementOrNull(parameters.get("loginName"));
        ShellOutput output = CommanderModel.doRemoteEcho(loginName, keyFile);

        String result = "FAILURE";
        if (blankIfNull(output.getStdout()).contains("Successful echo")) {
            result = "SUCCESS";
        }
        
        StringBuffer finalOutput = new StringBuffer(result);
        finalOutput.append("\n\nVerbose SSH STDOUT output:\n");
        finalOutput.append(output.getStdout());
        finalOutput.append("\n\nVerbose SSH STDERR output:\n");
        finalOutput.append(output.getStderr());
        
        return finalOutput;
    }
    
    public Boolean exposeTestManagerIfAllowed(TestManager m) {
        return false;
    }
    
    public Boolean exposeKeyManagerIfAllowed(KeyManager k) {
        return false;
    }    
}
