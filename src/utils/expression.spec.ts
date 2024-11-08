import { expression } from "./expression";

interface TestCase {
  expr: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  model: any;
  res: boolean;
}

interface TestGroup {
  expr: string;
  order: number;
  tests: TestCase[];
}

const tests: TestCase[] = [
    { expr: 'a="test"', model: { a: 'test' }, res: true },
    { expr: "a=\"test\"", model: { a: 'test' }, res: true },
    { expr: "a='te\"st'", model: { a: 'te"st' }, res: true },
    { expr: 'a=\'apple\'', model: { a: 'apple' }, res: true },
    { expr: 'a=\'ap"ple\'', model: { a: 'ap"ple' }, res: true },
    { expr: 'a="apple"', model: { a: 'pear' }, res: false },

    { expr: 'a="apple" & b="pear"', model: { a: 'apple', b: 'pear' }, res: true },
    { expr: 'a="apple" & b="orange"', model: { a: 'apple', b: 'pear' }, res: false },
    { expr: 'a="apple" & b="pear" & c="grape"', model: { a: 'apple', b: 'pear', c: 'grape' }, res: true },
    { expr: 'a="apple" & b="pear" & c="banana"', model: { a: 'apple', b: 'pear', c: 'orange' }, res: false },

    // OR (|) expressions
    { expr: 'a="apple" | b="pear"', model: { a: 'apple', b: 'other' }, res: true },
    { expr: 'a="orange" | b="pear"', model: { a: 'apple', b: 'pear' }, res: true },
    { expr: 'a="apple" | b="banana" | c="grape"', model: { a: 'apple', b: 'other', c: 'other' }, res: true },

    // Mixed AND and OR with parentheses
    { expr: '(a="apple" | b="pear") & c="grape"', model: { a: 'apple', b: 'other', c: 'grape' }, res: true },
    { expr: '(a="orange" | b="pear") & c="grape"', model: { a: 'apple', b: 'pear', c: 'grape' }, res: true },
    { expr: '(a="apple" | b="pear") & c="banana"', model: { a: 'apple', b: 'pear', c: 'grape' }, res: false },
    { expr: '(a="apple" & b="pear") | c="grape"', model: { a: 'apple', b: 'orange', c: 'grape' }, res: true },
    { expr: '(a="apple" & b="pear") | c="grape"', model: { a: 'apple', b: 'pear', c: 'banana' }, res: true },
    { expr: '(a="apple" & b="orange") | c="grape"', model: { a: 'apple', b: 'pear', c: 'orange' }, res: false },

    // Nested parentheses with AND and OR
    { expr: '((a="apple" | b="pear") & (c="grape" | d="melon"))', model: { a: 'apple', b: 'other', c: 'grape', d: 'other' }, res: true },
    { expr: '((a="apple" | b="pear") & (c="banana" | d="melon"))', model: { a: 'orange', b: 'pear', c: 'apple', d: 'melon' }, res: true },
    { expr: '((a="apple" | b="orange") & (c="banana" | d="melon"))', model: { a: 'pear', b: 'apple', c: 'grape', d: 'melon' }, res: false },

    // checking if it exists in model and is not empty
    { expr: 'a="test" & b', model: { a: 'test', b: true }, res: true },
    { expr: 'a="test" & b', model: { a: 'test', b: 'test' }, res: true },
    { expr: 'a="test" & b', model: { a: 'test', b: 0 }, res: true },
    { expr: 'a="test" & b', model: { a: 'test', b: 2 }, res: true },

    // empty values
    { expr: 'a="test" & b', model: { a: 'test', b: '' }, res: false },
    { expr: 'a="test" & b', model: { a: 'test', b: null }, res: false },
    { expr: 'a="test" & b', model: { a: 'test', b: undefined }, res: false },
    
    // with negations
    { expr: 'a!="test"', model: { a: 'test' }, res: false },
    { expr: 'a!="test"', model: { a: 'pear' }, res: true },
    { expr: '!(a!="test")', model: { a: 'test' }, res: true },
    
    // Mixed AND with = and !=
    { expr: 'a="apple" & b!="pear"', model: { a: 'apple', b: 'orange' }, res: true },
    { expr: 'a="apple" & b!="pear"', model: { a: 'apple', b: 'pear' }, res: false },
    { expr: 'a!="apple" & b="pear"', model: { a: 'grape', b: 'pear' }, res: true },
    { expr: 'a!="apple" & b="pear"', model: { a: 'apple', b: 'pear' }, res: false },

    // Mixed OR with = and !=
    { expr: 'a="apple" | b!="pear"', model: { a: 'apple', b: 'pear' }, res: true },
    { expr: 'a="apple" | b!="pear"', model: { a: 'orange', b: 'pear' }, res: false },
    { expr: 'a!="apple" | b="pear"', model: { a: 'grape', b: 'pear' }, res: true },
    { expr: 'a!="apple" | b="pear"', model: { a: 'apple', b: 'orange' }, res: false },

    // Mixed AND and OR with parentheses
    { expr: '(a="apple" | b!="pear") & c="grape"', model: { a: 'apple', b: 'pear', c: 'grape' }, res: true },
    { expr: '(a="apple" | b!="pear") & c="grape"', model: { a: 'orange', b: 'pear', c: 'grape' }, res: false },
    { expr: '(a="apple" & b!="pear") | c="grape"', model: { a: 'apple', b: 'orange', c: 'banana' }, res: true },
    { expr: '(a="apple" & b!="pear") | c="grape"', model: { a: 'apple', b: 'pear', c: 'grape' }, res: true },

    // Nested parentheses with AND, OR, =, and !=
    { expr: '((a="apple" | b!="pear") & (c="grape" | d!="melon"))', model: { a: 'apple', b: 'pear', c: 'grape', d: 'melon' }, res: true },
    { expr: '((a="apple" | b!="pear") & (c="grape" | d!="melon"))', model: { a: 'apple', b: 'pear', c: 'apple', d: 'melon' }, res: false },
    { expr: '((a!="apple" | b="pear") & (c!="banana" | d="melon"))', model: { a: 'orange', b: 'pear', c: 'grape', d: 'melon' }, res: true },
    { expr: '((a="apple" & b!="pear") | (c="banana" & d="melon"))', model: { a: 'apple', b: 'orange', c: 'banana', d: 'melon' }, res: true },

    // Complex expressions with mixed = and !=
    { expr: '(a!="apple" & (b="pear" | c!="grape"))', model: { a: 'grape', b: 'pear', c: 'melon' }, res: true },
    { expr: '(a!="apple" & (b="pear" | c!="grape"))', model: { a: 'apple', b: 'orange', c: 'grape' }, res: false },
    { expr: '(a="apple" | (b="pear" & c!="banana"))', model: { a: 'orange', b: 'pear', c: 'grape' }, res: true },
    { expr: '(a="apple" | (b="orange" & c!="grape"))', model: { a: 'apple', b: 'orange', c: 'grape' }, res: true },
];


describe("expression", () => {
  let order = 0;

  const testGroupsSorted = Object.values(tests.reduce((testGroups, testCase) => {
    const group = testGroups[testCase.expr] || { expr: testCase.expr, tests: [], order: order++};
    group.tests.push(testCase);
    testGroups[testCase.expr] = group;
    return testGroups;
  }, {} as {[key: string]: TestGroup}))
    .sort((a, b) => a.order - b.order);

  for (const testGroup of testGroupsSorted) {
    describe(testGroup.expr, () => {
        for (const testCase of testGroup.tests) {
            test(JSON.stringify(testCase.model) + ' -> ' + testCase.res, () => {
                expect(expression(testCase.expr)(testCase.model)).toEqual(testCase.res);
            });
        }
    }); 
  }

  it('test operator', () => {
    expression('hasChanged("test")', [{ name: 'hasChanged', evaluate: (model, variable) => { 
        console.log(model, variable);
        return false;
    } }])({});
  });
});

