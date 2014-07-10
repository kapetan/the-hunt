var remove = function(arr, item) {
	var i = arr.indexOf(item);
	if(i >= 0) arr.splice(i, 1);
};

module.exports = function(arr, item) {
	if(Array.isArray(item)) {
		item.forEach(function(it) {
			remove(arr, it);
		});
	} else {
		remove(arr, item);
	}
};
