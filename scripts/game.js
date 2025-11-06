/*
The Pipes Game
Copyright (C) 2010  WC Leung

This file is part of The Pipes Game.

The Pipes Game is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

The Pipes Game is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with The Pipes Game.  If not, see <http://www.gnu.org/licenses/>.
*/

function pipes_logic_pro() {
}
pipes_logic_pro.prototype = {

	minsize: 1,
	maxsize: 100,

	cx: 0,
	cy: 0,

	cursorx: -1,
	cursory: -1,

	vsize: 0,
	hsize: 0,

	// Tag piece
	tagPiece: function(x, y, norefresh) {
		if (typeof x == 'undefined') x = this.cursorx;
		if (typeof y == 'undefined') y = this.cursory;

		if (x >= 0 && x < this.hsize && y >= 0 && y <= this.vsize) {
			this.states[x][y] |= 2;
			if (!norefresh) board.refreshPiece(x, y, this);
		}
	},

	// Untag piece
	untagPiece: function(x, y, norefresh) {
		if (typeof x == 'undefined') x = this.cursorx;
		if (typeof y == 'undefined') y = this.cursory;

		if (x >= 0 && x < this.hsize && y >= 0 && y <= this.vsize) {
			this.states[x][y] &= 0xd;
			if (!norefresh) board.refreshPiece(x, y, this);
		}
	},

	// Toggle tag/untag status of piece
	togglePiece: function(x, y, norefresh) {
		if (typeof x == 'undefined') x = this.cursorx;
		if (typeof y == 'undefined') y = this.cursory;

		if (x >= 0 && x < this.hsize && y >= 0 && y <= this.vsize) {
			this.states[x][y] ^= 2;
			if (!norefresh) board.refreshPiece(x, y, this);
		}
	},

	// Set cursor
	setCursor: function(x, y) {
		if (this.cursorx != x || this.cursory != y) {
			var hsize = this.hsize;
			var vsize = this.vsize;

			if (this.cursorx >= 0 && this.cursorx < hsize && this.cursory >= 0 && this.cursory <= vsize) {
				this.states[this.cursorx][this.cursory] &= 0xfb;
				board.refreshPiece(this.cursorx, this.cursory, this)
			}

			if (x >= 0 && x < hsize && y >= 0 && y <= vsize) {
				this.states[x][y] |= 4;
				board.refreshPiece(x, y, this)
			}

			this.cursorx = x;
			this.cursory = y;
		}
	},

	// Move cursor
	moveCursor: function(deltax, deltay) {
		var hsize = this.hsize;
		var vsize = this.vsize;
		var cursorx = this.cursorx;
		var cursory = this.cursory;

		if (cursorx >= 0 && cursorx < hsize && cursory >= 0 && cursory <= vsize) {
			this.setCursor((cursorx + deltax + hsize) % hsize, (cursory + deltay + vsize) % vsize);
		} else {
			this.setCursor(0, 0);
		}
		board.scrollTo(this.cursorx, this.cursory);
	},

	// Light pipes and determine if the game is won
	light: function(cx, cy, norefresh) {
		if (typeof cx == "undefined") {
			cx = this.cx;
		} else {
			this.cx = cx;
		}

		if (typeof cy == "undefined") {
			cy = this.cy;
		} else {
			this.cy = cy;
		}

		var hsize = this.hsize;
		var vsize = this.vsize;

		for (var x=0; x < hsize; x++) {
			for (var y=0; y < vsize; y++) {
				this.states[x][y] &= 0xe;
			}
		}

		var lighted = 0;
		var lightList = new Array(hsize * vsize);
		lightList[0] = (cy << 8) + cx;
		var lightCount = 1;

		while (lightCount) {
			lighted++;

			lightCount--;
			var c = lightList[lightCount];
			var x = c & 0xff;
			var y = c >>> 8;
			this.states[x][y] |= 1;

			if (y > 0 && this.pieces[x][y] & 1 &&
					this.pieces[x][y-1] & 4 && !(this.states[x][y-1] & 1)) {
				lightList[lightCount] = (y-1 << 8) + x;
				lightCount++;
			}
			if (x < hsize-1 && this.pieces[x][y] & 2 &&
					this.pieces[x+1][y] & 8 && !(this.states[x+1][y] & 1)) {
				lightList[lightCount] = (y << 8) + x+1;
				lightCount++;
			}
			if (y < vsize-1 && this.pieces[x][y] & 4 &&
					this.pieces[x][y+1] & 1 && !(this.states[x][y+1] & 1)) {
				lightList[lightCount] = (y+1 << 8) + x;
				lightCount++;
			}
			if (x > 0 && this.pieces[x][y] & 8 &&
					this.pieces[x-1][y] & 2 && !(this.states[x-1][y] & 1)) {
				lightList[lightCount] = (y << 8) + x-1;
				lightCount++;
			}
		}

		if (lighted == hsize * vsize) {
			// won the game
			stopTimer();
			document.getElementById("timer").className = "won";
		}
		if (!norefresh) board.refresh(this);
		return lighted == hsize * vsize;
	},

	// Rotate piece
	rotatePiece: function(x, y, dir) {
		if (typeof x == 'undefined') x = this.cursorx;
		if (typeof y == 'undefined') y = this.cursory;

		if (x >= 0 && x < this.hsize && y >= 0 && y <= this.vsize) {
			var i = this.pieces[x][y];
			if (!dir)
				i = i << 1 & 0xf | i >>> 3;
			else
				i = i << 3 & 0xf | i >>> 1;
			this.pieces[x][y] = i;

			this.light();
		}
	},

	// Refer to this docs: https://docs.google.com/document/d/11I7ag3Bi5yJwxqJqq4KNCPjwFN8yogC3DyICXaxchgA/edit?usp=sharing
	generate: function (hsize, vsize) {
		/*
			Kruskal's algorithm (simplified)
			Pre requisite: A connected, undirected graph with weights assigned to each edge.

			1. Create a list of all edges in the graph, with random weights.
			2. Sort the edges in ascending order of their weights.
			3. Initialize an empty graph to store the MST.	
		*/

		this.hsize = hsize;
		this.vsize = vsize;

		// Pieces and states initialization
		this.pieces = Array.from({ length: hsize }, () => Array(vsize).fill(0));
		this.states = Array.from({ length: hsize }, () => Array(vsize).fill(0));

		// To do: Generate an adjacency matrix that will be used for Kruskal's algorithm 
		// edgeList shall store the weighted edges information
		
		const edgeList = []; // edgeList shall be an array of objects
		const directions = [ // To do: Check if grid comments are right
			{ dx: 1, dy: 0, bit: 2, opp: 8 },  // grid down
			{ dx: 0, dy: 1, bit: 4, opp: 1 },  // grid right --> also used in MST connection
		];

		// Each cell is to be connected to its right and bottom neighbor
		// Therefore, the # of edges = (hsize - 1) * vsize * 2
		for (let x = 0; x < hsize; x++) {
			for (let y = 0; y < vsize; y++) {
			
				// Check right and bottom neighbors
				for (const d of directions) {
					const nx = x + d.dx;
					const ny = y + d.dy;
					
					// Considering hsize - 1 and vsize - 1 to avoid out-of-boundary edges
					if (nx >= 0 && nx < hsize && ny >= 0 && ny < vsize) {
						const from = y * hsize + x;
						const to = ny * hsize + nx;
						const weight = Math.floor(Math.random() * 6);
						
						// Store edge information
						edgeList.push({ from, to, weight, ...d });
					}
				}
			}
		}

		console.table(edgeList); // For visualization

		// Sort edges by weight
		edgeList.sort((a, b) => a.weight - b.weight);

		// Union-Find for cycle detection
		// Web ref: https://www.geeksforgeeks.org/dsa/kruskals-minimum-spanning-tree-algorithm-greedy-algo-2/
		class UnionFind {
			constructor(n) {
				// Initializes parent of each vertex to itself
				this.parent = Array.from({ length: n }, (_, i) => i);
			}
			
			// Recursive find for locating root parent
			find(x) {
				if (this.parent[x] === x) return x;
				return (this.parent[x] = this.find(this.parent[x]));
			}
			
			// Union two vertices; return false if cycle detected
			union(a, b) {
				const ra = this.find(a);
				const rb = this.find(b);

				// ra and rb being equal means a cycle is detected
				if (ra === rb) return false;

				// else, continue with parent assignment + union
				this.parent[rb] = ra;
				return true;
			}
		}

		const uf = new UnionFind(hsize * vsize);
		let edgeCount = 0;

		// Build MST and connect pipes
		for (const edge of edgeList) {
			if (uf.union(edge.from, edge.to)) {
				edgeCount++;
				// Convert back to (x, y)
				const x = edge.from % hsize;
				const y = Math.floor(edge.from / hsize);
				const nx = edge.to % hsize;
				const ny = Math.floor(edge.to / hsize);

				// Bitmask connection
				// To be used later
				this.pieces[x][y] |= edge.bit;
				this.pieces[nx][ny] |= edge.opp;
				
				// hsize * vsize - 1 edges only for MST
				if (edgeCount >= hsize * vsize - 1) break;
			}
		}

		
	},

	scramble: function() {
		var hsize = this.hsize;
		var vsize = this.vsize;
		for (var x = 0; x < hsize; x++) {
			for (var y = 0; y < vsize; y++) {
				var d = Math.floor(Math.random() * 4);
				var i = this.pieces[x][y];
				i = i << d & 0xf | i >>> (4-d);
				this.pieces[x][y] = i;
			}
		}
	},

	// Save data in object obj. Only relevant properties are added
	save: function(obj) {
		var hsize = this.hsize;
		var vsize = this.vsize;

		if (this.hsize < 1 || this.vsize < 1) return false;
		props = ["hsize", "vsize", "cx", "cy", "cursorx", "cursory"];
		for (i in props) {
			obj[props[i]] = this[props[i]];
		}

		var pieces = "";
		var states = "";
		for (var y = 0; y < vsize; y++) {
			for (var x = 0; x < hsize; x++) {
				pieces += this.pieces[x][y].toString(16);
				states += this.states[x][y].toString(16);
			}
			if (y + 1 < vsize) {
				pieces += "_";
				states += "_";
			}
		}

		obj.pieces = pieces;
		obj.states = states;
		return true;
	},

	load: function(obj) {
		var hsize, vsize, cx, cy, cursorx, cursory, pieces_l, states_l
		// validate data
		try {
			hsize = parseInt(obj.hsize);
			if (hsize < this.minsize || hsize > this.maxsize)
				throw ("hsize is invalid");

			vsize = parseInt(obj.hsize);
			if (vsize < this.minsize || vsize > this.maxsize)
				throw ("vsize is invalid");

			cx = parseInt(obj.cx);
			if (cx < 0 || cx >= hsize)
				throw ("cx is invalid");

			cy = parseInt(obj.cy);
			if (cy < 0 || cy >= vsize)
				throw ("cy is invalid");

			cursorx = parseInt(obj.cursorx);
			if (cursorx < -1 || cursorx >= hsize)
				throw ("cursorx is invalid");

			cy = parseInt(obj.cy);
			if (cursory < -1 || cursory >= vsize)
				throw ("cursory is invalid");

			pieces_l = obj.pieces.split("_");
			if (pieces_l.length != vsize)
				throw ("pieces contains an incorrect number of lines");

			states_l = obj.states.split("_");
			if (states_l.length != vsize)
				throw ("states contains an incorrect number of lines");

			var pieces_check = new RegExp("^[0-9a-f]{" + hsize + "}$");
			var states_check = new RegExp("^[0-9a-f]{" + hsize + "}$");

			for (var i=0; i<vsize; i++) {
				if (!pieces_check.test(pieces_l[i]))
					throw ("pieces contains an error in line " + i);
				if (!states_check.test(states_l[i]))
					throw ("states contains an error in line " + i);
			}
		} catch(e) {
			// validate fail: alert and quit
			alert("Unable to load save data.\nReason: " + e + "\n\nYou may start a new game instead.\n\nIf you are using Internet Explorer, please press\n\"Load from URL\" and paste the URL there.");
			return false;
		}

		// write data after validation
		this.hsize = hsize;
		this.vsize = vsize;

		this.pieces = new Array(hsize);
		this.states = new Array(hsize);

		for (var x=0; x < hsize; x++) {
			this.pieces[x] = new Array(vsize);
			this.states[x] = new Array(vsize);
		}

		for (var y = 0; y < vsize; y++) {
			for (var x = 0; x < hsize; x++) {
				this.pieces[x][y] = parseInt(pieces_l[y].charAt(x), 16);
				this.states[x][y] = parseInt(states_l[y].charAt(x), 16);
			}
		}

		var won = this.light(cx, cy);
		this.setCursor(cursorx, cursory);
		this.moveCursor(0, 0);

		if (!won) {
			startTimer();
			document.getElementById("timer").className = "";
		}

		var form_sizeselect = document.getElementById("sizeselect");
		var form_hsize = document.getElementById("hsize");
		var form_vsize = document.getElementById("vsize");

		var size = hsize + "x" + vsize;

		for (i=0; i<form_sizeselect.options.length; i++) {
			if (size == form_sizeselect.options[i].value) {
				form_sizeselect.value = size;
				form_hsize.disabled = true;
				form_vsize.disabled = true;
				return true;
			}
		}

		form_sizeselect.value = "custom";
		form_hsize.value = hsize;
		form_vsize.value = vsize;
		form_hsize.disabled = false;
		form_vsize.disabled = false;

		return true;
	}

	// To do: generate an auto solution if user wants to surrender for solution
}
