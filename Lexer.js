/**
* Universidad del Valle de Guatemala
* Diseño de lenguajes de programación
* Pablo Viana - 16091
* Proyecto número 3
*
* Scanner de tokens
*
*
* Referencias: https://github.com/DmitrySoshnikov/letter-rdp-source
* Referencias: http://dmitrysoshnikov.com/
*/

/**
* Configuraciones de expresiones regulares para Lexer
*/
const config = [
	//-------- espacio en blanco
	[/^\s+/, null],

	//-------- numeros
	[/^\d+/, 'NUMBER'],

	//-------- simbolos delimitadores
	[/^;/, ';'],
	[/^\{/, '{'],
	[/^\}/, '}'],
	[/^\(/, '('],
	[/^\)/, ')'],

	//-------- caracteres
	[/^"[^"]*"/, 'STRING'],
	[/^'[^']*'/, 'STRING'],

	//-------- comentarios 1 linea
	[/^\/\/.*/, null],

	//-------- comentarios multilinea
	[/^\/\*[\s\S]*?\*\//, null],

	//-------- operadores
	[/^[+\-]/, 'OPERADOR'],
	[/^[*\/]/, 'OPERADOR_PRECEDENCIA'],
];

class Lexer {


	/**
	* Init para el string
	*/
	init(string) {
		this._string = string;
		this._position = 0;
	}

	/**
	* Funcion para saber si es EOF
	*/
	isEOF() {
		return this._position === this._string.length;
	}

	/**
	* Funcion para saber si es la ultima posicion
	*/
	moreTokens() {
		return this._position < this._string.length;
	}

	/**
	* Siguiente Token 
	*/
	nextToken() {

		if (!this.moreTokens()) {
			console.log("No hay más tokens por leer");
			return null;
		}

		//Utilizamos el atributo position para cortar nuestra cadena hasta donde estamos leyendo la cadena
		const string = this._string.slice(this._position);

		for (const [regexp, tokenType] of config) {
			const tokenValue = this._match(regexp, string);

			if (tokenValue == null) {
				continue;
			}

			if (tokenType == null) {
				return this.nextToken()
			}

			return {
				type: tokenType,
				value: tokenValue
			};
		}

		throw new SyntaxError(`Token desconocido: "${string[0]}"`)
	}

	/**
	* Hace el match de un token con una expresión regular
	*/
	_match(regexp, string) {
		const matched = regexp.exec(string);
		if (matched == null) {
			return null;
		}
		
		this._position += matched[0].length;
		return matched[0];
	}

}

module.exports = {
	Lexer,
}
