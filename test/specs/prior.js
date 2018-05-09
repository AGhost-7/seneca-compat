var seneca = require('../../')();

describe('prior', () => {

	it.skip('next', (done) => {
		let counter = 0;
		seneca.add({ cmd: 'ping' }, (args, done) => {
			assert.equal(counter, 1);
			counter++;
			done(null, 'pong');
		});
		seneca.add({ cmd: 'ping' }, function(args, next) {
			assert.equal(counter, 0);
			counter++;
			this.prior(args, next);
		});
		seneca.on('ready', () => {
			seneca.act({ cmd: 'ping' }, (err, response) => {
				assert.equal(response, 'pong');
				assert.equal(counter, 2);
				done();
			});
		});
	});

	it('delay', () => {
		let counter = 0;
		seneca.add({ cmd: 'beep' }, (args, done) => {
			assert.equal(counter, 1);
			counter++;
			done(null, 'bop');
		});
		seneca.add({ cmd: 'beep' }, function(args, done) {
			assert.equal(counter, 0);
			counter++;
			this.prior(args, (err, response) => {
				assert(!err);
				assert.equal(response, 'bop');
				done(null, response);
			});
		});
		seneca.act({ cmd: 'beep' }, (err, response) => {
			assert.equal(response, 'bop');
			assert(!err);
		});
	});

});
