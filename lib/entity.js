
var util    = require('util');
var _       = require('lodash');
var error   = require('eraro')({
	package: 'seneca',
	msgmap:ERRMSGMAP()
});

var common  = require('./common');

var noop = common.noop;

function Entity(canon, seneca) {
	var self = this;
	this._seneca$ = seneca;
	this._canon$ = canon;
	this.entity$ = this.canon$();
}

Entity.prototype.log$ = function() {
	this._seneca$.log.apply(this, arguments);
};

Entity.prototype._entargs$ = function(args) {
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
};

Entity.prototype.newCanon$ = function(entity$) {
	const canon = typeof entity$ === 'string' ?
		parsecanon(entity$) :
		entity$;

	return {
		zone: canon.zone == null ? this._canon$.zone : canon.zone,
		base: canon.base == null ? this._canon$.base : canon.base,
		name: canon.name == null ? this._canon$.name : canon.name
	};
};

Entity.prototype.make$ = function(entity$, assign) {

  var entity = new Entity(this.newCanon$(entity$), this._seneca$);

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
};


// save one
Entity.prototype.save$ = function(props,cb) {
  var si = this._seneca$;

  if( _.isFunction(props) ) {
    cb = props;
  }
  else if( _.isObject(props) ) {
    this.data$(props);
  }

	si.act(this._entargs$({ cmd:'save' }), cb);

  return this;
};

// provide native database driver
Entity.prototype.native$ = function(cb) {
  this._seneca.act(this._entargs$({ cmd:'native' }), cb || noop);
  return this;
};

// load one
// TODO: qin can be an entity, in which case, grab the id and reload
// qin omitted => reload self
Entity.prototype.load$ = function(qin, cb) {

  var si = this._seneca$;

  var qent = this;

	var q = resolve_id_query(qin, this);
  // empty query gives empty result
	if(null == q) {
    return cb();
  }

  si.act(this._entargs$({ qent: qent, q:q, cmd: 'load' }), cb);

  return this;
};

// list zero or more
// qin is optional, if omitted, list all
Entity.prototype.list$ = function(qin, cb) {
  var si = this._seneca$;

  var qent = this;
  var q = qin;
  if(_.isFunction(qin)) {
    q = {};
    cb = qin;
  }

  si.act(this._entargs$({ qent: qent, q: q, cmd: 'list' }), cb || noop);

  return this;
};

Entity.prototype.remove$ = function(qin, cb) {
  var self = this;
  var si = this._seneca$;

  var q = resolve_id_query(qin, this);

  cb = (_.isFunction(qin) ? qin : cb) || noop;

  // empty query means take no action
  if( null == q ) {
    return cb();
  }

  si.act(this._entargs$({qent:self,q:q,cmd:'remove'}), cb || noop);

  return this;
};

Entity.prototype.delete$ = Entity.prototype.remove$;


Entity.prototype.fields$ = function() {
	const fields = [];
	this.forEachField$((value, key) => {
		fields.push(key);
	});
  return fields;
};

Entity.prototype.forEachField$ = function(iterator) {
  for(const key in this) {
		if(key[key.length - 1] !== '$') {
			iterator(this[key], key, this);
    }
  }
};

Entity.prototype.is$ = function( canonspec ) {

  var canon = canonspec ? 
        canonspec.entity$ ? canonspec.canon$({ object:true }) : 
        parsecanon(canonspec) : 
      null;

  if( !canon ) return false;

  return util.inspect(this.canon$({ object: true })) == util.inspect(canon);
};


Entity.prototype.canon$ = function(options) {
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
			zone: this._canon.zone,
			base: this._canon.base,
			name: this._canon.name
		};
	} else if(options.object$) {
		return {
			zone$: this._canon.zone,
			base$: this._canon.base,
			name$: this._canon.name
		};
	} else {
		return [
			this._canon.zone,
			this._canon.base,
			this._canon.name
		];
	}

};

Entity.prototype.data$ = function(data) {

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
};


Entity.prototype.clone$ = function() {
  return this.make$(this.data$());
};


function resolve_id_query(qin, ent) {
  var q;

  if( (_.isUndefined(qin) || _.isNull(qin) || _.isFunction(qin)) && 
      null != ent.id ) 
  {
    q = { id:ent.id };
  }
  else if(_.isString(qin) || _.isNumber(qin)) {
    q = '' === qin ? null : {id:qin};
  }
  else if(_.isFunction(qin)) {
    q = null;
  }
  else {
    q = qin;
  }

  return q;
}

// parse a canon string: 
// $zone-base-name
// $, zone, base are optional
function parsecanon(str) {
  
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

  throw error('invalid_canon', { str: str });
}


function ERRMSGMAP() {
  return {
    invalid_canon: "Invalid entity canon: <%=str%>; expected format: zone/base/name."
  };
}



module.exports = function make_entity( canon, seneca ) {
  return new Entity(canon, seneca);
};

module.exports.parsecanon = parsecanon;
module.exports.Entity = Entity;
