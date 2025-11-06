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

globals = {}

globals.tilesets = [
{name:"Large (64×64)", h:64, v:64, filename: "tileset_64.png"},
];

globals.tileset = globals.tilesets[0];

board = 0;
pipes_logic = 0;
controller = 0;

tiles = 0;
menu_placeholder = 0;

function newgame() {
	form_hsize = document.getElementById("hsize");
	form_vsize = document.getElementById("vsize");

	var hsize = parseInt(form_hsize.value);
	var vsize = parseInt(form_vsize.value);

	pipes_logic.generate(hsize, vsize);
	pipes_logic.scramble();
	pipes_logic.light();

	startTimer();
	document.getElementById("timer").className = "";
	
	// Update draggable pipes after generating new game
	board.drawDraggablePipes();
}

function form_size() {
	var form_sizeselect = document.getElementById("sizeselect");
	var form_hsize = document.getElementById("hsize");
	var form_vsize = document.getElementById("vsize");

	size = form_sizeselect.value;

	if (size == "custom") {
		form_hsize.disabled = false;
		form_vsize.disabled = false;
	} else {
		form_hsize.disabled = true;
		form_vsize.disabled = true;

		size = size.split("x");
		form_hsize.value=size[0];
		form_vsize.value=size[1];
	}
}

// Function adapted from Ext JS. (w/ GPLv3 License) Proof of concept only.
function createDelegate(func, obj, args, appendArgs){
	var method = func;
	return function() {
		var callArgs = args || arguments;
		if (appendArgs === true){
			callArgs = Array.prototype.slice.call(arguments, 0);
			callArgs = callArgs.concat(args);
		} else if (appendArgs == parseInt(appendArgs)){
			callArgs = Array.prototype.slice.call(arguments, 0); // copy arguments first
			var applyArgs = [appendArgs, 0].concat(args); // create method call params
			Array.prototype.splice.apply(callArgs, applyArgs); // splice them in
		}
		return method.apply(obj || window, callArgs);
	};
}

function init() {
	board = new board_pro();
	pipes_logic = new pipes_logic_pro();
	controller = new controller_pro();
	
	newgame();

	if (window.location.search.length > 1)
		io.loadgame(window.location.search.substr(1));
}
