#!/usr/bin/perl

@ruleCandidates = (
"\\b(0[xX][0-9a-fA-F]+)\\b",
"([a-zA-Z0-9]+)%27(%20)+or(%20)+((%28)+)?sleep\\b"
);

$candidateScores = ();

foreach $candidate(@ruleCandidates) {
	$candidateScores{$candidate} = 0;
}

while (my $line = <STDIN>) {
    chomp($line);
    foreach $candidate(@ruleCandidates) {
    if ($line =~ m/$candidate/) {
      $candidateScores{$candidate}++;
    }
  }
}

print "Candidate scores:\n";
foreach $candidate(@ruleCandidates) {
  print $candidate . ": " . $candidateScores{$candidate} . "\n";
}
