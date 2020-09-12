import {
  Test,
  Tasks,
} from "https://raw.githubusercontent.com/stylecow/stylecow-core/deno/mod.js";
import Import from "../mod.js";

const tests = new Test("tests/cases");
const tasks = new Tasks().use(Import);

tests.run(function (test) {
  tasks.run(test.css);

  Deno.test("should match output.css", function () {
    //test.writeString()
    test.assertString();
  });

  Deno.test("should match ast.json", function () {
    //test.writeAst()
    test.assertAst();
  });
});
