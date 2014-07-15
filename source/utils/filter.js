module.exports = function(obj, fn) {
	var result = {};

	Object.keys(obj).forEach(function(key) {
		var v = fn(key, obj[key], obj);
		if(v) result[key] = obj[key];
	});

	return result;
};
