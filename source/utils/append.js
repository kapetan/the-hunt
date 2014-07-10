module.exports = function(arr, items) {
	if(!Array.isArray(items)) items = [items];

	items.forEach(function(item) {
		arr.push(item);
	});
};
