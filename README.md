stylecow plugin import
======================

[![Build Status](https://travis-ci.org/stylecow/stylecow-plugin-import.svg)](https://travis-ci.org/stylecow/stylecow-plugin-import)

Stylecow plugin to include the @import css files with relative paths in the main css file.

You write:

```css
@import "my-styles.css";

.foo {
    color: blue;
}
```

And stylecow converts to:

```css
.imported-foo {
    font-size: 2em;
}
.other-imported-foo {
    background: blue;
}
.foo {
    color: blue;
}
```

More demos in [the tests folder](https://github.com/stylecow/stylecow-plugin-import/tree/master/tests/cases)
