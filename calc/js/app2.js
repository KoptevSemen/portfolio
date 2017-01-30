$(document).ready(function(){
	/*Инициализация функции форматирования даты*/
	Date.prototype.format = function (mask, utc) {
		return dateFormat(this, mask, utc);
	};
//				var date = new Date(data.date.replace(/(\d+)-(\d+)-(\d+)/, '$2/$3/$1'));
//				var NewDate = date.format("dd.mm.yyyy");

	/*Функция перевода числа в денежный формат*/
	function number_format( str ){
		return str.replace(/(\s)+/g, '').replace(/(\d{1,3})(?=(?:\d{3})+$)/g, '$1 ');
	}
	/*Инпут типа cash_format при нажатии клавиши идет переформатирование*/
	$('input[type="cash_format"]').on('keyup', function(){
		$(this).val(number_format($(this).val()));
		/*Убираем пробелы и выщитываем разницу*/
		var cash = parseInt($('input[name="cash"]').val().replace(/\s+/g, '') , 10);
		var pay = parseInt($('input[name="pay"]').val().replace(/\s+/g, '') , 10);
		$('input[name="debt"]').val( +cash - +pay);
	});

	/**************************************************************
	* Расчетать стоимость                            			   *
	***************************************************************/
	function getTrashItemID(ATTR){
		var mas=""
		var trashContainer; 
		
		switch (ATTR){
			case "SID": trashContainer="#showTrash li";break;
			case "PID": trashContainer="#persTrash li";break;
			case "OID": trashContainer="#otherTrash li";break;
		}
		$(trashContainer).each(function() {
			var ItemID = $(this).attr(ATTR);
			if(ItemID != "0"){
				mas += ItemID + '|';
			}
			return mas;
		});
		if (mas==="") mas="0";
		return mas;
	}
	function emptyTrash(){
		if (getTrashItemID("SID") === "0" && getTrashItemID("PID") === "0" && getTrashItemID("OID") === "0"){
			return true;
		}else{
			return false;
		}
	}
	//Функция подсчета неообходимого кол-ва персов
	function persCount(){
		var count = "0";
		$.ajax({
			url:"server/persCount.php",
			data:{SID:getTrashItemID("SID")},
			type:"post",
			async:false,
			success:function(persCount){
				return count = persCount;
			}
		});
		return count;
	}
	//Скрытие/открытие блоков
	function ShowHide(){
		if (emptyTrash()){
			$("#persSection").hide();
			$("#formSection").hide();
			
		}else{
			if (persCount() !== "0"){
				$("#persSection").show();
			}else{
				$("#persSection").hide();
			}
			
			$("#formSection").show();
			
			getTrashItemID("SID") === "0" ? $(".SID").hide() : $(".SID").show();
			getTrashItemID("PID") === "0" ? $(".PID").hide() : $(".PID").show();
			getTrashItemID("OID") === "0" ? $(".OID").hide() : $(".OID").show();
		}
	}
	
	function getPersCash(){
		var res = 0;
		$.ajax({
			url:"server/getCash.php",
			data:{PID:getTrashItemID("PID")},
			type:"post",
			async:false,
			success:function(cash){
				
				return res = cash;
			}
		});	
		return res;
	}
	
	function getShowCash(){
		var res = 0;
		$.ajax({
			url:"server/getCash.php",
			data:{SID:getTrashItemID("SID")},
			type:"post",
			async:false,
			success:function(cash){
				return res = cash;
			}
		});	
		return res;		
	}
	function getOtherCash(){
		var res = 0;
		$.ajax({
			url:"server/getCash.php",
			data:{OID:getTrashItemID("OID")},
			type:"post",
			async:false,
			success:function(cash){
				return res = cash;
			}
		});	
		return res;		
	}
	function multiplyPersCash(NeedPers,NumbPers,factorPers,PersCash){		
		console.log("Нужно персов - "+NeedPers+" Всего персонажей - "+NumbPers);
		var i, res = PersCash;
		if (NeedPers > NumbPers){
			i =  NeedPers - NumbPers;
			console.log("Нехватает "+i+" персонажей");
			res = PersCash + (PersCash * i);
		}
		
		return res;
	}
	function getCash(){
		var cash = 0,
		OTHER = +getOtherCash(),
		PERS = +getPersCash(),
		SHOW = +getShowCash(),
		factorPers = +factor($("#guestCount").val()),
		NeedPers = +persCount()*factorPers,
		NumbPers = +trashPIDcount(),
		multiply = +multiplyPersCash(NeedPers,NumbPers,factorPers,PERS);
		
		cash = +OTHER + +multiply + +SHOW;
		
		$(".footer_trash span").text(number_format(String(cash)));
		$("input[name=MNT_AMOUNT]").val(cash+".00");
		
		ShowHide();
	}
	function trashPIDcount(){
		var i = 0;
		$("#persTrash li").each(function() {
			if($(this).attr("SID") === "0"){i++;}
		});
		return i;		
	}
	function factor(guestCount){
		var factor = 1;
		factor = ~~guestCount/10;
		factor = ~~factor;
		if ((guestCount <= 19 && guestCount != 10 ) || (guestCount % 10 != 0)){factor+=1;}
		return factor;
	}
	/**************************************************************
	* Маска для ввода номера телефона                             *
	***************************************************************/
	//$.mask.definitions['~']='[+-]';
	//$('input[type=tel]').mask("* (999) 999-99-99");

	/**************************************************************
	* Получить список ШОУ ПРОГРАММ   CID=CityID AGE=возраст
	* pack=1 show=2 quest=3
	***************************************************************/
	function renderShow(CID,AGE,selector){
		$.ajax({
			url:"server/getShowInfo.php",
			data:{CID:CID,AGE:AGE},
			type:"post",
			success:function(jsonString){
				var data = JSON.parse(jsonString);

				var output = "<div class='panel-group' id='accordion'>";

				var pack = "<div class='panel panel-default packStack'>"+
								"<div class='panel-heading'>"+
									"<a class='panel-title' data-toggle='collapse' data-parent='#accordion' href='#packStack"+AGE+"'>Пакет</a>"+
								"</div>"+
								"<div id='packStack"+AGE+"' class='panel-collapse collapse'>"+
									"<div class='panel-body'>";

				var show = "<div class='panel panel-default showStack'>"+
								"<div class='panel-heading'>"+
									"<a class='panel-title' data-toggle='collapse' data-parent='#accordion' href='#showStack"+AGE+"'>Шоу</a>"+
								"</div>"+
								"<div id='showStack"+AGE+"' class='panel-collapse collapse'>"+
									"<div class='panel-body'>";

				var quest = "<div class='panel panel-default questStack'>"+
								"<div class='panel-heading'>"+
									"<a class='panel-title' data-toggle='collapse' data-parent='#accordion' href='#questStack"+AGE+"'>Квест</a>"+
								"</div>"+
								"<div id='questStack"+AGE+"' class='panel-collapse collapse in'>"+
									"<div class='panel-body'>";

				var packStack="", showStack="", questStack="";


				for (var i in data) {
					switch (data[i].type) {
						case "1":
							packStack += "<div class='col-xs-12 col-sm-6 col-md-4 col-lg-3'>"+
								"<a data-toggle='modal' data-target='#ShowInfo' SID='"+data[i].id+"' class='program_item'>"+
									"<img src='img/"+data[i].img_url+".jpg'>"+
									"<p><strong>"+data[i].name+"</strong></p>"+
								"</a>"+
							"</div>";
							break;
						case "2":
							showStack += "<div class='col-xs-12 col-sm-6 col-md-4 col-lg-3'>"+
								"<a data-toggle='modal' data-target='#ShowInfo' SID='"+data[i].id+"' class='program_item'>"+
									"<img src='img/"+data[i].img_url+".jpg'>"+
									"<p><strong>"+data[i].name+"</strong></p>"+
								"</a>"+
							"</div>";
							break;
						case "3":
							questStack += "<div class='col-xs-12 col-sm-6 col-md-4 col-lg-3'>"+
								"<a data-toggle='modal' data-target='#ShowInfo' SID='"+data[i].id+"' class='program_item'>"+
									"<img src='img/"+data[i].img_url+".jpg'>"+
									"<p><strong>"+data[i].name+"</strong></p>"+
								"</a>"+
							"</div>";
							break;
					}
				}
				show = showStack !== "" ? show += showStack + "</div></div></div>" : "";
				pack = packStack !== "" ? pack += packStack + "</div></div></div>" : "";
				quest = questStack !== "" ? quest += questStack + "</div></div></div>" : "";

				output += quest + show + pack + "</div>";
				$(selector).html(output);
			}
		});
	}
	/******************************************************************************************
	* Получаем дополнительную информацию о ШОУ ПРОГРАММАХ SID=IDSHOW                          *
	******************************************************************************************/
	function getMoreShowInfo(SID){
		$.ajax({
			url:"server/getMoreShowInfo.php",
			data:{SID:SID},
			type:"post",
			success:function(jsonString){
				var data = JSON.parse(jsonString);
				$("#ShowInfoHead").text(data.name);
				$("#ShowInfoBody .description").html("<span>Описание:</span><br>"+data.description);
				$("#ShowInfoBody .cash span").text(number_format(data.cash));
				$("#ShowInfoBody .pers_count").text(data.pers_count);
				$("#ShowInfoBody img").attr("src","img/"+data.img_url+".jpg");
				$("#pers_stack").html("");
				var arr = getTrashItemID("PID").split('|');
				var tabPersButtons="", tabPersTabs="";
				for (var i in data.pers) {
					var proms = arr.indexOf(data.pers[i].id) !== -1 ? "check": "";
					tabPersButtons += "<a class='pers_avatar "+proms+
					"' PID='"+data.pers[i].id+"' href='#tabP_"+data.pers[i].id+"' aria-controls='tabP_"+data.pers[i].id+"' role='tab' data-toggle='tab'>"+
							"<div class='img'>"+
								"<img src='img/"+data.pers[i].img_url+".jpg'>"+
							"</div>"+
							"<h4>"+data.pers[i].name+"</h4>"+
						"</a>";
				}

				for (i in data.pers) {
					tabPersTabs += "<div id='tabP_"+data.pers[i].id+"' class='tab-pane fade'>"+
						"<p>"+data.pers[i].description+"</p>"+
					"</div>";
				}

				if (tabPersButtons !== ""){
					$("#pers_stack").append("<h4>Выберите персонажа:</h4>"+tabPersButtons+"<div class='tab-content'>"+tabPersTabs+"</div>");
				}

				if (!$('.pers_avatar').hasClass('check')) {
					$('.pers_avatar:first').addClass('check');
				}
				$("#addShow").attr("PID","0");
				$("#addShow").attr("OID","0");
				$("#addShow").attr("SID",data.id);
			}
		});
	}
	/******************************************************************************************
	* отрисовка во всех табах                                                                 *
	******************************************************************************************/
	function renderShowTabs(CID){
		renderShow(CID,0,"#tab_all");
		renderShow(CID,1,"#tab_2");
		renderShow(CID,2,"#tab_3");
		renderShow(CID,3,"#tab_4");
		renderShow(CID,4,"#tab_5");
	}
	//Положить в корзину
	$('#addShow').on('click',function(){
		var SID = $(this).attr("SID");
		var PID = $(this).attr("PID");
		var OID = $(this).attr("OID");
		var stackPID = $(".pers_avatar.check").attr("PID");
		
		if ((SID != "0") && (PID == "0") && (OID == "0") && (stackPID == undefined) ){
			if (!$(".program_item[SID="+SID+"]").hasClass("check")){
				$("[class=program_item][SID="+SID+"]").addClass("check");
				$.ajax({
					url:"server/getMoreShowInfo.php",
					data:{SID:SID},
					type:"post",
					success:function(jsonString){
						var data = JSON.parse(jsonString);

						$("#showTrash").append("<li class='media list-group-item' PID='0' OID='0' SID='"+data.id+"'>"+
							"<button class='close'><span>&times;</span></button>"+
								"<p class='pull-left'>"+
									"<img class='media-object' src='img/"+data.img_url+".jpg'>"+
								"</p>"+
								"<div class='media-body'>"+
									"<h4 class='media-heading'>"+data.name+"</h4>"+
									"<p>Стоимость: "+number_format(data.cash)+"</p>"+
								"</div>"+
						"</li>");
						getCash();
						$("#ShowInfo").modal("hide");
						$(".message").text("Добавлено в корзину");
						$(".message").fadeIn("slow",function(){
							setTimeout(function(){$(".message").fadeOut("fast");},3000);
						});
					}
				});
			}
		}
		if ((PID !== "0") && (SID === "0") && (OID === "0") && (stackPID == undefined)){
			if (!$(".pers_item[PID="+PID+"]").hasClass("check")){
				$("[class=pers_item][PID="+PID+"]").addClass("check");
				$.ajax({
					url:"server/getMorePersInfo.php",
					data:{PID:PID},
					type:"post",
					success:function(jsonString){
						var data = JSON.parse(jsonString);

						$("#persTrash").append("<li class='media list-group-item' SID='0' OID='0' PID='"+data.id+"'>"+
							"<button class='close'><span>&times;</span></button>"+
								"<p class='pull-left'>"+
									"<img class='media-object' src='img/"+data.img_url+".jpg'>"+
								"</p>"+
								"<div class='media-body'>"+
									"<h4 class='media-heading'>"+data.name+"</h4>"+
									"<p>Стоимость: "+number_format(data.cash)+"</p>"+
								"</div>"+
							"</li>");
						getCash();
						$("#ShowInfo").modal("hide");
						$(".message").text("Добавлено в корзину");
						$(".message").fadeIn("slow",function(){
							setTimeout(function(){$(".message").fadeOut("fast");},3000);
						});
					}
				});
			}
		}
		if ((OID !== "0") && (SID === "0") && (PID === "0") && (stackPID == undefined)){
			if (!$(".other_item[OID="+OID+"]").hasClass("check")){
				$("[class=other_item][OID="+OID+"]").addClass("check");
				$.ajax({
					url:"server/getMoreOtherInfo.php",
					data:{OID:OID},
					type:"post",
					success:function(jsonString){
						var data = JSON.parse(jsonString);
						$("#otherTrash").append("<li class='media list-group-item' PID='0' SID='0' OID='"+data.id+"'>"+
							"<button class='close'><span>&times;</span></button>"+
								"<p class='pull-left'>"+
									"<img class='media-object' src='img/"+data.img_url+".jpg'>"+
								"</p>"+
								"<div class='media-body'>"+
									"<h4 class='media-heading'>"+data.name+"</h4>"+
									"<p>Стоимость: "+number_format(data.cash)+"</p>"+
								"</div>"+
								"</li>");
						getCash();
						$("#ShowInfo").modal("hide");
						$(".message").text("Добавлено в корзину");
						$(".message").fadeIn("slow",function(){
							setTimeout(function(){$(".message").fadeOut("fast");},3000);
						});
					}
				});
			}
		}
		//Квест с персом в карзину
		if ((SID !== "0") && (stackPID != undefined) && (OID === "0") && (PID === "0")){
			if (!$(".program_item[SID="+SID+"]").hasClass("check")){
				$("[class=program_item][SID="+SID+"]").addClass("check");
				$("[class=pers_item][PID="+stackPID+"]").addClass("check");
				$.ajax({
					url:"server/getMoreShowInfo.php",
					data:{SID:SID},
					type:"post",
					success:function(jsonString){
						var data = JSON.parse(jsonString);
						$("#showTrash").append("<li class='media list-group-item questShow' PID='0' OID='0' SID='"+data.id+"'>"+
							"<button class='close'><span>&times;</span></button>"+
								"<p class='pull-left'>"+
									"<img class='media-object' src='img/"+data.img_url+".jpg'>"+
								"</p>"+
								"<div class='media-body'>"+
									"<h4 class='media-heading'>"+data.name+"</h4>"+
									"<p>Стоимость: "+number_format(data.cash)+"</p>"+
								"</div>"+
								"</li>");

									$.ajax({
										url:"server/getMorePersInfo.php",
										data:{PID:stackPID},
										type:"post",
										success:function(jsonString){
											var data = JSON.parse(jsonString);

											$("#persTrash").append("<li class='media list-group-item questPers' SID='"+SID+"' OID='0' PID='"+data.id+"'>"+
											"<button class='close'><span>&times;</span></button>"+
												"<p class='pull-left'>"+
													"<img class='media-object' src='img/"+data.img_url+".jpg'>"+
												"</p>"+
												"<div class='media-body'>"+
													"<h4 class='media-heading'>"+data.name+"</h4>"+
													"<p>Стоимость: "+number_format(data.cash)+"</p>"+
												"</div>"+
											"</li>");
											getCash();
										}
									});
						
						$("#ShowInfo").modal("hide");
						$(".message").text("Добавлено в корзину");
						$(".message").fadeIn("slow",function(){
							setTimeout(function(){$(".message").fadeOut("fast");},3000);
						});
						getCash();
					}
				});
			}
		}
	});

	$(document).on('click','.pers_avatar', function() {
		var PID = $(this).attr("PID");
		if (!$(".pers_avatar[PID="+PID+"]").hasClass("check")){
			$(".pers_avatar").removeClass("check");
			$("[class=pers_avatar][PID="+PID+"]").addClass("check");
		}
	});

	//Удалить из карзины
	$(document).on('click','.trash .close', function() {
		var SID = $(this).parent().attr("SID");
		var PID = $(this).parent().attr("PID");
		var OID = $(this).parent().attr("OID");
		if ((SID != "0") && (OID == "0") && (PID == "0")){
			$(".trash li[SID="+SID+"]").remove();
			$(".program_item[SID="+SID+"]").removeClass("check");


			$(".pers_item[SID="+SID+"]").removeClass("check");
			$(".pers_avatar[SID="+SID+"]").removeClass("check");
		}
		if ((PID != "0") && (SID == "0") && (OID == "0")){
			$(".trash li[PID="+PID+"]").remove();
			$(".pers_item[PID="+PID+"]").removeClass("check");
		}
		if ((OID != "0") && (PID == "0") && (SID == "0")){
			$(".trash li[OID="+OID+"]").remove();
			$(".other_item[OID="+OID+"]").removeClass("check");
		}
		if ((PID != "0") && (SID != "0") && (OID == "0")){
			$(".trash li[PID="+PID+"]").remove();
			$(".pers_item[PID="+PID+"]").removeClass("check");
			$(".pers_avatar[PID="+PID+"]").removeClass("check");
			$(".trash li[SID="+SID+"]").remove();
			$(".program_item[SID="+SID+"]").removeClass("check");
		}
		getCash();
		$(".message").text("Удалено из корзины");
		$(".message").fadeIn("slow",function(){
			setTimeout(function(){$(".message").fadeOut("fast");},3000);
		});

	});
	/**************************************************************
	* Получить список АНИМАТОРОВ   CID=CityID 					   *
	***************************************************************/
	function renderPers(CID,selector){
		$.ajax({
			url:"server/getPers.php",
			data:{CID:CID},
			type:"post",
			success:function(jsonString){
				var data = JSON.parse(jsonString);
				var output = "";
				for (var i in data) {
					output+="<div class='col-xs-12 col-sm-6 col-md-4 col-lg-3'>"+
								"<a data-toggle='modal' data-target='#ShowInfo' SID="+data[i].show_id+" PID='"+data[i].id+"' class='pers_item'>"+
									"<img src='img/"+data[i].img_url+".jpg'>"+
									"<p><strong>"+data[i].name+"</strong></p>"+
								"</a>"+
							"</div>";
				}
				$(selector).html(output);
			}
		});
	}
	/**************************************************************
	* Получить список Прочих услуг  CID=CityID   			   *
	***************************************************************/
	function renderOther(CID,selector){
		$.ajax({
			url:"server/getOther.php",
			data:{CID:CID},
			type:"post",
			success:function(jsonString){
				var data = JSON.parse(jsonString);
				var output = "";
				for (var i in data) {
					output+="<div class='col-xs-12 col-sm-6 col-md-4 col-lg-3'>"+
								"<a data-toggle='modal' data-target='#ShowInfo' OID='"+data[i].id+"' class='other_item'>"+
									"<img src='img/"+data[i].img_url+".jpg'>"+
									"<p><strong>"+data[i].name+"</strong></p>"+
								"</a>"+
							"</div>";
				}
				$(selector).html(output);
			}
		});
	}
	function getMorePersInfo(PID){
		$.ajax({
			url:"server/getMorePersInfo.php",
			data:{PID:PID},
			type:"post",
			success:function(jsonString){
				var data = JSON.parse(jsonString);
				$("#ShowInfoHead").text(data.name);
				$("#ShowInfoBody .description").html("<span>Описание:</span><br>"+data.description);
				$("#ShowInfoBody img").attr("src","img/"+data.img_url+".jpg");
				$("#pers_stack").html("");
				$("#addShow").attr("SID","0");
				$("#addShow").attr("OID","0");
				$("#addShow").attr("PID",data.id);
			}
		});
	}
	function getMoreOtherInfo(OID){
		$.ajax({
			url:"server/getMoreOtherInfo.php",
			data:{OID:OID},
			type:"post",
			success:function(jsonString){
				var data = JSON.parse(jsonString);
				$("#ShowInfoHead").text(data.name);
				$("#ShowInfoBody .description").html("<span>Описание:</span><br>"+data.description);
				$("#ShowInfoBody img").attr("src","img/"+data.img_url+".jpg");
				$("#pers_stack").html("");
				$("#addShow").attr("SID","0");
				$("#addShow").attr("PID","0");
				$("#addShow").attr("OID",data.id);
			}
		});
	}
	//Модальное окно Аниматоры
	$(document).on('click','.pers_item', function() {
		getMorePersInfo($(this).attr('PID'));
	});
	//Модальное окно Аниматоры
	$(document).on('click','.other_item', function() {
		getMoreOtherInfo($(this).attr('OID'));
	});
		//Модальное окно ШОУ программ
	$(document).on('click','.program_item', function() {
		getMoreShowInfo($(this).attr('SID'));
	});


	////////////////////////////////////////////////////////////
	//////////////////////////CALCMADAG/////////////////////////
	////////////////////////////////////////////////////////////
	renderShowTabs(1);
	renderPers(1,"#persSection .tab-content");
	renderOther(1,"#otherSection .tab-content");
	ShowHide();
	
	$('#guestCount').change(function() {
		getCash();
	});
	
	$(document).on('click', '#onlinePay', function() {
		event.preventDefault();
		getCash();
		$("#submitForm").submit();
	});
});
