/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package com.internal.pubsector.civilian.buckler.models;

import com.internal.pubsector.civilian.buckler.Utilities;
import com.internal.pubsector.civilian.buckler.objects.*;
import java.util.*;
/**
 *
 * @author jowilson
 */
public class ListTestGroupDetailsModel implements ModelInterface {
    ConnectionTestGroup group = null;
    public ListTestGroupDetailsModel(ConnectionTestGroup g) {
        group = g;
    }
    
    public ArrayList<Hashtable<String, Object>> getTestGroupDetails() throws Exception {        
        TestGroupDetailsArrayList<Hashtable<String,Object>> list = new TestGroupDetailsArrayList<Hashtable<String,Object>>(Utilities.valueIfNull(group.getTestGroupMapId(), "<unknown>"), group.getTestGroupId(), group.getStart(), group.getEnd());
        for (int i = 0; i < group.getConnectionTestCount(); i++) {
            Hashtable<String, Object> table = new Hashtable<String, Object>();
            table.put("ghostIp",group.getTestByIndex(i).getInputs().getGhostIp());
            table.put("originIp",group.getTestByIndex(i).getInputs().getOriginIp());
            table.put("originPort",group.getTestByIndex(i).getInputs().getOriginPort().toString());
            table.put("hostHeader",group.getTestByIndex(i).getInputs().getHostHeader());
            table.put("requestPath",group.getTestByIndex(i).getInputs().getRequestPath());
            table.put("ssl",group.getTestByIndex(i).getInputs().getSSL().toString());
            table.put("testId",group.getTestByIndex(i).getTestId());
            table.put("groupId",group.getTestGroupId());            
            table.put("groupName",group.getTestGroupName());
            table.put("status",Utilities.blankIfNull(group.getTestByIndex(i).getPrintableStatus()));                        
            table.put("verboseOutput",Utilities.blankIfNull(group.getTestByIndex(i).getOutputs().getVerboseOutput()));            
            table.put("resolution",Utilities.blankIfNull(group.getTestByIndex(i).getOutputs().getPrintableStatus()));
            if (group.getTestByIndex(i).getOutputs().getShellOutput() != null) {
                table.put("shellOutput",group.getTestByIndex(i).getOutputs().getShellOutput());            
            }
            list.add(table);
        }
        return list;
    }
}
