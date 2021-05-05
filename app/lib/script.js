
 var data = {
     claims: []
 }

document.getElementById("rdl_btn").addEventListener("click", function() {  
    document.getElementById("decisionDate_area").classList.remove("d-none");
});
document.getElementById("rbl_btn").addEventListener("click", function() {
    document.getElementById("decisionDate_area").classList.add("d-none");
});

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

function ddate_call(value){
    data.claims.forEach(function(res,index){
        if(res.Type == "Y"){ // Apply only for RDL claims
            data.claims[index].decicion_date = value;
        }
    });
}

function isRdl_call(value){
    console.log(value,"isRDL");
}
function field_call(el,value,field){

    var fields = {
        "1" : "status", 
        "2" : "effective_date", 
        "3" : "rating", 
    }

    var elem = el.parentElement.parentElement;
    var id = elem.querySelector("input[class='d-none data_id']").value;
    var index = _.findIndex(data.claims, {id:id}); // claim index
    if(id != -1){
        data.claims[index][fields[field]] = value;
    }
}

function displayData(res_data){
    
    document.getElementById("tb_result").classList.remove("d-none");
    document.getElementById("submit_area").classList.remove("d-none");
    document.getElementById("no_result").classList.add("d-none");

    
    document.getElementById("decisionDate_area").classList.remove("d-none");
    document.getElementById("isRdl_area").classList.remove("d-none");

    var option_content = document.createElement("tr");
    option_content.innerHTML = '<th scope="row"><input class="d-none data_id" value="'+res_data.id+'"><span>'+res_data.Claim_SubType+'</span> </th> '+
    '<td> <select id="isRdl_btn" class="form-select" onchange="option_select(this,value)"> '+
    '<option value="Y">Yes</option> '+
    '<option value="N">No</option> </select> </td> '+
    '<td> <select id="status_btn" aria-label="status" class="form-select" onchange="field_call(this,value,1)"> '+
    '<option disabled selected value></option> '+
    '<option value="Approved">Approved</option> '+
    '<option value="Approved No Increase">Approved No Increase</option> '+
    '<option value="Denied">Denied</option> '+
    '<option value="Deferred">Deferred</option> '+
    '<option value="Remanded">Remanded</option> '+
    '<option value="Claim Not changed">Claim Not changed</option> '+
    '<option value="Rating reduced">Rating reduced</option> </select> </td> '+
    '<td> <input type="date" id="edate_value" onchange="field_call(this,value,2)" class="edate_value w-100 rounded p-1"></td> '+
    '<td> <select id="rating_btn" aria-label="rating" class="form-select" onchange="field_call(this,value,3)">'+
    '<option value="0">0</option><option value="10">10</option>'+
    '<option value="20">20</option><option value="30">30</option>'+
    '<option value="40">40</option><option value="50">50</option>'+
    '<option value="60">60</option><option value="70">70</option>'+
    '<option value="80">80</option><option value="90">90</option>'+
    '<option value="100">100</option> </select></td>';
    document.getElementById("tb_body").appendChild(option_content);

}

function search_result(){
    document.getElementById("tb_body").innerHTML = "";

    var filingKey = document.getElementById("input_txt").value;

    if(filingKey == ""){
        return 
    }

    var data_search = {
        filingKey: filingKey
    }

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
                    rating: res.Claim_Awarded_Rating
                });
                displayData(res,data_search);
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
}

document.querySelector('#input_txt').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        search_result();
    }
});

function get_data(data_search, callback){
    ZOHO.embeddedApp.init()
    .then(function(){
        ZOHO.CRM.API.searchRecord({Entity:"Claims",Type:"criteria",Query:'((Name:equals:'+data_search.filingKey+') and (Claim_Status:equals:Packet Sent))', page:1,per_page:100})
        .then(function(data){
            callback(data);
        })
    })
}

function update_data(data_update, callback){
    ZOHO.embeddedApp.init()
    .then(function(){

        var config={
            Entity:"Claims",
            APIData:{
                  "id": data_update.id,
                  "Claim_Status": data_update.status,
                  "Date_Notified_of_Decision": data_update.decicion_date || null,
                  "Effective_Date": data_update.effective_date || null,
                  "Claim_Awarded_Rating": data_update.rating || null,
            },
            Trigger:["workflow"]
        }

        ZOHO.CRM.API.updateRecord(config)
        .then(function(data){
            console.log(data,'update log')
            callback(data);
        })
        
    })
}

function submit_btn(){
    success_update();
}

function success_update(info){
    document.getElementById("alert_status_s").classList.remove("d-none");
    setTimeout(function(){ 
        document.getElementById("alert_status_s").classList.add("d-none");
    }, 3000);
}
function failed_update(info){
    document.getElementById("alert_status_f").classList.remove("d-none");
    setTimeout(function(){ 
        document.getElementById("alert_status_f").classList.add("d-none");
    }, 3000);
}