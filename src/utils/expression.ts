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

const expression = (
  expression: string
): ((model: EvaluationModel) => boolean) => {
  let count = 0;

  const conditions: Condition[] = [];
  const newExpression = expression
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
