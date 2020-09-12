import { join, dirname, sep } from "https://deno.land/std/path/mod.ts";
import { parseFile } from "https://deno.land/x/stylecow_core/mod.js";
import NestedAtRule from "https://deno.land/x/stylecow_core/css/nested-at-rule.js";
import Block from "https://deno.land/x/stylecow_core/css/block.js";

export default function (tasks) {
  tasks.addTask({
    filter: {
      type: "AtRule",
      name: "import",
    },
    fn: function (atrule) {
      const importUrl = atrule.get("String").name;

      //is absolute?
      try {
        return new URL(importUrl);
      } catch (err) {}

      //get the root file
      const rootFile = atrule.getAncestor("Root").getData("file");

      if (!rootFile) {
        return;
      }

      const file = join(dirname(rootFile), importUrl);

      //prevent infinite recursion
      if (atrule.getAllData("file").indexOf(file) !== -1) {
        atrule.remove();
        return;
      }

      const root = parseFile(file);
      const relative = dirname(importUrl);

      root.getAll({
        type: "Function",
        name: "url",
      })
        .getAll("String")
        .forEach(function (string) {
          var src = string.name;

          //is not relative?
          try {
            if (src[0] === "/") return;
            return new URL(src);
          } catch (err) {}

          string.name = join(relative, src);

          if (sep === "\\") {
            string.name = string.name.replace(/\\/g, "/");
          }
        });

      if (atrule.has("MediaQueries")) {
        const media = new NestedAtRule().setName("media"),
          block = new Block();

        media.push(atrule.get("MediaQueries"));
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
    },
  });
}
