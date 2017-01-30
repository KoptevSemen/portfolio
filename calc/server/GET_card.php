<?php 
	include('connect.php');
	if ((isset($_POST["keyword"])) AND (isset($_POST["CID"])))
	{ 
		$keyword = "calc_".$_POST["keyword"];
		$city = $_POST["CID"];
		$age = $_POST["age"];
		
		
		if ($age != 0){
			$SQL = "SELECT `id`,`name`,`img_url`,`age` FROM `{$keyword}` WHERE `id_city` LIKE '{$city}' AND `age` LIKE '{$age}'";
		}else{
			$SQL = "SELECT `id`,`name`,`img_url` FROM `{$keyword}` WHERE `id_city` LIKE '{$city}'";			
		}
		
		$res = $db->query($SQL);
		$data = array();
		while ($item = $res->fetch_assoc()) {
			$data[]=$item;
		}
		echo json_encode($data);
	}else
	{
		echo "0";
	}
?>