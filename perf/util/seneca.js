
var senecaPath = process.env.SENECA_PATH || '../../seneca.js';
module.exports = () => require(senecaPath)({
	log: 'silent',
	actcache: false,
	timeout: 30000
});
