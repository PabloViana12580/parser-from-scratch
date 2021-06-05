/**
* Universidad del Valle de Guatemala
* Diseño de lenguajes de programación
* Pablo Viana - 16091
* Proyecto número 3  
*
* Archivo para correr pruebas de clases
*/

const {Parser} = require('../Parser');

const parser = new Parser();

const program = `
	
	42 * (15 / 32);

`;

const ast = parser.parse(program);

console.log(JSON.stringify(ast, null, 2));