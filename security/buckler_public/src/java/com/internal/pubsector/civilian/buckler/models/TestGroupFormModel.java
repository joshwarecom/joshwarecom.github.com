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
public class TestGroupFormModel implements ModelInterface {
    ArrayList<String> orderedKeys = new ArrayList<String>();
    Hashtable<String, String> data = new Hashtable<String, String>();
    
    public TestGroupFormModel(List<ConnectionTestMap> masterTestMapList) {
        for (int i = 0; i < masterTestMapList.size(); i++) {
            orderedKeys.add(masterTestMapList.get(i).getMapId());
            data.put(masterTestMapList.get(i).getMapId(), masterTestMapList.get(i).getMapName());
        }
    }
    
    public ArrayList<String> getOrderedKeys() throws Exception {
        return orderedKeys;
    }
    
    public Hashtable<String, String> getData() throws Exception {
        return data;
    }
}
