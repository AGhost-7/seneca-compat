
const seneca = require('../util/seneca')();

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

const tick = function() {
	iterations--;
	if(iterations < 0) return done();
	seneca.act({
		cmd: 'ping'
	}, tick);
};

seneca.ready(function() {
	console.log('starting benchmark: act');
	start = Date.now();
	tick();
});
