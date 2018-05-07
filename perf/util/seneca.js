
module.exports = () => require('../../seneca')({
	log: 'silent',
	actcache: false,
	timeout: 30000,
	default_plugins: {
		'mem-store': false,
		transport: false,
		web: false
	}
});
