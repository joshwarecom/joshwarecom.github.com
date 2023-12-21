// Import any other script files here, e.g.:
// import * as myModule from "./mymodule.js";

runOnStartup(async runtime =>
{
	// Code to run on the loading screen.
	// Note layouts, objects etc. are not yet available.
	runtime.addEventListener("beforeprojectstart", () => OnBeforeProjectStart(runtime));
});

function refreshBounds(la) {
	if (la == "Battle Board") {
		let winCenterX = document.oWindow.innerWidth/2.0;
		let winCenterY = document.oWindow.innerHeight/2.0;
		let viewCenterX = document.oRuntime.viewportWidth/2.0;
		let viewCenterY = document.oRuntime.viewportHeight/2.0;
		let xRatio = winCenterX/viewCenterX;
		let yRatio = winCenterY/viewCenterY;
		try {
		let minX = document.oWindow.innerWidth/2.0;
		let boardWidth = 60 * 8 * xRatio;		
		if (yRatio < xRatio) boardWidth = 60 * 8 * yRatio;
		minX = minX - (boardWidth/2);
		let maxX = minX + boardWidth;
		document.dMinX = minX;
		document.dMaxX = maxX;
		document.dMinY = (document.oWindow.innerHeight/2.0)-(boardWidth/2);
		document.dMaxY = (document.oWindow.innerHeight/2)+(boardWidth/2);
		document.dWidth = document.dMaxX - document.dMinX;
		document.dHeight = document.dMaxY - document.dMinY;
		} catch(e) {alert(e);}
	}
	else if (la == "Dungeon") {
		let winCenterX = document.oWindow.innerWidth/2.0;
		let winCenterY = document.oWindow.innerHeight/2.0;
		let viewCenterX = document.oRuntime.viewportWidth/2.0;
		let viewCenterY = document.oRuntime.viewportHeight/2.0;
		let xRatio = winCenterX/viewCenterX;
		let yRatio = winCenterY/viewCenterY;
		try {
		let minX = document.oWindow.innerWidth/2.0;
		let boardWidth = 60 * 7 * xRatio;
		let boardHeight = 60 * 6 * xRatio;		
		if (yRatio < xRatio) {
			boardWidth = 60 * 7 * yRatio;
			boardHeight = 60 * 7 * yRatio;			
		}
		minX = minX - (boardWidth/2);
		let maxX = minX + boardWidth;
		document.dMinX = minX;
		document.dMaxX = maxX;
		document.dMinY = (document.oWindow.innerHeight/2.0)-(boardHeight/2);
		document.dMaxY = (document.oWindow.innerHeight/2)+(boardHeight/2);
		document.dWidth = document.dMaxX - document.dMinX;
		document.dHeight = document.dMaxY - document.dMinY;
		} catch(e) {alert(e);}
	}	
}

async function OnBeforeProjectStart(runtime)
{
	// Code to run just before 'On start of layout' on
	// the first layout. Loading has finished and initial
	// instances are created and available to use here.	
	runtime.addEventListener("tick", () => Tick(runtime));
	document.oRuntime = runtime;
	document.oCanvas = document.getElementsByTagName("canvas")[0];
	document.oWindow = window;	
	refreshBounds(document.oRuntime.layout.name);
	
	document.oCanvas.addEventListener("click", function(ev) { fEvent_Click(ev, document.oCanvas); });
	document.oCanvas.addEventListener("touchstart", function(ev) { fEvent_Click(ev, document.oCanvas); });	
	document.oCanvas.addEventListener("mousemove", function(ev) { fEvent_MouseMove(ev, document.oCanvas); });
	document.oCanvas.addEventListener("touchmove", function(ev) { fEvent_MouseMove(ev, document.oCanvas); });
	document.btnListeners = false;
	
	document.fClick = function(src) {
		let tmp = src.getAttribute("op");
		switch (tmp) {
			case "NEW_GAME": fNewGame(); break;
			case "MAIN_MENU": fMainMenu(); break;
			case "GO_TO_DUNGEON": fDungeon(); break;
			case "GO_TO_BATTLE": fBattle(); break;
		}
	}
}

function Tick(runtime)
{
	// Code to run every tick
}

function fNewGame() {
	fBattle();
}

function fBattle() {
	document.oRuntime.goToLayout("Battle Board");
}

function fMainMenu() {
	document.oRuntime.goToLayout("Intro Splash");
}

function fDungeon() {
	document.oRuntime.goToLayout("Dungeon");
}

function fEvent_Click(eve, can) {
	alert('clicking');
	try {
	fSetMarker(eve);
	} catch(e) { alert(e);}
}

function fEvent_MouseMove(eve, can) {
	alert('moving');
	try {	
	fSetMarker(eve);
	} catch(e) { alert(e);}	
}

function fSetMarker(eve) {
	let markerS = null;
	let b = false;	
	switch (document.oRuntime.layout.name) {
		case "Battle Board":
			markerS = document.oRuntime.objects.BattleMarker.getFirstInstance();
			refreshBounds(document.oRuntime.layout.name);
			if (eve.x >= document.dMinX && eve.x <= document.dMaxX) {
				if (eve.y >= document.dMinY && eve.y <= document.dMaxY) {
					if (!markerS.isVisible) {
						markerS.isVisible = true;
					}				
					let markerX = Math.floor((eve.x - document.dMinX) / (document.dWidth / 8));
					let markerY = Math.floor((eve.y - document.dMinY) / (document.dHeight / 8));
					markerS.x = ((markerX+1) * (60)) + ((854/2)-270);
					markerS.y = ((markerY+0) * (60)) + 0 + 30;
					b = true;
				}
			}
			if (!b) {
				if (markerS.isVisible) {
					markerS.isVisible = false;
				}
			}
			break;
		case "Dungeon":
			markerS = document.oRuntime.objects.DungeonMarker.getFirstInstance();
			refreshBounds(document.oRuntime.layout.name);
			if (eve.x >= document.dMinX && eve.x <= document.dMaxX) {
				if (eve.y >= document.dMinY && eve.y <= document.dMaxY) {
					if (!markerS.isVisible) {
						markerS.isVisible = true;
					}				
					let markerX = Math.floor((eve.x - document.dMinX) / (document.dWidth / 7));
					let markerY = Math.floor((eve.y - document.dMinY) / (document.dHeight / 6));
					markerS.x = ((markerX+1) * (60)) + ((854/2)-247);
					markerS.y = ((markerY+0) * (60)) + 0 + 89;
					b = true;
				}
			}
			if (!b) {
				if (markerS.isVisible) {
					markerS.isVisible = false;
				}
			}
			break;			
	}
}