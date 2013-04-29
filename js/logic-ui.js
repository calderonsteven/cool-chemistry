$("#clear-btn").click(function(){
  $(".canvas-list").remove();
});

function SetDropableTheRxnList(){
  $(".rxn").droppable({
      activeClass: "ui-state-hover",
      hoverClass: "ui-state-active",
      drop: function( event, ui ) {
        //debugger;
        //for sort behavior
        if(ui.draggable.attr("class") == "ui-sortable-helper"){
          return;
        }

        //get the values from the DOM
        var elementsList = $(this).find("ol");
        //var elementsList = $(this);

        //sum the new item to the elements list
        var formulaStr = ui.draggable.find(".formula-name").text();
        var rxnid = $(this).parent().parent().data("rxn-id");

        //Cehck the side of the new coomponent
        var formulaDictionaryKey = 
                        rxnid + "-" +
                        (elementsList.parent().hasClass("rxnLetfSide") ? "Left-" : "Right-")
                        +
                        formulaStr;
        elements.addElement(formulaDictionaryKey);

        //append the new element
        $('<li></li>').html( 
          function(){
            //ui.draggable.find(".title").text()
            if(ui.draggable.data("operator") != undefined){
              return ui.draggable.data("operator");
            }else{
              //get the formated formula
              var formulaFormated = ui.draggable.find(".formula-name").html();

              //get the coef and check if need to add the coefficients
              var coef = elements.GetCoefficients(formulaDictionaryKey);

              if(coef > 1){
                //find the formula class and add the coeficient
                $("."+formulaDictionaryKey).html(coef);
              }else{
                //add as a new componet
                return '<span class="coef '+formulaDictionaryKey+'"></span>'+formulaFormated;
              }
            }
          }
        ).appendTo( elementsList );

        //add sortable behavior
        $(".rxn ol").sortable();
        $(".rxn ol").disableSelection();
      }
  });
}
SetDropableTheRxnList();

$(".draggable").draggable({
      appendTo: "body",
      helper: "clone"
});

//refactor this
$(".rxn ol").sortable();
$(".rxn ol").disableSelection();

function AddFormulaContainerBehavior(){
  //remove the component from the list
  $('.formula-container button').click(function(){
    //debugger;
    $(this).parent().effect("drop", function(){
      $(this).parent().remove();
    });
  });

  return; //disabled
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
      var html = 
              '<div class="control-group">'+
              '    <input type="text" id="inputEditName" placeholder="Name">'+
              '</div>'+
              '<div class="control-group">'+
              '    <input type="text" id="inputEditFormula" placeholder="Formula">'+
              '</div>'+                               
              '  <button type="button" class="btn btn-small btn-primary" onclick="StorageLogic.SaveChanges()" >Save</button>'+
              '  <button type="button" class="btn btn-small btn-danger" onclick="StorageLogic.DeleteFormula()" >Delete</button>'+
              '  <button type="button" class="btn btn-small" onclick="StorageLogic.CloseEdit()" >Cancel</button>';
      return html;
    },
  });
}

/*Storage Logic*/
var StorageLogic = {
  CloseEdit: function(){
    $('.equilibrium').popover("hide");
  },
  
  SaveChanges: function(e){
    //save the new equilibrium
    var equilibrium = $(e).parent().find("input").val();
    $(e).parent().parent().parent().parent().find(".equilibrium sup").text(equilibrium);

    StorageLogic.CloseEdit();
  },
  
  DeleteFormula: function (){
    var res = confirm("are you sure?");       
    if(res){
      StorageLogic.CloseEdit();
    }       
  }
}


/*Add reaction*/
function AddEquilibriumBehavior(){
  $(".equilibrium").popover({      
    html : true,
    title : 'Edit equilibrium constant',
    content : function(){
      var html = 
              '<div class="control-group">'+
              '    <input type="number" step="any" value="0.0">'+
              '</div>'+
              '<button type="button" class="btn btn-small btn-primary" onclick="StorageLogic.SaveChanges(this)" >Save</button>'+
              '<button type="button" class="btn btn-small" onclick="StorageLogic.CloseEdit()" >Cancel</button>';
      return html;
    },
  });

  //add the remove bahavior
  $("#chem-canvas .btn-trash").click(function(){
    $(this).parent().effect("drop", function(){
      $(this).remove();
    });
  });
}

AddEquilibriumBehavior();

$("#add-rxn-btn").click(function(){
  //use the dataRxId to manage the rxn components 
  var dataRxId = Date.now();
  var canvasListTemplete = 
  '<div class="well well-large canvas-list" data-rxn-id="'+ dataRxId +'">'+
    '  <ol class="fls">'+
    '    <li class="rxn rxnLetfSide"><ol></ol></li>'+
    '    <li class="equilibrium"><span>⇄<sup></sup></span></li>'+
    '    <li class="rxn rxnRightSide"><ol><li>ProductX</li></ol></li>'+
    '  </ol>'+
    '  <button class="btn pull-right btn-trash" type="button">'+
    '    <i class="icon-trash"></i>'+
    '  </button>'+
    '</div>';

  $("#chem-canvas").append(canvasListTemplete);
  SetDropableTheRxnList();
  AddEquilibriumBehavior();
});