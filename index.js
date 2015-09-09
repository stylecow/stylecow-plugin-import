"use strict";

var url = require('url');
var path = require('path');

module.exports = function (tasks, stylecow) {

	tasks.addTask({
		filter: {
			type: 'AtRule',
			name: 'import'
		},
		fn: function (atrule) {
			var importUrl = atrule.get('String').name;

			//is absolute?
			if (url.parse(importUrl).hostname || (importUrl[0] === '/')) {
				return;
			}

			//get the root file
			var rootFile = atrule.getAncestor('Root').getData('file');

			if (!rootFile) {
				return;
			}

			var file = path.join(path.dirname(rootFile), importUrl);

			//prevent infinite recursion
			if (atrule.getAllData('file').indexOf(file) !== -1) {
				atrule.remove();
				return;
			}

			var root = stylecow.parseFile(file);

			//Fix relative urls
			var relative = path.dirname(importUrl);

			root.getAll({
				type: 'Function',
				name: 'url'
			})
			.getAll('String')
			.forEach(function (string) {
				var src = string.name;

				//is not relative?
				if (url.parse(src).hostname || (src[0] === '/')) {
					return;
				}

				string.name = path.join(relative, src);
			});

			if (atrule.has('MediaQueries')) {
				var media = (new stylecow.NestedAtRule()).setName('media');
				var block = new stylecow.Block();

				media.push(atrule.get('MediaQueries'));
				media.push(block);

				//Insert the imported code
				while (root.length) {
					block.push(root[0]);
				}

				atrule.replaceWith(media);
			} else {
				while (root.length) {
					atrule.before(root[0]);
				}

				atrule.remove();
			}
		}
	});
};
