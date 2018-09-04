/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package com.internal.pubsector.civilian.buckler;

import com.internal.pubsector.civilian.buckler.managers.OverrideManager;
import com.internal.pubsector.civilian.buckler.managers.TestManager;
import com.internal.pubsector.civilian.buckler.managers.KeyManager;
import static com.internal.pubsector.civilian.buckler.SupportedControllers.getNewControllerObject;
import static com.internal.pubsector.civilian.buckler.SupportedControllers.getViewJSP;
import com.internal.pubsector.civilian.buckler.controllers.*;
import java.io.IOException;
import java.io.PrintWriter;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.ServletConfig;

/**
 *
 * @author jowilson
 */
public class Dispatcher extends HttpServlet {

    TestManager testManager = null;
    KeyManager keyManager = null;
    Exception err = null;

    /**
     * Processes requests for both HTTP
     * <code>GET</code> and
     * <code>POST</code> methods.
     *
     * @param request servlet request
     * @param response servlet response
     * @throws ServletException if a servlet-specific error occurs
     * @throws IOException if an I/O error occurs
     */
    protected void processRequest(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        PrintWriter out = response.getWriter();
        try {
            
            if (!KeyManager.isInitialized()) {
                if (KeyManager.getException() == null) {
                    throw new Exception("Key manager is not yet initialized, please wait.");
                }
                else {
                    throw new Exception("Error while initializing key manager, application will not start: " + KeyManager.getException().getMessage(), KeyManager.getException());
                }
            }
            
            if (!testManager.isInitialized()) {
                if (err == null) {
                    throw new Exception("Test Manager is not yet initialized, please wait.");
                }
                else {
                    //throw new Exception("Error while initializing Test Manager, application will not start: " + err.getMessage(), err);
                }
            }
            
            SupportedControllers sc = SupportedControllers.valueOf(request.getParameter("controller"));
            
            ControllerInterface c = getNewControllerObject(sc);
            request.setAttribute("@controllerObject", c);
            
            if (c != null) {
                c.exposeTestManagerIfAllowed(testManager);
                c.exposeKeyManagerIfAllowed(keyManager);
                
                Object modelOutput = c.go(request.getParameterMap());
                request.setAttribute("@modelOutput", modelOutput);    
                if (modelOutput != null) {
                    Utilities.logInfo("Model output set: " + modelOutput.toString());
                }
                else Utilities.logInfo("Model output is null");
            }
            
            request.getRequestDispatcher(getViewJSP(sc)).forward(request, response);
        }
        catch (Exception e) {
            out.println("<html>");
            out.println("<head>");
            out.println("<title>Servlet Dispatcher</title>");            
            out.println("</head>");
            out.println("<body bgcolor=\"#FFFFFF\">");
            out.println("<h1>Servlet Dispatcher at " + request.getContextPath() + "</h1>");
            out.println("Error Message: " + e.getMessage() + "<br>");
            out.println("<!--");
            out.println("Exception: " + e.toString() + "<br>");
            out.println(Utilities.getStackTrace(e));
            out.println("-->");
            out.println("</body>");
            out.println("</html>");
            
            Utilities.logInfo("Exception: Servlet Dispatcher at " + request.getContextPath());
            Utilities.logInfo("Error Message: " + e.getMessage());            
            Utilities.logInfo("Exception: " + e.toString());
            Utilities.logInfo("Statck trace:");
            Utilities.logInfo(Utilities.getStackTrace(e));
        }
        finally {
            out.close();            
        }
    }
    
    public static String getLoadingAnimationURL(HttpServletRequest request) throws Exception {    
        StringBuilder sb = new StringBuilder(request.getContextPath());
        sb.append("/static/img/loading.gif");
        return sb.toString();      
    }    
    public static String getGhostFailureIconURL(HttpServletRequest request) throws Exception {    
        StringBuilder sb = new StringBuilder(request.getContextPath());
        sb.append("/static/img/noghost.jpg");
        return sb.toString();      
    }    
    public static String getOriginFailureIconURL(HttpServletRequest request) throws Exception {    
        StringBuilder sb = new StringBuilder(request.getContextPath());
        sb.append("/static/img/noorigin.png");
        return sb.toString();      
    }    
    public static String getPendingIconURL(HttpServletRequest request) throws Exception {    
        StringBuilder sb = new StringBuilder(request.getContextPath());
        sb.append("/static/img/pending.png");
        return sb.toString();      
    }    
    public static String getSuccessIconURL(HttpServletRequest request) throws Exception {    
        StringBuilder sb = new StringBuilder(request.getContextPath());
        sb.append("/static/img/allgood.png");
        return sb.toString();      
    }
    public static String getActionIconURL(HttpServletRequest request) throws Exception {    
        StringBuilder sb = new StringBuilder(request.getContextPath());
        sb.append("/static/img/action.png");
        return sb.toString();      
    }
    public static String getAbortIconURL(HttpServletRequest request) throws Exception {    
        StringBuilder sb = new StringBuilder(request.getContextPath());
        sb.append("/static/img/stop.jpg");
        return sb.toString();      
    }
    public static String getSplashGraphicURL(HttpServletRequest request) throws Exception {    
        StringBuilder sb = new StringBuilder(request.getContextPath());
        sb.append("/static/img/buckler.png");
        return sb.toString();      
    }
    
    public static String getDispatchURL(SupportedControllers controller, HttpServletRequest request) throws Exception {    
        return getDispatchURL(controller, request, null);        
    }    
    
    public static String getDispatchURL(String function, HttpServletRequest request) throws Exception {
        SupportedControllers sc;
        String extraInfo = null;
        try {
            sc = SupportedControllers.valueOf(function.toLowerCase());
        }
        catch (Exception e) {
            sc = SupportedControllers.badcontroller;
            extraInfo = function;
        }
        return getDispatchURL(sc, request, extraInfo);
    }    
    
    protected static String getDispatchURL(SupportedControllers controller, HttpServletRequest request, String extraInfo) throws Exception {    
        StringBuilder sb = new StringBuilder(request.getContextPath());
        sb.append("/Dispatcher?controller=");
        sb.append(controller.toString());

        if (extraInfo != null) {
            sb.append("&extraInfo=");
            sb.append(Utilities.sanitizeName(extraInfo));
        }
        
        return sb.toString();
    }

    @Override
    public void init() throws ServletException {
        super.init();
        try {
            OverrideManager.init(this.getInitParameter("OverrideSettings"));            
            KeyManager.init(this.getInitParameter("DeployedSymKeyPath"));
            testManager = new TestManager(this.getInitParameter("LocalDataRoot"), this.getInitParameter("LocalWebRoot"));
            testManager.start();
        } catch (Exception e) {
            ServletException s = new ServletException("Exception occurred while initializating TestManager", e);
            err = (Exception)s;
            //throw s;
        }
    }
    
    @Override
    public void destroy() {
        testManager.terminate();
    }
    
    
    @Override
    public void init(ServletConfig config) throws ServletException {
        super.init(config);
    }

    // <editor-fold defaultstate="collapsed" desc="HttpServlet methods. Click on the + sign on the left to edit the code.">
    /**
     * Handles the HTTP
     * <code>GET</code> method.
     *
     * @param request servlet request
     * @param response servlet response
     * @throws ServletException if a servlet-specific error occurs
     * @throws IOException if an I/O error occurs
     */
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        processRequest(request, response);
    }

    /**
     * Handles the HTTP
     * <code>POST</code> method.
     *
     * @param request servlet request
     * @param response servlet response
     * @throws ServletException if a servlet-specific error occurs
     * @throws IOException if an I/O error occurs
     */
    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        processRequest(request, response);
    }

    /**
     * Returns a short description of the servlet.
     *
     * @return a String containing servlet description
     */
    @Override
    public String getServletInfo() {
        return "Short description";
    }// </editor-fold>
}
