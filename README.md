# seneca-compat - a way to migrate off SenecaJs
Fork of senecajs 0.6.2

Performance gained (so far): 39% based on `act.js` benchmark.

## Goals
- Mostly maintain compatibility with seneca plugins. Certain things like act
call caching will be dropped.
- Improve performance.
- Improve debuggability.
- Improve the readability of the codebase.
- Be less all encompassing (framework => library).

## Non-Goals
- Retain the exact same API.

## Things changed

### Stripped down logging
You will need to implement your own logging handler.
```js
var seneca = require('seneca-compat')({
	log: {
		level: 'warn',
		handler(level, ...args) {
			// ... handle logs here
		}
	}
});
```

This was done so that logs can be streamlined into the same logging facility as
your app. Performance was also significantly improved.

### actcache is no longer a thing
It was an unpredictable feature. Removed it to simplify the code.
