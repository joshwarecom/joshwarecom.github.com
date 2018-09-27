Author: Joshua Wilson

This simple tool is used to validate candidates for regex-based rules to be used with web application firewalls.
It takes as it's input a list of strings or URLs, evaluates each one against the rule candidates, and tallies the score for how many evaluate to true.

The 2 signatures in place by default are used to detect hexadecimal code injections, blind SQL sleep attacks, and also Havij and NetSparker scans (regardless of their user agent).

The script can easily be extended to check additional signatures by adding new regex entries to the @ruleCandidates array.
