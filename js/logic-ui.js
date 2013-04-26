$("#clear-btn").click(function(){
  $("#canvas-list ol").empty();
});

//$( "#canvas-list ol li" ).droppable({
$( "#canvas-list" ).droppable({
      activeClass: "ui-state-hover",
      hoverClass: "ui-state-active",
      drop: function( event, ui ) {
        //for sort behavior
        if(ui.draggable.attr("class") == "ui-sortable-helper"){
          return;
        }

      	//get the values from the DOM
      	var elementsList = $(this).find("ol");
        //var elementsList = $(this);

        //sum the new item to the elements list
        var formulaStr = ui.draggable.find(".formula-name").text();
        elements.addElement(formulaStr);

      	//append the new element
        $('<li></li>').html( 
          function(){
            //ui.draggable.find(".title").text()
            if(ui.draggable.data("operator") != undefined){
              return ui.draggable.data("operator");
            }else{
              var formulaFormated = ui.draggable.find(".formula-name").html();

              //check if need Add the coefficients
              var coef = elements.GetCoefficients(formulaStr);
              if(coef > 1){
                //formulaFormated = "<span>"+coef+"</span>" + formulaFormated;
                //find the formula class
                $("."+formulaStr).html(coef);
              }else{
                //$($(formulaFormated)[0]).attr("data-test", "test")
                //return '<div><span class="coef"></span>'+formulaFormated+'</div>';
                return '<span class="coef '+formulaStr+'"></span>'+formulaFormated;
              }
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