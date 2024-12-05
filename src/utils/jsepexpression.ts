import * as jsep from 'jsep';

declare type EvaluationFunction = (context: Context) => unknown;

type AnyExpression = 
  | jsep.BinaryExpression
  | jsep.Identifier
  | jsep.Literal
  | jsep.UnaryExpression;
  
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export declare type operand = any;
export declare type unaryCallback = (a: operand) => boolean;
export declare type binaryCallback = (a: operand, b: operand) => boolean;
export declare type Context = Record<string, unknown>;

const logicalOperators: string[] = ['||', '&&', '|', '&'];

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

function normalize(value: unknown, isLogical: boolean): unknown {
    return isLogical ? !!value : value;
}

function parse(expression: string): EvaluationFunction {
    const ast = jsep(expression);
    return (context: Context) => {
        console.log(ast);
        console.log(context);
        return evaluate(ast, context);
    }
}

export { parse };