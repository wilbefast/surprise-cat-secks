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

/*** CLASS representing a fluffy, flammable kitten ***/

/// CLASS VARIABLES/CONSTANTS
Kitten.SIZE = 16;
Kitten.HALF_SIZE = Kitten.SIZE / 2;
// characteristics
Kitten.MAX_MUTATION = 0.1;
Kitten.MAX_HEALTH = 10000000;
Kitten.TURN_SPEED = 0.1;
Kitten.MOVE_SPEED = 1.0;
// counters
Kitten.number = 0;
Kitten.MAX_NUMBER = 50;
// debuff effects
Kitten.MAX_HEAT_ABS = 80;
Kitten.HEAT_LOSS = 1.3;


/// INSTANCE ATTRIBUTES/METHODS
function Kitten(parent_resist)
{
  /* ATTRIBUTES 
  var a = x; 
  */
  
  // receiver 
  var obj = this, typ = Kitten;
  
  // real attributes
  // V2: current position
  var pos = new V2(Math.random()*canvas.width, Math.random()*canvas.height),	
  // V2: current direction
      dir = new V2(0.0, 0.0),
  // int: remaining hitpoints
      hitpoints = typ.MAX_HEALTH,	
  // int: body-heat, where positive means burning and negative freezing
      heat = 0,
  // [r, g, b]: resistance to fire, nerve-gas and nitro, between 0 and 1
      resist = new Array(),
  // string: "rgb(r,g,b)" format string corresponding to resistances
      colour = new String();

  // initialise resistances
  for(i = 0; i < 3; i++)
  {
    if(parent_resist)
    {
      // apply mutation
      resist[i] = parent.resist[i] 
		+ rand_between(-typ.MAX_MUTATION, typ.MAX_MUTATION);
      // cap resistance
      if(resist[i] > 1)
	resist[i] = 1;
      else if(resist[i] < 0)
	resist[i] = 0;
    }
    else
      resist[i] = 0;// rand_between(0.0, 1.0); //0;
    
  }
  // cache the colour corresponding to these resistances
  var r = Math.floor(255*(1.0-resist[0])), 
      g = Math.floor(255*(1.0-resist[1])), 
      b = Math.floor(255*(1.0-resist[2]));
  colour =  "rgb(" + r + "," + g + "," + b + ")";
  
  /* SUBROUTINES 
  var f = function(p1, ... ) { } 
  */
  
  var collision_cloud = function(cloud)
  {
    // local variables
    var cloud_type = cloud.getCloudType(),
	damage = (1.0-resist[cloud_type]) * cloud.getDamage(),
	previous_heat = heat;
	
    // we need to go deeper!
    switch(cloud_type)
    {
      case Cloud.NAPALM:
	heat += damage;
	if(previous_heat < 0)
	  damage -= -previous_heat; 
	break;
      case Cloud.NERVE_GAS:
	break;
      case Cloud.LIQUID_NITROGEN:
	heat -= damage;
	if(previous_heat > 0)
	  damage -= previous_heat; 
	break;
    }
    
    // apply the damage
    if(damage > 0)
      hitpoints -= damage;
    
    // cap burn and freeze amounts
    if(Math.abs(heat) > typ.MAX_HEAT_ABS)
      heat = sign(heat)*typ.MAX_HEAT_ABS;
  }
  
  /* METHODS 
    (obj.f = function(p1, ... ) { }
  */
  
  // getters
  obj.getPosition = function() { return pos; }
  obj.getRadius = function() { return typ.HALF_SIZE; }
  obj.getType = function() { return typ; }
  
  // injections
  obj.draw = function()
  {
    context.fillStyle = colour;
    context.fillRect(pos.x()-typ.HALF_SIZE, pos.y()-typ.HALF_SIZE, 
		     typ.SIZE, typ.SIZE);
  }
  
  obj.update = function(game, t_multiplier)
  { 
    // slow down if cold, speed up if hot
    var speed = typ.MOVE_SPEED * t_multiplier;
    if(heat != 0)
      speed *= (1.0 + heat/typ.MAX_HEAT_ABS);
    
    // decrease heat over time
    var heat_loss = typ.HEAT_LOSS * t_multiplier;
    if(Math.abs(heat) < heat_loss)
      heat = 0;
    else
      heat -= heat_loss * sign(heat);
    
    //console.log("pre update" + pos.x() + "," + pos.y());
    // move the kitten
    pos.addXY(dir.x()*speed, dir.y()*speed);
    //console.log("post update" + pos.x() + "," + pos.y());
    // turn the kitten
    dir.addAngle(rand_between(-1, 1)*typ.TURN_SPEED*t_multiplier);
    //console.log("post turn" + dir.x() + "," + dir.y());
    
    // lap around
    lap_around(pos, typ.HALF_SIZE);   
    
    // destroy this object if its hitpoints fall too low
    if(hitpoints <= 0)
    {
      Kitten.number--;
      return true;
    }
    else
      return false;
  }
  
  obj.collision = function(other)
  { 
    // turn away from collisions
    dir.setFromTo(other.getPosition(), pos);
    dir.normalise();
    
    switch(other.getType())
    {
      case Cloud:
	collision_cloud(other);
      break;
    }
    
  }
   
    
  /* RETURN INSTANCE */
  Kitten.number++;
  return obj;
}