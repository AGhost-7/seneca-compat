const seneca = require('../util/seneca')();

let iterations = 10000,
	start,
	end;

const response = {
	firstName: 'foo',
	lastName: 'bar'
};

for(var i = 0; i < 20; i++) {
	response[String.fromCodePoint(65 + i)] = 'this is sample data';
}

seneca.add({
	cmd: 'load',
	name: 'person',
	role: 'entity'
}, (args, callback) => {
	callback(null, args.ent.data$(response));
});

const done = () => {
	end = Date.now();
	console.log('time elapsed', end - start);
};

const query = { id: 1 };
const tick = () => {
	if(iterations <= 0) return done();
	iterations--;
	seneca.make('sys/person').load$(query, tick);
};

seneca.on('ready', () => {
	console.log('starting benchmark: entity');
	start = Date.now();
	tick();
});
