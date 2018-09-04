/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package com.internal.pubsector.civilian.buckler.models;

import com.internal.pubsector.civilian.buckler.objects.*;
import java.util.*;
/**
 *
 * @author jowilson
 */
public class ListTestMapsModel implements ModelInterface {
    Hashtable<String, ConnectionTestMap> testMapNames = new Hashtable<String, ConnectionTestMap>();
    ArrayList<String> testMapIds = new ArrayList<String>();

    public ListTestMapsModel(List<ConnectionTestMap> masterTestMapList) throws Exception {
        for (int i = 0; i < masterTestMapList.size(); i++) {
            ConnectionTestMap testMap = masterTestMapList.get(i);
            testMapNames.put(testMap.getMapId(), testMap);
            testMapIds.add(testMap.getMapId());
        }
    }
    
    public ListMapPair getTestMapPairs() {
        return new ListMapPair(testMapIds, testMapNames);
    }

}
