#!/usr/bin/perl

use Switch;
use Time::Local;
use Cwd 'abs_path';

$cfgFile = abs_path($0) . ".cfg";
$tmp = `whoami`; chomp($tmp);

if (-e "/data") {
        $defaultOutputDirectory = "/data/" . $tmp . "/logs";
}
else {
        $defaultOutputDirectory = "./timberlogs";
}

$hintFile = $cfgFile . ".$tmp.hints";
$errFile = $cfgFile . ".$tmp.err";
$tid = "";

%logFilePrefixes = ();

$sampleFile = "sample.log";
$absoluteFile = "";
$absoluteStartYYYY = "";
$absoluteStartMM = "";
$absoluteStartDD = "";
$absoluteStartHH = "";
$absoluteDuration = "";

$doCompressSample = 1;
$doTerminateImmediately = 0;
$samplePercentage = 0;
%randomSelections = ();
$doSampleLogs = -1;
$launchNewScreen = -1;
$stdinOnly = 0;
$doRemoteLDS2SERVER = 0;
$doUseServerGrep = -1;
$serverIPString = "";
$doPeekMode = 0;
$postProcessors = "";
$hintsOff = 0;
$leaveHints = 0;
$skipConnectTest = 0;

@inputCodes = ();
@customercodes = ();
@serverIPArray = ();

foreach $arg(@ARGV) {
	if (index($arg,"-rnd") == 0) {
		$samplePercentage = substr($arg,4);
		if (!isNumeric($samplePercentage) || !($samplePercentage > 0 && $samplePercentage < 100)) {
			die("FATAL ERROR! -rnd must be an integer between 1 and 99 (if specified at all)\n");
		}
		else {
			$doSampleLogs = 1;	
		}
	}

        if (index($arg,"-us") == 0) {
                $doCompressSample = 0;
        }
	
	if (index($arg,"-f") == 0) {
		$absoluteFile = substr($arg, 2);
		$sampleFile = $absoluteFile;
		$sampleFile .= ".sample";
	}

        if (index($arg,"-customer") == 0) {
                $nextcustomer = substr($arg, 3);
		$inputCodes[++$#inputCodes] = $nextcustomer;
        }

        if (index($arg,"-y") == 0) {
                $absoluteStartYYYY = substr($arg, 2);
        }

        if (index($arg,"-m") == 0) {
                $absoluteStartMM = substr($arg, 2);
        }

        if (index($arg,"-d") == 0) {
                $absoluteStartDD = substr($arg, 2);
        }

        if (index($arg,"-h") == 0) {
                $absoluteStartHH = substr($arg, 2);
        }

        if (index($arg,"-D") == 0) {
                $absoluteDuration = substr($arg, 2);
        }

	if ($arg eq "-s") {
		$stdinOnly = 1;	
	}

        if ($arg eq "-scy") {
                $launchNewScreen = 1;
        }
	
	if ($arg eq "-scn") {
		$launchNewScreen = 0;
	}

	if ($arg eq "-l2gn") {
		$doRemoteLDS2SERVER = 0;
	}

        if ($arg eq "-l2gy") {
                $doRemoteLDS2SERVER = 1;
        }

	if ($arg eq "-ti") {
		$doTerminateImmediately = 1;
	}

	if ($arg eq "-su") {
		$hintsOff = 1;
	}

        if ($arg eq "-lh") {
                $leaveHints = 1;
        }

        if ($arg eq "-sct") {
                $skipConnectTest = 1;
        }

	if ($arg eq "-peek") {
		$doPeekMode = 1;
	}

        if (index($arg,"-tid") == 0) {
                $tid = substr($arg, 4);
        }
}

if ($skipConnectTest == 0) {
        print "Testing gwsh connectivity...";
	sleep .5;
	print "...";
        $connectionTestResult = `gwsh -2 user\@internal1.logs.internaldns.com 'echo Connection test successful'`;
        chomp($connectionTestResult);
        if ($connectionTestResult eq "") {
                die "Unable to connect to user\@internal1.logs.internaldns.com\n\nPossible cause: are your keys are added and forwarding correctly?\n\n";
        }
        print "success.\n";
}

if (-e $hintFile) {
        if ($leaveHints == 0) {
                `rm $hintFile`;
        }
}

if ($stdinOnly == 1 && $launchNewScreen != 0) {
        die("FATAL ERROR! Cannot accept stdin input from a new screen session, when specifying -s, -scn must also be specified.\n");
}

if ($stdinOnly == 1 && $doPeekMode == 1) {
	die("FATAL ERROR! Cannot specify -peek and -s; peek mode is not compatible with stdin input.\n");
}

if ($doPeekMode == 1 && $absoluteFile eq "") {
	die ("FATAL ERROR! -peek requires valid -f to also be specified; peek mode requires a valid existing file.\n");
}

if ($launchNewScreen != 0) {
	if ($launchNewScreen == -1) {
		print "Would you like to attach this process to a new screen session? (Default: Y) > ";
		$tmp = <STDIN>;
		chomp($tmp);
		if ($tmp eq "" || !(lc($tmp) eq "n")) {
			$launchNewScreen = 1;
		}
		else {
			$launchNewScreen = 0;
		}
	}

	if ($launchNewScreen == 1) {
       		$fullCommandLine = join " ", abs_path($0), @ARGV;
		`screen -a $fullCommandLine -scn -lh -sct`;
		if ($hintsOff == 0) {
			hints();
		}
       		exit 0;
	}
}

if ($doSampleLogs == -1 && ($stdinOnly == 1 || $doPeekMode == 1)) {
	$doSampleLogs = 0;
}

if ($doSampleLogs == -1) {
        print "Automatically collect 1% random log sample? (Default: Y) > ";
	$tmp = <STDIN>;
        chomp($tmp);
        if ($tmp eq "" || !(lc($tmp) eq "n")) {
                $doSampleLogs = 1;
		$samplePercentage = 1;
        }
}

if ($doSampleLogs == 0 && $stdinOnly == 1) {
        die("FATAL ERROR! This script only accepts stdin when sampling log files (use option -rnd).\n");
}

if ($stdinOnly == 0) {
	if ($doPeekMode) {
		peek();
	}
	else {
		go();
	}
}
else {
	$sampleOutputCmd = " > $sampleFile";
	
	if ($doSampleLogs == 1) {
		for (1..$samplePercentage) {
			redo if ($randomSelections{int(rand(100))}++);
		}
	}

	if ($doCompressSample == 1) {
		$sampleFile .= ".gz";
		$sampleOutputCmd = "| gzip -c > $sampleFile";
	}

	if ($doSampleLogs == 1)  {
		open ($sampleOutput, $sampleOutputCmd) or die "Error creating gzip file $sampleFile: $!\n";
	}

	$currentLine = 0;
	while (my $line = <STDIN>) {
		if ($doSampleLogs == 1) {
			if ($randomSelections{$currentLine++}) {
				print $sampleOutput $line;
			}
			if ($currentLine >= 100) {
				$currentLine = 0;
			}
		}
	}

	if ($doSampleLogs == 1) {
		close $sampleOutput;
	}
	sleep 1;
}

sub isNumeric {
        my $val = shift;
        return $val =~ m/^\d+$/;
}

sub go {
	if (-e $cfgFile) {
		open FILE, $cfgFile or die "Could not open $cfgFile: $!\n";
		@cfgLines = <FILE> or die "Could not load lines from $cfgFile: $!\n";
		chomp(@cfgLines);
		foreach $cfgLine(@cfgLines) {
			@currentLine = split("=",$cfgLine);
			if (isNumeric($currentLine[0])) {
				if (!($currentLine[1] eq "")) {
					$logFilePrefixes{$currentLine[0]} = $currentLine[1];
				}
			}
		}
		close FILE;
	}

	if (@inputCodes == 0) {
		print "Enter single customercode or space delimited list: ";
		@inputCodes = split(" ", <STDIN>);
	}
	%acceptedCodes = ();

	if ($doRemoteLDS2SERVER == -1) {
		print "Convert logs to Server format? (Default: Y) > ";
		$tmp = <STDIN>;
                chomp($tmp);
                if ($tmp eq "" || !(lc($tmp) eq "n")) {
                        $doRemoteLDS2SERVER = 1;
                }
		else {
			$doRemoteLDS2SERVER = 0;
		}	
	}

        if ($doUseServerGrep == -1) {
                print "Collect logs from specific Server IPs? (Default: n) > ";
                $tmp = <STDIN>;
                chomp($tmp);
                if ($tmp eq "" || !(lc($tmp) eq "y")) {
                        $doUseServerGrep = 0;
                }
                else {
                        $doUseServerGrep = 1;
                }
        }

	if ($doUseServerGrep == 1) {
		print "Enter the server IPs or just press -ENTER- to query for the most active one:\n";
		$serverIPString = <STDIN>;
		chomp($serverIPString);
		@serverIPArray = split(" ",$serverIPString);
		$ipcount = 0;
		foreach $serverip(@serverIPArray) {
			if($serverip=~/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/ &&(($1<=255  && $2<=255 && $3<=255  &&$4<=255))) {
				$ipcount++;
			}
			else {
				die("FATAL ERROR! $serverip is not a valid IP...\n");
			}
		}
		if ($ipcount == 0 && $serverIPString ne "") {
			die("FATAL ERROR! No server IP addresses were entered...\n");
		}
	}
	else {
		@serverIPArray = split(" ","COLLECTOR");
	}
	
	if ($doRemoteLDS2SERVER != 0) {
        	$postProcessors .= "| ~user/bin/lds2server -";
	}
	foreach $inputCode(@inputCodes) {
		chomp($inputCode);
		if (!($inputCode eq "")) {
			if (!$acceptedCodes{$inputCode}) {
				if (!isNumeric($inputCode)) {
					die("FATAL ERROR! $inputCode is not a numeric customercode...\n");
				}
				else {
					$customercodes[++$#customercodes] = $inputCode;
					$acceptedCodes{inputCode} = "true";
					if ($logFilePrefixes{$inputCode} eq "") {
						print "Enter a short name for customercode $inputCode (examples: eop-www, hhs-essl, etc): ";
						$prefix = <STDIN>;
						chomp($prefix);
						$logFilePrefixes{$inputCode} = $prefix;
						`echo $inputCode=$prefix >> $cfgFile`;
					}
					else {
						print "The name of customercode $inputCode is: " . $logFilePrefixes{$inputCode} . "\n";
					}
					$acceptedCodes{$inputCode}++;
				}
			}
		}
	}
	
	if ($absoluteFile eq "") {
		print "Enter a comment to add to the filename (Default: spikeCheck) >\n";
		$fileComment = <STDIN>;
		chomp($fileComment);
		if ($fileComment eq "") {
			$fileComment = "spikeCheck";
		}
	
		print "Specify the output directory (Default: $defaultOutputDirectory) >\n";
		$inputDir = <STDIN>;
		chomp($inputDir);
		if ($inputDir eq "") {
			$inputDir = $defaultOutputDirectory;
		}
		$tmp = `mkdir $inputDir -p`;
		chomp($tmp);
		if ($tmp eq "") {
			$tmp = `file $inputDir | awk '{ print \$2}'`;
			chomp($tmp);
			if (!($tmp eq "directory" || $tmp eq "symbolic")) {
				die("FATAL ERROR! Could not create or find directory path: $inputDir\n");	
			}
		}
	}

	if ($absoluteDuration eq "") {
		$duration = 1;
		print "How many hours duration? (Default: $duration) > ";
		$inputCount = <STDIN>;
		chomp($inputCount);
		if ($inputCount eq "") { }
		else { $duration = $inputCount; }
	}
	else {
		$duration = $absoluteDuration;
	}

        (my $sec,$min,$hour,$mday,$mon,$year,$wday,$yday,$isdst) = (gmtime(time()-($duration * 60 * 60)-(3*60*60)));
        $year+=1900;
        $mon = sprintf '%02d', $mon+1;
        $mday   = sprintf '%02d', $mday;
        $hour = sprintf '%02d', $hour;
        $min   = sprintf '%02d', $min;
        $sec   = sprintf '%02d', $sec;

	if ($absoluteStartYYYY eq "") {
		print "Start YYYY (Default: $year) > ";
		$inputYear = <STDIN>;
		chomp($inputYear);
		if ($inputYear eq "") { }
		else { $year = $inputYear; }
		$year = sprintf'%04d', $year;
	}
	else {
		$year = $absoluteStartYYYY;
	}

        if ($absoluteStartMM eq "") {
		print "Start MM (Default: $mon) > ";
		$inputMonth = <STDIN>;
		chomp($inputMonth);
		if ($inputMonth eq "") { }
		else { $mon = $inputMonth; }
		$mon = sprintf'%02d', $mon;
	}
	else {
		$mon = $absoluteStartMM;
	}
		
        if ($absoluteStartDD eq "") {
		print "Start DD (Default: $mday) > ";
		$inputDay = <STDIN>;
		chomp($inputDay);
		if ($inputDay eq "") { }
		else { $mday = $inputDay; }
		$mday = sprintf'%02d', $mday;
	}
	else {
		$mday = $absoluteStartDD;
	}

        if ($absoluteStartHH eq "") {
		print "Start HH (Default: $hour) > ";
		$inputHour = <STDIN>;
		chomp($inputHour);
		if ($inputHour eq "") { }
		else { $hour = $inputHour; }
		$hour = sprintf'%02d', $hour;
	}
	else {
		$hour = $absoluteStartHH;
	}

	$tmp = timegm(0,0,$hour,$mday,$mon-1,$year) + (($duration-1)*60*60);
	(my $sec2,$min2,$hour2,$mday2,$mon2,$year2,$wday2,$yday2,$isdst2) = (gmtime($tmp));
	$year2+=1900;
	$mon2 = sprintf '%02d', ((sprintf '%02d', $mon2) + 1);
	$mday2   = sprintf '%02d', $mday2;
	$hour2 = sprintf '%02d', $hour2;
	$min2   = sprintf '%02d', $min2;
	$sec2   = sprintf '%02d', $sec2;

	@cmdList = ();
	@pidList = ();
	%pidFiles = ();

	foreach $customercode(@customercodes) {
	if ($serverIPString eq "") {
		if ($doUseServerGrep == 1) {
			print "QUERYING FOR IP, CUSTOMERCODE $customercode...\n";
			$cmd = "ssh -2A ssh-internal1.logs.internaldns.com '/usr/local/internal/bin/sql2 --csv -q dev.query.internaldns.net \"select b.name name, b.provider provider, g.physregion region, a.serverip serverip, sum(a.bytes*8/1024) kbps, sum(a.bytes*8) bps, sum(a.hits)/10 hits from customergeoloadinfo a, MCM_Regions b, serverinfo g where a.customercode in ($customercode) and g.serverip=a.serverip and b.physicalRegion=g.physregion group by 4 order by 6 desc limit 1\"'";
			$output = `$cmd`;
			@iprows = split("\n",$output);
			if (@iprows != 3) {
				print $output . "\n";
				die("Query failed when collecting server IP for customercode $customercode...\n");
			}
			$iprow = $iprows[2];
			@ipfields = split(",",$iprow);
			$ipfield = $ipfields[3];
			if($ipfield=~/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/ &&(($1<=255  && $2<=255 && $3<=255  &&$4<=255))) {

			}
			else {
				print ("Query output: $output\n");
				die("Query did not retrieve a valid server IP for customercode $customercode...\n");
			}
			@serverIPArray = split(" ",$ipfield);
		}
	}
	foreach $serverip(@serverIPArray) {
		if ($absoluteFile eq "") {
			$outputFileName = $inputDir . "/" . $logFilePrefixes{$customercode} . "#" . $fileComment . "#" . $customercode . "#$serverip#$year.$mon.$mday.$hour#" . $duration . ".log.gz";
		}
		else {
			$outputFileName = $absoluteFile . "#" . $customercode . "#" . $serverip . ".log.gz";
		}
		my $localErrFile = $errFile . "." . $customercode . "." . $tid;
		if ($serverip eq "COLLECTOR") {
			$cmd = "gwsh -2 user\@internal1.logs.internaldns.com '~lds/bin/collector_extract.pl -c $customercode -B $year.$mon.$mday.$hour -E $year2.$mon2.$mday2.$hour2 -s FF $postProcessors | gzip -c' 2> $localErrFile > $outputFileName";
		}
		else {
			$cmd = "ssh -2A ssh-internal1.logs.internaldns.com '/usr/local/internal/tools/bin/server_grep -i --use-collector --range=$mon/$mday/$year/$hour:00-$mon2/$mday2/$year2:$hour2:00 \"\\/$customercode\\/\" $serverip | gzip -c' 2> $localErrFile > $outputFileName";
		}
		$cmdList[++$#cmdList] = $cmd;

		my $pid = fork();
		if ($pid) {
			$pidList[++$#pidList] = $pid;
			$pidFiles{$pid} = $outputFileName;

			my $extractWait = 0;
			while ($extractWait >= 0 && $extractWait < 30) {
				print "WAITING FOR EXTRACTION TO BEGIN ($outputFileName : $pid) $extractWait\n";
				sleep 1;
				$extractWait++;
				$txt = `cat $localErrFile`;
				print $txt;
				if (index($txt,"-c $customercode") >= 0) {
					$extractWait = -1;
				}
				elsif (index($txt,"Getting deliverable data from") >= 0) {
					$extractWait = -1;
				}
				elsif (index($txt,"is not available on collector") >= 0) {
					$extractWait = -1;
				}
				elsif (index($txt,"connecting to streamer") >= 0) {
					$extractWait = -1;
				}
				elsif (index($txt,"HTTP\/1.1 500 Error") >= 0) {
					$extractWait = -1;
				}

				#last match
				elsif (index($txt,"DDC_DATACENTER") >= 0) {
					$extractWait = -1;
				}
			}
			if ($extractWait >= 30) {
				print "WILL RETRY ($outputFileName : $pid)\n";
				`kill $pid`;
				waitpid($pid, 0);
				waitpid(-1, WNOHANG);
				`rm $outputFileName`;
				$customercodes[++$#customercodes] = $customercode;
			}
		}
		elsif ($pid == 0) {
			print shellExecute($cmd) . "\n";
			if ($hintsOff == 0) {
				`echo awklets/hitme.pl $outputFileName >> $hintFile`;
			}
			exit 0;
		}
		else {
			die "FATAL ERROR! Could not fork: $!\n(Attempted: $cmd)\n";
		}
	}
	}

	my $pid = fork();

	if ($pid) {
		foreach $childPid(@pidList) {
			my $tmp = waitpid($childPid, 0);
			print "------------------------------------------------------------------------------\n";
			print "Finished " . $pidFiles{$childPid} . "\n";
			print "------------------------------------------------------------------------------\n";
		}
		waitpid($pid, 0);
		if ($doTerminateImmediately == 0) {
			print "*** PRESS ENTER TO EXIT ***\n";
			$tmp = <STDIN>;
		}
	}
	elsif ($pid == 0) {
		print "SCRIPT WILL EXIT WHEN ALL LOGS ARE FINISHED\n";
		if ($doSampleLogs == 1) {
			@samplePidList = ();
			foreach $target (values %pidFiles)
			{
				print "MUST SAMPLE: $target\n";
				my $samplePid = fork();
				if ($samplePid) {
					$samplePidList[++$#samplePidList] = $samplePid;
				}
				elsif ($samplePid == 0) {
					$sampleCmd = abs_path($0) . " -sct -peek -scn -f" . $target . " | " . abs_path($0) . " -sct -s -scn -rnd" . $samplePercentage . " -f" . $target;
					shellExecute($sampleCmd);
					exit(0);
				}
				else {
					die("FATAL ERROR! Could not create monitor fork: $!\n(Target was: $target)\n");	
				}
			}
	                
			foreach $childSamplePid(@samplePidList) {
        	                my $tmp = waitpid($childSamplePid, 0);
                	        print "------------------------------------------------------------------------------\n";
                        	print "Finished Sampling: " . $childSamplePid . "\n";
                        	print "------------------------------------------------------------------------------\n";
                	}
			print "*** MONITOR PROCESS FINISHED ***";
		}
		exit 0;
	}
	else {
		die "FATAL ERROR! Could not fork: $!\n(Attemped monitor process)\n";
	}	

        if ($launchNewScreen == 0) {
                if ($hintsOff == 0) {
                        hints();
                }
        }

	print "CLEANING UP AND EXITING...\n";
	do {
		$kid = waitpid(-1, WNOHANG);
		sleep 3;
	} while $kid > 0;
}

sub shellExecute {
	my $val = shift;
	print "------------------------------------------------------------------------------\n";
	print "Executing:\n$val\n";
	print "------------------------------------------------------------------------------\n";
	return `$val`;
}

sub peek {
        $logFileStatus = `file -i $absoluteFile | awk '{ print \$2}'`;
        chomp($logFileStatus);
        if (index($logFileStatus,"ERROR") == 0) {
                die("Could not access file \"$absoluteFile!\" Aborting.\n");
        }

	if (index($logFileStatus, "application/x-empty") >= 0 || index($logFileStatus, "application/octet-stream") >= 0) {
                if (index($absoluteFile,".gz") >= 0) {
                        $logFileStatus = "application/x-gzip";
                }
        }
	elsif (index($logFileStatus, "application/x-gzip") >= 0) {
                $logFileStatus = "application/x-gzip";
	}
        elsif (index($logFileStatus, "application/gzip") >= 0) {
                $logFileStatus = "application/x-gzip";
        }
	elsif (index($logFileStatus, "inode/x-empty") >= 0) {
                $logFileStatus = "application/x-gzip";
        }

        switch ($logFileStatus) {
                case "application/x-gzip" {
                        $cmd = "zcat";
                        $errLine = "gzip: $absoluteFile: unexpected end of file";
			$altErrLine = "zcat: $absoluteFile: unexpected end of file";
                }
                else {
                        die("FATAL ERROR! $absoluteFile must be a gzip file in order to proceed in peek mode.\n");
                }
        }

        $loop = 1;
        $cursor = 1;
        $peekedLines = -1;
        $multiplier = 100;
	do {
		$bufferCmd = "$cmd $absoluteFile 2>&1 | tail -n +$cursor | head -n $multiplier";
		@lines =  `$bufferCmd`;
		chomp(@lines);
		if (($lines[@lines-1] eq $errLine || $lines[@lines-1] eq $altErrLine) && !($errLine eq "" || $altErrLine eq "")) {
			sleep 1;
			$multiplier /= 2;
			if ($multiplier < 100) {
				$multiplier = 100;
			}
		}
		else {
			$cursor += @lines;
			$peekedLines = $cursor - 1;
			if (@lines != $multiplier) {
				$loop = 0;
			}
			else {
				$multiplier *= 2;
			}
			foreach $line(@lines) {
				print $line ."\n";
			}
		}
	} while ($loop == 1);
}

sub hints {
        if (-e $hintFile) {
	        $tmp = `cat $hintFile`; 
		print "\n\nHINTS FOR GETTING STARTED WITH THESE LOGS:\n\n";
		print $tmp;
		print "\n\n";
		if ($leaveHints == 0) {
	                `rm $hintFile`;
		}
        }
}
