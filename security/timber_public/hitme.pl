#!/usr/bin/perl
use Switch;
use Cwd 'abs_path';

@awkletDependencies = (
    "_top10",
    "_top10r",
    "_add1",
    "r_full",
    "frS_method",
    "S_full",
    "f_full",
    "frS_clientip",
    "fr_arl",
    "S_path",
    "rS_useragent",
    "rS_referer",
    "frS_status_full",
    "rS_edgeonly_full"
    );

$forceCmd = "";
$forceAdd = -1;
$inputFile = "";
$parentDir = substr(abs_path($0),0,rindex(abs_path($0),"/"));
$top10 = "_top10r";
$acceptStdin = 0;
$localUser = `whoami`;
chomp($localUser);

foreach $awklet(@awkletDependencies) {
        if (!(-e "$parentDir/$awklet")) {
		die("FATAL ERROR! Awklet '$awklet' not found in the same directory as this script.  Exiting...\n");
        }
}

foreach $arg(@ARGV) {
	if ($arg eq "-t") {
                $forceCmd = "cat";
	}
	elsif ($arg eq "-z") {
                $forceCmd = "./mcatz";
	}
        elsif ($arg eq "-o1") {
            $forceAdd = 1;
        }
        elsif ($arg eq "-o0") {
            $forceAdd = 0;
        }
	elsif ($arg eq "-nr") {
		$top10 = "_top10";
	}
	elsif ($arg eq "-s") {
		$acceptStdin = 1;
	}
        elsif (index($arg,"-") != 0) {
            $inputFile = $arg;
        }
}

if ($acceptStdin == 1 && $inputFile ne "") {
	die("FATAL ERROR! Cannot specify input file if -s is specified; script either accepts stdin, or file, but not both at the same time.\n");
}
elsif ($inputFile eq "") {
	$acceptStdin = 1;
}

if ($acceptStdin == 1) {
	$count = 0;
	$tmpFile = "$parentDir/hitMe.tmpfile.$localUser.gz";
	$tmpCmd = "| gzip -c > $tmpFile";
	open ($tmpOutput, $tmpCmd) or die "Error creating gzip file $tmpFile: $!";
	while (my $line = <STDIN>) {
		$count++;
		print $tmpOutput $line;
		if (!($count % 10000)) {
			print STDERR ".";
		}
	}
	close $tmpOutput;
	$inputFile = $tmpFile;
	print STDERR "\n";
}

if ($inputFile eq "") {
    die("FATAL ERROR! Input file not specified.\n");
}

if ($forceCmd eq "") {
	$cmd = "";
	$logFileStatus = `file -i $inputFile | awk '{ print \$2}'`;
	chomp($logFileStatus);
	if (index($logFileStatus,"ERROR") == 0) {
		die("Could not access file \"$inputFile!\" Aborting.\n");
	}

	if (index($logFileStatus, "application/x-empty") >= 0 || index($logFileStatus, "application/octet-stream") >= 0) {
		if (index($inputFile,".gz") >= 0) {
			$logFileStatus = "application/x-gzip";
		}
	}
	elsif (index($logFileStatus, "application/x-gzip") >= 0) {
		$logFileStatus = "application/x-gzip";
	}
        elsif (index($logFileStatus, "application/gzip") >= 0) {
                $logFileStatus = "application/x-gzip";
        }

	switch ($logFileStatus) {
		case "application/x-gzip" {
			$cmd = "./mcatz";
		}
		else {
			$cmd = "cat";
		}
	}
}
else {
	$cmd = $forceCmd;
}

if ($forceAdd == -1) {
	$tmp = `$cmd $inputFile | head -n 1`;
	if (index($tmp, "#") == 0) {
		$forceAdd  = 1;
	}
	elsif (index($tmp, " ") == 1) {
		$forceAdd = 1;
	}
	else {
		$forceAdd = 0;
	}
}

$preprocessors = "";

if ($forceAdd == 1) {
	$preprocessors .= "| $parentDir/_add1";
}
$output = `$cmd $inputFile $preprocessors | $parentDir/rS2o_full | $parentDir/frS_status | $parentDir/$top10`;
chomp($output);
if (!($output eq "")) {
print "Top 10 Edge-to-Origin Status Codes (r S)\t\n";
$data = "\t" . $output;
$data =~ s/\n/\n\t/g;
print $data . "\n\n";
}

$output = `$cmd $inputFile $preprocessors | $parentDir/rS_edgeonly_full | $parentDir/frS_status | $parentDir/$top10`;
chomp($output);
if (!($output eq "")) {
print "Top 10 Edge Request Status Codes (r S)\t\n";
$data = "\t" . $output;
$data =~ s/\n/\n\t/g;
print $data . "\n\n";
}

$output = `$cmd $inputFile $preprocessors | $parentDir/f2o_full | $parentDir/frS_method | $parentDir/$top10`;
chomp($output);
if (!($output eq "")) {
print "Top 10 Forward-to-Origin Methods (f)\t\n";
$data = "\t" . $output;
$data =~ s/\n/\n\t/g;
print $data . "\n\n";
}

$output = `$cmd $inputFile $preprocessors | $parentDir/rS_edgeonly_full | $parentDir/frS_method | $parentDir/$top10`;
chomp($output);
if (!($output eq "")) {
print "Top 10 Edge Request Methods (r S)\t\n";
$data = "\t" . $output;
$data =~ s/\n/\n\t/g;
print $data . "\n\n";
}

$output = `$cmd $inputFile $preprocessors | $parentDir/rS_edgeonly_full | $parentDir/frS_clientip | $parentDir/$top10`;
chomp($output);
if (!($output eq "")) {
print "Top 10 Edge Request IPs (r S)\t\n";
$data = "\t" . $output;
$data =~ s/\n/\n\t/g;
print $data . "\n\n";
}

$output = `$cmd $inputFile $preprocessors | $parentDir/rS_edgeonly_full | $parentDir/fr_arl | $parentDir/$top10`;
chomp($output);
if (!($output eq "")) {
print "Top 10 Edge Request ARLs (r)\t\n";
$data = "\t" . $output;
$data =~ s/\n/\n\t/g;
print $data . "\n\n";
}

$output = `$cmd $inputFile $preprocessors | $parentDir/rS_edgeonly_full | $parentDir/S_path | $parentDir/$top10`;
chomp($output);
if (!($output eq "")) {
print "Top 10 Edge Request Paths (S)\t\n";
$data = "\t" . $output;
$data =~ s/\n/\n\t/g;
print $data . "\n\n";
}

$output = `$cmd $inputFile $preprocessors | $parentDir/f2o_full | $parentDir/fr_arl | $parentDir/$top10`;
chomp($output);
if (!($output eq "")) {
print "Top 10 Forward-to-Origin ARLs (f)\t\n";
$data = "\t" . $output;
$data =~ s/\n/\n\t/g;
print $data . "\n\n";
}

$output = `$cmd $inputFile $preprocessors | $parentDir/rS_edgeonly_full | $parentDir/rS_useragent | $parentDir/$top10`;
chomp($output);
if (!($output eq "")) {
print "Top 10 Edge Request Agents (r S)\t\n";
$data = "\t" . $output;
$data =~ s/\n/\n\t/g;
print $data . "\n\n";
}

$output = `$cmd $inputFile $preprocessors | $parentDir/rS2o_full | $parentDir/rS_useragent | $parentDir/$top10`;
chomp($output);
if (!($output eq "")) {
print "Top 10 Edge-to-Origin Agents (r S)\t\n";
$data = "\t" . $output;
$data =~ s/\n/\n\t/g;
print $data . "\n\n";
}

$output = `$cmd $inputFile $preprocessors | $parentDir/rS_edgeonly_full | $parentDir/rS_referer | $parentDir/$top10`;
chomp($output);
if (!($output eq "")) {
print "Top 10 Edge Request Referers (r S)\t\n";
$data = "\t" . $output;
$data =~ s/\n/\n\t/g;
print $data . "\n\n";
}

$output = `$cmd $inputFile $preprocessors | $parentDir/rS_edgeonly_full | ICODE=404 $parentDir/frS_status_full | $parentDir/fr_arl | $parentDir/$top10`;
chomp($output);
if (!($output eq "")) {
print "Top 10 Edge Request 404s (r)\t\n";
$data = "\t" . $output;
$data =~ s/\n/\n\t/g;
print $data . "\n\n";
}

$output = `$cmd $inputFile $preprocessors | $parentDir/rS_edgeonly_full | ICODE=404 $parentDir/frS_status_full | $parentDir/S_path | $parentDir/$top10`;
chomp($output);
if (!($output eq "")) {
print "Top 10 Edge Request 404s (S)\t\n";
$data = "\t" . $output;
$data =~ s/\n/\n\t/g;
print $data . "\n\n";
}

$output = `$cmd $inputFile $preprocessors | $parentDir/f2o_full | ICODE=404 $parentDir/frS_status_full | $parentDir/fr_arl | $parentDir/$top10`;
chomp($output);
if (!($output eq "")) {
print "Top 10 Forward-to-Origin 404s (f)\t\n";
$data = "\t" . $output;
$data =~ s/\n/\n\t/g;
print $data . "\n\n";
}

if ($tmpFile ne "") {
	`rm $tmpFile`;
}
