/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package com.internal.pubsector.civilian.buckler;

import java.io.IOException;
import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import static com.internal.pubsector.civilian.buckler.Utilities.blankIfNull;
import static java.util.Arrays.asList;
/*
 *
 * @author jowilson
 */
public class DispatchFilter implements Filter {
    String[] allowedRequestURIs = null;
    String allowedStaticRoot = null;
    
    public void destroy() {   
    }
	 
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain filterChain) throws IOException, ServletException {
            HttpServletRequest r = (HttpServletRequest)request;
            if (asList(allowedRequestURIs).contains(r.getRequestURI())) {
                filterChain.doFilter(request, response);
            }
            else if (allowedStaticRoot != null && r.getRequestURI().startsWith(allowedStaticRoot)) {
                filterChain.doFilter(request, response);
            }
            else {
                HttpServletResponse redirectMe = (HttpServletResponse)response;
                try {
                    String url = Dispatcher.getDispatchURL(SupportedControllers.badurl, r);
                    redirectMe.sendRedirect(url);
                }
                catch (Exception e) {
                    throw new ServletException(e);
                }
            }
            return;
    }
	 
    public void init(FilterConfig filterConfig) throws ServletException {
        String tmp = filterConfig.getInitParameter("AllowedRequestURIs");
        if (tmp != null) {
            allowedRequestURIs = tmp.split(",");
        }
        
        allowedStaticRoot = filterConfig.getInitParameter("AllowedStaticRoot");
    }
}
