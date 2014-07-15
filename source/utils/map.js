module.exports = function(obj, fn) {
	var result = {};

	Object.keys(obj).forEach(function(key) {
		var v = fn(key, obj[key], obj);

		if(Array.isArray(v)) {
			result[v[0]] = v[1];
		} else {
			result[key] = v;
		}
	});

	return result;
};
