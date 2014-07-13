var find = function(arr, fn) {
	for(var i = 0; i < arr.length; i++) {
		var item = arr[i];
		if(fn(item, i, arr)) return item;
	}
};

module.exports = function(arr, obj) {
	if(typeof obj === 'function') return find(arr, obj);

	var keys = Object.keys(obj);
	var fn = function(item) {
		return keys.every(function(key) {
			return item[key] === obj[key];
		});
	};

	return find(arr, fn);
};
