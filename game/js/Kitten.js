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

/*** CLASS representing a fluffy, flammable kitten ***/

/// CLASS VARIABLES/CONSTANTS
// size
Kitten.SIZE = 16;
Kitten.HALF_SIZE = Kitten.SIZE / 2;
Kitten.PUSH_LENGTH = 2.0;
// movement
Kitten.TURN_SPEED = 0.1;
Kitten.MOVE_SPEED = 1.0;
// hitpoints
Kitten.MAX_HITPOINTS = 100;
Kitten.HITPOINTS_REGEN = 0.9;
Kitten.REPRODUCE_THRESHOLD = Kitten.MAX_HITPOINTS * 0.75;
Kitten.REPRODUCE_COST = Kitten.MAX_HITPOINTS * 0.5;
Kitten.START_HITPOINTS = Kitten.REPRODUCE_COST;
// repoduction
Kitten.MAX_MUTATION = 0.4;
Kitten.AGE_SPEED = 0.003;
// counters
Kitten.number = 0;
Kitten.saturation = 0.0;
Kitten.MAX_NUMBER = 35;
// heat and cold
Kitten.MAX_HEAT_ABS = 30;
Kitten.HEAT_LOSS = Kitten.MAX_HEAT_ABS/70;
Kitten.HEAT_DAMAGE = Kitten.HEAT_LOSS; // 1 heat loss means 1 damage
// poison from nerve-gas
Kitten.MAX_POISON = 70;
Kitten.POISON_DISSIPATION = Kitten.MAX_POISON/90;
Kitten.POISON_DAMAGE = Kitten.POISON_DISSIPATION; 
				      // 1 poison dissipation = 1 damage
// images
Kitten.IMG_FACE = load_image("cat_face.png");
// colours, fonts, line widths, etc
Kitten.OUTLINE_WIDTH = 1;
Kitten.OUTLINE_COLOUR = "rgb(34, 34, 77)";

/// INSTANCE ATTRIBUTES/METHODS
function Kitten(mum_resist, dad_resist, mum_pos)
{
  /* ATTRIBUTES 
  var a = x; 
  */
  
  // receiver 
  var obj = this, typ = Kitten;
  
  // real attributes
  // V2: current position
  var pos = new V2(),	
  // V2: current direction
      dir = new V2(rand_sign(), rand_sign()),
  // real: between 0 and 1, 1 is mature and can repoduce
      age = (mum_resist && dad_resist) ? 0.0 : rand_between(0.0, 1.0), 
  // int: remaining hitpoints
      hitpoints = typ.START_HITPOINTS,	
  // int: body-heat, where positive means burning and negative freezing
      heat = 0,
  // int: poison amount
      poison = 0,
  // [r, g, b]: resistance to fire, nerve-gas and nitro, between 0 and 1
      resist = new Array(),
  // string: "rgb(r,g,b)" format string corresponding to resistances
      colour = new String();
  
  // set position and normalise direction vector
  if(mum_pos)
    pos.setV2(mum_pos);
  else
    pos.setXY(Math.random()*canvas.width, Math.random()*canvas.height);
  dir.normalise();
    
  // initialise resistances
  for(i = 0; i < 3; i++)
  {
    if(mum_resist && dad_resist)
    {
      // apply mutation
      resist[i] = (mum_resist[i] + dad_resist[i])/2
		+ rand_between(-typ.MAX_MUTATION, typ.MAX_MUTATION);
      // cap resistance
      if(resist[i] > 1)
	resist[i] = 1;
      else if(resist[i] < 0)
	resist[i] = 0;
    }
    else
      resist[i] = 0.0; //rand_between(0.0, 1.0);
    
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
  
  var collision_kitten = function(mate)
  {
    if(typ.number < typ.MAX_NUMBER 
    && hitpoints >= typ.REPRODUCE_THRESHOLD 
    && mate.getHitpoints() >= typ.REPRODUCE_THRESHOLD)
    {
      hitpoints -= typ.REPRODUCE_COST;
      mate.addHitpoints(-typ.REPRODUCE_COST);
      Game.INSTANCE.addThing(new Kitten(resist, mate.getResistance()), pos);
    }
  }
  
  var push = function(xx, yy)
  {
    pos.addXY(xx*typ.PUSH_LENGTH, yy*typ.PUSH_LENGTH);
  }
  
  /* METHODS 
    (obj.f = function(p1, ... ) { }
  */
  
  // getters
  obj.getPosition = function() { return pos; }
  obj.getRadius = function() { return typ.HALF_SIZE; }
  obj.getType = function() { return typ; }
  obj.getHitpoints = function() { return hitpoints; }
  obj.getResistance = function() { return resist; }
  
  // setters
  obj.addHitpoints = function(amount) { hitpoints += amount; }
  
  // injections
  obj.draw = function()
  {
    // size depends on age
    var half_size = typ.HALF_SIZE*age, size = 2*half_size;
    
    // draw colour
    context.fillStyle = colour;
    context.fillRect(pos.x()-half_size, pos.y()-half_size, size, size);
    // draw face
    if(age == 1.0)
      context.drawImage(typ.IMG_FACE, 
			pos.x()-typ.HALF_SIZE, pos.y()-typ.HALF_SIZE);		     
    // draw outline
    context.lineWidth = typ.OUTLINE_WIDTH;
    context.strokeStyle = typ.OUTLINE_COLOUR;
    context.strokeRect(pos.x()-half_size, pos.y()-half_size, size, size);
    
    
    
    /* DEBUG */
    /*context.fillStyle = "rgb(0, 0, 0)";
    context.font = "20pt cube";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText(Math.floor(hitpoints), pos.x(), pos.y());*/
  }
  
  obj.update = function(game, t_multiplier)
  { 
    // slow down if cold, speed up if hot
    var speed = typ.MOVE_SPEED * t_multiplier;
    if(heat != 0)
      speed *= (1.0 + heat/typ.MAX_HEAT_ABS);
    
    // get older
    if(age != 1.0)
    {
      if(age - typ.AGE_SPEED >= 1.0)
	age = 1.0;
      else
	age += typ.AGE_SPEED;
    }
    // regenerate health
    else if(!heat && !poison && hitpoints < typ.MAX_HITPOINTS 
    && typ.number < typ.MAX_NUMBER)
    {
      // faster regenerate the fewer kittens there are
      var hitpoints_regen 
	= typ.HITPOINTS_REGEN * t_multiplier * (1.0-typ.saturation);
      if(hitpoints > typ.MAX_HITPOINTS - hitpoints_regen)
	hitpoints = typ.MAX_HITPOINTS;
      else
	hitpoints += hitpoints_regen;
    }
    // burn or freeze
    else if(heat)
    {
      // take damage
      var heat_damage = typ.HEAT_DAMAGE * t_multiplier;
      hitpoints -= heat_damage;
      
      // decrease heat over time
      var heat_loss = typ.HEAT_LOSS * t_multiplier;
      if(Math.abs(heat) < heat_loss)
	heat = 0;
      else
	heat -= heat_loss * sign(heat);
    }
    // poison dissipation
    else if(poison)
    {
      // take damage
      var poison_damage = typ.POISON_DAMAGE * t_multiplier;
      hitpoints -= poison_damage;
      
      // decrease heat over time
      var poison_dissipation = typ.POISON_DISSIPATION * t_multiplier;
      if(poison < poison_dissipation)
	poison = 0;
      else
	poison -= poison_dissipation;
    }
    
    // move the kitten
    pos.addXY(dir.x()*speed, dir.y()*speed);
    
    // turn the kitten
    dir.addAngle(rand_between(-1, 1)*typ.TURN_SPEED*t_multiplier);
    
    // lap around
    lap_around(pos, typ.HALF_SIZE);   
    
    // destroy this object if its hitpoints fall too low
    if(hitpoints <= 0)
    {
      typ.number--;
      Game.INSTANCE.addKill();
      typ.saturation = (typ.number/typ.MAX_NUMBER);
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
      case Player:
	push(dir.x(), dir.y());
	break;
      case Kitten:
	push(dir.x(), dir.y());
	collision_kitten(other);
	break;
    }
    
  }
  
  
  /* UPDATE COUNTERS */
  
  typ.number++;
  typ.saturation = (typ.number/typ.MAX_NUMBER);
   
  
  /* RETURN INSTANCE */
  
  return obj;
}