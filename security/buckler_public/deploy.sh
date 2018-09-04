ssh -2 -v pstools.intern.al 'rm /var/lib/tomcat7/webapps/buckler.war'
scp -2 -v -S ssh dist/buckler.war pstools.intern.al:/var/lib/tomcat7/dropbox/buckler.war
sleep 3
ssh -2 -v pstools.intern.al 'mv /var/lib/tomcat7/dropbox/buckler.war /var/lib/tomcat7/webapps/buckler.war' 
