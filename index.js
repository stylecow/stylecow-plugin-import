var url = require('url');
var path = require('path');

module.exports = function (stylecow) {

	stylecow.addTask({
		AtRule: {
			"import": function (atrule) {
				var file = atrule.getData('sourceFile');
				var importUrl = atrule.searchFirst({type: "Function", name: "url"}).getValue().join('');

				//is not relative?
				if (!file || url.parse(importUrl).hostname || (importUrl[0] === '/')) {
					return;
				}

				file = path.dirname(file) + '/' + importUrl;

				var root = stylecow.createFromFile(file);

				//Fix relative urls
				var relative = path.dirname(importUrl);

				root.search({type: 'Function', name: 'url'}).forEach(function (fn) {
					var keyword = fn[0][0];
					var src = keyword.name;

					//is not relative?
					if (!src || url.parse(src).hostname || (src[0] === '/')) {
						return;
					}

					keyword.name = relative + '/' + src;
				});

				//Insert the imported code
				while (root.length) {
					atrule.insertBefore(root[0].setData('sourceFile', file));
				}

				atrule.remove();
			}
		}
	});
};
