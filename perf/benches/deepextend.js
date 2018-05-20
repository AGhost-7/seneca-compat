const common = require('../../lib/common');

let iterations = 100000,
	start,
	end;

const cloning = {
	a: 1,
	b: {
		c: 2,
		d: {
			e: 3,
			f: {
				g: 4
			}
		}
	}
};

for(var i = 0; i < 20; i++) {
	const char = String.fromCodePoint(65 + i);
	cloning[char] = char;
}

start = Date.now();

while(iterations--) {
	common.deepextend({}, cloning);
}
end = Date.now();

console.log('time elapsed:', end - start);
