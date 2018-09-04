/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package com.internal.pubsector.civilian.buckler.cmd;

/**
 *
 * @author jowilson
 */
public class Sql2 {
    public static String getSql2Command(String sql) throws Exception {
        return getSql2Command("dev.query.internaldns.net", sql);
    }
    
    private static String getSql2Command(String aggregator, String sql) throws Exception {
        StringBuilder sb = new StringBuilder("/a/bin/sql2 -q ");
        sb.append(aggregator);
        sb.append(" \"");
        sb.append(sql);
        sb.append("\"");
        return sb.toString();
    }
}
