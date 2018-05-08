/* Copyright (c) 2013-2015 Richard Rodger, MIT License */
/* jshint node:true, asi:true, eqnull:true */

"use strict";

var _      = require('lodash')

var common = require('./common')

exports.log_act_in = function(instance, actinfo, actmeta, args, prior_ctxt) {
	if(actmeta.sub || !instance.log.levels.debug) return;

  instance.log.debug(
    'act',
    actmeta.plugin_name,
    actmeta.plugin_tag,
    'IN',
    actinfo.actid,
    actmeta.pattern,
    function() {
      return [
        actmeta.descdata ? actmeta.descdata(args) : common.descdata(args),
        prior_ctxt.entry ? 'ENTRY' : 
          'PRIOR;'+(prior_ctxt.chain.slice(0,prior_ctxt.depth)).join(','),
        'A;'+actmeta.id, 
        args.gate$ ? 'GATE' : '-'
      ]
    })
}


exports.log_act_out = 
  function(instance, actinfo, actmeta, args, result, prior_ctxt) 
{
	if(actmeta.sub || !instance.log.levels.debug) return;

  instance.log.debug(
    'act',
    actmeta.plugin_name,
    actmeta.plugin_tag,
    'OUT',
    actinfo.actid,
    actmeta.pattern,
    function() {
      return _.flatten( [ 
        _.flatten([ 
          actmeta.descdata ? 
            actmeta.descdata(result.slice(1)) : 
            common.descdata(result.slice(1)) ], 
                  true), 
        prior_ctxt.entry ? 'EXIT' : 
          'PRIOR;'+(prior_ctxt.chain.slice(0,prior_ctxt.depth)).join(','),
        'A;'+actmeta.id,
        actinfo.duration,
        args.gate$ ? 'GATE' : '-'
      ])
    })
}

exports.log_act_err = function(instance, actinfo, actmeta, args, prior_ctxt, err) {
  if(!err.log || !instance.log.levels.error) return;

  instance.log.error(
    'act',
    actmeta.plugin_name || '-',
    actmeta.plugin_tag  || '-',
    'OUT',
    actinfo.actid,
    actmeta.pattern     || '-', 
    actinfo.duration,
    ( actmeta.descdata ? 
      actmeta.descdata(args) : common.descdata(args) ),
    prior_ctxt.entry ? 'ENTRY' : 
      'PRIOR;'+(prior_ctxt.chain.slice(0,prior_ctxt.depth)).join(','),
    'A;'+actmeta.id, 
    args.gate$ ? 'GATE' : '-',
    err.message,
    err.code,
    common.descdata(err.details),
    err.stack,
    args.caller$
  )

}


exports.log_act_cache = function(instance, actinfo, actmeta, args, prior_ctxt) {
	if(!instance.log.levels.debug) return;

  instance.log.debug(
    'act',
    actmeta.plugin_name,
    actmeta.plugin_tag,
    'OUT',
    actinfo.actid,
    actmeta.pattern,
    'CACHE',
    prior_ctxt.entry ? 'ENTRY' : 
      'PRIOR;'+(prior_ctxt.chain.slice(0,prior_ctxt.depth)).join(','),
    function() {
      return [actmeta.descdata ? 
              actmeta.descdata(args) : 
              common.descdata(args), 
              'A='+actmeta.id]
    })
}


exports.log_exec_err = function( instance, err ) {
  if(!err.log || instance.log.levels.error) return;

  err.details        = err.details || {}
  err.details.plugin = err.details.plugin || {}

  instance.log.error( 
    'act',
    err.details.plugin.name || '-',
    err.details.plugin.tag  || '-',
    err.details.id          || '-',
    err.details.pattern     || '-', 
    err.message,
    err.code,
    common.descdata(err.details),
    err.stack )
}

exports.log_act_not_found = function(instance, err, loglevel) {
  if( false === err.log ) return;

  loglevel = loglevel || 'warn'
  if( 'ignore' == loglevel ) return;

  err.details = err.details || {}
  err.details.plugin = err.details.plugin || {}

	if(instance.log.levels[loglevel]) {
		instance.log(
			loglevel,
			'act',
			err.details.plugin.name || '-',
			err.details.plugin.tag  || '-',
			err.details.id          || '-',
			err.details.pattern     || '-', 
			err.message,
			err.code,
			common.descdata(err.details),
			err.stack )
	}
}


const noop = () => {};

const levels = [
	'debug', // 0
	'info', // 1
	'warn', // 2
	'error', // 3
	'fatal' // 4
];

const normalizeLevel = function(level) {
	level = level.toLowerCase();
	if(levels.indexOf(level) === -1 && level !== 'silent') {
		throw new Error('Invalid log level ' + level);
	}
	return level;
};

const parseLevel = (options) => {
	if(options.log && options.log.level) {
		return normalizeLevel(options.log.level);
	}
	if(options.log && typeof options.log === 'string') {
		return normalizeLevel(options.log);
	}

	for(const arg of process.argv.slice(2)) {
		var match = arg.match(/--seneca\.log=level:(.*)/);
		if(match) {
			return normalizeLevel(match[1]);
		}
	}

	return process.env.SENECA_LOG ?
		normalizeLevel(process.env.SENECA_LOG) :
		'warn';
};

exports.createLogger = (options) => {
	const level = parseLevel(options);
	const handler = (options.log && options.log.handler) || console.log;

	const log = (level, ...args) => {
		if(log.levels[level]) {
			handler(level, ...args);
		}
	};

	log.levels = {};
	levels.forEach((currentLevel, index) => {
		if(index + 1 > levels.indexOf(level) && level !== 'silent') {
			log[currentLevel] = (...args) => handler(currentLevel, ...args);
			log.levels[currentLevel] = true;
		} else {
			log[currentLevel] = noop;
			log.levels[currentLevel] = false;
		}
	});

	Object.freeze(log);

	return log;
};

