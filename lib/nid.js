
/**
 * Inlined for now, will likely be removed later on.
 *
 * Source taken from: https://github.com/rjrodger/nid/blob/master/nid.js
 */

const alphabet =  '0123456789abcdefghijklmnopqrstuvwxyz';
const length = alphabet.length;

module.exports = () => {
	const time = Date.now();
	var sb = [];
	for (var i = 0; i < 12; i++) {
		var c = Math.floor((time * Math.random()) % length);
		sb.push(alphabet[c]);
	}
	return sb.join('');
};
