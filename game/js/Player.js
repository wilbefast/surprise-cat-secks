/** @author William J. Dyce */

/*
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

/*** PLAYER CHARACTER CLASS CLASS ***/

/// CLASS VARIABLES/CONSTANTS
// size
Player.SIZE = 24;
Player.HALF_SIZE = Player.SIZE / 2;
Player.GUN_LENGTH = Player.SIZE * 1.5;
// speed
Player.SPEED_MAX = 1.9;
Player.SPEED_DELTA = Player.SPEED_MAX / 8.0;
Player.SPEED_MAX_2 = Math.pow(Player.SPEED_MAX, 2);
Player.SPEED_MAX_INV = 1.0 / Player.SPEED_MAX;
Player.FRICTION = 0.1;
Player.TURN_SPEED = 0.05;
Player.FACING_CHANGE_TIME = 3;
// weapons
Player.RELOAD_TIME = 17;
Player.WEAPON_CHANGE_TIME = 45;
// images
Player.IMG_FACE = load_image("skull_face.png");
// colours, fonts, line widths, etc
Player.BODY_COLOUR = "rgb(34, 34, 77)"; 
Player.OUTLINE_COLOUR = "rgb(11, 11, 11)"; 
Player.OUTLINE_WIDTH = 1;
Player.GUN_COLOUR = "rgb(22, 22, 22)";
Player.GUN_WIDTH = 3;


/// INSTANCE ATTRIBUTES/METHODS

function Player(x, y)
{
  /* ATTRIBUTES 
    var a = x; 
  */
  
  // receiver 
  var obj = this, typ = Player;
  
  // true attributes
  
  // V2: position
  var pos = new V2(),
  // {desired=V2, actual=V2, change_timer=real}: aim
      facing = new Object,
      nozzle_pos = new V2(),
  // V2: vertical and horizontal speed
      speed = new V2(),	
  // real: updates till gun is reloaded
      reloading = 0,
  // enum in Cloud.NAPALM, Cloud.NERVE_GAS or Cloud.LIQUID NITROGEN
      weapon_type = Cloud.NAPALM,
  // a short delay prevent mouse-wheel from skipping over weapons
      wpn_change_timer = 0;
  
  // initialise from parameters
  pos.setXY((x || 0.0), (y || 0.0));
  // facing, straight down by default
  facing.desired = new V2(0, -1);
  facing.actual = new V2(0, -1); 
  nozzle_pos.setXY(pos.x() + typ.GUN_LENGTH * facing.actual.x(), 
		   pos.y() + typ.GUN_LENGTH * facing.actual.y());
      
  /* SUBROUTINES 
    var f = function(p1, ... ) { } 
  */
  
  /* METHODS 
    (obj.f = function(p1, ... ) { }
  */
  
  // getters
  obj.getPosition = function() { return pos; }
  obj.getRadius = function() { return typ.HALF_SIZE; }
  obj.getType = function() { return typ; }
  
  // injections
  obj.change_weapon = function(delta)
  {
    // wait a short delay in between changes
    if(wpn_change_timer > 0)
    {
      console.log("new change possible in " + wpn_change_timer);
      return;
    }
    
    console.log("weapon changing " + weapon_type + " + " + delta);
    
    // change weapon and reset timer
    weapon_type += delta || 1;
    wpn_change_timer = typ.WEAPON_CHANGE_TIME;
    
    // lap around weapon-types
    if(weapon_type >= Cloud.N_TYPES)
      weapon_type -= Cloud.N_TYPES;
    else if(weapon_type < 0)
      weapon_type += Cloud.N_TYPES;
  }
  
  obj.draw = function()
  {
    context.fillStyle = Game.C_TEXT;
    
    // draw gun
    context.beginPath();
    context.strokeStyle = typ.GUN_COLOUR;
    context.lineWidth = typ.GUN_WIDTH;
    context.moveTo(pos.x(), pos.y());
    context.lineTo(nozzle_pos.x(), nozzle_pos.y());
    context.stroke();
    
    // draw body and outline
    context.fillStyle = typ.BODY_COLOUR;
    context.fillRect(pos.x()-typ.HALF_SIZE, pos.y()-typ.HALF_SIZE, 
		     typ.SIZE, typ.SIZE); 
    context.strokeStyle = typ.OUTLINE_COLOUR;
    context.lineWidth = typ.OUTLINE_WIDTH;
    context.strokeRect(pos.x()-typ.HALF_SIZE, pos.y()-typ.HALF_SIZE, 
		  typ.SIZE, typ.SIZE);  
    // draw face
    context.drawImage(typ.IMG_FACE, pos.x()-typ.HALF_SIZE, pos.y()-typ.HALF_SIZE, 
		  typ.SIZE, typ.SIZE);

  }
  
  obj.update = function(game, t_multiplier)
  {
    // get useful variables
    var move = game.getInputMove(), shoot = game.isInputShoot(),
	use_mouse = game.isInputMouse();
    
    // apply move commands
    if(move.x() || move.y())
    {
      // reset desired facing
      if(!shoot && !use_mouse
      && (move.x() != facing.desired.x() || move.y() != facing.desired.y()))
      {
	// don't change direction immediately or we'll never face diagonals
	if(facing.change_timer == 0)
	{
	  // change direction
	  facing.desired.setXY(move.x(), move.y());
	  // reset direction-change timer
	  facing.change_timer = typ.FACING_CHANGE_TIME;
	}
	else
	  // count down till direction change
	  facing.change_timer--;
      }
	
      // accelerate
      speed.addXY(move.x()*typ.SPEED_DELTA*t_multiplier, 
		  move.y()*typ.SPEED_DELTA*t_multiplier);
      
      // cap speed to terminal velocity
      if(speed.norm() > typ.SPEED_MAX)
	speed.setNorm(typ.SPEED_MAX);
    }
    else
      // reset direction-change timer
      facing.change_timer = typ.FACING_CHANGE_TIME;
    
    // change facing based on mouse if applicable
    if(use_mouse)
      facing.desired.setV2(game.getInputMouse());
    
    // interpolate aqual angle towards desired angle
    if(facing.actual.x() != facing.desired.x() 
    || facing.actual.y() != facing.desired.y())
    {
      if(facing.actual.dist2(facing.desired) < 0.01)
	facing.actual.setV2(facing.desired);
      else
      {
	var turn_dir = (facing.actual.det(facing.desired) > 0.0) ? 1 : -1
	facing.actual.addAngle(typ.TURN_SPEED*turn_dir);
      }
    }
    
    // apply friction
    if(speed.x() || speed.y())
    {
      if(speed.norm2() > 0.01)
	speed.scale(1-Math.pow(typ.FRICTION,t_multiplier));
      else
	speed.setNorm(0.0);
    }
    
    // update position
    pos.addXY(speed.x()*t_multiplier, speed.y()*t_multiplier);
    
    // lap around the edges of the screen
    lap_around(pos, typ.HALF_SIZE);    
    
    // update nozzle location cache
    nozzle_pos.setXY(pos.x() + typ.GUN_LENGTH * facing.actual.x(), 
		    pos.y() + typ.GUN_LENGTH * facing.actual.y());
	
    // shoot gun if need be
    if(shoot)
    {
      // make sure gun is loaded
      if(reloading > 0.0)
	reloading -= t_multiplier;
      else
      {
	Game.INSTANCE.addThing(new Cloud(weapon_type, nozzle_pos, 
					 facing.actual, speed));
	// wait for reload
	reloading = typ.RELOAD_TIME;
      }
    }
    
    // count down until next weapon-change is allowed
    if(wpn_change_timer >= t_multiplier)
      wpn_change_timer -= t_multiplier;
    else
      wpn_change_timer = 0;
  }
  
  obj.collision = function(other) { }
  
  /* RETURN THE INSTANCE */
  return obj;
}