var url = require('url');
var path = require('path');

module.exports = function (stylecow) {

	stylecow.addTask({
		filter: {
			type: 'AtRule',
			name: 'import'
		},
		fn: function (atrule) {
			var file = atrule.getData('sourceFile');

			if (!file) {
				return;
			}

			var importUrl = atrule
				.searchFirst({
					type: 'Function',
					name: 'url'
				})
				.searchFirst({
					type: ['Keyword', 'String']
				})
				.name;

			//is absolute?
			if (url.parse(importUrl).hostname || (importUrl[0] === '/')) {
				return;
			}

			file = path.dirname(file) + '/' + importUrl;

			var root = stylecow.Root.create(stylecow.Reader.readFile(file));

			//Fix relative urls
			var relative = path.dirname(importUrl);

			root
			.search({
				type: 'Function',
				name: 'url'
			})
			.search({
				type: ['Keyword', 'String']
			})
			.forEach(function (keyword) {
				var src = keyword.name;

				//is not relative?
				if (url.parse(src).hostname || (src[0] === '/')) {
					return;
				}

				keyword.name = relative + '/' + src;
			});

			//Insert the imported code
			while (root.length) {
				atrule.before(root[0]);
			}

			atrule.remove();
		}
	});
};
