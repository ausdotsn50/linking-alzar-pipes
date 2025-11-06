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

controlsets = [
	{
		name: "Mouse",
		desc: "<p><i>Click</i>: Rotate piece</p><p><i>Right click</i>: Toggle highlight</p><p><i>Ctrl + Click</i>: Start lighting here</p><p><i>Note: rotating a piece highlights it automatically</i></p>",
		eventprocess: function(e) {
			var buttonmap = [1, 4, 2];
			var button = e.which ? buttonmap[e.button] : e.button;

			if (e.type == "mouseup") {
				var t = e.target || e.srcElement;
				if (t.id == "gameContent") {
					var pos = board.getXY(e.pageX, e.pageY); // incomplete
					var x = pos[0];
					var y = pos[1];
					switch (button)
					{
						case 1:
							if (e.ctrlKey)
								pipes_logic.light(x, y);
							else {
								pipes_logic.tagPiece(x, y, true);
								pipes_logic.rotatePiece(x, y);
							}
							break;
						case 2:
							pipes_logic.togglePiece(x, y);
							break;
					} 
				}
			} else if (e.type == "mousemove") {
				var t = e.target || e.srcElement;
				if (t.id == "gameContent") {
					var pos = board.getXY(e.pageX, e.pageY); // incomplete
					var x = pos[0];
					var y = pos[1];
					pipes_logic.setCursor(x, y);
				}
			} else if (e.type == "mouseout") {
				var t = e.target || e.srcElement;
				if (t.id == "gameContent") {
					pipes_logic.setCursor(-1, -1);
				}
			}
		}
	},
];

// Mouse control set as default - keyboard removed
function controller_pro() {
	this.controlset = controlsets[0];
}

controller_pro.prototype = {
	controlset: null,

	setControlset: function(n) {
		this.controlset = controlsets[0];
	},

	eventprocess: function(e) {
		return this.controlset.eventprocess(e);
	}
}