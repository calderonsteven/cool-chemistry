
// A term in a chemical equation. It has a list of groups or elements, and a charge.
// For example: H3O^+, or e^-.
function Term(items, charge) {
	if (items.length == 0 && charge != -1)
		throw "Invalid term";  // Electron case
	
	items = cloneArray(items);
	
	this.getItems = function() { return cloneArray(items); }
	
	this.getElements = function(resultSet) {
		resultSet.add("e");
		for (var i = 0; i < items.length; i++)
			items[i].getElements(resultSet);
	}
	
	// Counts the number of times the given element (specified as a string) occurs in this term, taking groups and counts into account, returning an integer.
	this.countElement = function(name) {
		if (name == "e") {
			return -charge;
		} else {
			var sum = 0;
			for (var i = 0; i < items.length; i++)
				sum = checkedAdd(sum, items[i].countElement(name));
			return sum;
		}
	}
	
	// Returns an HTML element representing this term.
	this.toHtml = function() {
		var node = document.createElement("span");
		if (items.length == 0 && charge == -1) {
			appendText("e", node);
			var sup = document.createElement("sup");
			appendText(MINUS, sup);
			node.appendChild(sup);
		} else {
			for (var i = 0; i < items.length; i++)
				node.appendChild(items[i].toHtml());
			if (charge != 0) {
				var sup = document.createElement("sup");
				var s;
				if (Math.abs(charge) == 1) s = "";
				else s = Math.abs(charge).toString();
				if (charge > 0) s += "+";
				else s += MINUS;
				appendText(s, sup);
				node.appendChild(sup);
			}
		}
		return node;
	}
}


// A group in a term. It has a list of groups or elements.
// For example: (OH)3
function Group(items, count) {
	if (count < 1)
		throw "Assertion error: Count must be a positive integer";
	items = cloneArray(items);
	
	this.getItems = function() { return cloneArray(items); }
	
	this.getCount = function() { return count; }
	
	this.getElements = function(resultSet) {
		for (var i = 0; i < items.length; i++)
			items[i].getElements(resultSet);
	}
	
	this.countElement = function(name) {
		var sum = 0;
		for (var i = 0; i < items.length; i++)
			sum = checkedAdd(sum, checkedMultiply(items[i].countElement(name), count));
		return sum;
	}
	
	// Returns an HTML element representing this group.
	this.toHtml = function() {
		var node = document.createElement("span");
		appendText("(", node);
		for (var i = 0; i < items.length; i++)
			node.appendChild(items[i].toHtml());
		appendText(")", node);
		if (count != 1) {
			var sub = document.createElement("sub");
			appendText(count.toString(), sub);
			node.appendChild(sub);
		}
		return node;
	}
}


// A chemical element.
// For example: Na, F2, Ace, Uuq6
function Element(name, count) {
	if (count < 1)
		throw "Assertion error: Count must be a positive integer";
	
	this.getName = function() { return name; }
	
	this.getCount = function() { return count; }
	
	this.getElements = function(resultSet) { resultSet.add(name); }
	
	this.countElement = function(n) { return n == name ? count : 0; }
	
	// Returns an HTML element representing this element.
	this.toHtml = function() {
		var node = document.createElement("span");
		appendText(name, node);
		if (count != 1) {
			var sub = document.createElement("sub");
			appendText(count.toString(), sub);
			node.appendChild(sub);
		}
		return node;
	}
}


/* Parser functions */

// Parses the given formula string and returns an equation object, or throws an exception.
function parse(formulaStr) {
	var tokenizer = new Tokenizer(formulaStr);
	return parseEquation(tokenizer);
}


// Parses and returns an equation.
function parseEquation(tok) {
	var lhs = [];
	var rhs = [];
	
	lhs.push(parseTerm(tok));
	while (true) {
		var next = tok.peek();
		if (next == "=") {
			tok.consume("=");
			break;
		} else if (next == null) {
			//throw {message: "Plus or equal sign expected", start: tok.position()};
			break;
		} else if (next == "+") {
			tok.consume("+");
			lhs.push(parseTerm(tok));
		} else
			throw {message: "Plus expected", start: tok.position()};
	}
	
	/*rhs.push(parseTerm(tok));
	while (true) {
		var next = tok.peek();
		if (next == null)
			break;
		else if (next == "+") {
			tok.consume("+");
			rhs.push(parseTerm(tok));
		} else
			throw {message: "Plus or end expected", start: tok.position()};
	}*/
	
	return new Equation(lhs, rhs);
}


// Parses and returns a term.
function parseTerm(tok) {
	var startPosition = tok.position();
	
	// Parse groups and elements
	var items = [];
	while (true) {
		var next = tok.peek();
		if (next == null)
			break;
		else if (next == "(")
			items.push(parseGroup(tok));
		else if (/^[A-Za-z][a-z]*$/.test(next))
			items.push(parseElement(tok));
		else
			break;
	}
	
	// Parse optional charge
	var charge = 0;
	var next = tok.peek();
	if (next != null && next == "^") {
		tok.consume("^");
		next = tok.peek();
		if (next == null)
			throw {message: "Number or sign expected", start: tok.position()};
		else
			charge = parseOptionalNumber(tok);
		
		next = tok.peek();
		if (next == "+")
			charge = +charge;  // No-op
		else if (next == "-")
			charge = -charge;
		else
			throw {message: "Sign expected", start: tok.position()};
		tok.take();  // Consume the sign
	}
	
	// Check if term is valid
	var elems = new Set();
	for (var i = 0; i < items.length; i++)
		items[i].getElements(elems);
	elems = elems.toArray();  // List of all elements used in this term, with no repeats
	if (items.length == 0) {
		throw {message: "Invalid term - empty", start: startPosition, end: tok.position()};
	} else if (indexOf(elems, "e") != -1) {  // If it's the special electron element
		if (items.length > 1)
			throw {message: "Invalid term - electron needs to stand alone", start: startPosition, end: tok.position()};
		else if (charge != 0 && charge != -1)
			throw {message: "Invalid term - invalid charge for electron", start: startPosition, end: tok.position()};
		// Tweak data
		items = [];
		charge = -1;
	} else {  // Otherwise, a term must not contain an element that starts with lowercase
		for (var i = 0; i < elems.length; i++) {
			if (/^[a-z]+$/.test(elems[i]))
				throw {message: 'Invalid element name "' + elems[i] + '"', start: startPosition, end: tok.position()};
		}
	}
	
	return new Term(items, charge);
}


// Parses and returns a group.
function parseGroup(tok) {
	var startPosition = tok.position();
	tok.consume("(");
	var items = [];
	while (true) {
		var next = tok.peek();
		if (next == null)
			throw {message: "Element, group, or closing parenthesis expected", start: tok.position()};
		else if (next == "(")
			items.push(parseGroup(tok));
		else if (/^[A-Za-z][a-z]*$/.test(next))
			items.push(parseElement(tok));
		else if (next == ")") {
			tok.consume(")");
			if (items.length == 0)
				throw {message: "Empty group", start: startPosition, end: tok.position()};
			break;
		} else
			throw {message: "Element, group, or closing parenthesis expected", start: tok.position()};
	}
	
	return new Group(items, parseOptionalNumber(tok));
}


// Parses and returns an element.
function parseElement(tok) {
	var name = tok.take();
	if (!/^[A-Za-z][a-z]*$/.test(name))
		throw "Assertion error";
	return new Element(name, parseOptionalNumber(tok));
}


// Parses a number if it's the next token, returning a non-negative integer, with a default of 1.
function parseOptionalNumber(tok) {
	var next = tok.peek();
	if (next != null && /^[0-9]+$/.test(next))
		return checkedParseInt(tok.take());
	else
		return 1;
}


/* Tokenizer object */

// Tokenizes a formula into a stream of token strings.
function Tokenizer(str) {
	var i = 0;
	
	// Returns the index of the next character to tokenize.
	this.position = function() {
		return i;
	}
	
	// Returns the next token as a string, or null if the end of the token stream is reached.
	this.peek = function() {
		if (i == str.length)  // End of stream
			return null;
		
		var match = /^([A-Za-z][a-z]*|[0-9]+|[+\-^=()])/.exec(str.substring(i));
		if (match == null)
			throw {message: "Invalid symbol", start: i};
		return match[0];
	}
	
	// Returns the next token as a string and advances this tokenizer past the token.
	this.take = function() {
		var result = this.peek();
		if (result == null)
			throw "Advancing beyond last token"
		i += result.length;
		skipSpaces();
		return result;
	}
	
	// Takes the next token and checks that it matches the given string, or throws an exception.
	this.consume = function(s) {
		if (this.take() != s)
			throw "Token mismatch";
	}
	
	function skipSpaces() {
		var match = /^[ \t]*/.exec(str.substring(i));
		i += match[0].length;
	}
	
	skipSpaces();
}



/* Set object */

function Set() {
	// Storage for the set
	var items = [];
	
	// Adds the given object to the set. Returns nothing.
	this.add = function(obj) {
		if (indexOf(items, obj) == -1)
			items.push(obj);
	}
	
	// Tests if the given object is in the set, returning a Boolean.
	this.contains = function(obj) {
		return items.indexOf(obj) != -1;
	}
	
	// Returns an array containing the elements of this set in an arbitrary order, with no duplicates.
	this.toArray = function() {
		return cloneArray(items);
	}
}


/* Math functions (especially checked integer operations) */

var INT_MAX = 9007199254740992;  // 2^53

// Returns the given string parsed into a number, or throws an exception if the result is too large.
function checkedParseInt(str) {
	var result = parseInt(str, 10);
	if (isNaN(result))
		throw "Not a number";
	if (result <= -INT_MAX || result >= INT_MAX)
		throw "Arithmetic overflow";
	return result;
}

// Returns the sum of the given integers, or throws an exception if the result is too large.
function checkedAdd(x, y) {
	var z = x + y;
	if (z <= -INT_MAX || z >= INT_MAX)
		throw "Arithmetic overflow";
	return z;
}

// Returns the product of the given integers, or throws an exception if the result is too large.
function checkedMultiply(x, y) {
	var z = x * y;
	if (z <= -INT_MAX || z >= INT_MAX)
		throw "Arithmetic overflow";
	return z;
}


// Returns the greatest common divisor of the given integers.
function gcd(x, y) {
	if (typeof x != "number" || typeof y != "number" || isNaN(x) || isNaN(y))
		throw "Invalid argument";
	x = Math.abs(x);
	y = Math.abs(y);
	while (y != 0) {
		var z = x % y;
		x = y;
		y = z;
	}
	return x;
}


/* Miscellaneous */

// Unicode character constants (because this script file's character encoding is unspecified)
var MINUS = "\u2212";        // Minus sign
var RIGHT_ARROW = "\u2192";  // Right arrow


// A JavaScript 1.6 function for Array, which every browser has except for Internet Explorer.
function indexOf(array, item) {
	for (var i = 0; i < array.length; i++) {
		if (array[i] == item)
			return i;
	}
	return -1;
}


// Returns a shallow copy of the given array. Usually used for making defensive copies.
function cloneArray(array) {
	return array.slice(0);
}


// Removes all the children of the given DOM node. Returns nothing.
function removeAllChildren(node) {
	while (node.childNodes.length > 0)
		node.removeChild(node.firstChild);
}


// Creates a new text node with the given text and appends it to the given DOM node. Returns nothing.
function appendText(text, node) {
	node.appendChild(document.createTextNode(text));
}
