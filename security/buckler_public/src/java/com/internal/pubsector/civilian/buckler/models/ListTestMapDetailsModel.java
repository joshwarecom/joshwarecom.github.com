/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package com.internal.pubsector.civilian.buckler.models;

import com.internal.pubsector.civilian.buckler.Utilities;
import com.internal.pubsector.civilian.buckler.objects.*;
import java.util.*;
import java.net.InetAddress;
/**
 *
 * @author jowilson
 */
public class ListTestMapDetailsModel implements ModelInterface {
    Hashtable details = new Hashtable();
    ConnectionTestMap map = null;
    public ListTestMapDetailsModel(ConnectionTestMap m) {
        map = m;
        details.put("internalLogin", m.getinternalLogin());
        details.put("mapId", m.getMapId());
        details.put("mapName", m.getMapName());
        
        details.put("didIncludeManualGhostIPs", m.didIncludeManualGhostIPs());        
        details.put("manualGhostIPList", m.getManualIPList());

        details.put("didIncludeExtractedGhostIPs", m.didIncludeExtractedGhostIPs());        
        details.put("extractedGhostIPList", m.getExtractedIPList());
        details.put("manualCIDRList", m.getManualCIDRList());

        if (m.getNetwork() != null) {
            details.put("network", m.getNetwork());
        }
        
        if (m.getMapruleId() != null) {
            details.put("mapruleId", m.getMapruleId());
        }

        if (m.getMasterGhostIPList() != null) {
            details.put("masterGhostIPList", m.getMasterGhostIPList());
        }
    }
    
    public Hashtable getTestMapDetails() throws Exception {
        return details;
    }
}
