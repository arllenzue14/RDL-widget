
 var data = {
     claim: []
 }

document.getElementById("rdl_btn").addEventListener("click", function() {  
    document.getElementById("decisionDate_area").classList.remove("d-none");
});
document.getElementById("rbl_btn").addEventListener("click", function() {
    document.getElementById("decisionDate_area").classList.add("d-none");
});

function displayData(res_data,data_search){

    var options = { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC'};
    var rdlclassform = data_search.rdl_opt == 'Y' ? "class='form-select'" : "class='form-select d-none'";
    var rdlClass = data_search.rdl_opt == 'Y' ? "" : "class='d-none'";

    if(data_search.rdl_opt == 'Y' && data_search.decisionDate == ""){
        document.getElementById("d_date_warning").classList.remove("d-none");
        document.getElementById("tb_result").classList.add("d-none");
        return
    }
        
    document.getElementById("d_date_warning").classList.add("d-none");
    document.getElementById("tb_result").classList.remove("d-none");
    document.getElementById("no_result").classList.add("d-none");

    var option_content = document.createElement("tr");
    option_content.innerHTML = '<th scope="row"> <span>'+res_data.Claim_SubType+'</span> </th> '+
    '<td> <span>'+data_search.rdl_opt+'</span> </td> '+
    '<td> <select id="status_btn" '+rdlclassform+' aria-label="status"> <option value="1">Approved</option> <option value="0">Denied</option> </select> </td> '+
    '<td> <span '+rdlClass+'>'+new Date(data_search.decisionDate).toLocaleDateString("en-US", options)+'</span> </td> '+
    '<td> <select id="rating_btn" '+rdlclassform+' aria-label="rating">'+
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
    var decisionDate = document.getElementById("d_date").value;
    var isRdl = document.getElementById('rdl_btn').checked;
    var rdl_opt = isRdl == true ? 'Y' : 'N'; 

    var data_search = {
        filingKey: filingKey,
        decisionDate: decisionDate,
        rdl_opt: rdl_opt
    }

    get_data(data_search, function(result){
        if(result.data){
            data.claims = result.data;
            data.claims.forEach(function(res){
                displayData(res,data_search);
            })
        }else{
            data.claims = [];
            document.getElementById("tb_result").classList.add("d-none");
            document.getElementById("no_result").classList.remove("d-none");
        }
    })
}

function get_data(data_search, callback){
    ZOHO.embeddedApp.init()
    .then(function(data){
        ZOHO.CRM.API.searchRecord({Entity:"Claims",Type:"criteria",Query:'((Name:equals:'+data_search.filingKey+') and (Claim_Status:equals:Packet Sent))', page:1,per_page:15})
        .then(function(data){
            callback(data);
        })
    })
}

function update_data(data, callback){
    
}