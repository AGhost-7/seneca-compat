const seneca = require('../util/seneca')();

let iterations = 10000,
	start,
	end;

const response = {
	firstName: 'foo',
	lastName: 'bar'
};

seneca.add({
	cmd: 'load',
	name: 'person',
	role: 'entity'
}, (args, done) => {
	done(null, response);
});

const done = () => {
	end = Date.now();
	console.log('time elapsed', end - start);
};

const query = { id: 1 };
const tick = () => {
	iterations--;
	if(iterations < 0) return done();
	seneca.make('person').load$(query, tick);
};

seneca.ready(() => {
	console.log('starting benchmark: entity');
	start = Date.now();
	tick();
});
