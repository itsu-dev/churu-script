// tokens
export const TOKEN_TYPE_IDENTIFIER = 0;
export const TOKEN_TYPE_NUMBER = 1;
export const TOKEN_TYPE_STRING = 2;

// operators
export const TOKEN_TYPE_ADD_OPERATOR = 3; // +
export const TOKEN_TYPE_SUB_OPERATOR = 4; // -
export const TOKEN_TYPE_MUL_OPERATOR = 5; // *
export const TOKEN_TYPE_DIV_OPERATOR = 6; // /
export const TOKEN_TYPE_MOD_OPERATOR = 7; // %
export const TOKEN_TYPE_POW_OPERATOR = 8; // **

// comparison operators
export const TOKEN_TYPE_EQ_OPERATOR = 9; // ==
export const TOKEN_TYPE_NE_OPERATOR = 10; // !=
export const TOKEN_TYPE_STRICT_EQ_OPERATOR = 11; // ===
export const TOKEN_TYPE_STRICT_NE_OPERATOR = 12; // !==
export const TOKEN_TYPE_GT_OPERATOR = 13; // >
export const TOKEN_TYPE_GE_OPERATOR = 14; // >=
export const TOKEN_TYPE_LT_OPERATOR = 15; // <
export const TOKEN_TYPE_LE_OPERATOR = 16; // <=
export const TOKEN_TYPE_AND_OPERATOR = 17; // &&
export const TOKEN_TYPE_OR_OPERATOR = 18; // ||
export const TOKEN_TYPE_NOT_OPERATOR = 19; // !
export const TOKEN_TYPE_BITWISE_AND_OPERATOR = 20; // &
export const TOKEN_TYPE_BITWISE_OR_OPERATOR = 21; // |
export const TOKEN_TYPE_BITWISE_XOR_OPERATOR = 22; // ^
export const TOKEN_TYPE_BITWISE_NOT_OPERATOR = 23; // ~
export const TOKEN_TYPE_LEFT_SHIFT_OPERATOR = 24; // <<
export const TOKEN_TYPE_RIGHT_SHIFT_OPERATOR = 25; // >>
export const TOKEN_TYPE_ASSIGN_OPERATOR = 26; // =

// punctuation
export const TOKEN_TYPE_COMMA = 27; // ,

// delimiters
export const TOKEN_TYPE_LEFT_PAREN = 28; // (
export const TOKEN_TYPE_RIGHT_PAREN = 29; // )
export const TOKEN_TYPE_LEFT_BRACE = 30; // {
export const TOKEN_TYPE_RIGHT_BRACE = 31; // }
export const TOKEN_TYPE_LEFT_BRACKET = 32; // [
export const TOKEN_TYPE_RIGHT_BRACKET = 33; // ]

// keywords
export const TOKEN_TYPE_KEYWORD_VAR = 34; // var
export const TOKEN_TYPE_KEYWORD_FUN = 35; // fun
export const TOKEN_TYPE_KEYWORD_RETURN = 36; // return
export const TOKEN_TYPE_KEYWORD_IF = 37; // if
export const TOKEN_TYPE_KEYWORD_ELSE = 38; // else
export const TOKEN_TYPE_KEYWORD_WHILE = 39; // while
export const TOKEN_TYPE_KEYWORD_FOR = 40; // for
export const TOKEN_TYPE_KEYWORD_BREAK = 41; // break
export const TOKEN_TYPE_KEYWORD_CONTINUE = 42; // continue
export const TOKEN_TYPE_KEYWORD_TRUE = 43; // true
export const TOKEN_TYPE_KEYWORD_FALSE = 44; // false
export const TOKEN_TYPE_KEYWORD_NULL = 45; // null
export const TOKEN_TYPE_KEYWORD_WITH = 54; // undefined

// punctuation
export const TOKEN_TYPE_COLON = 46; // :
export const TOKEN_TYPE_SEMICOLON = 47; // ;
export const TOKEN_TYPE_DOT = 48; // .
export const TOKEN_TYPE_QUESTION_ELVIS = 49; // ?:
export const TOKEN_TYPE_QUESTION_MARK = 50; // ?

// end of file
export const TOKEN_TYPE_EOF = 100;

export const TOKEN_TYPE_GE_SLASH_OPERATOR = 52; // </
export const TOKEN_TYPE_ARROW = 53; // =>

export type Token = {
	type: number;
	line: number;
	lexeme?: string;
};

const KEYWORDS: Record<string, number> = {
	var: TOKEN_TYPE_KEYWORD_VAR,
	fun: TOKEN_TYPE_KEYWORD_FUN,
	return: TOKEN_TYPE_KEYWORD_RETURN,
	if: TOKEN_TYPE_KEYWORD_IF,
	else: TOKEN_TYPE_KEYWORD_ELSE,
	while: TOKEN_TYPE_KEYWORD_WHILE,
	for: TOKEN_TYPE_KEYWORD_FOR,
	break: TOKEN_TYPE_KEYWORD_BREAK,
	continue: TOKEN_TYPE_KEYWORD_CONTINUE,
	true: TOKEN_TYPE_KEYWORD_TRUE,
	false: TOKEN_TYPE_KEYWORD_FALSE,
	null: TOKEN_TYPE_KEYWORD_NULL,
	with: TOKEN_TYPE_KEYWORD_WITH,
};

type ReturnType = {
	lex: () => Array<Token>;
};

export default function Lexer(code: string): ReturnType {
	const characters = code.split("");
	let index = 0;
	let start = 0;
	let line = 1;

	const isAtEnd = () => {
		return index >= characters.length;
	};

	const advance = () => {
		return characters[index++];
	};

	const peek = () => {
		return !isAtEnd() ? characters[index] : undefined;
	};

	const match = (expected: string) => {
		if (isAtEnd()) return false;
		if (characters[index] !== expected) return false;

		index++;
		return true;
	};

	const string = () => {
		while (peek() !== '"' && !isAtEnd()) {
			if (peek() === "\n") line++;
			advance();
		}

		if (isAtEnd()) {
			throw new Error("Unterminated string");
		}

		advance();
		return characters.slice(start + 1, index - 1).join("");
	};

	const lex = (): Array<Token> => {
		const result: Array<Token> = [];

		while (!isAtEnd()) {
			start = index;

			const c = advance();
			switch (c) {
				case "(":
					result.push({ type: TOKEN_TYPE_LEFT_PAREN, line });
					break;
				case ")":
					result.push({ type: TOKEN_TYPE_RIGHT_PAREN, line });
					break;
				case "{":
					result.push({ type: TOKEN_TYPE_LEFT_BRACE, line });
					break;
				case "}":
					result.push({ type: TOKEN_TYPE_RIGHT_BRACE, line });
					break;
				case "[":
					result.push({ type: TOKEN_TYPE_LEFT_BRACKET, line });
					break;
				case "]":
					result.push({ type: TOKEN_TYPE_RIGHT_BRACKET, line });
					break;
				case ",":
					result.push({ type: TOKEN_TYPE_COMMA, line });
					break;
				case ".":
					result.push({ type: TOKEN_TYPE_DOT, line });
					break;
				case ":":
					result.push({ type: TOKEN_TYPE_COLON, line });
					break;
				case ";":
					result.push({ type: TOKEN_TYPE_SEMICOLON, line });
					break;
				case "+":
					result.push({ type: TOKEN_TYPE_ADD_OPERATOR, line });
					break;
				case "-":
					result.push({ type: TOKEN_TYPE_SUB_OPERATOR, line });
					break;
				case "%":
					result.push({ type: TOKEN_TYPE_MOD_OPERATOR, line });
					break;
				case "^":
					result.push({ type: TOKEN_TYPE_BITWISE_XOR_OPERATOR, line });
					break;
				case "~":
					result.push({ type: TOKEN_TYPE_BITWISE_NOT_OPERATOR, line });
					break;
				case "*":
					result.push({
						type: match("*")
							? TOKEN_TYPE_POW_OPERATOR
							: TOKEN_TYPE_MUL_OPERATOR,
						line,
					});
					break;
				case "<":
					result.push({
						type: match("=")
							? TOKEN_TYPE_LE_OPERATOR
							: match("<")
								? TOKEN_TYPE_LEFT_SHIFT_OPERATOR
								: match("/")
									? TOKEN_TYPE_GE_SLASH_OPERATOR
									: TOKEN_TYPE_LT_OPERATOR,
						line,
					});
					break;
				case ">":
					result.push({
						type: match("=")
							? TOKEN_TYPE_GE_OPERATOR
							: match(">")
								? TOKEN_TYPE_RIGHT_SHIFT_OPERATOR
								: TOKEN_TYPE_GT_OPERATOR,
						line,
					});
					break;
				case "=":
					result.push({
						type: match("=")
							? TOKEN_TYPE_EQ_OPERATOR
							: match(">")
								? TOKEN_TYPE_ARROW
								: TOKEN_TYPE_ASSIGN_OPERATOR,
						line,
					});
					break;
				case "!":
					result.push({
						type: match("=") ? TOKEN_TYPE_NE_OPERATOR : TOKEN_TYPE_NOT_OPERATOR,
						line,
					});
					break;
				case "&":
					result.push({
						type: match("&")
							? TOKEN_TYPE_AND_OPERATOR
							: TOKEN_TYPE_BITWISE_AND_OPERATOR,
						line,
					});
					break;
				case "|":
					result.push({
						type: match("|")
							? TOKEN_TYPE_OR_OPERATOR
							: TOKEN_TYPE_BITWISE_OR_OPERATOR,
						line,
					});
					break;
				case "?":
					result.push({
						type: match(":")
							? TOKEN_TYPE_QUESTION_ELVIS
							: TOKEN_TYPE_QUESTION_MARK,
						line,
					});
					break;
				case "/":
					if (match("/")) {
						while (!isAtEnd() && peek() !== "\n") advance();
					} else {
						result.push({ type: TOKEN_TYPE_DIV_OPERATOR, line });
					}
					break;
				case " ":
				case "\r":
				case "\t":
					break;
				case "\n":
					line++;
					break;

				case '"':
					result.push({ type: TOKEN_TYPE_STRING, lexeme: string(), line });
					break;

				default:
					if (c >= "0" && c <= "9") {
						while (
							!isAtEnd() &&
							characters[index] >= "0" &&
							characters[index] <= "9"
						) {
							advance();
						}

						if (
							characters[index] === "." &&
							characters[index + 1] >= "0" &&
							characters[index + 1] <= "9"
						) {
							advance();

							while (
								!isAtEnd() &&
								characters[index] >= "0" &&
								characters[index] <= "9"
							) {
								advance();
							}
						}

						result.push({
							type: TOKEN_TYPE_NUMBER,
							lexeme: characters.slice(start, index).join(""),
							line,
						});
					} else if (
						(c >= "a" && c <= "z") ||
						(c >= "A" && c <= "Z") ||
						c === "_"
					) {
						while (
							!isAtEnd() &&
							((characters[index] >= "a" && characters[index] <= "z") ||
								(characters[index] >= "A" && characters[index] <= "Z") ||
								characters[index] === "_" ||
								(characters[index] >= "0" && characters[index] <= "9"))
						) {
							advance();
						}

						const lexeme = characters.slice(start, index).join("");
						const type = KEYWORDS[lexeme] || TOKEN_TYPE_IDENTIFIER;

						result.push({ type, lexeme, line });
					} else {
						throw new Error(`Unexpected character ${c} at line ${line}`);
					}
			}
		}

		result.push({ type: TOKEN_TYPE_EOF, line });

		return result;
	};

	return {
		lex,
	};
}
