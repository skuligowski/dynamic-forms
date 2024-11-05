import { evaluate, parse } from "./parser";

interface TestCase {
  expr: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  cond: any;
  res: boolean;
}

interface TestGroup {
  expr: string;
  order: number;
  tests: TestCase[];
}

const tests: TestCase[] = [
    { expr: 'a', cond: { a: true }, res: true },
    { expr: 'a', cond: { a: false, b:true }, res: false },
    
    { expr: '!a', cond: { a: true }, res: false },
    { expr: '!a', cond: { a: false }, res: true },

    { expr: 'a & b', cond: { a: true, b: true }, res: true },
    { expr: 'a & b', cond: { a: true, b: false }, res: false },
    { expr: 'a & b', cond: { a: false, b: true }, res: false },
    { expr: 'a & b', cond: { a: false, b: false }, res: false },

    { expr: 'a & !b', cond: { a: true, b: true }, res: false },
    { expr: 'a & !b', cond: { a: true, b: false }, res: true },
    { expr: 'a & !b', cond: { a: false, b: true }, res: false },
    { expr: 'a & !b', cond: { a: false, b: false }, res: false },

    { expr: 'a | b', cond: { a: true, b: true }, res: true },
    { expr: 'a | b', cond: { a: true, b: false }, res: true },
    { expr: 'a | b', cond: { a: false, b: true }, res: true },
    { expr: 'a | b', cond: { a: false, b: false }, res: false },
    
    { expr: 'a | !b', cond: { a: true, b: true }, res: true },
    { expr: 'a | !b', cond: { a: true, b: false }, res: true },
    { expr: 'a | !b', cond: { a: false, b: true }, res: false },
    { expr: 'a | !b', cond: { a: false, b: false }, res: true },

    { expr: 'a | b & c', cond: { a: true, b: true, c: true }, res: true },
    { expr: 'a | b & c', cond: { a: false, b: true, c: true }, res: true },
    { expr: 'a | b & c', cond: { a: true, b: false, c: true }, res: true },
    { expr: 'a | b & c', cond: { a: true, b: true, c: false }, res: true },
    { expr: 'a | b & c', cond: { a: false, b: false, c: true }, res: false },
    { expr: 'a | b & c', cond: { a: false, b: true, c: false }, res: false },
    { expr: 'a | b & c', cond: { a: true, b: false, c: false }, res: true },
    { expr: 'a | b & c', cond: { a: false, b: false, c: false }, res: false },

    { expr: '(a | b) & c', cond: { a: true, b: true, c: true }, res: true },
    { expr: '(a | b) & c', cond: { a: false, b: true, c: true }, res: true },
    { expr: '(a | b) & c', cond: { a: true, b: false, c: true }, res: true },
    { expr: '(a | b) & c', cond: { a: true, b: true, c: false }, res: false },
    { expr: '(a | b) & c', cond: { a: false, b: false, c: true }, res: false },
    { expr: '(a | b) & c', cond: { a: false, b: true, c: false }, res: false },
    { expr: '(a | b) & c', cond: { a: true, b: false, c: false }, res: false },
    { expr: '(a | b) & c', cond: { a: false, b: false, c: false }, res: false },

    { expr: '!(a | b) & c', cond: { a: true, b: true, c: true }, res: false },
    { expr: '!(a | b) & c', cond: { a: false, b: true, c: true }, res: false },
    { expr: '!(a | b) & c', cond: { a: true, b: false, c: true }, res: false },
    { expr: '!(a | b) & c', cond: { a: true, b: true, c: false }, res: false },
    { expr: '!(a | b) & c', cond: { a: false, b: false, c: true }, res: true },
    { expr: '!(a | b) & c', cond: { a: false, b: true, c: false }, res: false },
    { expr: '!(a | b) & c', cond: { a: true, b: false, c: false }, res: false },
    { expr: '!(a | b) & c', cond: { a: false, b: false, c: false }, res: false },

    { expr: 'a | (b & c)', cond: { a: true, b: true, c: true }, res: true },
    { expr: 'a | (b & c)', cond: { a: false, b: true, c: true }, res: true },
    { expr: 'a | (b & c)', cond: { a: true, b: false, c: true }, res: true },
    { expr: 'a | (b & c)', cond: { a: true, b: true, c: false }, res: true },
    { expr: 'a | (b & c)', cond: { a: false, b: false, c: true }, res: false },
    { expr: 'a | (b & c)', cond: { a: false, b: true, c: false }, res: false },
    { expr: 'a | (b & c)', cond: { a: true, b: false, c: false }, res: true },
    { expr: 'a | (b & c)', cond: { a: false, b: false, c: false }, res: false },

    { expr: 'a | !(b & c)', cond: { a: true, b: true, c: true }, res: true },
    { expr: 'a | !(b & c)', cond: { a: false, b: true, c: true }, res: false },
    { expr: 'a | !(b & c)', cond: { a: true, b: false, c: true }, res: true },
    { expr: 'a | !(b & c)', cond: { a: true, b: true, c: false }, res: true },
    { expr: 'a | !(b & c)', cond: { a: false, b: false, c: true }, res: true },
    { expr: 'a | !(b & c)', cond: { a: false, b: true, c: false }, res: true },
    { expr: 'a | !(b & c)', cond: { a: true, b: false, c: false }, res: true },
    { expr: 'a | !(b & c)', cond: { a: false, b: false, c: false }, res: true },

    { expr: 'A & ((B | C) & !(A | B & C))', cond: { A: true, B: false, C: true }, res: false},
];


describe("parser", () => {
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
            test(JSON.stringify(testCase.cond).replace(/["{}]/g, '').replace(/,/g, ' ') + ' -> ' + testCase.res, () => {
                expect(evaluate(parse(testCase.expr), testCase.cond)).toEqual(testCase.res);
            });
        }
    }); 
  }
});
