$(document).ready(function(){
	//loadElements(); //ya no los carga desde el archivo elements.js
	loadBehavior();
	loadLogicCRUD();
});

//load elements from elements.js
function loadElements(){
	//loop into elements and add the new Div
	$.each(elements, function(index, value) {
		var newElement = '<div class="draggable">' +
							 '<h3>'+value.name+'</h3>' + 
							 '<h2>'+value.charge+'</h2>'+
						 '</div>';

		$("#elements-container").append(newElement);
	});
}

//load the drag&drop behavior
function loadBehavior(){
	//clear button
	$("#clearButton").click(function(){
		//clear the calculus and element list
		$("#droppable ol").empty();		
		$("#calculus-result").empty();
	});

	//draggable elements
	//$( ".draggable" ).draggable({
    //  appendTo: "body",
    //  helper: "clone"
    //});

    //droppable div
    $( "#droppable" ).droppable({
      drop: function( event, ui ) {
      	$( this ).find( ".placeholder" ).remove();

      	//get the values from the DOM
      	var name = ui.draggable.find("h3").text();
      	var charge = ui.draggable.find("h2").text();
      	var elementsList = $(this).find("ol");

      	//append the new element
        $( '<li data-name="'+name+'" data-charge="'+charge+'" ></li>' ).text( 
        		ui.draggable.find("h3").text() 
        	).appendTo( elementsList );

        //make the "magic"
        makeCalculus();
      }
    });
}

function makeCalculus(){
	//clear the result div
	$("#calculus-result").empty();

	//used variables
	var concatenedNames = "";
	var totalCharge = 0;

	//iterate over elements in container
	var elementsToCalculate = $("#droppable ol li");
	$.each(elementsToCalculate, function(index, value) {
		//get value and cast to integer
		var elementCharge = parseInt($(value).data("charge"));

		concatenedNames += $(value).data("name") + 
						  (elementCharge == 1 ? "" : elementCharge ) ; //if charge is 1 dont show the value
		totalCharge += elementCharge;
	});

	//show the result
	var message = "Description: " + concatenedNames + "<br>Charge: " + totalCharge;

	//show message and animate
	$("#calculus-result").animate({height: "toggle", opacity: "toggle"}, "fast" );
	$("#calculus-result").html(message);
	$("#calculus-result").animate({height: "toggle", opacity: "toggle"}, "slow" );
}


//firebase & storage logic
//load de control remote client
var ElementsClient = new Firebase('https://chemistry.firebaseio.com/');

ElementsClient.on('child_added', function(snapshot) {
  	var message = snapshot.val();
  	console.log(snapshot.name());

  	//add the element to the elements list
	var newElement = '<div class="draggable" data-name="'+snapshot.name()+'" >' +
				 '<h3>'+message.name+'</h3>' + 
				 '<h2>'+message.charge+'</h2>'+
			 '</div>';

	$("#elements-container").append(newElement);
	$( ".draggable" ).draggable({
      appendTo: "body",
      helper: "clone"
    });
});


ElementsClient.on('child_removed', function(snapshot) {
  	
});

function loadLogicCRUD(){
	$("#addElementBtn").click(function(){
		var name = $("#nameText").val() ;
		var charge = $("#chargeText").val();

		//store in firebase
		ElementsClient.push({name: name, charge: charge});	
		
		//clear form
		$("#nameText").val("");
		$("#chargeText").val("");
	});

	$( "#deleteElement" ).droppable({
      drop: function( event, ui ) {
      	//get the values from the DOM
      	var name = ui.draggable.find("h3").text();
      	var charge = ui.draggable.find("h2").text();
      	var elementsList = $(this).find("ol");

      	//get the snapshotName
      	var snapshotName = ui.draggable.data("name");

      	//delete from firebase
      	var snapshotRef = new Firebase('https://chemistry.firebaseio.com/'+snapshotName);
		snapshotRef.remove();

		//animation
		ui.draggable.hide("explode", "slow");
		//ui.draggable.remove();
      }
    });
}

