function evaluateFormula() {
	//debugger;
	
	//clear the UI
	setMessage("");
	var balancedElem = document.getElementById("balanced");
	var codeOutElem  = document.getElementById("codeOutput");
	removeAllChildren(balancedElem);
	removeAllChildren(codeOutElem);

 	//get the formula from textbox
	var formulaStr = document.getElementById("inputFormula").value;

	// Parse equation
	var eqn;
	try {
		//debugger;
		//eqn = parse(formulaStr);
		//console.log(eqn);
		var tokenizer = new Tokenizer(formulaStr);
		var formula = parseFormula(tokenizer);
		
		console.log(formula.toHtml());
		codeOutElem.appendChild(formula.toHtml());
	} catch (e) {
		console.log("Error:", e);
	}	
}

// Parses and returns an equation.
function parseFormula(tok) {
	var lhs = [];
	
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
	
	//return lhs[0];//for two or more expressions
	return lhs[0];
}