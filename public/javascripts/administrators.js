/*$("#restaurant-info-btn").click(function () {
    $.ajax({
        success: function (data) {
            console.log("AJAXXXXXX: " + data);
            $('#info-box').addClass("show");
        },
        async: true
    });
});

$(".info-box .close").click(function(){
    $(this).closest(".info-box").removeClass("show");
});
*/

function articleAvailable() {
    var x = document.getElementById("available").checked;
    console.log("ONCHANGE: " + x);

}