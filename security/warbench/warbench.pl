$done = 0; $candidate = 1; $increase = $candidate; $sec = 5;
$target = 'http://test-team-1.wargames2019.akamaized.net/target.html';
while ($done == 0) {
print "Testing request rate: $candidate\n";
for ($i = 0; $i < $sec; $i++) {
$cmd = "ab -n $candidate -c $candidate -v 10 -H 'If-Modified-Since: Mon, 06 May 2019 16:11:33 GMT' $target 2>&1";
$output = `$cmd`;
sleep 1;
}
$test = `curl -v -o /dev/null $target 2>&1 | grep OK`;
if (index($test, 'OK') >= 0) { $candidate+=$increase; }
else { $done = $candidate; }
}
print "Rate threshold candidate: $done\n";