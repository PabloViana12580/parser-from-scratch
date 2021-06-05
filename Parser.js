/**
* Universidad del Valle de Guatemala
* Diseño de lenguajes de programación
* Pablo Viana - 16091
* Proyecto número 3
*
* Parser sintáctico por desenso recursivo 
*
*
* Referencias: https://github.com/DmitrySoshnikov/letter-rdp-source
* Referencias: http://dmitrysoshnikov.com/
*/

const {Lexer} = require('./Lexer')

class Parser {

	/**
	* Inicializamos el parser
	*/
	constructor() {
		this._string = '';
		this._lexer = new Lexer();
	}

	/**
	* Parsear un string a un AST
	*/
	parse(string){
		this._string = string;
		this._lexer.init(string);

		// Utilizamos nuestra función para consumir el siguiente
		// token como look-a-head
		this._lookahead = this._lexer.nextToken();

		//Parseo recursivo empezando en el main
		return this.Program();
	}


	/**
	* Main entry point
	* Program
	* : StatementList 
	* ;
	*/
	Program() {
		return {
			type: 'Program',
			body: this.StatementList(),
		};
	}

	/**
	* StatementList
	* : Statement
	* | StatementList Statement -> Statement Statement
	* ;
	* => stopLookAhead : simbolo para parar terminar parseo
	*/
	StatementList(stopLookAhead = null) {
		const statementList = [this.Statement()];

		//Hasta que ya todavía haya tokens, parsear el siguiente Statement y "pushearlo" a la lista
		while(this._lookahead != null && this._lookahead.type !== stopLookAhead){ 
			statementList.push(this.Statement());
		}

		return statementList;
	}

	/**
	* Statement
	* : ExpressionStatement
	* | BlockStatement
	* ;
	*/
	Statement() {
		//el tipo de mi posición actual
		switch(this._lookahead.type){
			//inicio de bloque que función
			case '{':
				return this.BlockStatement();
			case ';':
				return this.StatementVacio();
			default:
				return this.ExpressionStatement();
		}
	}

	/**
	* StatementVacio
	* : ';'
	* ;
	*/
	StatementVacio() {
		this._consume(';');
		return {
			type: 'StatementVacio',
		}
	}

	/**
	* BlockStatement
	* : E: '{' OptionalStatement '}'
	* ;
	*/
	BlockStatement() {
		this._consume('{');

		// Si token siguiente '}' => no hay nada entre corchetes
		// pasamos '}' StatementList para terminar parseo de statements en corchete final
		const body = this._lookahead.type !== '}' ? this.StatementList('}') : [];

		this._consume('}');

		return {
			type: 'BlockStatement',
			body,
		};


	}

	/**
	* ExpressionStatement
	* : E: ';'
	* ;
	*/
	ExpressionStatement() {
		const expression = this.Expression();
		this._consume(';');
		return {
			type: 'ExpressionStatement',
			expression,
		}
	}


	/**
	* Caracter
	* : CaracterNumerico
	* | Caracter
	* ;
	*/
	Caracter() {
		switch (this._lookahead.type) {
			case 'NUMBER':
				return this.CaracterNumerico();
			case 'STRING':
				return this.CaracterString();
		}

		throw new SyntaxError (
			`No se soporta el tipo de caracter`
		);
	}

	/**
	* Expression
	* : Caracter
	* ;
	*/
	Expression() {
		return this.OperacionBinaria();
	}

	/**
	* OperacionBinaria
	* : MultiplicativeExpression
	* | OperacionBinaria 'OPERADOR' Caracter
	*/
	OperacionBinaria() {
		let left = this.MultiplicativeExpression();

		while(this._lookahead.type === 'OPERADOR') {

			const operador = this._consume('OPERADOR').value;

			const right = this.MultiplicativeExpression();

			left = {
				type: 'OperacionBinaria',
				operador,
				left,
				right,
			};
		}

		return left;
	}

	/**
	* MultiplicativeExpression
	* : PrimaryExpression
	* | MultiplicativeExpression 'OPERADOR_PRECEDENCIA' PrimaryExpression
	*/
	MultiplicativeExpression() {
		let left = this.PrimaryExpression();

		while(this._lookahead.type === 'OPERADOR_PRECEDENCIA') {

			const operador = this._consume('OPERADOR_PRECEDENCIA').value;

			const right = this.PrimaryExpression();

			left = {
				type: 'OperacionBinaria',
				operador,
				left,
				right,
			};
		}

		return left;

	}

	/**
	* PrimaryExpression
	* : Caracter
	* | ExpresionParentesis 
	*/
	PrimaryExpression(){
		switch (this._lookahead.type){
			case '(':
				return this.ExpresionParentesis();
			default:
				return this.Caracter();

		}
		return this.Caracter();
	}

	/**
	* ExpresionParentesis
	* : '(' Expression ')'
	*/
	ExpresionParentesis() {
		this._consume('(');
		const expression = this.Expression();
		this._consume(')')
		return expression;
	}

	/**
	* CaracterNumerico
	* : NUMBER
	* ;
	*/
	CaracterNumerico() {
		const token = this._consume('NUMBER');
		return {
			type: 'CaracterNumerico',
			value: Number(token.value),
		};
	}


	/**
	* Caracter
	* : STRING
	* ;
	*/
	CaracterString() {
		const token = this._consume('STRING');
		return {
			type: 'CaracterString',
			value: token.value.slice(1, -1),
		};
	}

	/**
	* Funcion que chequea que el look-a-head (current token) sea de un tipo en especifico
	* Y nos permite "avanzar" de caracter en el string que se está utilizando
	*/
	_consume(tokenType) {
		// guardamos en variable el lookahead
		const token = this._lookahead;

		// Si el token es null, levantamos error
		if (token == null) {
			throw new SyntaxError (
				`Error se esperaba fin de input, tipo esperado "${tokenType}"`
			);
		}

		// Si el token es de un tipo diferente al esperado, levantamos error
		if (token.type !== tokenType) {
			throw new SyntaxError (
				`Token no esperado "${token.value}, esperado "${tokenType}"`
			);
		}

		this._lookahead = this._lexer.nextToken();

		return token;

	}
}


module.exports = {
	Parser,
}