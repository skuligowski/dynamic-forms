import jsep from 'jsep';

declare type EvaluationFunction = (context: Context) => unknown;

type AnyExpression = 
  | jsep.BinaryExpression
  | jsep.Identifier
  | jsep.Literal
  | jsep.UnaryExpression
  | jsep.MemberExpression;
  
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export declare type operand = any;
export declare type unaryCallback = (a: operand) => boolean;
export declare type binaryCallback = (a: operand, b: operand) => boolean;
export declare type Context = Record<string, unknown>;

const logicalOperators: string[] = ['||', '&&', '|', '&'];
const valueExpressionTypes: string[] = ['Identifier', 'Literal'];

const binaryOperators: Record<string, binaryCallback> = {
    '||': function (a, b) { return a || b; },
    '&&': function (a, b) { return a && b; },
    '|': function (a, b) { return a || b; },
    '&': function (a, b) { return a && b; },
    '==': function (a, b) { return a == b; },
    '!=': function (a, b) { return a != b; },
    '<': function (a, b) { return a < b; },
    '>': function (a, b) { return a > b; },
    '<=': function (a, b) { return a <= b; },
    '>=': function (a, b) { return a >= b; },
};

const unaryOperators: Record<string, unaryCallback> = {
    '!': function (a) { return !a; },
};

function evaluate(jsepNode: jsep.Expression, context: Context): unknown {
    const node = jsepNode as AnyExpression;

    switch(node.type) {
        case 'BinaryExpression':
            return evaluateBinary(jsepNode, context);
        case 'MemberExpression':
            return evaluateMember(jsepNode, context);
        case 'Identifier':
            return context[node.name];
        case 'Literal':
            return node.value;
        case 'UnaryExpression':
            return unaryOperators[node.operator](!!evaluate(node.argument, context));
    }
}

function evaluateBinary(jsepNode: jsep.Expression, context: Context): boolean {
    const node = jsepNode as jsep.BinaryExpression;
    const isLogical = logicalOperators.includes(node.operator);
    const leftEvaluated = normalize(evaluate(node.left, context), isLogical);
    const rightEvaluated = normalize(evaluate(node.right, context), isLogical);
    return binaryOperators[node.operator](leftEvaluated, rightEvaluated);
}

function evaluateMember(jsepNode: jsep.Expression, context: Context) {
    const node = jsepNode as jsep.MemberExpression;
    const object = evaluate(node.object, context) as {[key: string]: unknown};
    let key: string;
    if (node.computed) {
      key = evaluate(node.property, context) as string;
    } else {
      key = (node.property as jsep.Identifier).name;
    }
    if (/^__proto__|prototype|constructor$/.test(key)) {
      throw Error(`Access to member "${key}" disallowed.`);
    }
    return object[key];
  }

function normalize(value: unknown, isLogical: boolean): unknown {
    return isLogical ? !!value : value;
}

function parse(expression: string): EvaluationFunction {
    const ast = jsep(expression);
    if (!expression) {
        return () => false;
    }
    return (context: Context) => {
        const evaluatedValue = evaluate(ast, context);
        return valueExpressionTypes.includes(ast.type) ? !!evaluatedValue : evaluatedValue;
    }
}

export { parse };