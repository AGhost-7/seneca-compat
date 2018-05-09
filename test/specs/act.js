
const assert = require('assert');
const seneca = require('../../seneca')();

describe('act', () => {

	seneca.add({ cmd: 'ping' }, (args, done) => done(null, 'pong'));
	seneca.add('cmd:beep', (args, done) => done(null, 'bop'));

	before((done) => {
		seneca.on('ready', () => done());
	});

	it('simple:object', (done) => {
		seneca.act({ cmd: 'ping' }, (err, response) => {
			assert.equal(response, 'pong');
			done();
		});
	});

	it('simple:string', () => {
		seneca.act('cmd:beep', (err, response) => {
			assert.equal(response, 'bop');
			done();
		});
	});

	it('compound:object', (done) => {
		seneca.add({
			role: 'employee',
			employment: 'software developer',
			specialty: 'everything'
		}, (args, done) => done(null, 'ok'));

		seneca.act({
			role: 'employee',
			employment: 'software developer',
			specialty: 'everything'
		}, (err, response) => {
			assert.equal(response, 'ok');
			done();
		});
	});

	it('compound:string', () => {
		seneca.add(
			'role:employee,employment:software developer,specialty:everything',
			(args, done) => done(null, 'ok'));

		seneca.act(
			'role:employee,employment:software developer,specialty:everything',
			(err, response) => {
				assert.equal(response, 'ok');
				done();
			});
	});


});
