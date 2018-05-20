
var common = require('../../lib/common');

const defaults = {};
const args = {
	q: {
		nick: 'foobar'
	},
	cmd: 'login',
	role: 'user',
	password: 'foobar',
	email: 'foo@bar.com',
	user: {
		id: 'foo',
		nick: 'foobar',
		password: 'foobar',
		email: 'foo@bar.com'
	}
};

for(var i = 0; i < 10; i++) {
	args[String.fromCodePoint(65 + i)] = 'this is sample data';
}

const fixed = {
	id$: 'foobar',
	nick: 'foobar',
	user: '123-123',
	when: new Date().toISOString(),
	active: true,
	why: 'password'
};
const omits = 'role,cmd,password';

let iterations = 100000,
	start,
	end;

start = Date.now();
while(iterations--) {
	common.argprops(defaults, args, fixed, omits);
}
end = Date.now();

console.log('time elapsed:', end - start);
