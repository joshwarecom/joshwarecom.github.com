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
public class ExtractCidrsModel implements ModelInterface {
    List<String> validatedIpList = new ArrayList<String>();
    public ExtractCidrsModel(String[] cidrList) throws Exception {
        for (int i = 0; i < cidrList.length; i++) {
            String[] ipList = Utilities.getIpsFromCidr(cidrList[i]);
            for (int j = 0; j < ipList.length; j++) {
                validatedIpList.add(ipList[j]);
            }
        }
    } 

    public List<String> getValidatedIpList() {
        return validatedIpList;
    }
}
