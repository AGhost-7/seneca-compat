var assert = require('assert');
var seneca = require('../..')();

describe('entity', () => {

	var lastArgs;
	seneca.add({
		cmd: 'save',
		base: 'foo',
		name: 'bar',
		role: 'entity'
	}, (args, done) => {
		lastArgs = args;
		done(null, args.ent);
	});

	seneca.add({
		cmd: 'load',
		base: 'foo',
		name: 'bar',
		role: 'entity'
	}, function(args, done) {
		lastArgs = args;
		done(null, args.ent.data$({ name: 'foobar' }));
	});

	let listResponse = [{ id: 1, name: 'foobar' }];
	seneca.add({
		role: 'entity',
		cmd: 'list',
		base: 'foo',
		name: 'bar'
	}, function(args, done) {
		lastArgs = args;
		var ents = listResponse.map((item) => args.qent.make$(item));
		done(null, ents);
	});

	beforeEach(() => lastArgs = null);

	describe('save', () => {

		it('no assign', (done) => {
			var foo = seneca.make('foo/bar');
			foo.name = 'foobar';
			foo.save$((err) => {
				if(err) return done(err);
				assert.equal(lastArgs.cmd, 'save');
				assert.equal(lastArgs.base, 'foo');
				assert.equal(lastArgs.name, 'bar');
				assert.equal(lastArgs.ent.name, 'foobar');
				assert.equal(foo.name, 'foobar');
				done();
			});
		});

		it('assign on save', (done) => {
			var foo = seneca.make('foo/bar');
			foo.name = 'foobar';
			foo.save$({ baz: false }, (err) => {
				if(err) return done(err);
				assert.equal(foo.name, 'foobar');
				assert.equal(foo.baz, false);
				done();
			});
		});

		it('handles garbage', (done) => {
			var foo = seneca.make('foo/bar', { name: 'foobar' });
			lastArgs = null;
			foo.save$(null, function(err) {
				if(err) return done(err);
				assert(lastArgs);
				assert.equal(foo.name, 'foobar');
				done();
			});
		});

	});


	describe('load', (done) => {

		it('id:number', () => {
			seneca.make('foo/bar').load$(1, function(err, ent) {
				if(err) return done(err);
				assert.equal(lastArgs.q.id, 1);
				assert.equal(ent.name, 'foobar');
				done();
			});
		});

		it('id:string', () => {
			seneca.make('foo/bar').load$('one', function(err, ent) {
				if(err) return done(err);
				assert.equal(lastArgs.q.id, 'one');
				done();
			});
		});

		it('no query - id', () => {
			var foo = seneca.make('foo/bar');
			foo.id = 'one';
			foo.load$(function(err, ent) {
				if(err) return done(err);
				assert(lastArgs);
				assert.equal(lastArgs.q.id, 'one');
				done();
			});
		});

		it('no query - empty', () => {
			seneca.make('foo/bar').load$(function(err, ent) {
				if(err) return done(err);
				assert(!ent);
				assert(!lastArgs);
			});
		});

		it('undefined query - empty', (done) => {
			seneca.make('foo/bar').load$(undefined, function(err, ent) {
				if(err) return done(err);
				assert(!lastArgs);
				assert(!ent);
				done();
			});
		});

		it('undefined query - id', () => {
			seneca
				.make('foo/bar', { id: 'one' })
				.load$(undefined, function(err, ent) {
					if(err) return done(err);
					assert.equal(lastArgs.q.id, 'one');
					assert.equal(ent.name, 'foobar');
					done();
				});
		});

		it('null query - empty', (done) => {
			seneca
				.make('foo/bar')
				.load$(null, function(err, ent) {
					if(err) return done(err);
					assert(!lastArgs);
					assert(!ent);
					done();
				});
		});

		it('null query - id', (done) => {
			seneca
				.make('foo/bar', { id: 1 })
				.load$(null, function(err, ent) {
					if(err) return done(err);
					assert(lastArgs);
					assert.equal(ent.name, 'foobar');
					done();
				});
		});

		it('delegates', (done) => {
			seneca
				.delegate({ a$: true })
				.make('foo/bar')
				.load$(1, function(err, ent) {
					if(err) return done(err);
					assert.equal(ent.name, 'foobar');
					assert.equal(lastArgs.a$, true);
					done();
				});
		});

	});

	describe('list', () => {

		it('query', (done) => {
			seneca.make('foo/bar').list$({ name: 'foobar' }, function(err, ents) {
				if(err) return done(err);
				assert.equal(ents.length, 1);
				assert.equal(ents[0].entity$, '-/foo/bar');
				assert(ents[0].save$);
				assert.equal(lastArgs.q.name, 'foobar');
				done();
			});
		});

		it('compound - load', (done) => {
			seneca.make('foo/bar').list$({ name: 'foobar' }, function(err, ents) {
				if(err) return done(err);
				ents[0].load$(ents[0].id, function(err, ent) {
					if(err) return done(err);
					assert(ent.save$);
					assert(ent.name, 'foobar');
					done();
				});
			});
		});

	});

	describe.skip('remove', () => {
	});

	describe.skip('delete', () => {
	});


});
