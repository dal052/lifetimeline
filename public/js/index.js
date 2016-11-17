//<![CDATA[
$(document).ready(function() {
  $('#li0').click(function(){
        var startenddate = (this.data('cur').start.getMonth() + 1) + '/' + this.data('cur').start.getDate()+ '/' + this.data.start.getFullYear() +'-'+ (this.data.end.getMonth() + 1) + '/' + this.data.end.getDate()+ '/' + this.data.end.getFullYear();;
        console.log('suuuup'+startenddate);
        $("#detailedTitle").html('<p><b>'+this.data('cur').label+'</b></p>');
        $("#detailedEmotion").html('<p>'+this.data('cur').type+'</p>');
        $("#detailedStartEndDate").html('<p>'+ startenddate +'</p>');
        $("#detailedDescription").html('<p>'+this.data('cur').desc+'</p>');
        var button = document.createElement("button");
        //document.createTextNode("Delete");
        button.textContent = "Delete";
        button.data = this.data.id;
        button.id = "detailedDeleteButton";
        $('#detailedIdDelete').html(button);
        button.onclick = function(){
          console.log('ee');
          angular.element($('#mainCon')).scope().deleteLifetimeline(this.data);
        };
      }); 
});
//]]>