import Lexer from "./lexer";
import Parser from "./parser";
import * as fs from "fs";

const lexer = Lexer(fs.readFileSync('sample.crsc', 'utf-8'));
const parser = Parser(lexer.lex());

console.dir(parser.parse(), {depth: null});