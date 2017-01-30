<?php
	include('connect.php');
	if((isset($_POST['CID'])) AND (isset($_POST['table']))){
		
		$CID = $_POST['CID'];
		$table ="calc_".$_POST['table'];
		
		$sql = "SELECT * FROM `{$table}` WHERE `id` LIKE '{$CID}'";

		$res = $db->query($sql);
		$card = $res->fetch_assoc();
		
		if ($table == "calc_quest"){
			$sql = "SELECT * FROM `calc_quest_item` WHERE `parent_quest_id` LIKE '{$CID}'";
			$res = $db->query($sql);
			
			$quest_item = array();
			while ($data = $res->fetch_assoc()) {
				$quest_item['quests'][]= $data;
			}
			$result = array_merge($card, $quest_item);
			echo json_encode($result);
		}else{
			echo json_encode($card);
		}

	}
	else{
		echo "0";
	}
?>
