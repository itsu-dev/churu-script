import {
  Token,
  TOKEN_TYPE_ADD_OPERATOR,
  TOKEN_TYPE_AND_OPERATOR,
  TOKEN_TYPE_BITWISE_NOT_OPERATOR,
  TOKEN_TYPE_BITWISE_XOR_OPERATOR,
  TOKEN_TYPE_COLON,
  TOKEN_TYPE_COMMA,
  TOKEN_TYPE_DIV_OPERATOR,
  TOKEN_TYPE_EQ_OPERATOR,
  TOKEN_TYPE_GT_OPERATOR,
  TOKEN_TYPE_IDENTIFIER,
  TOKEN_TYPE_KEYWORD_FALSE,
  TOKEN_TYPE_KEYWORD_NULL,
  TOKEN_TYPE_KEYWORD_TRUE,
  TOKEN_TYPE_LE_OPERATOR,
  TOKEN_TYPE_LEFT_BRACE,
  TOKEN_TYPE_LEFT_BRACKET,
  TOKEN_TYPE_LEFT_PAREN,
  TOKEN_TYPE_LT_OPERATOR,
  TOKEN_TYPE_MOD_OPERATOR,
  TOKEN_TYPE_MUL_OPERATOR,
  TOKEN_TYPE_NE_OPERATOR,
  TOKEN_TYPE_NOT_OPERATOR,
  TOKEN_TYPE_NUMBER,
  TOKEN_TYPE_POW_OPERATOR,
  TOKEN_TYPE_RIGHT_BRACE,
  TOKEN_TYPE_RIGHT_BRACKET,
  TOKEN_TYPE_RIGHT_PAREN, TOKEN_TYPE_GE_SLASH_OPERATOR,
  TOKEN_TYPE_STRING,
  TOKEN_TYPE_SUB_OPERATOR, TOKEN_TYPE_ASSIGN_OPERATOR
} from "./lexer";

export type Expr = {
  accept<T>(visitor: Visitor<T>): T;
};

export type BinaryExpr = {
  left: Expr;
  operator: Token;
  right: Expr;
} & Expr;

export type GroupingExpr = {
  expression: Expr;
} & Expr;

export type LiteralExpr = {
  type: number;
  value: any;
} & Expr;

export type ObjectLiteralExpr = {
  map: Record<string, Expr>;
} & Expr;

export type XMLObjectLiteralExpr = {
  tag: string;
  attributes: Record<string, Expr>;
  value?: XMLObjectLiteralExpr | LiteralExpr;
} & Expr;

export type ArrayLiteralExpr = {
  array: Expr[];
} & Expr;

export type UnaryExpr = {
  operator: Token;
  right: Expr;
} & Expr;

export interface Visitor<T> {
  visitBinaryExpr(expr: BinaryExpr): T;
  visitGroupingExpr(expr: GroupingExpr): T;
  visitLiteralExpr(expr: LiteralExpr): T;
  visitUnaryExpr(expr: UnaryExpr): T;
}

type ReturnType = {
  parse: () => Expr;
}

export default function Parser(tokens: Array<Token>): ReturnType {
  let current = 0;

  const isAtEnd = (): boolean => {
    return current >= tokens.length;
  }

  const peek = (): Token => {
    return tokens[current];
  }

  const previous = (): Token => {
    return tokens[current - 1];
  }

  const advance = (): Token => {
    if (!isAtEnd()) current++;
    return previous();
  }

  const check = (type: number): boolean => {
    if (isAtEnd()) return false;
    return peek().type === type;
  }

  const match = (...types: Array<number>): boolean => {
    for (const type of types) {
      if (check(type)) {
        advance();
        return true;
      }
    }

    return false;
  }

  const array = (): Expr => {
    const elements: Array<Expr> = [];

    while (!check(TOKEN_TYPE_RIGHT_BRACKET) && !isAtEnd()) {
      elements.push(or());
      match(TOKEN_TYPE_COMMA);
    }

    if (!match(TOKEN_TYPE_RIGHT_BRACKET)) {
      throw new Error('Expect "]" after array elements');
    }

    return { array: elements } as ArrayLiteralExpr;
  }

  const pair = (): [string, Expr] => {
    match(TOKEN_TYPE_IDENTIFIER)
    const key = previous();
    match(TOKEN_TYPE_COLON);
    const value = or();
    return [`${key.lexeme}`, value];
  }

  const object = (): Expr => {
    const elements: Array<[string, Expr]> = [];

    while (!check(TOKEN_TYPE_RIGHT_BRACE) && !isAtEnd()) {
      elements.push(pair());
      match(TOKEN_TYPE_COMMA);
    }

    if (!match(TOKEN_TYPE_RIGHT_BRACE)) {
      throw new Error('Expect "}" after object elements');
    }

    const map: Record<string, Expr> = {};
    elements.forEach(([key, val]) => {
      map[key] = val;
    });
    return { map } as ObjectLiteralExpr;
  }

  const attribute = (): [string, Expr] => {
    match(TOKEN_TYPE_IDENTIFIER);
    const key = previous();
    match(TOKEN_TYPE_ASSIGN_OPERATOR);

    if (match(TOKEN_TYPE_STRING)) {
      return [`${key.lexeme}`, { value: previous().lexeme, type: TOKEN_TYPE_STRING } as LiteralExpr];
    }

    if (match(TOKEN_TYPE_LEFT_BRACE)) {
      const value = or();

      if (!match(TOKEN_TYPE_RIGHT_BRACE)) {
        throw new Error('Expect "}" after attribute value');
      }

      return [`${key.lexeme}`, value];
    }

    // TODO: Implement null
    return [`${key.lexeme}`, { value: null, type: TOKEN_TYPE_KEYWORD_NULL } as LiteralExpr];
  }

  const xmlObject = (): Expr => {
    const rawAttributes: Array<[string, Expr]> = [];

    match(TOKEN_TYPE_IDENTIFIER);

    const tag = previous().lexeme;

    while (!check(TOKEN_TYPE_GT_OPERATOR) && !isAtEnd()) {
      rawAttributes.push(attribute());
    }

    if (!match(TOKEN_TYPE_GT_OPERATOR)) {
      throw new Error('Expect ">" after tag attributes');
    }

    let value: Expr | undefined = undefined;
    if (match(TOKEN_TYPE_STRING)) {
      value = { value: previous().lexeme, type: TOKEN_TYPE_STRING } as LiteralExpr;
    }

    if (match(TOKEN_TYPE_LEFT_BRACE)) {
      value = or();

      if (!match(TOKEN_TYPE_RIGHT_BRACE)) {
        throw new Error('Expect "}" after attribute value');
      }
    }

    if (match(TOKEN_TYPE_LT_OPERATOR)) {
      value = xmlObject();
    }

    if (!match(TOKEN_TYPE_GE_SLASH_OPERATOR)) {
      throw new Error('Expect "</" after tag attributes');
    }

    if (!match(TOKEN_TYPE_IDENTIFIER)) {
      throw new Error('Expect tag name after "</"');
    }

    if (!match(TOKEN_TYPE_GT_OPERATOR)) {
      throw new Error('Expect ">" after tag name');
    }

    const attributes: Record<string, Expr> = {};
    rawAttributes.forEach(([key, val]) => {
      attributes[key] = val;
    });
    return { tag, attributes, value } as XMLObjectLiteralExpr;
  }

  const primary = (): Expr => {
    if (match(TOKEN_TYPE_LEFT_PAREN)) {
      const expr = expression();
      if (!match(TOKEN_TYPE_RIGHT_PAREN)) {
        throw new Error('Expect ")" after expression');
      }
      return { expression: expr } as GroupingExpr;
    }

    if (match(TOKEN_TYPE_LEFT_BRACKET)) {
      return array();
    }

    if (match(TOKEN_TYPE_LEFT_BRACE)) {
      return object();
    }

    if (match(TOKEN_TYPE_LT_OPERATOR)) {
      return xmlObject();
    }

    if (match(TOKEN_TYPE_NUMBER, TOKEN_TYPE_STRING, TOKEN_TYPE_KEYWORD_TRUE, TOKEN_TYPE_KEYWORD_FALSE, TOKEN_TYPE_KEYWORD_NULL, TOKEN_TYPE_IDENTIFIER)) {
      const prev = previous();
      return { value: prev.type === TOKEN_TYPE_NUMBER ? parseFloat(prev.lexeme!) : prev.lexeme, type: prev.type } as LiteralExpr;
    }

    throw new Error('Expect expression');
  }

  const call = (): Expr => {
    let expr = primary();

    while (match(TOKEN_TYPE_LEFT_PAREN)) {
      //expr = finishCall(expr);
    }

    return expr;
  }

  const unary = (): Expr  => {
    if (match(TOKEN_TYPE_NOT_OPERATOR, TOKEN_TYPE_SUB_OPERATOR, TOKEN_TYPE_BITWISE_XOR_OPERATOR, TOKEN_TYPE_BITWISE_NOT_OPERATOR)) {
      const operator = previous();
      const right = unary();
      return { operator, right } as UnaryExpr;
    }

    return call();
  }

  const factor = (): Expr => {
    let expr = unary();

    while (match(TOKEN_TYPE_DIV_OPERATOR, TOKEN_TYPE_MUL_OPERATOR, TOKEN_TYPE_MOD_OPERATOR, TOKEN_TYPE_POW_OPERATOR)) {
      const operator = previous();
      const right = unary();
      expr = {left: expr, operator, right} as BinaryExpr;
    }

    return expr;
  }

  const term = (): Expr => {
    let expr = factor();

    while (match(TOKEN_TYPE_ADD_OPERATOR, TOKEN_TYPE_SUB_OPERATOR)) {
      const operator = previous();
      const right = factor();
      expr = { left: expr, operator, right } as BinaryExpr;
    }

    return expr;
  }

  const comparison = (): Expr => {
    let expr = term();

    while (match(TOKEN_TYPE_GT_OPERATOR, TOKEN_TYPE_GT_OPERATOR, TOKEN_TYPE_LT_OPERATOR, TOKEN_TYPE_LE_OPERATOR)) {
      const operator = previous();
      const right = term();
      expr = { left: expr, operator, right } as BinaryExpr;
    }

    return expr;
  }

  const equality = (): Expr => {
    let expr = comparison();

    while (match(TOKEN_TYPE_NE_OPERATOR, TOKEN_TYPE_EQ_OPERATOR)) {
      const operator = previous();
      const right = comparison();
      expr = { left: expr, operator, right } as BinaryExpr;
    }

    return expr;
  }

  const and = (): Expr => {
    let expr = equality();

    while (match(TOKEN_TYPE_AND_OPERATOR)) {
      const operator = previous();
      const right = equality();
      expr = { left: expr, operator, right } as BinaryExpr;
    }

    return expr;
  }

  const or = (): Expr => {
    let expr: Expr = and();

    while (match(TOKEN_TYPE_AND_OPERATOR)) {
      const operator = previous();
      const right = and();
      expr = { left: expr, operator, right } as BinaryExpr;
    }

    return expr;
  }

  const assignment = (): Expr => {
    // TODO: Implement assignment
    return or();
  }

  const expression = (): Expr => {
    return assignment();
  }

  const parse = (): Expr => {
    return expression();
  }

  return {
    parse
  }
}