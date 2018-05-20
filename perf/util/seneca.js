
var senecaPath = process.env.SENECA_PATH || '../../seneca.js';
module.exports = () => require(senecaPath)({
	log: 'silent',
	actcache: false,
	timeout: 30000,
	default_plugins: {
		'mem-store': false,
		transport: false,
		web: false
	}
});
