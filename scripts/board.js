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
	this.tileset_loading = document.getElementById("loading_images");
	
	this.game_content = document.getElementById("gameContent");
	this.ctx = this.game_content.getContext('2d');

	this.draggable_pipes = document.getElementById("draggablePipes");
	this.ctx_draggables = this.draggable_pipes.getContext('2d');

	this.tileImage = new Image();
	this.tileImage.onload = createDelegate(this._replaceTileset, this);

	this.replaceTileset();
}

board_pro.prototype = {
	hsize: 0,
	vsize: 0,

	getXY: function(x, y) {
		var h = globals.tileset.h;
		var v = globals.tileset.v;
		var rect = this.game_content.getBoundingClientRect();
		var relativeX = x - rect.left;
		var relativeY = y - rect.top;
		return [Math.floor(relativeX/h), Math.floor(relativeY/v)];
	},

	refreshPiece: function(x, y, caller) {
		// Skip if this piece is in draggable area
		if (this.draggablePieces && this.draggablePieces.some(p => p.x === x && p.y === y)) {
			// Clear the area where the piece was
			var h = globals.tileset.h;
			var v = globals.tileset.v;
			this.ctx.clearRect(x*h, y*v, h, v);
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

		// Helper function to check if a position is in draggable pieces
		const isPieceInDraggable = (x, y) => {
			if (!this.draggablePieces) return false;
			return this.draggablePieces.some(p => p.x === x && p.y === y);
		};

		if (hsize == this.hsize && vsize == this.vsize) {
		// if size is okay, only redraw needed tiles
			for (var y=0; y < vsize; y++) {
				for (var x=0; x < hsize; x++) {
					// Skip if this piece is in draggable area
					if (isPieceInDraggable(x, y)) continue;
					
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
					if (isPieceInDraggable(x, y)) continue;

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

			// Update draggable pipes with new board pieces
			this.drawDraggablePipes();
		}
	},

	replaceTileset: function(n) {
		if (typeof(n) != "undefined") globals.tileset = globals.tilesets[n];
		// this.tileset_loading.style.display = "";
		this.tileImage.src = "images/" + globals.tileset.filename;
	},

	_replaceTileset: function(n) {
		// this.tileset_loading.style.display = "none";

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
		
		// Draw the draggable pipes
		this.drawDraggablePipes();
	},

	scrollTo: function(x, y) {
		var h = globals.tileset.h;
		var v = globals.tileset.v;
		var wh = window.innerWidth || document.body.parentElement.clientWidth;
		var wv = window.innerHeight || document.body.parentElement.clientHeight;

		window.scrollTo(x*h - (wh - h - 200)/2, y*v - (wv - v)/2);
	},

	drawDraggablePipes: function() {
		if (!this.ctx_draggables || !this.draggable_pipes || !this.caller) return;

		var h = globals.tileset.h;
		var v = globals.tileset.v;
		
		// Fixed canvas dimensions
		const FIXED_WIDTH = 1200;
		const FIXED_HEIGHT = 100;
		this.ctx_draggables.clearRect(0, 0, FIXED_WIDTH, FIXED_HEIGHT); // Clear canvas
		
		// Calculate how many pieces we need
		var numPieces = Math.ceil((this.hsize * this.vsize) / 4);
		
		// Find all existing pieces in the game board
		let availablePositions = [];
		for (let x = 0; x < this.hsize; x++) {
			for (let y = 0; y < this.vsize; y++) {
				if (this.caller.pieces[x][y] !== 0) {
					availablePositions.push({
						x: x,
						y: y,
						piece: this.caller.pieces[x][y],
						state: this.caller.states[x][y]
					});
				}
			}
		}
		
		// Shuffle the available positions
		for (let i = availablePositions.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[availablePositions[i], availablePositions[j]] = [availablePositions[j], availablePositions[i]];
		}
		
		// Take a random subset of the available pieces
		var pieces = availablePositions.slice(0, numPieces);
		
		// Calculate spacing and position to center pieces in fixed canvas
		var spacing = 10;
		var totalPiecesWidth = (pieces.length * (h + spacing)) + spacing;
		var startX = Math.max(spacing, (FIXED_WIDTH - totalPiecesWidth) / 2);
		var centerY = (FIXED_HEIGHT - v) / 2;

		// Draw all pieces in draggable area
		pieces.forEach((p, index) => {
			this.ctx_draggables.drawImage(
				this.tileImage,
				p.piece * h,
				p.state * v,
				h,
				v,
				startX + (h + spacing) * index,
				centerY,
				h,
				v
			);
		});
	}
}

