function formatFormula() {
	//evaluate key
	//if is enter key, must be add the formula
	if(event.keyCode == 13){
		 addFormulaToList();
		return;
	}

	//get the formula from textbox
	var formulaStr = $("#inputFormula").val();
	formatedFormula = formulaToHtml(formulaStr);
	$("#formatedFormula").html(formatedFormula);
}

function formulaToHtml(formulaStr){
	// Parse equation
	try {
		//make the magic
		var tokenizer = new Tokenizer(formulaStr);
		var formula = parseFormula(tokenizer);
		
		//format the tokens into html
		var formatedFormula = formula.toHtml();
		//$(formatedFormula).attr("data-formula", formulaStr)

		$("#formula-form").removeClass("error");
		$("#formula-form").addClass("success");	

		return formatedFormula;
	} catch (e) {
		if(formulaStr == ""){
			$("#formula-form").removeClass("error");
			$("#formula-form").removeClass("success");
		}else{
			$("#formula-form").removeClass("success");
			$("#formula-form").addClass("error");	
		}
		
		console.log("Error:", e);
	}
}

function addFormulaToList(){
	var formulaStr = $("#inputFormula").val();
	var formulaConcentration = $("#inputFormulaConcentration").val();
	var formatedFormula = formulaToHtml(formulaStr);

	var newDiv = '<div class="formula-container well draggable">'+
				 '<div class="formula-formated" >'+
				 '  <button class="btn pull-right btn-mini btn-edit" type="button">'+
			     '    <i class="icon-edit"></i>'+
			     '  </button>'+
				 '	<button class="btn pull-right btn-mini btn-trash" type="button" >'+
				 '		<i class="icon-trash"></i>'+
				 '	</button>'+
				 '	<div class="formula-name">'+ $(formatedFormula).html() +'</div>'+
				 '	<div class="formula-concentration">'+ formulaConcentration +'</div>'+
				 '</div>'+
				 '<div>'+
				
				'<div class="controls" style="display:none">'+
				'	<div class="input-prepend">'+
				'		<span class="add-on"><i class="icon-beaker"></i></span>'+
				'		<input type="text" id="inputFormula" value="'+ formulaStr +'">'+
				'	</div>'+
				'	<div class="input-prepend">'+
				'		<span class="add-on"><i class="icon-filter"></i></span>'+
				'		<input type="text" id="inputFormulaConcentration" value="'+ formulaConcentration +'">'+
				'	</div>'+

				'  <button class="btn pull-right2 btn-mini btn-ok" type="button">'+
				'    <i class="icon-ok"></i>'+
				'  </button>'+
				'	<button class="btn pull-right2 btn-mini btn-reply" type="button" >'+
				'		<i class="icon-reply"></i>'+
				'	</button>'+

				'</div>'+

				 '</div>'+
				 '</div>';
	//console.log(newDiv);

	//add the new formula to the list
	var newList = $('<li></li>').html(newDiv);
	$("#formula-list").append(newList);

	//clear the UI
	$("#inputFormula").val("");
	$("#formatedFormula").html("");
	$("#inputFormulaConcentration").val("");
	$("#formula-form").removeClass("error");
	$("#formula-form").removeClass("success");

	//add new event
	$(".draggable").draggable({
      appendTo: "body",
      helper: "clone"
    });

    AddFormulaContainerBehavior();
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

/*coeficients logic*/
var ElementsLogic = function(){
	var elements = {};
	
	this.Elements = function(){ return elements; }

	this.GetCoefficients = function(element){ return elements[element]; }
 
	this.addElement = function(element){
		if(elements[element] == undefined){
			elements[element] = 0;
		}
		
		++elements[element];
	}	

	this.RemoveElement = function(element){
		if(elements[element] != undefined){
			elements[element] = undefined;
		}
	}	
	
	return this;
}

var elements = new ElementsLogic();