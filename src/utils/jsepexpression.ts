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

const logicalOperators: string[] = ['||', '&&', '|', '&', '!'];
const valueExpressionTypes: string[] = [
  'Identifier',
  'Literal',
  'MemberExpression',
];

const binaryOperators: Record<string, binaryCallback> = {
  '||': function (a, b) {
    return a || b;
  },
  '&&': function (a, b) {
    return a && b;
  },
  '|': function (a, b) {
    return a || b;
  },
  '&': function (a, b) {
    return a && b;
  },
  '==': function (a, b) {
    return a == b;
  },
  '!=': function (a, b) {
    return a != b;
  },
  '<': function (a, b) {
    return a < b;
  },
  '>': function (a, b) {
    return a > b;
  },
  '<=': function (a, b) {
    return a <= b;
  },
  '>=': function (a, b) {
    return a >= b;
  },
};

const unaryOperators: Record<string, unaryCallback> = {
  '!': function (a) {
    return !a;
  },
};

function evaluate(jsepNode: jsep.Expression, context: Context): unknown {
  const node = jsepNode as AnyExpression;

  switch (node.type) {
    case 'BinaryExpression':
      return evaluateBinary(jsepNode as jsep.BinaryExpression, context);
    case 'MemberExpression':
      return evaluateMember(jsepNode as jsep.MemberExpression, context);
    case 'Identifier':
      return evaluateIdentifier(jsepNode as jsep.Identifier, context);
    case 'Literal':
      return evaluateLiteral(jsepNode as jsep.Literal);
    case 'UnaryExpression':
      return evaluateUnary(jsepNode as jsep.UnaryExpression, context);
    default:
      return undefined;
  }
}

function evaluateLiteral(node: jsep.Literal): unknown {
  return node.value;
}

function evaluateIdentifier(node: jsep.Identifier, context: Context): unknown {
  return context[node.name];
}

function evaluateBinary(
  node: jsep.BinaryExpression,
  context: Context,
): boolean {
  const leftEvaluated = evaluate(node.left, context);
  const rightEvaluated = evaluate(node.right, context);
  const isLogical = logicalOperators.includes(node.operator);
  return binaryOperators[node.operator](
    isLogical ? !!leftEvaluated : leftEvaluated,
    isLogical ? !!rightEvaluated : rightEvaluated,
  );
}

function evaluateMember(
  node: jsep.MemberExpression,
  context: Context,
): unknown {
  const object = evaluate(node.object, context) as Context;
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

function evaluateUnary(node: jsep.UnaryExpression, context: Context): unknown {
  const isLogical = logicalOperators.includes(node.operator);
  const evaluated = evaluate(node.argument, context);
  return unaryOperators[node.operator](isLogical ? !!evaluated : evaluated);
}

function parse(expression: string): EvaluationFunction {
  const ast = jsep(expression);
  if (!expression) {
    return () => false;
  }
  return (context: Context) => {
    const evaluatedValue = evaluate(ast, context);
    return valueExpressionTypes.includes(ast.type)
      ? !!evaluatedValue
      : evaluatedValue;
  };
}

export { parse };
