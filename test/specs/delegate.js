var assert = require('assert');
var seneca = require('../../')();

describe('delegate', () => {

	seneca.add({
		cmd: 'put'
	}, (args, done) =>
		done(null, args.key ? args[args.key] : args.value));

	it('simple', (done) => {
		seneca.delegate({ value: 1 }).act({ cmd: 'put' }, (err, response) => {
			assert(!err);
			assert.equal(response, 1);
			done();
		});
	});

	it('stacked', () => {
		seneca
			.delegate({ other: 2 })
			.delegate({ key: 'other' })
			.act({ cmd: 'put' }, (err, response) => {
				assert(!err);
				assert.equal(response, 2);
				done();
			});
	});
});

