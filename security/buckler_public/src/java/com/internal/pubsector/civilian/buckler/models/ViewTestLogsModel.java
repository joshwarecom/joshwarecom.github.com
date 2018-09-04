/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package com.internal.pubsector.civilian.buckler.models;

import com.internal.pubsector.civilian.buckler.Utilities;
import static com.internal.pubsector.civilian.buckler.Utilities.logInfo;
import com.internal.pubsector.civilian.buckler.objects.*;
import java.util.*;
/**
 *
 * @author jowilson
 */
public class ViewTestLogsModel implements ModelInterface {
    ConnectionTest test = null;
    public ViewTestLogsModel(ConnectionTest t) {
        test = t;
    }
    
    public Hashtable<String, Object> getTestLogs() throws Exception {        
        String stdErr = "";
        String stdOut = "";
        
        if (test.getOutputs().getShellOutput() != null) {
            stdErr = Utilities.blankIfNull(test.getOutputs().getShellOutput().getStderr());
            stdOut = Utilities.blankIfNull(test.getOutputs().getShellOutput().getStdout());
        }
        
        String verboseOutput = Utilities.blankIfNull(test.getOutputs().getVerboseOutput());        
        String testStatus = test.getPrintableStatus();
        String testResolution = test.getOutputs().getPrintableStatus();
        
        Hashtable<String, Object> table = new Hashtable<String, Object>();
        table.put("id", test.getTestId());
        table.put("stderr", Utilities.blankIfNull(stdErr));
        table.put("stdout", Utilities.blankIfNull(stdOut));
        table.put("verboseOutput", Utilities.blankIfNull(verboseOutput));
        table.put("status", Utilities.blankIfNull(testStatus));
        table.put("resolution", Utilities.blankIfNull(testResolution));
        return table;
    }
}
