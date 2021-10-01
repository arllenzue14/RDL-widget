
 var data = {
    claims: [], 
    onRDL: 'rdl',
    invoice: []
}

document.getElementById("rdl_btn").addEventListener("click", function() {  
   document.getElementById("decisionDate_area").classList.remove("d-none");
});
document.getElementById("rbl_btn").addEventListener("click", function() {
   document.getElementById("decisionDate_area").classList.add("d-none");
});

// testing remove once done
document.getElementById("rating_col").addEventListener("click", function() {
   console.log(data,"this is Data")

    var config = 
    {
    "Entity": "Claims",
    "RecordID": data.claims[0].id
    }

    ZOHO.embeddedApp.init()
    .then(function(){
        ZOHO.CRM.API.getBluePrint(config).then(function(ress){
            console.log(ress, "blueprint");
        })
    })
    .catch(function(error){
         alert(error.status + " - " +error.message + " - getBluePrint");
     });
     
});

//claim type update field
function option_select(el, value){
   var elem = el.parentElement.parentElement;
   var id = elem.querySelector("input[class='d-none data_id']").value;    
   var index = _.findIndex(data.claims, {id:id});
   data.claims[index].type = value;

   if(value == "Y"){ // is RDL
        elem.querySelector("select[id='status_btn']").classList.remove("d-none");
        elem.querySelector("select[id='rating_btn']").classList.remove("d-none");
        elem.querySelector("input[id='edate_value']").classList.remove("d-none");
   }else if(value == "N"){ // is RBL
       elem.querySelector("select[id='status_btn']").classList.add("d-none");
       elem.querySelector("select[id='rating_btn']").classList.add("d-none");
       elem.querySelector("input[id='edate_value']").classList.add("d-none");
   }
}

//apply decision date to RDL claims
function ddate_call(value){
   data.claims.forEach(function(res,index){
       if(res.type == "Y"){ // Apply only for RDL claims
           data.claims[index].decicion_date = value;
       }
   });
}

// onRDL/rbl show decision date 
function isRdl_call(value){
   data.onRDL = value;
}

//update claim field
function field_call(el,value,field){

   var fields = {
       "1" : "status", 
       "2" : "effective_date", 
       "3" : "rating", 
       "4" : "invoice"
   }

   var elem = el.parentElement.parentElement;
   var id = elem.querySelector("input[class='d-none data_id']").value;
   var index = _.findIndex(data.claims, {id:id}); // claim index
   if(id != -1){
       data.claims[index][fields[field]] = value;
   }

   var no_edate = [
        "Claim Denied",
        "Claim Deferred",
        "Claim Remanded",
        "Confirmed/Continued"
   ]

   if(field == "1" && _.indexOf(no_edate, value) > -1){
       elem.querySelector("input[id='edate_value']").classList.add("d-none");
   }else if(field == "1"){
       elem.querySelector("input[id='edate_value']").classList.remove("d-none");
   }
}

//fourth call fetch data
function displayData(res_data, invoice_data){
   
   document.getElementById("tb_result").classList.remove("d-none");
   document.getElementById("submit_area").classList.remove("d-none");
   document.getElementById("no_result").classList.add("d-none");

   var option_class = (res_data.Claim_Status == "Claim Remanded" || res_data.Claim_Status == "Claim Deferred") ? "d-none" : "";

   document.getElementById("decisionDate_area").classList.remove("d-none");
   document.getElementById("isRdl_area").classList.remove("d-none");
   
   var option_content = document.createElement("tr");
   var laterality = (res_data.Laterality != null && res_data.Laterality != "N/A") ? " - "+res_data.Laterality : "";
   var Date_Packet_Sent = (res_data.Date_Packet_Sent != null) ? res_data.Date_Packet_Sent+" - " : "";
   option_content.innerHTML = '<th scope="row"><input class="d-none data_id" value="'+res_data.id+'"><span>'+Date_Packet_Sent+res_data.Claim_Categories+" - "+res_data.Claim_SubType+laterality+'</span> </th> '+
   '<td> <select id="isRdl_btn" class="form-select" onchange="option_select(this,value)"> '+
   '<option value="Y">Yes</option> '+ // Y = RDL
   '<option value="N">No</option> </select> </td> '+ // N = RBL
   '<td> <select id="status_btn" aria-label="status" class="form-select" onchange="field_call(this,value,1)"> '+
   '<option disabled selected value></option> '+
   '<option value="Claim Approved">Approved</option> '+
   '<option value="Claim Denied">Denied</option> '+
   '<option class="'+option_class+'" value="Claim Deferred">Deferred</option> '+
   '<option class="'+option_class+'" value="Claim Remanded">Remanded</option> '+
   '<option value="Confirmed/Continued">Confirmed and Continued</option> '+
   '<option value="Rating Reduced">Rating Reduced</option> '+
   '<option value="Rating Severed">Rating Severed</option> </select> </td> '+
   '<td> <input type="date" id="edate_value" onchange="field_call(this,value,2)" class="edate_value w-100 rounded p-1"></td> '+
   '<td> <select id="rating_btn" aria-label="rating" class="form-select" onchange="field_call(this,value,3)">'+
   '<option disabled selected value></option>'+
   '<option value="0%">0%</option><option value="10%">10%</option>'+
   '<option value="20%">20%</option><option value="30%">30%</option>'+
   '<option value="40%">40%</option><option value="50%">50%</option>'+
   '<option value="60%">60%</option><option value="70%">70%</option>'+
   '<option value="80%">80%</option><option value="90%">90%</option>'+
   '<option value="100%">100%</option> </select></td>';

   if(invoice_data.data){
        document.getElementById("invoice_col").classList.remove("d-none");
        var invoiceHtml = '<td> <select id="invoice_btn" aria-label="invoice" class="form-select" onchange="field_call(this,value,4)"><option disabled selected value></option>';
        invoice_data.data.forEach(function(res){
            invoiceHtml += '<option value="'+res.Name+'">'+res.Name+'</option>';
        })
        invoiceHtml += '</select></td>';
        option_content.innerHTML += invoiceHtml;
    }else{
        document.getElementById("invoice_col").classList.add("d-none");
    }

   document.getElementById("tb_body").appendChild(option_content);

}

//second call fetch data
function getInvoice(filingKey, callback){
    ZOHO.embeddedApp.init()
    .then(function(){
        ZOHO.CRM.API.searchRecord({Entity:"Billing",Type:"criteria",Query:'(Filing_Key:equals:'+filingKey+')', page:1,per_page:100})
        .then(function(invoice){
            if(invoice.data){
                invoice.data.forEach(function(res){
                    data.invoice.push({
                        name: res.Name,
                        module: "CustomModule13",
                        id: res.id
                    })
                })
            }
            callback(invoice);
        })
        .catch(function(error){
             alert(error.status + " - " +error.message + " - searchRecord_getInvoice");
         });
    })
}

//first call fetch data
function search_result(){

   document.getElementById("tb_body").innerHTML = "";
   data.claims = [];

   var filingKey = document.getElementById("input_txt").value;

   if(filingKey == "" || filingKey.split("_").length < 3){
       alert("Please enter a valid filling key");
        return 
    }

    filingKey = filingKey.replace(/\(/g, "\\(");
    filingKey = filingKey.replace(/\)/g, "\\)");

   var data_search = {
       filingKey: filingKey
   }

   getInvoice(filingKey, function(invoice_data){
        get_data(data_search, function(result){
            if(result.data){
                result.data.forEach(function(res){
                    data.claims.push({
                        id: res.id,
                        type: "Y",
                        claim: res.Claim_SubType,
                        status: res.Claim_Status,
                        decicion_date : res.Date_Notified_of_Decision,
                        effective_date: res.Effective_Date,
                        rating: res.Claim_Awarded_Rating,
                        laterality: res.Laterality,
                        invoice:""
                    });
                    displayData(res,invoice_data);
                })
            }else{
                data.claims = [];
                document.getElementById("tb_result").classList.add("d-none");
                document.getElementById("submit_area").classList.add("d-none");
                document.getElementById("no_result").classList.remove("d-none");
                document.getElementById("decisionDate_area").classList.add("d-none");
                document.getElementById("isRdl_area").classList.add("d-none");
            }
        })
   });



}

document.querySelector('#input_txt').addEventListener('keypress', function (e) {
   if (e.key === 'Enter') {
       search_result();
   }
});

//third call update data
function getTransitionID(claim, callback){
    
    var config = 
    {
    "Entity": "Claims",
    "RecordID": claim.id
    }

    ZOHO.embeddedApp.init()
    .then(function(){
        ZOHO.CRM.API.getBluePrint(config).then(function(res_blueprint){
            var index = _.findIndex(res_blueprint.blueprint.transitions, {name:claim.status}); // transition index
            if(index != -1){
                callback(res_blueprint.blueprint.transitions[index].id);
            }
        })
    })
    .catch(function(error){
         alert(error.status + " - " +error.message + " - getBluePrint");
     });
}

//second call update data
function get_user(callback){
    ZOHO.embeddedApp.init()
   .then(function(){
        ZOHO.CRM.CONFIG.getCurrentUser().then(function(data){
            if(data.users.length > 0){
                callback(data.users[0].full_name);
            }
        })
        .catch(function(error){
            alert(error.status + " - " +error.message + " - getCurrentUser");
        });
   });
}

//third call fetch data
function get_data(data_search, callback){
   ZOHO.embeddedApp.init()
   .then(function(){
       ZOHO.CRM.API.searchRecord({Entity:"Claims",Type:"criteria",Query:'((Name:equals:'+data_search.filingKey+') and ((Claim_Status:equals:Packet Sent) or (Claim_Status:equals:Claim Deferred) or (Claim_Status:equals:Claim Remanded)))', page:1,per_page:100})
       .then(function(data){
           callback(data);
       })
       .catch(function(error){
            alert(error.status + " - " +error.message + " - searchRecord_getData");
        });
   })
}

//fourth call update data
function update_data(data_update, user, transition_id, callback){
   ZOHO.embeddedApp.init()
   .then(function(){

        status_data = {};

        switch(data_update.status){
            case "Claim Approved": 
            case "Rating Reduced": 
            case "Rating Severed": 
                status_data = {
                    "Claim_Awarded_Rating" : data_update.rating,
                    "Effective_Date" : data_update.effective_date,
                    "RDL_input_by" : user
                }
                break;
            default:
                status_data = {
                    "Claim_Awarded_Rating" : data_update.rating,
                    "RDL_input_by" : user
                }
        }

        if(data.onRDL == "rdl"){
            status_data["Date_Notified_of_Decision"] = data_update.decicion_date;
        }

        if(data_update.invoice != ""){
            var index = _.findIndex(data.invoice, {name:data_update.invoice}); // invoice index
            status_data["Invoice"] = data.invoice[index].id;
        }

        var BlueprintData = 
            {
                "blueprint": [
                    {
                        "transition_id": transition_id,
                        "data": status_data
                    }
                ]
            }

        var blueprint_config=
            {
            Entity:"Claims",
            RecordID: data_update.id,
            BlueprintData:BlueprintData
            }

        ZOHO.CRM.API.updateBluePrint(blueprint_config).then(function(blueprint_data){
            callback(blueprint_data)
            
        })
        .catch(function(error){
            callback(error)
        });


   })
}

//first call update data
function submit_btn(){

   document.getElementById("tb_update_body").innerHTML = "";

   get_user(function(user){
        data.claims.forEach(function(res){
            if(res.type == "Y"){
                getTransitionID(res, function(transition_id){
                    update_data(res, user, transition_id, function(result){
                        status_update(res, result);
                    });
                });
            }
        });
   });

}

//fifth call update data
function status_update(claim_data, response_data){
   document.getElementById("update_status_result").classList.remove("d-none");
   var option_content = document.createElement("tr");
   var laterality = (claim_data.laterality != null && claim_data.laterality != "N/A") ? " - "+claim_data.laterality : "";
   option_content.innerHTML = '<th scope="row"><span>'+claim_data.claim+''+laterality+'</span></th> '+
   '<td> <span>'+response_data.status+'</span> </td> '+
   '<td> <span>'+response_data.message+'</span> </td> ';
   document.getElementById("tb_update_body").appendChild(option_content);
}