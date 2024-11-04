class TreeNode {
  value: string;
  left: TreeNode | null;
  right: TreeNode | null;

  constructor(value: string) {
    this.value = value;
    this.left = null;
    this.right = null;
  }
}

const tokenize = (expression: string): string[] => {
  const tokens: string[] = [];
  let current = "";
  for (const char of expression.replace(/\s+/g, "")) {
    if (
      char === "(" ||
      char === ")" ||
      char === "&" ||
      char === "|" ||
      char === "!"
    ) {
      if (current) tokens.push(current);
      tokens.push(char);
      current = "";
    } else {
      current += char;
    }
  }
  if (current) tokens.push(current);
  return tokens;
};

const buildExpressionTree = (tokens: string[]): TreeNode => {
  const operators: string[] = [];
  const operands: TreeNode[] = [];

  const precedence: { [key: string]: number } = { "|": 1, "&": 2, "!": 3 };

  const applyOperator = () => {
    const operator = operators.pop()!;
    const node = new TreeNode(operator);

    if (operator === "!") {
      // Negation is unary, so only one operand
      node.right = operands.pop()!;
    } else {
      // Binary operators like & and |
      node.right = operands.pop()!;
      node.left = operands.pop()!;
    }
    operands.push(node);
  };

  tokens.forEach((token) => {
    if (token === "(") {
      operators.push(token);
    } else if (token === ")") {
      while (operators[operators.length - 1] !== "(") {
        applyOperator();
      }
      operators.pop(); // Remove '('
    } else if (token === "&" || token === "|" || token === "!") {
      while (
        operators.length &&
        precedence[operators[operators.length - 1]] >= precedence[token]
      ) {
        applyOperator();
      }
      operators.push(token);
    } else {
      // It's an operand (e.g., a condition ID)
      operands.push(new TreeNode(token));
    }
  });

  while (operators.length) {
    applyOperator();
  }

  return operands[0]; // The root of the BET
};

const evaluateExpressionTree = (
  node: TreeNode,
  conditionResults: { [key: string]: boolean }
): boolean => {
  if (!node.left && !node.right) {
    return conditionResults[node.value]; // Leaf node with a condition ID
  }

  const leftValue = node.left
    ? evaluateExpressionTree(node.left, conditionResults)
    : null;
  const rightValue = evaluateExpressionTree(node.right!, conditionResults);

  if (node.value === "&") {
    return (leftValue as boolean) && rightValue;
  }
  if (node.value === "|") {
    return (leftValue as boolean) || rightValue;
  }
  if (node.value === "!") {
    return !rightValue;
  }

  throw new Error(`Unknown operator: ${node.value}`);
};

const parse = (expression: string): TreeNode => {
  const tokens = tokenize(expression);
  return buildExpressionTree(tokens);
};

const evaluate = (tree: TreeNode, conditions: { [key: string]: boolean }) => {
  return evaluateExpressionTree(tree, conditions);
};

export { parse, evaluate }; 