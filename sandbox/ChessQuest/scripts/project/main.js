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
		document.dBoardWidth = boardWidth;
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
		document.dBoardWidth = boardWidth;
		document.dBoardHeight = boardHeight;
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
	document.oCanvas.addEventListener("touchstart", function(ev) { fEvent_TouchStart(ev, document.oCanvas); });	
	document.oCanvas.addEventListener("mousemove", function(ev) { fEvent_MouseMove(ev, document.oCanvas); });
	document.oCanvas.addEventListener("touchmove", function(ev) { fEvent_TouchMove(ev, document.oCanvas); });
	document.btnListeners = false;
	
	var q = 0;
	document.fRenderLayout = function() {
		switch (document.oRuntime.layout.name) {
			case "Battle Board":
				refreshBounds(document.oRuntime.layout.name);
				try {
					for (let i = 0; i < document.aBattleBoard.length; i++) {
						let rank = Math.floor(i / 8);
						let file = i % 8;
												
						let markerX = ((854/2)-270)+(((8-rank))*60);
						let markerY = ((480/2)-270)+(((8-file))*60);						
												
						let proto = null;
						switch (document.aBattleBoard[i]) {
							case iLightPawn: proto = document.oRuntime.objects.LightPawn; break;
							case iLightBishop: proto = document.oRuntime.objects.LightBishop; break;							
							case iLightKnight: proto = document.oRuntime.objects.LightKnight; break;
							case iLightRook: proto = document.oRuntime.objects.LightRook; break;
							case iLightQueen: proto = document.oRuntime.objects.LightQueen; break;
							case iLightKing: proto = document.oRuntime.objects.LightKing; break;
							
							case iDarkPawn: proto = document.oRuntime.objects.DarkPawn; break;
							case iDarkBishop: proto = document.oRuntime.objects.DarkBishop; break;							
							case iDarkKnight: proto = document.oRuntime.objects.DarkKnight; break;
							case iDarkRook: proto = document.oRuntime.objects.DarkRook; break;
							case iDarkQueen: proto = document.oRuntime.objects.DarkQueen; break;							
							case iDarkKing: proto = document.oRuntime.objects.DarkKing; break;							
						}
						if (proto) proto.createInstance(0, markerX, markerY);			
					}
					
					for (let i = 1; i < document.oRuntime.objects.LightPawn.getAllInstances().length; i++) {
						let o = document.oRuntime.objects.LightPawn.getAllInstances()[i];
						o.isVisible = true;
					}
					for (let i = 1; i < document.oRuntime.objects.LightBishop.getAllInstances().length; i++) {
						let o = document.oRuntime.objects.LightBishop.getAllInstances()[i];
						o.isVisible = true;
					}
					for (let i = 1; i < document.oRuntime.objects.LightKnight.getAllInstances().length; i++) {
						let o = document.oRuntime.objects.LightKnight.getAllInstances()[i];
						o.isVisible = true;
					}
					for (let i = 1; i < document.oRuntime.objects.LightRook.getAllInstances().length; i++) {
						let o = document.oRuntime.objects.LightRook.getAllInstances()[i];
						o.isVisible = true;
					}
					for (let i = 1; i < document.oRuntime.objects.LightQueen.getAllInstances().length; i++) {
						let o = document.oRuntime.objects.LightQueen.getAllInstances()[i];
						o.isVisible = true;
					}					
					for (let i = 1; i < document.oRuntime.objects.LightKing.getAllInstances().length; i++) {
						let o = document.oRuntime.objects.LightKing.getAllInstances()[i];
						o.isVisible = true;
					}


					for (let i = 1; i < document.oRuntime.objects.DarkPawn.getAllInstances().length; i++) {
						let o = document.oRuntime.objects.DarkPawn.getAllInstances()[i];
						o.isVisible = true;
					}
					for (let i = 1; i < document.oRuntime.objects.DarkBishop.getAllInstances().length; i++) {
						let o = document.oRuntime.objects.DarkBishop.getAllInstances()[i];
						o.isVisible = true;
					}
					for (let i = 1; i < document.oRuntime.objects.DarkKnight.getAllInstances().length; i++) {
						let o = document.oRuntime.objects.DarkKnight.getAllInstances()[i];
						o.isVisible = true;
					}
					for (let i = 1; i < document.oRuntime.objects.DarkRook.getAllInstances().length; i++) {
						let o = document.oRuntime.objects.DarkRook.getAllInstances()[i];
						o.isVisible = true;
					}
					for (let i = 1; i < document.oRuntime.objects.DarkQueen.getAllInstances().length; i++) {
						let o = document.oRuntime.objects.DarkQueen.getAllInstances()[i];
						o.isVisible = true;
					}										
					for (let i = 1; i < document.oRuntime.objects.DarkKing.getAllInstances().length; i++) {
						let o = document.oRuntime.objects.DarkKing.getAllInstances()[i];
						o.isVisible = true;
					}				
					
					
					//overlay
					for (let i = 0; i < document.aEntranceOverlay.length; i++) {
						let rank = Math.floor(i / 8);
						let file = i % 8;

						let markerX = ((854/2)-270)+(((8-rank))*60);
						let markerY = ((480/2)-270)+(((8-file))*60);						
						
						if (document.aEntranceOverlay[i] == iDungeonEntrance) {
							document.oRuntime.objects.DungeonEntrance.createInstance(0, markerX, markerY);
							break;
						}
					}
					for (let i = 1; i < document.oRuntime.objects.DungeonEntrance.getAllInstances().length; i++) {
						let o = document.oRuntime.objects.DungeonEntrance.getAllInstances()[i];
						o.isVisible = true;
					}
										
				} catch(e) { alert(e);}
			break;
		}
	};	
	
	document.fRenderValidMoves = function() {
		switch (document.oRuntime.layout.name) {
			case "Battle Board":
				refreshBounds(document.oRuntime.layout.name);
				try {
					//valid moves
					for (let i = 1; i < document.oRuntime.objects.ValidDestination.getAllInstances().length; i++) {
						let o = document.oRuntime.objects.ValidDestination.getAllInstances()[i];
						o.destroy();
					}					
					
					for (let i = 0; i < document.aMoveOverlay.length; i++) {
						let rank = Math.floor(i / 8);
						let file = i % 8;
						let markerX = ((854/2)-270)+(((8-rank))*60);
						let markerY = ((480/2)-270)+(((8-file))*60);							
						if (document.aMoveOverlay[i] == iValidMove) {
							document.oRuntime.objects.ValidDestination.createInstance(0, markerX, markerY);
						}
					}
					for (let i = 1; i < document.oRuntime.objects.ValidDestination.getAllInstances().length; i++) {
						let o = document.oRuntime.objects.ValidDestination.getAllInstances()[i];
						o.isVisible = true;
					}					
				} catch(e) { alert(e);}
			break;
		}
	};		
	
	document.fClick = function(src) {
		let tmp = src.getAttribute("op");
		switch (tmp) {
			case "NEW_GAME": fNewGame(); break;
			case "MAIN_MENU": fMainMenu(); break;
			case "GO_TO_DUNGEON": fDungeon(); break;
			case "GO_TO_BATTLE": fBattle(); break;
			case "RESUME": fBattle(); break;		
		}
	};
}

const iLightPawn = 1;
const iLightBishop = 3;
const iLightKnight = 5;
const iLightRook = 7;
const iLightQueen = 9;
const iLightKing = 11;

const iDarkPawn = 2;
const iDarkBishop = 4;
const iDarkKnight = 6;
const iDarkRook = 8;
const iDarkQueen = 10;
const iDarkKing = 12;

const iDungeonEntrance = 100;
const iValidMove = 101;

document.aBattleBoard = null;
document.aEntranceOverlay = null;
document.aMoveOverlay = null;
document.bLightKingMoved = false;
document.bDarkKingMoved = false;
function fInitializeGame() {

	document.aBattleBoard = [
		0,0,0,iDarkKing,0,0,0,0,
		iDarkPawn, 0, 0, iDarkPawn, iDarkPawn, 0, 0, 0,
		0,0,0,0,0,0,0,0,
		0,iDarkPawn,iDarkPawn,0,0,0,0,0,
		0,iLightPawn,0,0,0,0,iDarkPawn,0,
		iLightPawn,0,0,0,0,iDarkPawn,0,iDarkPawn,		
		0, 0, iLightPawn, iLightPawn, iLightPawn, iLightPawn, iLightPawn, iLightPawn,		
		0,0,0,iLightKing,0,0,0,0
	];
	
	document.aEntranceOverlay = [
		0,0,0,0,0,0,0,0,
		0,0,0,0,0,0,0,0,
		0,0,0,0,0,0,0,0,
		-1,-1,-1,-1,-1,-1,-1,-1,
		0,0,0,0,0,0,0,0,
		0,0,0,0,0,0,0,0,		
		0,0,0,0,0,0,0,0,		
		0,0,0,0,0,0,0,0,
	];
	
	let tmp = 0;
	for (let i = 0; i < document.aEntranceOverlay.length; i++) {
		if (document.aEntranceOverlay[i] == -1) tmp = tmp + 1;
	}
	let pos = Math.floor(Math.random() * tmp);
	tmp = 0;
	for (let i = 0; i < document.aEntranceOverlay.length; i++) {
		if (document.aEntranceOverlay[i] == -1) {
			if (tmp == pos) {
				document.aEntranceOverlay[i] = iDungeonEntrance;
				break;
			}
			else {
				tmp = tmp + 1;
			}
		}
	}
	
	document.aMoveOverlay = [
		0,0,0,0,0,0,0,0,
		0,0,0,0,0,0,0,0,
		0,0,0,0,0,0,0,0,
		0,0,0,0,0,0,0,0,
		0,0,0,0,0,0,0,0,
		0,0,0,0,0,0,0,0,		
		0,0,0,0,0,0,0,0,		
		0,0,0,0,0,0,0,0,
	];	
	
	document.bLightKingMoved = false;
	document.bDarkKingMoved = false;
}

function fMarkValidMoves(x, y) {
	document.aMoveOverlay = [
		0,0,0,0,0,0,0,0,
		0,0,0,0,0,0,0,0,
		0,0,0,0,0,0,0,0,
		0,0,0,0,0,0,0,0,
		0,0,0,0,0,0,0,0,
		0,0,0,0,0,0,0,0,		
		0,0,0,0,0,0,0,0,		
		0,0,0,0,0,0,0,0,
	];
	let tmpi = parseInt(x)+(parseInt(y)*8);
	
	switch (document.aBattleBoard[tmpi]) {
		case iLightPawn:
			let mc1 = [parseInt(x), parseInt(y)-1];
			let mc2 = [parseInt(x), parseInt(y)-2];
			let mc3 = [parseInt(x)-1, parseInt(y)-1];
			let mc4 = [parseInt(x)+1, parseInt(y)-1];			
			tmpi = mc1[0]+(mc1[1]*8);
			if (tmpi < document.aMoveOverlay.length && tmpi >= 0) {
				if (document.aBattleBoard[tmpi] == 0) {
					document.aMoveOverlay[tmpi] = iValidMove;		
					if (y == 6) {
						tmpi = mc2[0]+(mc2[1]*8);
						if (tmpi < document.aMoveOverlay.length && tmpi >= 0) {
							if (document.aBattleBoard[tmpi] == 0) {
								document.aMoveOverlay[tmpi] = iValidMove;							
							}
						}
					}
				}
			}
			tmpi = mc3[0]+(mc3[1]*8);
			if (tmpi < document.aMoveOverlay.length && tmpi >= 0) {
				if (document.aBattleBoard[tmpi] >= iDarkPawn && document.aBattleBoard[tmpi] <= iDarkKing)
					document.aMoveOverlay[tmpi] = iValidMove;
			}
			tmpi = mc4[0]+(mc4[1]*8);
			if (tmpi < document.aMoveOverlay.length && tmpi >= 0) {
				if (document.aBattleBoard[tmpi] >= iDarkPawn && document.aBattleBoard[tmpi] <= iDarkKing)
					document.aMoveOverlay[tmpi] = iValidMove;
			}			
			break;
	}
}

function Tick(runtime)
{
	// Code to run every tick
}

function fNewGame() {
	fInitializeGame();
	fBattle();
}

function fBattle() {
	let markerS = document.oRuntime.objects.BattleMarker.getFirstInstance();
	if (markerS) markerS.isVisible = false;
	document.oRuntime.goToLayout("Battle Board");
}

function fMainMenu() {
	document.oRuntime.goToLayout("Intro Splash");
}

function fDungeon() {
	let markerS = document.oRuntime.objects.DungeonMarker.getFirstInstance();
	if (markerS) markerS.isVisible = false;
	document.oRuntime.goToLayout("Dungeon");
}

function fEvent_Click(eve, can) {
	try {
	fSetMarker(eve);
	} catch(e) { alert(e);}
}

function fEvent_TouchStart(eve, can) {
	let touch = eve.touches[0];
	let mouseEvent = new MouseEvent("click", {
		clientX: touch.clientX,
		clientY: touch.clientY,
	});
	document.touching = true;
	can.dispatchEvent(mouseEvent);
}

function fEvent_MouseMove(eve, can) {
	try {	
	fSetMarker(eve);
	} catch(e) { alert(e);}	
}

function fEvent_TouchMove(eve, can) {
	let touch = eve.touches[0];
	let mouseEvent = new MouseEvent("mousemove", {
		clientX: touch.clientX,
		clientY: touch.clientY,
	});
	document.touching = true;
	can.dispatchEvent(mouseEvent);
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
					let markerX = Math.floor((eve.x - document.dMinX) / (document.dWidth / 8));
					let markerY = Math.floor((eve.y - document.dMinY) / (document.dHeight / 8));
					markerS.x = ((markerX+1) * (60)) + ((854/2)-270);
					markerS.y = ((markerY+0) * (60)) + 0 + 30;
					b = true;
					let tmpX = markerX;
					let tmpY = markerY;
					markerX = (7 - tmpY);					
					markerY = (7 - tmpX);
					fMarkValidMoves(markerX, markerY);
					document.fRenderValidMoves();
					if (!markerS.isVisible) {
						markerS.isVisible = true;
					}									
				}
			}
			if (!b) {
				if (markerS.isVisible && !document.touching) {
					markerS.isVisible = false;
				}
			}
			document.touching = false;
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
				if (markerS.isVisible && !document.touching) {
					markerS.isVisible = false;
				}
			}
			document.touching = false;			
			break;			
	}
}
