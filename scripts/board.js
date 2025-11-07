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

function board_pro() {
	this.menu_placeholder = document.getElementById("menu_placeholder");
	
	this.game_content = document.getElementById("gameContent");
	this.ctx = this.game_content.getContext('2d');

	this.draggable_pipes = document.getElementById("draggablePipes");
	this.draggables_context = this.draggable_pipes.getContext('2d');

	this.tileImage = new Image();
	this.tileImage.onload = createDelegate(this._replaceTileset, this);

	this.replaceTileset();
}

board_pro.prototype = {
	hsize: 0,
	vsize: 0,
	draggablePiecePositions: [], // Track which positions are in draggable area

	getXY: function(x, y) {
		var h = globals.tileset.h;
		var v = globals.tileset.v;
		var rect = this.game_content.getBoundingClientRect();
		var relativeX = x - rect.left;
		var relativeY = y - rect.top;
		
		// Check if the click is in a position that's been marked as draggable
		let boardX = Math.floor(relativeX/h);
		let boardY = Math.floor(relativeY/v);
		
		if (this.draggablePiecePositions && this.draggablePiecePositions.some(p => p.x === boardX && p.y === boardY)) {
			return [boardX, boardY];
		}
		
		return [Math.floor(relativeX/h), Math.floor(relativeY/v)];
	},

	refreshPiece: function(x, y, caller) {
		// Skip if this piece is in draggable area
		if (this.draggablePiecePositions && this.draggablePiecePositions.some(p => p.x === x && p.y === y)) {
			return;
		}

		var ix = caller.pieces[x][y];
		var iy = caller.states[x][y];
		var h = globals.tileset.h;
		var v = globals.tileset.v;

		if (ix != this.oldpieces[x][y] || iy != this.oldstates[x][y]) {
			this.ctx.drawImage(this.tileImage, ix*h, iy*v, h, v, x*h, y*v, h, v);
			this.oldpieces[x][y] = ix;
			this.oldstates[x][y] = iy;
		}
	},

	refresh: function(caller) {
		this.caller = caller;

		var hsize = caller.hsize;
		var vsize = caller.vsize;

		var h = globals.tileset.h;
		var v = globals.tileset.v;
		
		// Select draggable pieces if size changed or not yet selected
		if (hsize != this.hsize || vsize != this.vsize || !this.draggablePiecePositions || !this.draggablePiecePositions.length) {
			console.log('Selecting new draggable pieces');
			this.selectDraggablePieces();
			this.drawDraggablePipes();
		}

		if (hsize == this.hsize && vsize == this.vsize) {
		// if size is okay, only redraw needed tiles
			for (var y=0; y < vsize; y++) {
				for (var x=0; x < hsize; x++) {
					// Skip if this piece is in draggable area
					if (this.draggablePiecePositions && this.draggablePiecePositions.some(p => p.x === x && p.y === y)) {
						continue;
					}
					
					var ix = caller.pieces[x][y];
					var iy = caller.states[x][y];
					if (ix != this.oldpieces[x][y] || iy != this.oldstates[x][y]) {
						this.ctx.drawImage(this.tileImage, ix*h, iy*v, h, v, x*h, y*v, h, v);
						this.oldpieces[x][y] = ix;
						this.oldstates[x][y] = iy;
					}
				}
			}

		} else {
		// if size is not okay, redraw the whole board
			this.oldpieces = new Array(hsize);
			this.oldstates = new Array(hsize);

			for (var x=0; x < hsize; x++) {
				this.oldpieces[x] = new Array(vsize);
				this.oldstates[x] = new Array(vsize);
			}

			this.game_content.width = hsize * h;
			this.game_content.height = vsize * v;

			for (var y=0; y<vsize; y++) {
				for (var x=0; x<hsize; x++) {
					// Skip if this piece is in draggable area
					if (this.draggablePiecePositions && this.draggablePiecePositions.some(p => p.x === x && p.y === y)) {
						// Clear the area where the piece was
						this.ctx.clearRect(x*h, y*v, h, v);
						continue;
					}

					var ix = caller.pieces[x][y];
					var iy = caller.states[x][y];

					this.ctx.drawImage(this.tileImage, ix*h, iy*v, h, v, x*h, y*v, h, v);
					this.oldpieces[x][y] = caller.pieces[x][y];
					this.oldstates[x][y] = caller.states[x][y];
				}
			}

			// Place menu placeholder at right place
			this.menu_placeholder.style.left = (hsize*h) + 'px'

			this.hsize = hsize;
			this.vsize = vsize;
		}
	},

	replaceTileset: function(n) {
		if (typeof(n) != "undefined") globals.tileset = globals.tilesets[n];
		this.tileImage.src = "images/" + globals.tileset.filename;
	},

	_replaceTileset: function(n) {
		var hsize = this.hsize;
		var vsize = this.vsize;

		var h = globals.tileset.h;
		var v = globals.tileset.v;

		this.game_content.width = hsize * h;
		this.game_content.height = vsize * v;

		if (hsize) {
			for (var y=0; y<vsize; y++) {
				for (var x=0; x<hsize; x++) {
					var ix = this.oldpieces[x][y];
					var iy = this.oldstates[x][y];

					this.ctx.drawImage(this.tileImage, ix*h, iy*v, h, v, x*h, y*v, h, v);
				}
			}
			this.menu_placeholder.style.left=(hsize * h) + "px";
		}
		
		this.drawDraggablePipes();
	},
	
	/*
	scrollTo: function(x, y) {
		var h = globals.tileset.h;
		var v = globals.tileset.v;
		var wh = window.innerWidth || document.body.parentElement.clientWidth;
		var wv = window.innerHeight || document.body.parentElement.clientHeight;

		window.scrollTo(x*h - (wh - h - 200)/2, y*v - (wv - v)/2);
	},
	*/
	selectDraggablePieces: function() {
		// Calculate how many pieces we need
		var numPieces = this.caller.hsize;
		
		// Find all existing pieces
		let availablePositions = [];
		for (let x = 0; x < this.caller.hsize; x++) {
			for (let y = 0; y < this.caller.vsize; y++) {
				// Check for any non-zero piece
				if (this.caller.pieces[x] && this.caller.pieces[x][y] > 0) {
					availablePositions.push({ x, y });
				}
			}
		}
		
		if (availablePositions.length === 0) {
			// If no pieces found, create some default pieces
			for (let i = 0; i < numPieces; i++) {
				let x = Math.floor(Math.random() * this.caller.hsize);
				let y = Math.floor(Math.random() * this.caller.vsize);
				availablePositions.push({ x, y });
			}
		} else {
			// Shuffle existing pieces
			for (let i = availablePositions.length - 1; i > 0; i--) {
				const j = Math.floor(Math.random() * (i + 1));
				[availablePositions[i], availablePositions[j]] = [availablePositions[j], availablePositions[i]];
			}
		}
		
		// draggablePiece subset only of availablePositions
		this.draggablePiecePositions = availablePositions.slice(0, numPieces);
	},
	
	clearDraggables: function() {
		if (!this.draggables_context || !this.draggable_pipes) return;
		this.draggables_context.clearRect(0, 0, this.draggable_pipes.width, this.draggable_pipes.height);
	},

	drawDraggablePipes: function() {
		// Checker
		if (!this.caller || !this.draggablePiecePositions || !this.draggablePiecePositions.length) {
			return;
		}

		this.clearDraggables();
		
		var h = globals.tileset.h;
		var v = globals.tileset.v;

		// Calculate layout
		var spacing = 10;  // Space between pieces
		var startX = spacing;  // Start with some padding
		
		// Draw each draggable piece
		this.draggablePiecePositions.forEach((pos, index) => {
			var px = startX + (index * (h + spacing));
			var py = (this.draggable_pipes.height - v) / 2;  // Center vertically

			var piece = this.caller.pieces[pos.x][pos.y];
			var state = this.caller.states[pos.x][pos.y];

			this.draggables_context.drawImage(
				this.tileImage,
				piece * h,
				state * v,
				h,
				v,
				px,
				py,
				h,
				v
			);
		});
	},

	drawOnWin: function(caller) {
		// Clear the separate draggable canvas
		this.clearDraggables();

		var h = globals.tileset.h;
		var v = globals.tileset.v;

		// Draggable pieces in the main board
		this.draggablePiecePositions.forEach(pos => {
			var ix = caller.pieces[pos.x][pos.y];
			var iy = caller.states[pos.x][pos.y];
			this.ctx.drawImage(this.tileImage, ix*h, iy*v, h, v, pos.x*h, pos.y*v, h, v);
			// Also update the 'old' state to prevent refresh from re-drawing
			if (this.oldpieces && this.oldpieces[pos.x]) {
				this.oldpieces[pos.x][pos.y] = ix;
				this.oldstates[pos.x][pos.y] = iy;
			}
		});

		// Refresh the entire board to draw the non-draggable pieces
		this.refresh(caller);
	},

	drawSolution: function(caller) {
	},
}

