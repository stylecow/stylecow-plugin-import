var fs = require('fs');
var url = require('url');
var path = require('path');

module.exports = function (stylecow) {
	return {
		Import: function (importRule) {
			var file = importRule.getData('sourceFile');

			//is not relative?
			if (!file || url.parse(importRule.url).hostname || (importRule.url[0] === '/')) {
				return;
			}

			file = path.dirname(file) + '/' + importRule.url;

			var root = stylecow.readFile(file);

			//Fix relative url
			var relative = path.dirname(importRule.url);

			root.search('Function', 'url').forEach(function (fn) {
				var src = fn[0].name;

				//is not relative?
				if (!src || url.parse(src).hostname || (src[0] === '/')) {
					return;
				}

				if (src[0] === '"' || src[0] === "'") {
					src = relative + '/' + src.slice(1, -1);
				} else {
					src = relative + '/' + src;
				}

				fn[0].name = "'" + src + "'";
			});

			//Insert the imported code
			var child;

			while (root.length) {
				importRule.insertBefore(root[0].setData('sourceFile', file));
			}

			importRule.remove();
		}
	};
};
