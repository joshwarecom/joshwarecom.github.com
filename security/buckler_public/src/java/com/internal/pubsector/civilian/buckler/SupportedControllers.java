/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package com.internal.pubsector.civilian.buckler;

import com.internal.pubsector.civilian.buckler.controllers.*;

/**
 *
 * @author jowilson
 */
public enum SupportedControllers {
    badurl,
    welcome,
    testindex,
    testcommands,
    doremotecurl,
    doremoteecho,
    badcontroller,
    testgroupform,
    addtestgroup,
    listtestgroups,
    listtestgroupdetails,
    launch,
    launchmenu,
    viewtestlogs,
    mapeditor,
    mapeditormenu,
    newmapform,
    addnewmap,
    listtestmaps,
    listtestmapdetails,
    extractcidrs,
    doremotesql2,
    dosnailscan,
    viewwrapper,
    editmapform,
    aborttestgroup;

    
    protected static ControllerInterface getNewControllerObject(SupportedControllers controller) throws Exception {
        switch (controller) {
            case doremotecurl:
                return new DoRemoteCurlController();
            case doremoteecho:
                return new DoRemoteEchoController();
            case doremotesql2:
                return new DoRemoteSql2Controller();
            case dosnailscan:
                return new DoSnailScanController();
            case addtestgroup:
                return new AddTestGroupController();
            case listtestgroups:                
                return new ListTestGroupsController();                
            case listtestgroupdetails:                
                return new ListTestGroupDetailsController();
            case viewtestlogs:                
                return new ViewTestLogsController();
            case addnewmap:
                return new AddNewMapController();                
            case listtestmaps:
                return new ListTestMapsController();                
            case listtestmapdetails:
                return new ListTestMapDetailsController(); 
            case testgroupform:
                return new TestGroupFormController();
            case extractcidrs:
                return new ExtractCidrsController();    
            case newmapform:                
            case editmapform:
                return new EditExistingMapController();
            case aborttestgroup:
                return new AbortTestGroupController();
            case viewwrapper:
            case mapeditor:
            case mapeditormenu:
            case launch:                
            case launchmenu:
            case badurl:
            case welcome:
            case testindex:
            case testcommands:
            case badcontroller:
                return null;
            default: throw new Exception("Unsupported Controller Object could not be created: " + controller.toString());
        }
    }        
        
    protected static String getViewJSP(SupportedControllers controller) throws Exception {
        StringBuilder sb = new StringBuilder("views/");
        sb.append(controller.toString());
        sb.append(".jsp");
        return sb.toString();        
    }

}