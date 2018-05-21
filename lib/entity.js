
var debug = require('debug')('seneca:entity');
var util    = require('util');
var _       = require('lodash');

var common  = require('./common');

var noop = common.noop;

class Entity {
	constructor(canon, seneca) {
		Object.defineProperty(this, '_seneca$', {
			value: seneca,
			enumerable: false
		});
		this._canon$ = canon;
		this.entity$ = this.canon$();
	}

	/**
	 * @deprecated
	 */
	log$() {
		this._seneca$.log.apply(this, arguments);
	}

	static create(input, assign, seneca) {
		const canon = typeof input === 'string' ?
			Entity.parseCanon(input) :
			input;

		const entity = new Entity(canon, seneca);
		debug('seneca.make (%o):', entity._canon$);

		if(assign) {
			for(var key in assign) {
				if(key[key.length - 1] !== '$') {
					entity[key] = assign[key];
				}
			}
			if(assign.id$ != null) {
				entity.id$ = assign.id$;
			}
		}
		return entity;
	}

	/**
	 * Create a blank entity.
	 *
	 * @example
	 *   make$('foo/bar')
	 *   make$({ name: 'foobar' })
	 *   make$('foo/bar', { name: 'foobar' })
	 *
	 * @
	 */
	make$(arg1, arg2) {

		let assign = null, canon;
		if(typeof arg1 === 'string') {
			const inputCanon = Entity.parseCanon(arg1);
			canon = {
				zone: inputCanon.zone == null ? this._canon$.zone : inputCanon.zone,
				base: inputCanon.base == null ? this._canon$.base : inputCanon.base,
				name: inputCanon.name == null ? this._canon$.name : inputCanon.name
			};
			if(arg2 != null) {
				assign = arg2;
			}
		} else {
			assign = arg1;
			canon = this._canon$;
		}

		var entity = new Entity(canon, this._seneca$);
		debug('make (%o)', entity._canon$);

		if(assign != null) {
			for(var key in assign) {
				if(key[key.length - 1] !== '$') {
					entity[key] = assign[key];
				}
			}
			if(assign.id$ != null) {
				entity.id$ = assign.id$;
			}
		}

		return entity;
	}


	// save one
	save$(props, cb) {
		debug('save (%o)', this._canon$);
		var si = this._seneca$;

		if( _.isFunction(props) ) {
			cb = props;
		}
		else if( _.isObject(props) ) {
			this.data$(props);
		}

		si.act(this._entargs$({ cmd:'save' }), cb);

		return this;
	}

	/**
	 * Provide native database driver
	 *
	 * @deprecated
	 */
	native$(cb) {
		debug('native (%o)', this._canon$);
		this._seneca.act(this._entargs$({ cmd:'native' }), cb || noop);
		return this;
	}

	/**
	 * load one. not a scalar query.
	 */
	load$(qin, cb) {
		var query = this._resolveIdQuery$(qin, this);
		debug('load (%o): %o', this._canon$, query);
		// empty query gives empty result
		if(null == query) {
			return cb();
		}

		var args = {
			qent: this,
			q: query,
			cmd: 'load'
		};

		this._seneca$.act(this._entargs$(args), cb);

		return this;
	}

	/**
	 * list zero or more
	 * qin is optional, if omitted, list all.
	 */
	list$(qin, cb) {
		var si = this._seneca$;

		var qent = this;
		var q = qin;
		if(_.isFunction(qin)) {
			q = {};
			cb = qin;
		}

		debug('list (%o): %o', this._canon$, q);
		si.act(this._entargs$({ qent: qent, q: q, cmd: 'list' }), cb || noop);

		return this;
	}

	/**
	 * Delete.
	 */
	remove$(qin, cb) {
		var self = this;
		var si = this._seneca$;

		var q = this._resolveIdQuery$(qin, this);

		cb = (_.isFunction(qin) ? qin : cb) || noop;

		// empty query means take no action
		if( null == q ) {
			if(typeof qin === 'function') qin = cb();
			return cb();
		}

		debug('remove (%o): %o', this._canon$, q);
		si.act(this._entargs$({qent:self,q:q,cmd:'remove'}), cb || noop);

		return this;
	}

	delete$(...args) {
		this.remove$.apply(this, args);
	}

	fields$() {
		debug('fields');
		const fields = [];
		for(const key in this) {
			if(key[key.length - 1] !== '$') {
				fields.push(key);
			}
		}
		return fields;
	}

	is$(canonspec) {
		debug('is');
		var canon = canonspec ? 
			canonspec.entity$ ? canonspec.canon$({ object:true }) : 
			Entity.parseCanon(canonspec) : 
			null;

		if(!canon) return false;

		return util.inspect(this.canon$({ object: true })) == util.inspect(canon);
	}

	canon$(options) {
		debug('canon (%o): %o', this._canon$, options);
		var canon = this._canon$;

		if(!options || options.string) {
			return (canon.zone || '-') + '/' +
				(canon.base || '-') + '/' +
				(canon.name || '-');
		} else if(options.string$) {
			return '$' + (canon.zone || '-') + '/' +
				(canon.base || '-') + '/' +
				(canon.name || '-');
		} else if(options.object) {
			return {
				zone: canon.zone,
				base: canon.base,
				name: canon.name
			};
		} else if(options.object$) {
			return {
				zone$: canon.zone,
				base$: canon.base,
				name$: canon.name
			};
		} else {
			return [
				canon.zone,
				canon.base,
				canon.name
			];
		}

	}

	data$(data) {
		debug('data');
		if(data) {
			for(const key in data) {
				if(key[key.length - 1] !== '$') {
					this[key] = data[key];
				}
			}

			return this;
		}
		else {
			const result = {
				entity$: this.entity$
			};

			for(const key in this) {
				if(key[key.length - 1] !== '$') {
					result[key] = this[key];
				}
			}

			return result;
		}
	}


	clone$() {
		debug('clone');
		return this.make$(this.data$());
	}

	/**
	 * @private
	 */
	_entargs$(args) {
		args.role = 'entity';
		args.ent = this;

		if(this._canon$.name != null) {
			args.name = this._canon$.name;
		}
		if(this._canon$.base != null) {
			args.base = this._canon$.base;
		}
		if(this._canon$.zone != null) {
			args.zone = this._canon$.zone;
		}

		return args;
	}

	/**
	 * @private
	 */
	_resolveIdQuery$(query, ent) {
		switch(typeof query) {
			case 'number':
			case 'string':
				return { id: query };
			case 'function':
				return ent.id != null ? { id: ent.id } : query;
			case 'undefined':
				return ent.id != null ? { id: ent.id } : query;
			case 'object':
				if(query === null && ent.id != null) return { id: ent.id };
				return query;
			default:
				return query;
		}
	}

	static parseCanon(str) {
		debug('parseCanon: %s', str);
		if(_.isArray(str)) {
			return {
				zone: str[0],
				base: str[1],
				name: str[2],
			};
		}

		if( _.isObject(str) && !_.isFunction(str) ) return str;

		if( !_.isString(str) ) return {};

		var match = /\$?((\w+|-)\/)?((\w+|-)\/)?(\w+|-)/.exec(str);
		if(match) {
			var zi = void 0==match[4]?4:2, bi = void 0==match[4]?2:4;

			var out = {};
			out.zone = '-' == match[zi] ? void 0 : match[zi];
			out.base = '-' == match[bi] ? void 0 : match[bi];
			out.name = '-' == match[5] ? void 0 : match[5];
			return out;
		}

		throw new Error(util.format('Invalid entity canon: %s; expected format zone/base/name'));
	}
}

module.exports = Entity;
