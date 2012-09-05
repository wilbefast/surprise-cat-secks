/** @author William J. Dyce */

/*
"SURPRISE CAT SECKS!"
Kitten-burning game made for Ludum Dare #24 ("Evolution").
Copyright (C) 2012 William James Dyce

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/


/*** GAME CLASS ***/

/// CLASS VARIABLES/CONSTANTS
// strings
Game.TITLE = "Surprise Cat Secks";
Game.AUTHOR = "By William 'wilbefast' J.D.";
Game.TUT_TEXT = ["You are to breed a new strain of super-kittie.",
		  "Use your weapons sparingly (SPACE/ENTER).",
		  "Good luck and have fun!" ];
// timing: maximum number of frames per second
Game.MAX_FPS = 60;
// left keys
Game.K_LEFT = 37;
Game.K_A = 'A'.charCodeAt(0);		// qwerty + dvorak
Game.K_Q = 'Q'.charCodeAt(0);		// azerty
// right keys
Game.K_RIGHT = 39;
Game.K_D = 'D'.charCodeAt(0);		// qwerty + azerty
Game.K_E = 'E'.charCodeAt(0);		// dvorak
// up keys
Game.K_UP = 38;
Game.K_W = 'W'.charCodeAt(0);		// qwerty
Game.K_Z = 'Z'.charCodeAt(0);		// azerty
Game.K_COMMA = 1;			// dvorak
// down keys
Game.K_DOWN = 40;
Game.K_S = 'S'.charCodeAt(0);		// qwerty + azerty
Game.K_O = 'O'.charCodeAt(0);		// dvorak
// other keys
Game.K_ENTER = 13;
Game.K_SPACE = 32;
// mouse
Game.M_FADE_SPEED = 0.01;
// gameplay constants
Game.STARTING_KITTENS = 3; //Kitten.MAX_NUMBER/3;
// object types
Game.KITTEN_T = 0;
Game.PLAYER_T = 1;
Game.CLOUD_T = 2;
// colours, fonts, line widths, etc
Game.C_BACKGROUND = "rgb(186, 186, 100)";
Game.C_TEXT = "rgb(69, 69, 155)";
Game.C_OUTLINE = ["rgba(69, 69, 155, 0.9)", "rgba(69, 69, 155, 0.6)", 
		  "rgba(69, 69, 155, 0.3)"];
Game.C_CREAM = "rgb(221, 221, 221)";		  
Game.C_MASK = "rgba(17, 17, 39, 0.9)";
Game.OUTLINE_WIDTHS = 10;
Game.CROSSHAIR_LINE_WIDTH = 3;
Game.CROSSHAIR_SIZE = 24;
// different modes
Game.TUTORIAL = 0;
Game.PLAY = 1;
Game.SCORE = 2;
Game.N_MODES = 3;
// music
Game.music = load_audio("music.ogg");
Game.music.volume = 0.2;

/// INSTANCE ATTRIBUTES/METHODS
function Game()
{
  /* ATTRIBUTES 
    var a = x; 
  */
  
  // receiver 
  var obj = this, typ = Game;
  
  // true attributes
  var k_left, k_right, 	// boolean: left and right arrow keys?
      k_up, key_down,	// boolean: up and down arrow keys?
      k_direction,	// V2: {x,y} reprenting direction pressed on key-pad
      k_shoot,		// boolean: is shoot key being pressed?
      k_wpn_change,	// boolean: is the weapon change key being pressed?
      m_shoot,		// boolean: is the mouse shoot key being pressed?
      m_pos,		// V2: {x,y} position of the mouse
      m_direction,	// V2: {x,y} normalised player->mouse direction
      m_use,		// real: value between 0 and 1, move fades if not used
      focus,		// boolean: pause if we lose focus
      time,		// time taken to kill/breed all the cats	
      kills,		// total number of cats killed
      mode;		// enum: tutorial, play or score screen
      
  /* SUBROUTINES 
    var f = function(p1, ... ) { } 
  */
  
  // reset the game to its initial state
  var reset = function()
  {
    // clear all objects
    Kitten.objects = new Array();
    Kitten.best = Kitten.worst = null;
    Player.objects = new Array();
    Cloud.objects = new Array();
    Stain.objects = new Array();
    
    // create new objects
    new Player(canvas.width/2, canvas.height/2);
    for(var i = 0; i < typ.STARTING_KITTENS-1; i++)
      new Kitten();

    // keyboard
    k_direction = new V2();
    key_left = k_right = k_up = k_down = k_shoot = k_wpn_change = false;
    // mouse
    m_pos = new V2();
    m_direction = new V2();
    m_shoot = false;
    m_wheel_offset = 0;
    m_use = 0.0;
    
    // for score
    time = 0.0;
    kills = 0;
    
    // pause or unpause
    focus = true;
    
    // mode
    mode = typ.TUTORIAL;
  }
  
  // generate a collision between two objects if applicable
  var generateCollision = function(a, b)
  {
    if(a != null && b != null && areColliding(a, b))
    {
      // generate collision
      a.collision(b);
      b.collision(a);
    }
  }
  
  // generate collisions between two arrays of dynamic objects
  var generateObjectCollisions = function(obj_array1, obj_array2)
  {
    for(var i = 0; i < obj_array1.length; i++)
    for(var j = 0; j < obj_array2.length; j++)
      generateCollision(obj_array1[i], b = obj_array2[j])
  }
  
  // update dynamic objects (a variable number stored in an array)
  var updateObjects = function(obj_array, delta_t, tween_functions)
  {
    // array of indexes of objects to be deleted
    var cleanUp = new Array();
    for(var i = 0; i < obj_array.length; i++)
    {
      var a = obj_array[i];
      // update objects, save update result
      var deleteThing = (a == null || a.update(delta_t));
      // delete object if the update returns true
      if(deleteThing)
      {
	obj_array[i] = null;
	// add to cleanup list ;)
	cleanUp.push(i);
      }
      
      // before each "tween" function on each pair of objects
      if(tween_functions) for(f = 0; f < tween_functions.length; f++)
      {
	// for instance, generate collision events between objects if requested
	for(var j = i+1; j < obj_array.length; j++)
	{
	  var b = obj_array[j];
	  if (b != null)
	    tween_functions[f](a, b);
	}
      }
    }
    // delete the indices in the cleanup list
    for(var i = 0; i < cleanUp.length; i++)
      obj_array.splice(cleanUp[i], 1);
  }
  
  var drawObjects = function(obj_array)
  {
    for(var i = 0; i < obj_array.length; i++)
      if(obj_array[i] != null)	// uber-rare but did happen... once o_O
	obj_array[i].draw();
  }
  
  var injectKeyState = function(key, state)
  {
    // work out what the input is
    switch(key)
    {	  
      case typ.K_LEFT: 	case typ.K_A: 	case typ.K_Q:	
	k_left = state; 	
	break;
      case typ.K_RIGHT: case typ.K_D: 	case typ.K_E: 	
	k_right = state; 
	break;
      case typ.K_UP: 	case typ.K_W: 	case typ.K_Z:	case typ.K_COMMA:		
	k_up = state; 	
	break;
      case typ.K_DOWN:	case typ.K_S:	case typ.K_O: 		
	k_down = state; 	
	break;
      case typ.K_SPACE:		
	k_shoot = state; 
	break;
      case typ.K_ENTER:
	if(state && !k_wpn_change)
	  Player.objects[0].change_weapon(1);
	k_wpn_change = state;
	break;
    }
    
    // reset the direction based on input
    k_direction.setX((k_left && !k_right) ? -1 : ((!k_left && k_right) ? 1 : 0));
    k_direction.setY((k_up && !k_down) ? -1 : ((!k_up && k_down) ? 1 : 0));
    
    // normalise only if nessecary
    if(k_direction.x() && k_direction.x())
      k_direction.normalise();
  }
  
  var injectMouseDir = function(x, y)
  {
    m_direction.setFromTo(Player.objects[0].getPosition(), m_pos);
    m_direction.normalise();
  }
  
  // drawing
  
  var draw_outline = function()
  {
    // the top box
    context.fillStyle = Game.C_TEXT;
    context.fillRect(0, 0, canvas.width, typ.INFOBAR_HEIGHT);
    // three concentric rectangles of varying sizes
    context.lineWidth = typ.OUTLINE_WIDTHS;
    for(var i = 0; i < 3; i++)
    {
      var offset = (i+0.5)*typ.OUTLINE_WIDTHS;
      context.strokeStyle = typ.C_OUTLINE[i];
      context.strokeRect(offset, offset /*+ typ.INFOBAR_HEIGHT*/, 
	canvas.width-offset*2, canvas.height-offset*2 /*- typ.INFOBAR_HEIGHT*/);
    }
  }
  
  var draw_crosshair = function()
  {
    // diamond shape
    context.beginPath();
    context.strokeStyle = Cloud.COLOUR[Player.objects[0].getWeapon()] + m_use + ")";
    context.moveTo(m_pos.x(), m_pos.y()-typ.CROSSHAIR_SIZE);	// top
    context.lineTo(m_pos.x()+typ.CROSSHAIR_SIZE, m_pos.y());	// right
    context.lineTo(m_pos.x(), m_pos.y()+typ.CROSSHAIR_SIZE);	// bottom
    context.lineTo(m_pos.x()-typ.CROSSHAIR_SIZE, m_pos.y());	// left
    context.closePath();
    context.stroke();
  }
  
  /* METHODS 
    (obj.f = function(p1, ... ) { }
  */
  
  // getters
  obj.getInputMove = function() 
  { 
    return k_direction; 
  }
  obj.isInputShoot = function() { return (k_shoot||m_shoot); }
  obj.isInputMouse = function() { return m_shoot; }
  obj.getInputMouse = function() { return m_direction; }
  obj.getPlayer = function() { return Player.objects[0]; }
  obj.isFocus = function() { return focus; }
  
  // modification
  obj.setFocus = function(new_focus) 
  {  
    if(focus && !new_focus)
    {
      // pause music
      typ.music.pause();
      
      // redraw once without the cursor
      m_use = 0;
      obj.injectDraw();
      
      // apply mask
      context.fillStyle = Game.C_MASK;
      context.fillRect(0,0,canvas.width, canvas.height);
      
      // draw paused text
      context.fillStyle = Game.C_BACKGROUND;
      context.font = "32pt cube";
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.fillText("Paused", canvas.width/2, canvas.height/2);
    }
    else if(!focus && new_focus)
      typ.music.play();

    focus = new_focus; 
  }
  
  obj.addKill = function() { kills++; }
  
  // injections
  obj.injectUpdate = function(delta_t)
  {
    if(!focus)
      return;

    // gameplay update
    if(mode == typ.PLAY)
    {
      // increment the timer
      time += delta_t/typ.MAX_FPS;
      
      // gradually hide the cursor
      if(!m_shoot)
      {
	if(m_use > typ.M_FADE_SPEED)
	  m_use -= typ.M_FADE_SPEED;
	else
	  m_use = 0.0;
      }
      
      // generate inter-object-type collisions
      generateObjectCollisions(Kitten.objects, Cloud.objects);
      generateObjectCollisions(Kitten.objects, Player.objects);
      
      // update game objects (generating collisions between same-type objects)
      updateObjects(Player.objects, delta_t);
      updateObjects(Kitten.objects, delta_t, [generateCollision, Kitten.checkIfNearest]);
      updateObjects(Cloud.objects, delta_t);
      updateObjects(Stain.objects, delta_t);
      
      // check if there are no cats left
      if(Kitten.objects.length == 0)
      {
	mode++;
	Player.SND_SPRAY.pause();
      }
    }
    
    // update the GUI
    tdata_cats.innerHTML = Kitten.objects.length + "/" + Kitten.MAX_NUMBER;
    tdata_kills.innerHTML = kills;
    var minutes = Math.floor(time/60);
      if(minutes < 10) minutes = '0' + minutes;
    var seconds = Math.floor(time)%60;
      if(seconds < 10) seconds = '0' + seconds;
    tdata_time.innerHTML = minutes + ':' +  seconds;
    tdata_min.innerHTML = Math.floor(Kitten.min_fitness*100) + '%';
    tdata_mean.innerHTML = Math.floor(Kitten.mean_fitness*100) + '%';
    tdata_max.innerHTML = Math.floor(Kitten.max_fitness*100) + '%';
  }
 
  obj.injectDraw = function()
  {
    if(!focus)
      return;

    // clear canvas
    context.fillStyle = Game.C_BACKGROUND;
    context.fillRect(0,0,canvas.width, canvas.height);
    
    
    switch(mode)
    {
      // gameplay draw loop
      case typ.PLAY:
	// draw objects
	drawObjects(Stain.objects);
	drawObjects(Kitten.objects);
	drawObjects(Cloud.objects);
	drawObjects(Player.objects);
	// draw outline overlay
	draw_outline();
	// draw crosshair
	if(m_use > 0)
	  draw_crosshair();
	// draw marker on best and worst cats
	context.font = "16pt cube";
	context.lineWidth = 1;
	if(Kitten.worst != null)
	{
	  var pos = Kitten.worst.getPosition();
	  context.fillStyle = context.strokeStyle = "rgb(255,255,255)";
	  context.fillText(Math.floor(Kitten.worst.getFitness()*100) + "%", 
			   pos.x(), pos.y()-24);
	  context.strokeRect(pos.x()-Kitten.SIZE, pos.y()-Kitten.SIZE, 
			    Kitten.SIZE*2, Kitten.SIZE*2);
	}
	if(Kitten.best != null)
	{
	  var pos = Kitten.best.getPosition();
	  context.fillStyle = context.strokeStyle = typ.C_MASK;
	  context.fillText(Math.floor(Kitten.best.getFitness()*100) + "%", 
			   pos.x(), pos.y()-24);
	  context.strokeRect(pos.x()-Kitten.SIZE, pos.y()-Kitten.SIZE, 
			    Kitten.SIZE*2, Kitten.SIZE*2);
	}	
      break;
      
      case typ.TUTORIAL:
	// draw outline overlay
	draw_outline();
	// draw tutorial
	context.fillStyle = typ.C_TEXT;
	context.font = "16pt cube";
	context.textAlign = "center";
	context.textBaseline = "middle";
	for(var i = 0; i < 3; i++)
	  context.fillText(typ.TUT_TEXT[i], 
			  canvas.width/2, canvas.height*(i+1)/4);
	break;
	
      case typ.SCORE:
	// draw outline overlay
	draw_outline();
	// draw epilogue text
	context.fillStyle = Game.C_TEXT;
	context.font = "18pt cube";
	context.textAlign = "center";
	context.textBaseline = "middle";
	context.fillText("You killed all the kitties. You monster!", 
			 canvas.width/2, canvas.height/2);
	break;
    }
  }
  
  obj.injectMouseDown = function(x, y) 
  { 
    if(!focus)
      obj.setFocus(true);
    else
    {
      switch(mode)
      {
	case typ.PLAY:
	  m_shoot = true;
	  m_pos.setXY(x, y);
	  injectMouseDir(x, y);
	  // make cursor appear
	  m_use = 1.0;
	  break;
      
	case typ.TUTORIAL:
	  mode++;
	  break;
	
	case typ.SCORE:
	  reset();
	  break;
      }
    }
  }
  
  obj.injectMouseUp = function(x, y) 
  {   
    // release mouse button even when not focused!
    m_shoot = false;
  }
  
  obj.injectMouseMove = function(x, y)
  {
    if(!focus)
      return;
    
    // move cursor
    m_pos.setXY(x, y);
    if(m_shoot)
      injectMouseDir(x, y);
    
    // cursor visible only if used
    m_use = Math.max(0.5, m_use);
    if(m_use < 1.0 - typ.M_FADE_SPEED)
      m_use += typ.M_FADE_SPEED;
    else
      m_use = 1.0;
  }
  
  obj.injectMouseWheel = function(delta)
  {    
    if(!focus)
      return;
    
    Player.objects[0].change_weapon(sign(delta));
  }
  
  obj.injectKeyDown = function(key)
  {
    if(!focus)
      return;
    
    switch(mode)
    {
      case typ.PLAY:
	injectKeyState(key, true);
	break;
    
      case typ.TUTORIAL:
	mode++;
	break;
      
      case typ.SCORE:
	reset();
	break;
    }
  }
  
  obj.injectKeyUp = function(key)
  {
    // release key even when not focused!
    injectKeyState(key, false);
  }

  /* INITIALISE AND RETURN INSTANCE */
  reset();
  typ.music.play(); typ.music.loop = true;
  return obj;
}

// singleton instance
Game.INSTANCE = new Game();