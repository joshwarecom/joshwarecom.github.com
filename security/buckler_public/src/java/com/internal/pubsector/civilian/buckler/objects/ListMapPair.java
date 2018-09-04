/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package com.internal.pubsector.civilian.buckler.objects;

import java.util.*;
/**
 *
 * @author jowilson
 */
public class ListMapPair {
    List list = null;
    Map map = null;
    
    public ListMapPair(List l, Map m) {
        list = l;
        map = m;
    }
    
    public List getList() {
        return list;
    }
    
    public Map getMap() {
        return map;
    }
}
