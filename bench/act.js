
const seneca = require('../seneca')({
	log: 'silent',
	actcache: false,
	timeout: 30000,
	default_plugins: {
		'mem-store': false,
		transport: false,
		web: false
	}
});

let iterations = 10000,
	start,
	end;

seneca.add({
	cmd: 'ping'
}, (err, done) => {
	done(null, 'pong');
});

const done = () => {
	end = Date.now();
	console.log('time elapsed:', end - start);
};

var tick = function() {
	iterations--;
	if(iterations < 0) return done();
	seneca.act({
		cmd: 'ping'
	}, tick);
};

seneca.ready(function() {
	console.log('starting benchmark');
	start = Date.now();
	tick();
});
