/** @author William J. Dyce */

/*
Generic javascript base-code for HTML5 games.
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
// singleton instance
Game.INSTANCE = null;
// strings
Game.TITLE = "Black Dog";
Game.AUTHOR = "By William 'wilbefast' J.D.";
// maximum frames per second
Game.MAX_FPS = 30;
// colours
Game.C_BACKGROUND = 'rgb(255, 0, 0)';
Game.C_TEXT = 'rgb(0, 0, 128)';


/// INSTANCE ATTRIBUTES/METHODS
function Game()
{
    /* ATTRIBUTES 
      var a = x; 
    */
    
    // receiver 
    var obj = this;
    var typ = Game;
    
    // true attributes
      // your attributes here

    /* SUBROUTINES 
      var f = function(p1, ... ) { } 
    */
    
    /* METHODS 
      (obj.f = function(p1, ... ) { }
    */
    obj.injectUpdate = function()
    {
      // your code here
    }
    
    obj.injectDraw = function()
    {
      // your code here
    }
    
    obj.injectMouseDown = function(x, y)
    {
      // your code here
    }
    
    obj.injectMouseUp = function(x, y)
    {
      // your code here
    }
    
    obj.injectKeyDown = function(key)
    {
      // your code here
    }
    
    obj.injectKeyUp = function(key)
    {
      // your code here
    }

    /* RETURN INSTANCE */
    return obj;
}