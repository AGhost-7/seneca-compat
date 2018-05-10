var assert = require('assert');
var seneca = require('../..')();

describe('entity', () => {

	describe('make', () => {

		it('assigns', () => {
			const foo = seneca.make('foo/bar', {
				name: 'foobar'
			});
			assert.equal(foo.name, 'foobar');
		});

		it('no stars', () => {
			const foo = seneca.make('foo/bar', {
				name$: 'foobar'
			});
			assert(!foo.name$);
		});

		it('id$', () => {
			const foo = seneca.make('foo/bar', { id$: 1 });
			assert.equal(foo.id$, 1);
		});

		it('chain', () => {
			const foo = seneca.make('bar').make$({ base: 'foo'}, {
				name: 'foobar',
				name$: 'foobar',
				id$: 1
			});
			assert.equal('-/foo/bar', foo.entity$);
			assert.equal(foo.name, 'foobar');
			assert.equal(foo.id$, 1);
			assert(!foo.name$);
		});

		it('delegates', () => {
			const foo = seneca
				.delegate({ a$: true })
				.make('foo/bar');
			assert.equal(foo._seneca$.fixedargs.a$, true);
		});

	});

	describe('canon', () => {

		it('name only', () => {
			const foo = seneca.make$('foo');
			assert.equal('-/-/foo', foo.entity$);
			assert.equal('-/-/foo', foo.canon$());
			assert.equal('-/-/foo', foo.canon$({ string: true }));
			assert.equal('$-/-/foo', foo.canon$({ string$: true }));
			assert.deepEqual([undefined, undefined, 'foo'], foo.canon$({ array: true }));
			assert.deepEqual([undefined, undefined, 'foo'], foo.canon$({ array$: true }));
			assert.deepEqual({
				zone: undefined,
				base: undefined,
				name: 'foo'
			}, foo.canon$({ object: true }));
			assert.deepEqual({
				zone$: undefined,
				base$: undefined,
				name$: 'foo'
			}, foo.canon$({ object$: true }));
		});

		it('base and name', () => {
			const foo = seneca.make$('foo/bar');
			assert.equal('-/foo/bar', foo.entity$);
			assert.equal('-/foo/bar', foo.canon$());
			assert.equal('-/foo/bar', foo.canon$({ string:true }));
			assert.equal('$-/foo/bar', foo.canon$({ string$:true }));
			assert.deepEqual([undefined, 'foo', 'bar'], foo.canon$({ array: true }));
			assert.deepEqual([undefined, 'foo', 'bar'], foo.canon$({ array$: true }));
			assert.deepEqual({
				zone: undefined,
				base: 'foo',
				name: 'bar'
			}, foo.canon$({ object: true }));
			assert.deepEqual({
				zone$: undefined,
				base$: 'foo',
				name$: 'bar'
			}, foo.canon$({ object$: true }));
		});

	});

	describe('fields', () => {

		it('skip dollar prefix', () => {
			assert.deepEqual(
				seneca.make('foo/bar', { foo$: 'bar'}).fields$(),
				[]);
		});

		it('new field', () => {
			assert.deepEqual(
				seneca.make('foo/bar', { foo: 'bar' }).fields$(),
				['foo']);
		});

	});

	describe('data', () => {

		it('get', () => {
			const foo = seneca.make('foo/bar', {
				a$: 1
			});
			foo.name = 'foobar';
			assert.deepEqual(
				foo.data$(),
				{ entity$: '-/foo/bar', name: 'foobar' });
		});

		it('set', () => {
			const foo = seneca.make('foo/bar');
			foo.data$({
				a$: 1,
				name: 'foobar'
			});
			assert.equal(foo.name, 'foobar');
			assert(!foo.a$);
		});

	});

	describe('save', () => {

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

	describe.skip('load', () => {
	});

	describe.skip('list', () => {
	});

	describe.skip('remove', () => {
	});

	describe.skip('delete', () => {
	});

	describe.skip('clone', () => {
	});

	describe.skip('is', () => {
	});


});
