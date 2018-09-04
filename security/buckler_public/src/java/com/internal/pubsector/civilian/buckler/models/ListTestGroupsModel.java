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
public class ListTestGroupsModel implements ModelInterface {
    ArrayList<String> pendingIds = new ArrayList<String>();
    Hashtable<String, String> pendingIdNamePairs = new Hashtable<String, String>();

    ArrayList<String> activeIds = new ArrayList<String>();    
    Hashtable<String, String> activeIdNamePairs = new Hashtable<String, String>();
    
    ArrayList<String> resolvedIds = new ArrayList<String>();    
    Hashtable<String, String> resolvedIdNamePairs = new Hashtable<String, String>();

    public ListTestGroupsModel(List<ConnectionTestGroup> pending, List<ConnectionTestGroup> active, List<ConnectionTestGroup> resolved) throws Exception {
        for (int i = 0; i < pending.size(); i++) {
            pendingIds.add(pending.get(i).getTestGroupId());
            pendingIdNamePairs.put(pending.get(i).getTestGroupId(), pending.get(i).getTestGroupName());
        }

        for (int i = 0; i < active.size(); i++) {
            activeIds.add(active.get(i).getTestGroupId());
            activeIdNamePairs.put(active.get(i).getTestGroupId(), active.get(i).getTestGroupName());   
            int resolveCount = 0;
            int pendingCount = 0;
            int successCount = 0;            
            int ghostFailCount = 0;
            int originFailCount = 0;
            for (int j = 0; j < active.get(i).getConnectionTestCount(); j++) {
                if (active.get(i).getTestByIndex(j).isResolved()) {
                    resolveCount++;
                }
                
                if (active.get(i).getTestByIndex(j).getOutputs() != null) {
                    if (active.get(i).getTestByIndex(j).getOutputs().getStatus() == ConnectionTestOutput.Statuses.GHOST_CONNECTION_FAILED) {
                        ghostFailCount++;
                    }
                    else 
                    if (active.get(i).getTestByIndex(j).getOutputs().getStatus() == ConnectionTestOutput.Statuses.ORIGIN_CONNECTION_FAILED) {
                        originFailCount++;
                    }
                    else
                    if (active.get(i).getTestByIndex(j).getOutputs().getStatus() == ConnectionTestOutput.Statuses.SUCCESSFUL) {
                        successCount++;
                    }
                    else {
                        pendingCount++;
                    }
                }
            }
            activeIdNamePairs.put(active.get(i).getTestGroupId() + "@resolvedCount", ""+resolveCount);
            activeIdNamePairs.put(active.get(i).getTestGroupId() + "@ghostCount", ""+ghostFailCount);
            activeIdNamePairs.put(active.get(i).getTestGroupId() + "@originCount", ""+originFailCount);
            activeIdNamePairs.put(active.get(i).getTestGroupId() + "@pendingCount", ""+pendingCount);
            activeIdNamePairs.put(active.get(i).getTestGroupId() + "@successCount", ""+successCount);
            activeIdNamePairs.put(active.get(i).getTestGroupId() + "@aborted", ""+active.get(i).isAborted());
        }

        for (int i = 0; i < resolved.size(); i++) {
            resolvedIds.add(resolved.get(i).getTestGroupId());
            resolvedIdNamePairs.put(resolved.get(i).getTestGroupId(), resolved.get(i).getTestGroupName());
            
            int resolveCount = 0;
            int pendingCount = 0;
            int successCount = 0;            
            int ghostFailCount = 0;
            int originFailCount = 0;
            
            for (int j = 0; j < resolved.get(i).getConnectionTestCount(); j++) {
                if (resolved.get(i).getTestByIndex(j).isResolved()) {
                    resolveCount++;
                }
                
                if (resolved.get(i).getTestByIndex(j).getOutputs() != null) {
                    if (resolved.get(i).getTestByIndex(j).getOutputs().getStatus() == ConnectionTestOutput.Statuses.GHOST_CONNECTION_FAILED) {
                        ghostFailCount++;
                    }
                    else 
                    if (resolved.get(i).getTestByIndex(j).getOutputs().getStatus() == ConnectionTestOutput.Statuses.ORIGIN_CONNECTION_FAILED) {
                        originFailCount++;
                    }
                    else
                    if (resolved.get(i).getTestByIndex(j).getOutputs().getStatus() == ConnectionTestOutput.Statuses.SUCCESSFUL) {
                        successCount++;
                    }
                    else {
                        pendingCount++;
                    }
                }
            }
            resolvedIdNamePairs.put(resolved.get(i).getTestGroupId() + "@resolvedCount", ""+resolveCount);
            resolvedIdNamePairs.put(resolved.get(i).getTestGroupId() + "@ghostCount", ""+ghostFailCount);
            resolvedIdNamePairs.put(resolved.get(i).getTestGroupId() + "@originCount", ""+originFailCount);
            resolvedIdNamePairs.put(resolved.get(i).getTestGroupId() + "@pendingCount", ""+pendingCount);
            resolvedIdNamePairs.put(resolved.get(i).getTestGroupId() + "@successCount", ""+successCount);            
            resolvedIdNamePairs.put(resolved.get(i).getTestGroupId() + "@aborted", ""+resolved.get(i).isAborted());            
        }        
    }
    
    public ListMapPair getPendingTestGroups() {
        return (new ListMapPair(pendingIds, pendingIdNamePairs));
    }

    public ListMapPair getActiveTestGroups() {
        return (new ListMapPair(activeIds, activeIdNamePairs));
    }

    public ListMapPair getResolvedTestGroups() {
        return (new ListMapPair(resolvedIds, resolvedIdNamePairs));
    }

}
