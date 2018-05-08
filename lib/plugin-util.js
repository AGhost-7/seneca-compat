/* Copyright (c) 2014-2015 Richard Rodger, MIT License */
/* jshint node:true, asi:true, eqnull:true */
"use strict";


var _     = require('lodash')

var common  = require('./common')
var logging = require('./logging')



function resolve_options( fullname, plugindef, seneca_options ) {
  var so = seneca_options

  var fullname_options  = _.extend(
    {},
    so[fullname],
    so.plugin[fullname],
    so[fullname+'$'+plugindef.tag],
    so.plugin[fullname+'$'+plugindef.tag]        
  )
  
  var shortname = fullname != plugindef.name ? plugindef.name : null
  if( !shortname && 0 === fullname.indexOf('seneca-') ) {
    shortname = fullname.substring('seneca-'.length)
  }

  var shortname_options = _.extend(
    {},
    so[shortname],
    so.plugin[shortname],
    so[shortname+'$'+plugindef.tag],
    so.plugin[shortname+'$'+plugindef.tag]        
  )

  var outopts = _.extend( {},
                          shortname_options,
                          fullname_options,
                          plugindef.options || {} )

  return outopts
}



function make_delegate( instance, plugin, options ) {

  // Adjust Seneca API to be plugin specific.
  var sd = instance.delegate({
    plugin$: {
      name: plugin.name,
      tag:  plugin.tag
    },

    // Act calls inside the plugin definition function are not gated.
    ungate$:true,
    fatal$:true,
  })

  sd.die  = options.makedie( sd, {type:'plugin',plugin:plugin.name} )

  var actmetalist = []

  sd.add = function() {
    var args = common.arrayify(arguments)

    var actmeta = args[args.length-1] || {}
    
    if( _.isFunction(actmeta) ) {
      actmeta = {}
      args.push(actmeta)
    }

    actmeta.plugin_name     = plugin.name || '-'
    actmeta.plugin_tag      = plugin.tag || '-'
    actmeta.plugin_fullname = plugin.fullname
    actmeta.log             = sd.log

    actmetalist.push(actmeta)

    return instance.add.apply(sd,args)
  }

  sd.__update_plugin__ = function( plugin_meta ) {
    sd.context.name     = plugin_meta.name || '-'
    sd.context.tag      = plugin_meta.tag || '-'
    sd.context.full     = plugin_meta.fullname || '-'

    _.each(actmetalist,function(actmeta){
      actmeta.plugin_name     = plugin_meta.name || '-'
      actmeta.plugin_tag      = plugin_meta.tag || '-'
      actmeta.plugin_fullname = plugin_meta.fullname || '-'
    })
  }
  

  sd.context.module   = plugin.parent || module
  sd.context.name     = plugin.name || '-'
  sd.context.tag      = plugin.tag || '-'
  sd.context.full     = plugin.fullname
  sd.context.isplugin = true


  return sd;
}

function define_plugin( sd, plugin, options ) {
  var is_normal = plugin.init.length <= 1

  var meta = plugin.init.call(sd,options) || {}

  meta = _.isString( meta ) ? {name:meta} : meta
  meta.options = meta.options || options

  var updated_options = {}
  updated_options[plugin.fullname] = meta.options
  sd.options( updated_options )

  return meta;
}

module.exports = {
  make_delegate:   make_delegate,
  resolve_options: resolve_options,
  define_plugin:   define_plugin,
}


