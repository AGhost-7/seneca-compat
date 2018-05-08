/**
 * Since there are a lot of varargs, I'm testing what the performance
 * looks like depending on the nodejs version.
 */

const argumentsSlice = function() {
	return Array.prototype.slice.call(arguments);
};

const argumentsConcat = function() {
	return Array.prototype.concat.call(arguments);
};

const spread = function(...args) {
	return args;
};

const noop = function() {};

const iterations = 1000000;

var start, end;


start = Date.now();
for(var i = 0; i < iterations; i++) {
	argumentsSlice(1, 2, 3, 'four');
}
end = Date.now();
console.log('argumentsSlice:', end - start);


start = Date.now();
for(var i = 0; i < iterations; i++) {
	argumentsConcat(1, 2, 3, 'four');
}
end = Date.now();
console.log('argumentsConcat', end - start);


start = Date.now();
for(var i = 0; i < iterations; i++) {
	spread(1, 2, 3, 'four');
}
end = Date.now();
console.log('spread', end - start);


start = Date.now();
for(var i = 0; i < iterations; i++) {
	noop(1, 2, 3, 'four');
}
end = Date.now();
console.log('noop:', end - start);
