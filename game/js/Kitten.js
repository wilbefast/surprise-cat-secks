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

/** UTILITY FUNCTIONS FOR CAT SECKS MARKER */

function draw_heart(pos, size, colour)
{
  var half_size = size * 0.5; 
  
  // set up
  context.strokeStyle = colour;
  context.lineWidth = size * 0.3;
  
  // draw the heart
  context.beginPath();
  context.moveTo(pos.x(), pos.y() - half_size);			// valley
  context.lineTo(pos.x() + half_size, pos.y() - size);		// right-peak
  context.lineTo(pos.x() + size, pos.y());			// right
  context.lineTo(pos.x(), pos.y() + size);			// bottom
  context.lineTo(pos.x() - size, pos.y());			// left
  context.lineTo(pos.x() - half_size, pos.y() - size);		// left-peak
  context.closePath();
  context.stroke();
}

/*** CLASS representing a fluffy, flammable kitten ***/

/// CLASS CONSTANTS
// size
Kitten.SIZE = 16;
Kitten.HALF_SIZE = Kitten.SIZE / 2;
Kitten.PUSH_LENGTH = 2.0;
// movement
Kitten.TURN_SPEED = 0.1;
Kitten.POISON_TURN_SPEED = 0.5;
Kitten.MOVE_SPEED = 1.5;
Kitten.MIN_DISTANCE2_FROM_PLAYER = Math.pow(canvas.width/7, 2);
Kitten.MAX_FEAR = 100;
Kitten.OLDUN_SPEED_PENALTY = 0.6;
// hitpoints
Kitten.MAX_HITPOINTS = 100;
Kitten.HITPOINTS_REGEN = 0.7;
Kitten.REPRODUCE_THRESHOLD = Kitten.MAX_HITPOINTS * 0.9;
Kitten.REPRODUCE_COST = Kitten.MAX_HITPOINTS * 0.6;
Kitten.START_HITPOINTS = Kitten.REPRODUCE_COST * 0.5;
Kitten.PLAYER_TOUCH_DAMAGE = Kitten.MAX_HITPOINTS * 0.2;
// repoduction
Kitten.MAX_MUTATION = 0.18;
Kitten.DECREPITUDE_SPEED = 0.0005;
Kitten.REPRODUCE_MAX_DECREPITUDE = 0.75;
Kitten.MATURE_SPEED = 0.003;
// bonus
Kitten.MAX_REGENERATE = Kitten.MAX_HITPOINTS * 0.2;
Kitten.FERTILITY_MATURE_BONUS = 0.05;
Kitten.FERTILITY_DECREPITUDE_BONUS = 0.01;
Kitten.REGENERATE_DISSIPATION = Kitten.MAX_REGENERATE/100;
// counters
Kitten.MAX_NUMBER = 35;
// heat and cold
Kitten.MAX_HEAT_ABS = 50;
Kitten.FIRE_DISSIPATION = Kitten.MAX_HEAT_ABS/150;
Kitten.FROST_DISSIPATION = Kitten.MAX_HEAT_ABS/100;
Kitten.FIRE_PER_DAMAGE = 2;
Kitten.FROST_PER_DAMAGE = 4;
Kitten.BURN_DAMAGE = Kitten.FIRE_DISSIPATION/4; // 4 heat loss means 1 damage
Kitten.CHILL_DAMAGE = Kitten.FROST_DISSIPATION/10; // 10 heat loss means 1 damage
// poison from nerve-gas
Kitten.POISON_PER_DAMAGE = 5;
Kitten.MAX_POISON = 70;
Kitten.POISON_DISSIPATION = Kitten.MAX_POISON/200;
Kitten.POISON_DAMAGE = Kitten.POISON_DISSIPATION/Kitten.POISON_PER_DAMAGE; 
				      // 5 poison dissipation = 1 damage
// images
Kitten.IMG_FACE = load_image("cat_face.png");
// colours, fonts, line widths, etc
Kitten.OUTLINE_WIDTH = 1;
Kitten.OUTLINE_COLOUR = "rgb(34, 34, 77)";
// sounds
Kitten.SND_DIE = load_audio("cat_death.wav");
Kitten.SND_SECKS = load_audio("cat_secks.wav");

/// CLASS VARIABLES
// counters
Kitten.min_fitness = 0;
Kitten.max_fitness = 0;
Kitten.mean_fitness = 0;
Kitten.saturation = 0.0;
// fittest and least fit cat
Kitten.worst = Kitten.best = null;
// object array
Kitten.objects;

/// CLASS FUNCTIONS

Kitten.static_draw = function(pos, colour, half_size, size, draw_face)
{
  // optional parameters
  if(half_size == undefined) 
    half_size = Kitten.HALF_SIZE;
  if(size == undefined) 
    size = 2*half_size;
  if(draw_face == undefined) 
    draw_face = true;
  
  // draw colour
  context.fillStyle = colour;
  context.fillRect(pos.x()-half_size, pos.y()-half_size, size, size);
  // draw face
  if(draw_face)
    context.drawImage(Kitten.IMG_FACE, pos.x()-half_size, pos.y()-half_size 
						/*, size, size*/);		     
  // draw outline
  context.lineWidth = Kitten.OUTLINE_WIDTH;
  context.strokeStyle = Kitten.OUTLINE_COLOUR;
  context.strokeRect(pos.x()-half_size, pos.y()-half_size, size, size);
}

Kitten.reset_counters = function()
{
  // recalculate saturation
  this.saturation = (this.objects.length/this.MAX_NUMBER);
  
  // reset all
  this.mean_fitness = this.max_fitness = 0.0;
  this.min_fitness = 1.0;
  var live_cats = 0;
  
  // recalculate min, max, mean
  for(var i = 0; i < this.objects.length; i++)
  {
    var obj = this.objects[i];
    
    // don't count dead cats
    if(obj == null || obj.getHitpoints() <= 0 || obj.getDecrepitude() >= 1.0)
      continue;
    
    var fitness = obj.getFitness();
    
    // min and max
    if(fitness < this.min_fitness)
    {
      this.min_fitness = obj.getFitness();
      this.worst = obj;
    }
    if(fitness > this.max_fitness)
    {
      this.max_fitness = obj.getFitness();
      this.best = obj;
    }
    
    // mean
    this.mean_fitness += fitness;
    live_cats++;
  }
  
  // check for inconsistencies
  //if(live_cats != this.objects.length)
    //;
  
  // avoid divisions by 0
  if(this.objects.length == 0 || live_cats == 0)
  {
    this.min_fitness = 0.0;
    return;
  }
  
  this.mean_fitness /= live_cats;
}

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
      maturity = (mum_resist && dad_resist) ? 0.0 : rand_between(0.0, 1.0), 
  // real: between 0 and 1, 1 is death by old age
      decrepitude = 0.0,
  // int: remaining hitpoints
      hitpoints = typ.START_HITPOINTS,	
  // int: body-heat, where positive means burning and negative freezing
      heat = 0,
  // int: poison amount
      poison = 0,
  // [r, g, b]: resistance to fire, nerve-gas and nitro, between 0 and 1
      resist = new Array(),
  // string: "rgb(r,g,b)" format string corresponding to resistances
      colour = new String(),
  // {friend : Kitten, distance2 : real} the closest kitten object, for mating
      nearest = new Object(),
  // real : frightened cats will not try to mate until at a safe distance
      fear = 0,
  // int: regeneration amount, hitpoints that will be gained over time
      regenerate = 0;
  
  // set up the 'nearest' dictionary
  nearest.friend = null;
  nearest.distance2 = 0.0;
      
  // set position and normalise direction vector
  if(mum_pos)
    pos.setXY(mum_pos.x(), mum_pos.y());
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
      resist[i] = 0.0; // rand_between(0.0, 1.0);
    
  }
  // cache the colour corresponding to these resistances
  var r = Math.floor(255*(1.0-(resist[1]+resist[2])/2)), 
      g = Math.floor(255*(1.0-(resist[0]+resist[2])/2)), 
      b = Math.floor(255*(1.0-(resist[0]+resist[1])/2));
  colour =  "rgb(" + r + "," + g + "," + b + ")";
  
  // cache total fitness as this will not change
  var total_fitness = (resist[0] + resist[1] + resist[2])/3;
  
  /* SUBROUTINES 
  var f = function(p1, ... ) { } 
  */
  
  var collision_player = function(player)
  {
    // unclip
    push(dir.x(), dir.y());
    
    // turn away from the player
    dir.setFromTo(player.getPosition(), pos);
    dir.normalise();
    
    // take damage to avoid swarming player if mate is on the other side
    hitpoints -= typ.PLAYER_TOUCH_DAMAGE;
    if(hitpoints < 0)
    {
      // only actually die if player is moving (ie. stepped on)
      if(player.isMoving())
	player.setFootRedness(1.0);
      else
	hitpoints = 1;
    }
  }
  
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
	obj.addHeat(damage * typ.FIRE_PER_DAMAGE);
	if(previous_heat < 0)
	  damage -= -previous_heat;	// thaw from ice 
	break;
      case Cloud.NERVE_GAS:
	poison += damage * typ.POISON_PER_DAMAGE;
	break;
      case Cloud.NITROGEN:
	obj.addHeat(-damage * typ.FROST_PER_DAMAGE);
	if(previous_heat > 0)
	  damage -= previous_heat; 	// extinguish fire
	break;
      case Cloud.FERTILITY:
	regenerate += cloud.getDamage();
	if(regenerate > typ.MAX_REGENERATE)
	  regenerate = typ.MAX_REGENERATE;
	hitpoints += cloud.getDamage();
	if(hitpoints > typ.MAX_HITPOINTS)
	  hitpoints = typ.MAX_HITPOINTS;
	fear = poison = heat = 0;
	break;
	
    }
    
    // apply the damage
    if(damage > 0)
    {
      // take damage, stop regenerating
      hitpoints -= damage;
      regeneration = 0;
      // be afraid
      fear = typ.MAX_FEAR;
      // turn away from clouds
      dir.setFromTo(cloud.getPosition(), pos);
      dir.normalise();
    }
    
  }
  
  var collision_kitten = function(friend)
  { 
    // breed only if energy is full(ish), between adults
    if(obj.canMate() && friend.canMate() && typ.objects.length < typ.MAX_NUMBER)
    {
      // deduct price
      hitpoints -= typ.REPRODUCE_COST;
      friend.addHitpoints(-typ.REPRODUCE_COST);
      // create kitten
      new Kitten(resist, friend.getResistance(), pos);
      // create sound and audio effects
      play_audio("cat_secks.wav");
      new Cloud(Cloud.HEART, pos, null, null, draw_heart);
    }
    
    // set fire to other cats!
    else if(heat > 0)
    {
      var binj = friend.getHeat();
      
      
      var heat_diff = heat - friend.getHeat();
      if(heat_diff > 0)
	friend.addHeat(heat_diff*0.5*(1-friend.getResistance()[Cloud.NAPALM]));
    }
    
    // turn away from adult cats only
    if(maturity < 1 || friend.getMaturity() >= 1)
    {
      dir.setFromTo(friend.getPosition(), pos);
      dir.normalise();
      push(dir.x(), dir.y());
    }
  }
  
  var push = function(xx, yy)
  {
    // cluster fcucks are strictly forbidden!
    fear = typ.MAX_FEAR;
    
    pos.addXY(xx*typ.PUSH_LENGTH, yy*typ.PUSH_LENGTH);
  }
  
  /* METHODS 
    (obj.f = function(p1, ... ) { }
  */
  
  // getters
  obj.getPosition = function() { return pos; }
  obj.getRadius = function() { return typ.HALF_SIZE*maturity; }
  obj.getType = function() { return typ; }
  obj.getHitpoints = function() { return hitpoints; }
  obj.getResistance = function() { return resist; }
  obj.getMaturity = function() { return maturity; }
  obj.getDecrepitude = function() { return decrepitude; }
  obj.getFitness = function() { return total_fitness; }
  obj.getColour = function() { return colour; }
  obj.getHeat = function() { return heat; }
  obj.getPoison = function() { return poison; }
  obj.canMate = function() 
  { 
    return  (heat == 0 && poison == 0 
	      && hitpoints >= typ.REPRODUCE_THRESHOLD && maturity >= 1
	      && decrepitude <= typ.REPRODUCE_MAX_DECREPITUDE
	      && fear == 0);
  }
  obj.checkIfNearest = function(new_friend)
  {
    // only check potential mates
    if(!new_friend.canMate() || typ.objects.length >= typ.MAX_NUMBER)
      return;
    
    // distance from this kitten to the other one
    var span = new V2();
    span.setFromTo(pos, new_friend.getPosition());
    var new_distance2 = span.norm2();
   
    // the new friend is closer or the old one didn't exist in the first place
    if(nearest.friend == null || nearest.distance2 > new_distance2)
    {
      // add the kitten as the new desired mate
      nearest.distance2 = new_distance2;
      nearest.friend = new_friend;
      // inform the kitten that it has been selected
      new_friend.matingRequest(obj, new_distance2);
    }
  }
  obj.matingRequest = function(requester, requester_distance2)
  {
    // agree to requests if they are better than the current option
    if(nearest.friend == null || nearest.distance2 > requester_distance2)
    {
      nearest.distance2 = requester_distance2;
      nearest.friend = requester;
    }
  }
  
  // setters
  obj.addHitpoints = function(amount) { hitpoints += amount; }
  obj.addHeat = function(amount) 
  { 
    heat += amount;
    // cap burn and freeze amounts
    if(Math.abs(heat) > typ.MAX_HEAT_ABS)
      heat = sign(heat)*typ.MAX_HEAT_ABS;
  }
  
  // injections
  obj.draw = function()
  {
    // size depends on maturity and decrepitude
    var half_size = typ.HALF_SIZE *

    // olduns get little
    ((decrepitude > typ.REPRODUCE_MAX_DECREPITUDE) 
    
      ? 1 - (decrepitude-typ.REPRODUCE_MAX_DECREPITUDE)
			/ (1-typ.REPRODUCE_MAX_DECREPITUDE)
    // younguns are little
      : maturity),
    
    size = 2*half_size;
    
    // draw fire or ice
    if(heat != 0)
    {
      var fx_half_size = typ.SIZE*rand_between(0.8,1.0), 
	  fx_size = 2*fx_half_size;
      context.fillStyle = ((heat > 0) ? Cloud.COLOUR[Cloud.NAPALM] 
			      : Cloud.COLOUR[Cloud.NITROGEN]) 
			    + (Math.abs(heat)/typ.MAX_HEAT_ABS) + ")"; 
      context.fillRect(pos.x()-fx_half_size, pos.y()-fx_half_size,
			fx_size, fx_size);
		
    }
    
    // draw poison
    if(poison > 0)
    {
      var fx_half_size = typ.SIZE*rand_between(0.8,1.0), 
	  fx_size = 2*fx_half_size;
      context.lineWidth = 3;
      context.strokeStyle = Cloud.COLOUR[Cloud.NERVE_GAS] 
			    + poison/typ.MAX_POISON + ")"; 
      context.strokeRect(pos.x()-fx_half_size, pos.y()-fx_half_size,
			fx_size, fx_size);
    }
    
    if(regenerate > 0)
      draw_heart(pos, typ.SIZE*rand_between(0.8,1.0), 
		 Cloud.COLOUR[Cloud.FERTILITY] + (regenerate/typ.MAX_REGENERATE) + ")");
    
    // draw the cat itself
    typ.static_draw(pos, colour, half_size, size, 
	  maturity == 1.0 && decrepitude < typ.REPRODUCE_MAX_DECREPITUDE);
  }
  
  obj.update = function(t_multiplier)
  { 
    // slow down if young
    // slow down if old
    // slow down if cold, speed up if hot
    var speed = typ.MOVE_SPEED * maturity * t_multiplier
      * (1 - typ.OLDUN_SPEED_PENALTY + (1-decrepitude)*typ.OLDUN_SPEED_PENALTY);
    if(heat != 0)
      speed *= (1.0 + heat/typ.MAX_HEAT_ABS);
    
    
    // artificial regeneration
    if(regenerate)
    {
      // lose all fear, regain health
      hitpoints += typ.HITPOINTS_REGEN * t_multiplier;
      fear = 0;
      
      
      // grow up faster
      if(maturity + typ.FERTILITY_MATURE_BONUS < 1.0)
	maturity += typ.FERTILITY_MATURE_BONUS;
      else
	maturity = 1.0;
      // stay young
      if(decrepitude - typ.FERTILITY_DECREPITUDE_BONUS > 0.0)
	decrepitude -= typ.FERTILITY_DECREPITUDE_BONUS;
      else
	decrepitude = 0.0;
      
      // decrement regeneration
      regenerate -= typ.REGENERATE_DISSIPATION * t_multiplier;
      if(regenerate < 0)
	regenerate = 0;
    }

    // grow up
    if(maturity != 1.0)
    {
      if(maturity + typ.MATURE_SPEED*t_multiplier >= 1.0)
	maturity = 1.0;
      else
	maturity += typ.MATURE_SPEED*t_multiplier;
    }
    // fully grown
    else
    {
      // regenerate health
      if(!heat && !poison && hitpoints < typ.MAX_HITPOINTS 
      && typ.objects.length < typ.MAX_NUMBER)
      {
	// faster regenerate the fewer kittens there are
	var hitpoints_regen 
	  = typ.HITPOINTS_REGEN * t_multiplier * (1.0-typ.saturation);
	if(hitpoints > typ.MAX_HITPOINTS - hitpoints_regen)
	  hitpoints = typ.MAX_HITPOINTS;
	else
	  hitpoints += hitpoints_regen;
      }
      
      // get old
       if(decrepitude + typ.DECREPITUDE_SPEED*t_multiplier >= 1.0)
      {
	if(typ.worst == obj) typ.worst = null;
	if(typ.best == obj) typ.best = null;
	typ.reset_counters();
	
	// destroy object
	return true;
      }
      else
	decrepitude += typ.DECREPITUDE_SPEED*t_multiplier;
    }
    
    // burn or freeze
    if(heat)
    {
      // take damage
      var heat_damage = ((heat > 0) ? typ.BURN_DAMAGE : typ.CHILL_DAMAGE) 
			* (1 - (heat > 0 ? resist[Cloud.NAPALM] 
					 : resist[Cloud.NITROGEN])) 
			* t_multiplier;
      hitpoints -= heat_damage;
      
      // decrease heat over time
      var heat_loss = ((heat > 0) ? typ.FIRE_DISSIPATION 
		      : typ.FROST_DISSIPATION) * t_multiplier;
      if(Math.abs(heat) < heat_loss)
	heat = 0;
      else
	heat -= heat_loss * sign(heat);
    }
    
    // poison dissipation
    if(poison)
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
    
    /* CHOOSE A NEW DIRECTION */
    
    // away from player
    var from_player = new V2();
      from_player.setFromTo(Player.objects[0].getPosition(), pos);
    if(from_player.norm2() < typ.MIN_DISTANCE2_FROM_PLAYER)
    {
      dir.setV2(from_player);
      dir.normalise();
      fear = typ.MAX_FEAR;
    }
      
    // towards mate
    else if(nearest.friend != null && obj.canMate() 
	&& typ.objects.length < typ.MAX_NUMBER)
    {
      // move towards nearest potential mate if ready to mate
      dir.setFromTo(pos, nearest.friend.getPosition());
      dir.normalise();
    }
    
    // randomly
    else
      // turn the kitten randomly
      dir.addAngle(rand_between(-1, 1) 
	    * (typ.TURN_SPEED + typ.POISON_TURN_SPEED * poison/typ.MAX_POISON) 
	    * t_multiplier);
    
    // lap around
    lap_around(pos, typ.HALF_SIZE);  
    
    // reset the nearest object to null (it will reset before the next update)
    nearest.friend = null;
    nearest.distance2 = 0.0;
    
    // stop being afraid
    if(fear - t_multiplier < 0)
      fear = 0;
    else
      fear -= t_multiplier;
    
    // destroy this object if its hitpoints fall too low
    if(hitpoints <= 0)
    {
      // reset counters and saturation cache
      Game.INSTANCE.addKill();
      if(typ.worst == obj) typ.worst = null;
      if(typ.best == obj) typ.best = null;
      typ.reset_counters();
      
      // make death sound
      play_audio("cat_death.wav");
      
      // create special-effects
      for(var i = 0; i < 3; i++)
	new Decal(pos, 24, "rgba(255,0,0,", Decal.BLOOD);
      
      // destroy object
      return true;
    }
    else
      return false;
  }
  
  obj.collision = function(other)
  { 
    switch(other.getType())
    {
      case Cloud: 	collision_cloud(other); 	break;
      case Player: 	collision_player(other); 	break;
      case Kitten: 	collision_kitten(other); 	break;
    }
    
  }
  
  
  /* UPDATE COUNTERS */
  typ.objects.push(obj);
  typ.number++;
  typ.reset_counters();
   
  
  /* RETURN INSTANCE */
  return obj;
}

// The great almighty kludge o' death!
Kitten.checkIfNearest = function(from, to)
{
  if(from != null & to != null)
    from.checkIfNearest(to);
}