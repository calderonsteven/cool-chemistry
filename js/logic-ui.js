$("#clear-btn").click(function(){
  $("#canvas-list ol").empty();
});

$( "#canvas-list" ).droppable({
      drop: function( event, ui ) {
        //for sort behavior
        if(ui.draggable.attr("class") == "ui-sortable-helper"){
          return;
        }

      	//get the values from the DOM
      	/*var name = ui.draggable.find("h3").text();
      	var charge = ui.draggable.find("h2").text();*/
      	var elementsList = $(this).find("ol");

      	//append the new element
        //$( '<li data-name="'+name+'" data-charge="'+charge+'" ></li>' ).text( 
        $('<li></li>').html( 
          function(){
            //ui.draggable.find(".title").text()
            if(ui.draggable.data("operator") != undefined){
              return ui.draggable.data("operator");
            }else{
              return ui.draggable.find(".formula-name").html();
            }
          }
        ).appendTo( elementsList );

        //add sortable behavior
        $("#canvas-list ol").sortable();
        $("#canvas-list ol").disableSelection();
      }
});

$(".draggable").draggable({
      appendTo: "body",
      helper: "clone"
});

$("#canvas-list ol").sortable();
$("#canvas-list ol").disableSelection();

function AddFormulaContainerBehavior(){
  //behavior for Edit button
  $(".formula-container").hover(
    function(){ $(this).find(".edit-btn").show(); },
    function(){ $(this).find(".edit-btn").hide(); }
  );

  $('.formula-container button').tooltip({title:"Click to edit."});

  $('.formula-container button').popover({      
    html : true,
    title : 'Edit or Delete current item',
    content : function(){
      var html = //'<form class="form-horizontal">'+
              '<div class="control-group">'+
              '    <input type="text" id="inputEditName" placeholder="Name">'+
              '</div>'+
              '<div class="control-group">'+
              '    <input type="text" id="inputEditFormula" placeholder="Formula">'+
              '</div>'+                               
              '  <button type="button" class="btn btn-small btn-primary" onclick="StorageLogic.SaveChanges()" >Save</button>'+
              '  <button type="button" class="btn btn-small btn-danger" onclick="StorageLogic.DeleteFormula()" >Delete</button>'+
              '  <button type="button" class="btn btn-small" onclick="StorageLogic.CloseEdit()" >Cancel</button>'//+
            //'</form>';
      return html;
    },
  });   
}

/*Storage Logic*/
var StorageLogic = {
  CloseEdit: function(){
    $('.formula-container button').popover("hide");
  },
  
  SaveChanges: function(){
    $("#savedChanges-alert").alert();
    StorageLogic.CloseEdit();
  },
  
  DeleteFormula: function (){
    var res = confirm("are you sure?");       
    if(res){
      ///TODO: Show Alert
      StorageLogic.CloseEdit();
    }       
  }
}