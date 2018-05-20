/**
 * Benchmark used to determine what is the fastest way to figure out if a
 * property is a seneca "meta property" (ends with a dollar sign).
 *
 * Unsurprisingly, the finite automata is slower.
 */

let iterations = 1000000,
	start,
	end,
	counter;

const reg = /\$$/;
const key = 'foobar$';

counter = iterations;
start = Date.now();
while(counter--) {
	let result = reg.test(key);
}
end = Date.now();
console.log('regex match:', end - start);

counter = iterations;
start = Date.now();
while(counter--) {
	let result = key[key.length - 1] !== '$';
}
end = Date.now();
console.log('end index check:', end - start);

