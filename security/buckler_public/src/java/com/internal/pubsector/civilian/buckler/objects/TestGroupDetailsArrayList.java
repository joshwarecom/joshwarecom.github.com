/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package com.internal.pubsector.civilian.buckler.objects;

import java.util.ArrayList;
/**
 *
 * @author jowilson
 */
public class TestGroupDetailsArrayList<E> extends ArrayList<E> {
    String testGroupMapId = null;
    String testGroupId = null;
    String start = null;
    String end = null;

    public String getTestGroupMapId() {
        return testGroupMapId;
    }
    
    public String getTestGroupId() {
        return testGroupId;
    }

    public TestGroupDetailsArrayList(String mapid, String testgroupid, String st, String en) {
        super();
        testGroupMapId = mapid;        
        testGroupId = testgroupid;
        start = st;
        end = en;
    }
    
    public String getStart() {
        return start;
    }
    
    public String getEnd() {
        return end;
    }
}
