$(document).ready(function(){
	/*Функция перевода числа в денежный формат*/
	function number_format( str ){
		return str.replace(/(\s)+/g, '').replace(/(\d{1,3})(?=(?:\d{3})+$)/g, '$1 ');
	}
	/*Получить карточку*/
	function getCardJSON(param, city_id, age){
		age = typeof age !== 'undefined' ? age : 0;
		var result;
		$.ajax({
			url:"server/GET_card.php",
			data:{
				keyword:param,
				CID:city_id,
				age:age
			},
			type:"post",
			async:false,
			success:function(json){
				result = json;
				return result;
			}
		});
		return result;
	}
	function HTML_card(json,cardClass){
		var data = JSON.parse(json);
		var html = "";
		for (var i in data) {
			html += "<div class='col-xs-12 col-sm-6 col-md-4 col-lg-3'>"+
				"<a data-toggle='modal' data-target='#ShowInfo' card-id='"+data[i].id+"' class='card_item' card-class='"+cardClass+"'>"+
					"<img src='img/"+data[i].img_url+".jpg'>"+
					"<p><strong>"+data[i].name+"</strong></p>"+
				"</a>"+
			"</div>";
		}
		return html;
	}

	function html_programmStack(type, city, age , caption , open){
		open = typeof open !== 'undefined' ? open : false;
		var programmBody = "", openStack = open ? "in" : '',
		programm = "<div class='panel panel-default "+type+"Stack'>"+
					"<div class='panel-heading'>"+
						"<a class='panel-title' data-toggle='collapse' data-parent='#accordion' href='#"+type+"Stack"+age+"'>"+caption+"</a>"+
					"</div>"+
					"<div id='"+type+"Stack"+age+"' class='panel-collapse collapse "+openStack+"'>"+
						"<div class='panel-body'>";

		programmBody = HTML_card(getCardJSON(type,city,age),type);

		if (programmBody !== ""){
			programm += programmBody + "</div></div></div>";
			return programm;
		}else{
			return "";
		}
	}
	function renderCard(selector, type, city , age){
		age = typeof age !== 'undefined' ? age : 0;
		$(selector).append(HTML_card(getCardJSON(type,city, age),type));
	}
	function renderProgrammStack(selector, type, city, age,caption,open){
		$(selector).append(html_programmStack(type,city,age,caption,open));
	}
	/*Рендер*/
	function renderContent(city_id){
		renderProgrammStack("#show #tab_all .panel-group", "quest" , city_id, 0 , "Квест" , true);
		renderProgrammStack("#show #tab_all .panel-group", "pack" , city_id, 0, "Пакет" , false);
		renderProgrammStack("#show #tab_all .panel-group", "show" , city_id, 0, "ШОУ" , false);

		renderProgrammStack("#show #tab_2 .panel-group", "quest" , city_id, 1 , "Квест" , true);
		renderProgrammStack("#show #tab_2 .panel-group", "pack" , city_id, 1, "Пакет" , false);
		renderProgrammStack("#show #tab_2 .panel-group", "show" , city_id, 1, "ШОУ" , false);

		renderProgrammStack("#show #tab_3 .panel-group", "quest" , city_id, 2, "Квест" , true);
		renderProgrammStack("#show #tab_3 .panel-group", "pack" , city_id, 2, "Пакет" , false);
		renderProgrammStack("#show #tab_3 .panel-group", "show" , city_id, 2, "ШОУ" , false);

		renderProgrammStack("#show #tab_4 .panel-group", "quest" , city_id, 3, "Квест" , true);
		renderProgrammStack("#show #tab_4 .panel-group", "pack" , city_id, 3, "Пакет" , false);
		renderProgrammStack("#show #tab_4 .panel-group", "show" , city_id, 3, "ШОУ" , false);

		renderProgrammStack("#show #tab_5 .panel-group", "quest" , city_id, 4, "Квест" , true);
		renderProgrammStack("#show #tab_5 .panel-group", "pack" , city_id, 4, "Пакет" , false);
		renderProgrammStack("#show #tab_5 .panel-group", "show" , city_id, 4, "ШОУ" , false);


		renderCard("#persSection .tab-content", "pers" , city_id , 0);
		renderCard("#otherSection .tab-content", "other" , city_id ,0);

		hideTrash("quest",true);
		hideTrash("pack",true);
		hideTrash("show",true);
		hideTrash("pers",true);
		hideTrash("other",true);
		
		sectionHide();
	}
	/*Получить доп инфу*/
	function GetMoreCardInfo_JSON(CID,table){
		var result;
		$.ajax({
			url:"server/GetMoreCardInfo_JSON.php",
			data:{CID:CID,table:table},
			type:"post",
			async:false,
			success:function(json){
				result = json;
				return result;
			}
		});
		return result;
	}
	function HTML_moreInfo(json,Ccls){
		var data = JSON.parse(json), itemID = "0";

		$("#ShowInfoHead").text(data.name);
		$("#ShowInfoBody .description").text(data.description);
		$("#ShowInfoBody img").attr("src","img/"+data.img_url+".jpg");
		$("#quest_pack").html("");

		if (data.cash != "0"){
			$("#ShowInfoBody .cash p").text(number_format(data.cash));
			$("#ShowInfoBody .cash h4").text("Стоимость:");
		}
		else{
			$("#ShowInfoBody .cash p").text("");
			$("#ShowInfoBody .cash h4").text("");
		}

		var ButtonsTab="", tabItem="";

		for (var i in data.quests) {
			ButtonsTab += "<a class='questItem' href='#tabP_"+data.quests[i].id+"' aria-controls='tabP_"+data.quests[i].id+"' role='tab' data-toggle='tab' item-id='"+data.quests[i].id+"'>"+
					"<div class='img'>"+
						"<img src='img/"+data.quests[i].img_url+".jpg'>"+
					"</div>"+
					"<h4>"+data.quests[i].name+"</h4>"+
				"</a>";
		}

		for (i in data.quests) {
			tabItem += "<div id='tabP_"+data.quests[i].id+"' class='tab-pane fade'>"+
				"<p>"+data.quests[i].description+"</p>"+
				"<div class='cash'><h4>Стоимость:</h4><p>"+data.quests[i].cash+"</p></div>"+
			"</div>";
		}

		if (ButtonsTab !== ""){
			$("#quest_pack").append("<h4>Выберите вариант:</h4>"+
					ButtonsTab+
				"<div class='tab-content'>"+
					tabItem+
				"</div>");
			itemID = data.quests[0].id;
		}
		if (!$('.questItem').hasClass('check')) {
			$('.questItem:first').addClass('check');
		}
		if (!$('.quest_pack .tab-pane').hasClass('active')) {
			$('.quest_pack .tab-pane:first').addClass('active in');
		}
		$('#addShow').attr('item-id',itemID);
		$("#addShow").attr("card-id",data.id);
		$("#addShow").attr("card-class",Ccls);
	}
	$(document).on('click','.card_item',function(){
		var Cid = $(this).attr("card-id");
		var Ccls = $(this).attr("card-class");
		HTML_moreInfo(GetMoreCardInfo_JSON(Cid,Ccls),Ccls);
	});
	$(document).on('click','.questItem', function() {
		var itemID = $(this).attr("item-id");
		if (!$(".questItem[item-id="+itemID+"]").hasClass("check")){
			$(".questItem").removeClass("check");
			$("[item-id="+itemID+"]").addClass("check");
			$('#addShow').attr('item-id',itemID);
		}
	});
	/*Добавляем в карзину*/
	function trashCard(cardID,cardClass,itemID){
		var data = JSON.parse(GetMoreCardInfo_JSON(cardID,cardClass)),
		selector = "#" + cardClass + "Trash", CardCash = data.cash,
		attr = "";

		for (var i in data.quests) {
			if(data.quests[i].id == itemID){
				CardCash = data.quests[i].cash;
				attr = "item-id='"+data.quests[i].id+"'";
			}
		}
		$(selector).append("<li class='media list-group-item' card-class="+cardClass+" card-id='"+data.id+"' "+attr+">"+
			"<button class='close'><span>&times;</span></button>"+
			"<p class='pull-left'>"+
				"<img class='media-object' src='img/"+data.img_url+".jpg'>"+
			"</p>"+
			"<div class='media-body'>"+
				"<h4 class='media-heading'>"+data.name+"</h4>"+
				"<p>Стоимость: "+number_format(CardCash)+"</p>"+
			"</div>"+
		"</li>");
	}
	$('#addShow').on('click',function(){
		var cardID = $(this).attr("card-id"),
		cardClass = $(this).attr("card-class"),
		itemID = $(this).attr("item-id");

		if (!$(".card_item[card-id="+cardID+"][card-class="+cardClass+"]").hasClass("check")){
			$("[class=card_item][card-id="+cardID+"][card-class="+cardClass+"]").addClass("check");
			
			trashCard(cardID,cardClass,itemID);
			msgBox("Добавлено в корзину!",3);
			
			trashCount(cardClass);
			hideTrash(cardClass,emptyTrash(cardClass));
			
			getAllSum($('#guestCount').val());	
		}
		$("#ShowInfo").modal("hide");
	});
	//Удалить из карзины
	function delTrashItem(cardID,cardClass){
		$(".trash li[card-id="+cardID+"][card-class="+cardClass+"]").remove();
		$(".card_item[card-id="+cardID+"][card-class="+cardClass+"]").removeClass("check");
		
		trashCount(cardClass);
		hideTrash(cardClass,emptyTrash(cardClass));
		
		msgBox("Удалено из корзины!",3);
		
		getAllSum($('#guestCount').val());
	}
	$(document).on('click','.trash .close', function(event) {
		event.preventDefault();
		var cardID = $(this).parent().attr("card-id"),
		cardClass = $(this).parent().attr("card-class");

		delTrashItem(cardID,cardClass);
	});

	function msgBox(text,time){
		time = typeof time !== 'undefined' ? time : 3;
		time *= 1000;
		$(".message").text(text);
		$(".message").fadeIn("slow",function(){
			setTimeout(function(){$(".message").fadeOut("fast");},time);
		});
	}
	function trashCount(trash){
		var i = 0,
		trashName = "#"+trash+"Trash li",
		trashCounter = "#"+trash+"Count";

		$(trashName).each(function() {i++;});
		$(trashCounter).text(" - "+i);
	
		return i;
	}
	function emptyTrash(trashName){
		if(trashCount(trashName) === 0){
			return true;
		}else{
			return false;
		}
	}
	function hideTrash(trashName,hidden){
		trashName = "." + trashName + "Trash";
		if (hidden){
			$(trashName).hide();
			return true;
		}else{
			$(trashName).show();
			return false;
		}
	}
	/*Получаем ID только тех карт у которых имеется стоимость*/
	function getTrashItemID(trashName) {
		var mas="",
		attr = trashName === "quest" ? "item-id" : "card-id";
		
		trashName = "#"+trashName+"Trash li";
		$(trashName).each(function () {
			var cardID = $(this).attr(attr);
			if(cardID != "0"){
				mas += cardID + '|';
			}
			return mas;
		});
		if (mas==="") mas="0";
		return mas;
	}
	
	function getSumCash(trashName){
		var sum = 0,
		tableName = trashName === "quest" ? "quest_item" : trashName;
		
		$.ajax({
			url:"server/getCash.php",
			data:{
				ID:getTrashItemID(trashName),
				table:tableName
			},
			type:"post",
			async:false,
			success:function(cash){	
				sum = cash;			
				return sum;
			}
		});	
		return sum;
	}
	function getAllSum(f){
		var sum = 0 , multy = 1000 * (+factor(f) - 1);
		
		sum += +getSumCash("quest") + multy;
		sum += +getSumCash("show");
		sum += +getSumCash("pack");
		sum += +getSumCash("pers") * +factor(f);
		sum += +getSumCash("other");
		
		$(".footer_trash span").text(number_format(String(sum)));
		$("input[name=MNT_AMOUNT]").val(sum+".00");
		
		sectionHide();
		
		return sum;
	}
	/*Множитель*/
	function factor(guestCount){
		var factor = 1;
		factor = ~~guestCount/10;
		factor = ~~factor;
		if ((guestCount <= 19 && guestCount != 10 ) || (guestCount % 10 != 0)){factor+=1;}
		return factor;
	}
	function sectionHide(){
		if (hideTrash("pack",emptyTrash("pack"))){
			$("#persSection").hide();
			if(emptyTrash("quest") && emptyTrash("show")){
				$("#formSection").hide();
			}else{
				$("#formSection").show();
			}
		}else{
			$("#persSection").show();
			$("#formSection").show();
		}
		

	}
	$('#guestCount').change(function() {
		getAllSum($(this).val());
	});
	$(document).on('click', '#onlinePay', function() {
		event.preventDefault();
		getAllSum($('#guestCount').val());
		$("#submitForm").submit();
	});
	/***********************************************************/
	var CITY_ID = 1;
	renderContent(CITY_ID);
});
