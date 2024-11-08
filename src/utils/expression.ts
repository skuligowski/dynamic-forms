import {
  buildExpressionTree,
  evaluateExpressionTree,
  tokenize,
} from "./parser";

declare type EvaluationModel = { [key: string]: string | number | boolean };

interface Condition {
  key: string;
  fn: (model: EvaluationModel) => boolean;
}

type OperatorEval = (model: EvaluationModel, ...variables: string[]) => boolean;
interface Operator {
    name: string;
    evaluate: OperatorEval;
}

const expression = (
  expression: string,
  operators?: Operator[],
): ((model: EvaluationModel) => boolean) => {
  let count = 0;

  const conditions: Condition[] = [];
  let newExpression = expression
    .replace(
      /(\w+)(!=|=)(["'])((?:(?!\3)[^\\]|\\.)+)\3/g,
      (_all, variable, operator, _delimiter, value) => {
        const exprName = `_${count++}`;
        conditions.push({
          key: exprName,
          fn: (model: EvaluationModel) => model[variable] === value,
        });
        return operator === '!=' ? `!${exprName}` : exprName;
      }
    )
    .replace(/\b(?!_[0-9]+\b)(\w+)/g, (_all, variable) => {
      const exprName = `_${count++}`;
      conditions.push({
        key: exprName,
        fn: (model: EvaluationModel) =>
          model[variable] !== null &&
          model[variable] !== undefined &&
          model[variable] !== "",
      });
      return exprName;
    });

  if (operators && operators.length) {
    newExpression = operators.reduce((currentExpression, operator) => {
        return currentExpression.replace(
            new RegExp(`${operator.name}\\(([^\\(]+)\\)`, 'g'),
            (_all, variables) => {
                console.log('-------')
                console.log(_all);
                console.log(variables);
                const exprName = `_${count++}`;
                conditions.push({
                    key: exprName,
                    fn: (model: EvaluationModel) => operator.evaluate(model, ...variables.split(',')),
                });
                console.log('-------')
                return exprName;
            }
        )
    }, newExpression);
  }

  const tokens = tokenize(newExpression);
  const tree = buildExpressionTree(tokens);
  return (model) => {
    const evaluatedConds = conditions.reduce((map, condition) => {
      map[condition.key] = condition.fn(model);
      return map;
    }, {} as { [key: string]: boolean });
    const newModel = Object.keys(model).reduce(
      (map, modelKey) => ({ ...map, [modelKey]: !!model[modelKey] }),
      {}
    );
    return evaluateExpressionTree(tree, { ...newModel, ...evaluatedConds });
  };
};



export { expression };
