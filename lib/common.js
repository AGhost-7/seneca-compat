/* Copyright (c) 2010-2015 Richard Rodger, MIT License */
/* jshint node:true, asi:true, eqnull:true */
"use strict";


var util = require('util')


var _ = require('lodash')


function arrayify(){ return Array.prototype.slice.call(arguments[0],arguments[1]) }
exports.arrayify = arrayify



exports.delegate = function( scope, func ) {
  var args = Array.prototype.slice.call(arguments,2)
  return function() {
    return func.apply(scope,args.concat(Array.prototype.slice.call(arguments)))
  }
}


exports.noop = function noop() {
  // does nothing
}




// TODO: are any of the below used?



var conf = exports.conf = {}





var die = exports.die = function(msg) {
  console.error(msg)
  process.exit(1)
}




var copydata = exports.copydata = function(obj) {
  var copy

  // Handle the 3 simple types, and null or undefined
  if (null == obj || "object" != typeof obj) return obj;

  // Handle Date
  if( _.isDate(obj) ) {
    copy = new Date();
    copy.setTime(obj.getTime());
    return copy;
  }
  
  // Handle Array
  if( _.isArray(obj) ) {
    copy = [];
    for (var i = 0, len = obj.length; i < len; ++i) {
      copy[i] = copydata(obj[i]);
    }
    return copy;
  }

  // Handle Object
  if( _.isObject(obj) ) {
    copy = {};
    for (var attr in obj) {
      if (obj.hasOwnProperty(attr)) copy[attr] = copydata(obj[attr]);
    }
    return copy;
  }
  
  throw new Error("Unable to copy obj! Its type isn't supported.");
}


exports.argpattern = function argpattern( args ) {
  args = args || {}
  var sb = []
  _.each( args, function(v,k){
    if( !~k.indexOf('$') ) {
      sb.push(k+':'+v)
    }
  })
  return sb.join(',')
}



var owndesc = exports.owndesc = function(obj,depth,meta){
  var out = null

  depth = (null == depth) ? 3 : depth
  if( depth < 0 ) { 
    out = _.isArray(obj) ? '[-]' : _.isObject(obj) ? '{-}' : ''+obj 
  }
  else if( null != obj ) {
    if( (obj.entity$ || _.isFunction(obj.seneca)) && 
        obj.hasOwnProperty('toString') ) 
    {
      out = obj.toString()
    }
    else {
      var isarr = _.isArray(obj)
      var sb = [ isarr?'[':'{' ]
      for( var p in obj ) {
        if( obj.hasOwnProperty(p) && 
            (meta || !~p.indexOf('$')) && 
            !_.isFunction(obj[p]) ) 
        {
          if( !isarr ) {
            sb.push(p)
            sb.push('=')
          }

          if( _.isObject(obj[p]) ) {
            sb.push(owndesc(obj[p],depth-1))
          }
          else {
            sb.push(obj[p])
          }

          sb.push(',')
        }
      }

      if( 1 < sb.length ) {
        sb.pop()
      }

      sb.push( isarr?']':'}' )
      out = sb.join('')
    }
  }

  return out;
}




  // noop for callbacks
exports.nil = function nil(){
  _.each(arguments,function(arg){
    if( _.isFunction(arg) ) {
      return arg()
    }
  })
}



// remove any props containing $
function clean(obj) {
  if( null == obj ) return obj;

  var out = {}
  if( obj ) {
    for( var p in obj ) {
      if( !~p.indexOf('$') ) {
        out[p] = obj[p]
      }
    }
  }
  return out
}
exports.clean = clean

const deepextend = require('deep-extend');
exports.deepextend = deepextend;

// loop over a list of items recursively
// list can be an integer - number of times to recurse
exports.recurse = function recurse(list,work,done) {
  /* jshint validthis:true */

  var ctxt = this

  if( _.isNumber(list) ) {
    var size = list
    list = new Array(size)
    for(var i = 0; i < size; i++){
      list[i]=i
    }
  }
  else {
    list = _.clone(list)
  }

  function next(err,out){
    if( err ) return done(err,out);

    var item = list.shift()

    if( void 0 !== item ) {
      work.call(ctxt,item,next)
    }
    else {
      done.call(ctxt,err,out)
    }
  }
  next.call(ctxt)
}


// use args properties as fields
// defaults: map of default values
// args: args object
// fixed: map of fixed values - cannot be overriden
// omits: array of prop names to exclude
// defaults, args, and fixed are deepextended together in that order
exports.argprops = function argprops( defaults, args, fixed, omits){
  omits = _.isArray(omits) ? omits : 
    _.isObject(omits) ? _.keys(omits) : 
    _.isString(omits) ? omits.split(/\s*,\s*/) : 
    ''+omits

  // a little pre omit to avoid entities named in omits
  var usedargs = _.omit( args, omits )

  // don't support $ args
  usedargs = clean(usedargs)

  return _.omit( deepextend( defaults, usedargs, fixed ), omits )
}


exports.print = function print(err,out){
  if(err) throw err;

  console.log(util.inspect(out,{depth:null}))
  for(var i = 2; 2 < arguments.length; i++) {
    console.dir(arguments[i])
  }
}



exports.descdata =   function descdata(data,depth) {
  var i = 0, cleandata

  depth = depth || 0
  if( 3 < depth ) {
    return _.isArray(data) ? '[-]' : _.isObject(data) ? '{-}' : ''+data;
  }

  if( !_.isObject(data) ) {
    return ''+data
  }
  else if( _.isArray(data) ) {
    cleandata = []
    for( i = 0; i < data.length && i < 3; i++ ) {
      cleandata.push(descdata(data[i]))
    }

    if( i < data.length ) {
      cleandata.push(' ...(len='+data.length+')')
    }

    return cleandata
  }
  else if( _.isDate(data) ) {
    return data.toISOString()
  }
  else if( _.isObject(data) && data.entity$ && data.hasOwnProperty('toString')) {
    return data.toString()
  }
  else {
    if( data.seneca && data.seneca.nodesc ) return '<SENECA>';
    cleandata = {}
    for( var p in data ) {
      if( 16 < i ) {
        continue;
      }

      var ownprop = data.hasOwnProperty(p)
      i = i + (ownprop?1:0)

      if( ownprop && 
          (!~p.indexOf('$')) && 
          !_.isFunction(data[p]) ) {
        cleandata[p] = descdata(data[p],1+depth)
      }
    }
    if( 16 < i ) {
      cleandata['<LEN>']=i
    }

    return cleandata
  }
}
