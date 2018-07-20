var e = document.getElementById("fullscreen");
alert(123);
function go() {
if (RunPrefixMethod(document, "FullScreen") || RunPrefixMethod(document, "IsFullScreen")) {
RunPrefixMethod(document, "CancelFullScreen");
}
else {
RunPrefixMethod(e, "RequestFullScreen");
}
e = document.getElementById('gif');
e.src = "http://joshware.com/sandbox/dice/assets/skull.gif";
e.style.width = "100%";
e.style.height="100%";
toggleDisplay("dice",0);
Crafty.audio.play('laugh',-1);
}

function toggleDisplay(id, displayvalue)
{
if ( displayvalue == 1 ) {
document.getElementById(id).style.display = 'block';
} else if ( displayvalue == 0 ) {
document.getElementById(id).style.display = 'none';
}
}
var pfx = ["webkit", "moz", "ms", "o", ""];
function RunPrefixMethod(obj, method) {
var p = 0, m, t;
while (p < pfx.length && !obj[m]) {
m = method;
if (pfx[p] == "") {
m = m.substr(0,1).toLowerCase() + m.substr(1);
}
m = pfx[p] + m;
t = typeof obj[m];
if (t != "undefined") {
pfx = [pfx[p]];
return (t == "function" ? obj[m]() : obj[m]);
}
p++;
}
}
window.addEventListener('load', Game.start);
