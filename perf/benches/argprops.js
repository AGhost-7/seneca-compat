
var common = require('../../lib/common');

const defaults = {};
const args = {
	user$: {},
	actid$: 'foo'
};
const fixed = {
	id$: 'foobar',
	nick: 'foobar',
	user: '123-123',
	when: new Date().toISOString(),
	active: true,
	why: 'password'
};
const omits = 'role,cmd,password';

let iterations = 1000000,
	start,
	end;

start = Date.now();
while(iterations--) {
	common.argprops(defaults, args, fixed, omits);
}
end = Date.now();

console.log('time elapsed:', end - start);
