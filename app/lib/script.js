
var data = {
    claim: []
}

var dummy = {
    claims : [{
        id: 123,
        claim: "Claim",
        isRDL: true,
        status: 1,
        date: new Date(),
        rating: 10
    },{
        id: 456,
        claim: "Claim",
        isRDL: false,
        status: 0,
        date: new Date(),
        rating: 50
    }]
}

//sample data
data = dummy;


document.getElementById("rdl_btn").addEventListener("click", function() {  
    document.getElementById("decisionDate_area").classList.remove("d-none");
});
document.getElementById("rbl_btn").addEventListener("click", function() {
    document.getElementById("decisionDate_area").classList.add("d-none");
});

function displayData(_data){
    var options = { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC'};
    var rdl_opt = _data.isRDL == true ? 'Y' : 'N';
    var statusA = _data.status == 0 ? 'selected' : '';
    var statusD = _data.status == 1 ? 'selected' : '';
    var option_content = document.createElement("tr");
    option_content.innerHTML = '<th scope="row"> <span>'+_data.claim+'</span> </th> '+
    '<td> <span>'+rdl_opt+'</span> </td> '+
    '<td> <select id="status_btn" class="form-select" aria-label="status"> <option value="1" '+statusA+'>Approved</option> <option value="0" '+statusD+'>Denied</option> </select> </td> '+
    '<td> <span>'+new Date(_data.date).toLocaleDateString("en-US", options)+'</span> </td> '+
    '<td> <input type="number" min="0" max="100" value="'+_data.rating+'"> </td>';
    document.getElementById("tb_body").appendChild(option_content);
}

function seach_result(){

    data.claims.forEach(function(res){

       var result = res
       displayData(res);

    })
}

seach_result();