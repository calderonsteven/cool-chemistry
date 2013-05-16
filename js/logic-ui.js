
$("#clear-btn").click(function(){
  $(".canvas-list").remove();
});

function AddPlusSignToRxn(list){
  //remove all plus signs and empty elements
  //$(list).parent().find(".componet:empty").remove();
  $(list).find(".plusSign").remove();

  var componentsInRxn = $(list).parent().find(".componet:visible");
  for (var i = 0; i < componentsInRxn.length-1; i++) {
    $(componentsInRxn[i]).after('<li class="plusSign">+</li>');
  };
}

function SetDropableTheRxnList(){
  $(".rxn").droppable({
      activeClass: "ui-state-hover",
      hoverClass: "ui-state-active",
      drop: function( event, ui ) {
        //for sort behavior
        if(ui.draggable.attr("class").match("ui-sortable-helper")){
          AddPlusSignToRxn(this);
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
                        formulaStr.replace("+", "plus");
        elements.addElement(formulaDictionaryKey);

        //append the new element
        $('<li class="componet" ></li>').html( 
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
                return '<span class="coef '+formulaDictionaryKey+'"></span>'+
                        formulaFormated +
                       '<sup class="isSolidState"></sup>';
              }
            }
          }
        ).appendTo( elementsList );
        AddComponentInRxnBehavior();

        //add sortable behavior
        $(".rxn ol").sortable();
        //$(".rxn ol").disableSelection();

        //add plus signs
        AddPlusSignToRxn(this);
      }
  });
}
SetDropableTheRxnList();

var ComponentInRxnLogic = {
  CloseEdit: function(){
    $('.componet').popover("hide");
    $(".CurrentComponent").removeClass("CurrentComponent");
  },
  
  SaveChanges: function(e){
    //save the new isSolidState
    var isSolid = $(e).parent().parent().find(".isSolid").is(':checked');
    var isSolidSymbol = (isSolid ? "↓" : "");
    
    //asigna el estado solido
    $(".CurrentComponent").find(".isSolidState").text(isSolidSymbol);
    ComponentInRxnLogic.CloseEdit();
  },
  
  RemoveComponent: function (e){
    //debugger;
    var res = confirm("are you sure?");       
    if(res){
      //the magic effect
      $(".CurrentComponent").effect("drop", function(){
        //remove all
        AddPlusSignToRxn($(".CurrentComponent").parent());

        //remove the coef class from the actual element
        $(".CurrentComponent .coef").removeClass("coef")
        
        //get the element key from the DOM
        var elementKey = $(".CurrentComponent span").attr("class");
        
        //remove the element from the list
        elements.RemoveElement(elementKey);

        //close the dialog
        ComponentInRxnLogic.CloseEdit();

        //remove from the DOM
        var currentItem = $(".CurrentComponent");
        $(currentItem).remove();
      });
    }       
  }
};

function AddComponentInRxnBehavior(){
    $(".componet").popover({      
    placement: 'top',
    html : true,
    title : 'Edit Component',
    content : function(){
      //ugly hack
      $(".CurrentComponent").removeClass("CurrentComponent");
      $(this).addClass("CurrentComponent");

      //get the status
      var isSolid = $(this).find(".isSolidState").text() != "";

      var html = 
              '<div class="control-group">'+
              '  <label class="checkbox">'+
              '   <input class="isSolid" type="checkbox" '+ (isSolid ? "checked" : "") +' > Is Solid?'+
              '  </label>'+
              '</div>'+
              '<button type="button" class="btn btn-small btn-primary" onclick="ComponentInRxnLogic.SaveChanges(this)" >Save</button>'+
              '<button type="button" class="btn btn-small btn-danger" onclick="ComponentInRxnLogic.RemoveComponent(this)" >Remove</button>'+
              '<button type="button" class="btn btn-small" onclick="ComponentInRxnLogic.CloseEdit()" >Cancel</button>';
      return html;
    },
  });
}

$(".draggable").draggable({
      appendTo: "body",
      helper: "clone"
});

//refactor this
$(".rxn ol").sortable();
//$(".rxn ol").disableSelection();

function AddFormulaContainerBehavior(){
  //remove the component from the list
  $('.formula-container .btn-trash').click(function(){
    $(this).parent().effect("drop", function(){
      $(this).parent().remove();
    });
  });

  //edit component from the list
  $('.formula-container .btn-edit').click(function(){
    $(this).parent().hide();
    $(this).parent().parent().find(".controls").show();
  });

  //undo changes
  $('.formula-container .btn-reply').click(function(){
    //debugger;
    $(this).parent().parent().parent().find(".formula-formated").show();
    $(this).parent().parent().find(".controls").hide();
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

/*Equilibrium Logic*/
var EquilibriumLogic = {
  CloseEdit: function(){
    $('.equilibrium').popover("hide");
  },
  
  SaveChanges: function(e){
    //save the new equilibrium
    var equilibriumSup = $(e).parent().find(".eqSup").val();
    var equilibriumSub = $(e).parent().find(".eqSub").val();

    $(e).parent().parent().parent().parent().find(".equilibrium sup").text(equilibriumSup);
    $(e).parent().parent().parent().parent().find(".equilibrium sub").text(equilibriumSub);

    EquilibriumLogic.CloseEdit();
  },
  
  DeleteFormula: function (){
    var res = confirm("are you sure?");       
    if(res){
      EquilibriumLogic.CloseEdit();
    }       
  },

  CalculateSub: function(e){
    var inverso = (1 / e.value).toFixed(2); //suponiendo que es asi el calculo
    $(e).parent().parent().find(".eqSub").val(inverso);
  },

  CalculateSup: function(e){
    var inverso = (1 / e.value).toFixed(2); //suponiendo que es asi el calculo
    $(e).parent().parent().find(".eqSup").val(inverso);
  }
}


/*Add reaction*/
function AddEquilibriumBehavior(){
  $(".equilibrium").popover({      
    html : true,
    title : 'Edit equilibrium constant',
    content : function(){
      var eqSupValue = $(this).find("sup").text();
      var eqSubValue = $(this).find("sub").text();

      var html = 
              '<div class="control-group">'+
              '  <div class="input-prepend">'+
              '   <span class="add-on"><i class=" icon-arrow-right"></i></span>'+
              '    <input class="eqSup" type="number" step="any" value="'+ eqSupValue +'" onkeypress="EquilibriumLogic.CalculateSub(this)" >'+
              '  </div>'+
              '  <div class="input-prepend">'+
              '   <span class="add-on"><i class=" icon-arrow-left"></i></span>'+
              '    <input class="eqSub" type="number" step="any" value="'+ eqSubValue +'" onkeypress="EquilibriumLogic.CalculateSup(this)">'+
              '  </div>'+
              '</div>'+
              '<button type="button" class="btn btn-small btn-primary" onclick="EquilibriumLogic.SaveChanges(this)" >Save</button>'+
              '<button type="button" class="btn btn-small" onclick="EquilibriumLogic.CloseEdit()" >Cancel</button>';
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

/*ProductX Behavior*/
/*Storage Logic*/
var ProductXLogic = {
  CloseEdit: function(){
    $('.productX').popover("hide");
  },
  
  SaveChanges: function(e){
    //save the Values from ProductX
    //debugger;
    var isSolid = $(e).parent().parent().find(".isSolid").is(':checked');
    var isSolidSymbol = (isSolid ? "↓" : "");
    $(e).parent().parent().parent().parent().parent().find(".productX sup").text(isSolidSymbol);

    ProductXLogic.CloseEdit();
  },
  
  DeleteFormula: function (){
    var res = confirm("are you sure?");       
    if(res){
      ProductXLogic.CloseEdit();
    }       
  }
}

function AddProductXBehavior(){
  //add the popover to the productX
  $(".productX").popover({      
    html : true,
    title : 'Edit ProductX',
    content : function(){
      //get the value from the DOM
      var isSolid = $(this).find("sup").text() != "";

      var html = 
        '<div id="formula-form" class="control-group">'+
        ' <div class="controls">'+
        '  <div class="input-prepend">'+
        '   <span class="add-on"><i class="icon-beaker"></i></span>'+
        '   <input type="text" id="inputFormula" placeholder="Type your formula here!" onkeyup="formatFormula()">'+
        '  </div>'+
        '  <div class="input-prepend">'+
        '   <span class="add-on"><i class="icon-filter"></i></span>'+
        '   <input type="text" id="inputFormulaConcentration" placeholder="Concentration">'+
        '  </div>'+
        '  <label class="checkbox">'+
        '   <input class="isSolid" type="checkbox" '+ (isSolid ? "checked" : "") +' > Is Solid?'+
        '  </label>'+
        ' </div>'+
        ' <div class="control-group">'+
        '  <button type="button" class="btn btn-small btn-primary" onclick="ProductXLogic.SaveChanges(this)" >Save</button>'+
        '  <button type="button" class="btn btn-small" onclick="ProductXLogic.CloseEdit()" >Cancel</button>'+
        ' </div>'+
        '</div>';
      return html;
    },
  });
}
AddProductXBehavior();
/*End ProductX Behavior*/


$("#add-rxn-btn").click(function(){
  //use the dataRxId to manage the rxn components 
  var dataRxId = Date.now();
  var canvasListTemplete = 
  '<div class="well well-large canvas-list" data-rxn-id="'+ dataRxId +'">'+
    '  <ol class="fls">'+
    '    <li class="rxn rxnLetfSide"><ol></ol></li>'+
    '    <li class="equilibrium"><span><sub></sub>⇄<sup></sup></span></li>'+
    //'    <li class="rxn rxnRightSide"><ol><li class="productX" >ProductX<sup></sup></li></ol></li>'+
    '    <li class="rxn rxnRightSide"><ol></ol></li>'+
    '  </ol>'+
    '  <button class="btn pull-right btn-trash" type="button">'+
    '    <i class="icon-trash"></i>'+
    '  </button>'+
    '</div>';

  $("#chem-canvas").append(canvasListTemplete);
  SetDropableTheRxnList();
  AddEquilibriumBehavior();
  AddProductXBehavior();
});


/*Output logic*/
$("#ViewOutputLink").click(function(){
  var result = "";

  //calculate the vector
  
  ///1. Vector de concentracion
  result += "Vector De Concentracion<br>";
  $.each($(".formula-container"), function(index, value) {
    var item = $(value).find(".formula-concentration");
    if(item.length == 0){
      result += "0";
    }else{
      result += ($(item).html() == "" ? "0" : $(item).html() )+ ", ";
    }
  });

  ///2. Vector de cargas
  result += "<br><br>Vector De Cargas<br>";
  $.each($(".formula-container"), function(index, value) {
    var item = $(value).find(".formula-name sup");
    result += (item.length == 0 ? "0" : $(item).html()) + ", ";
  });

  ///3. Vector de Constantes de equilibrio
  result += "<br><br>Vector De Constantes de equilibrio<br>";
  $.each($(".equilibrium sup"), function(index, value) {
    result += ($(value).html() == "" ? "0" : $(value).html() )+ ", ";
  });

  ///4. matiz de coeficientes
  result += "<br><br>Vector De Coeficientes<br>";
  $.each($(".canvas-list"), function(index, value) {
    $.each($(value).find(".coef"), function(i, v){
      result += ($(v).html() == "" ? "0" : $(v).html() )+ ", "; 
    });
    result += "<br>";
  });


  $("#outputResult").html(result);
});

