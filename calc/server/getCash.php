<?php 
	include('connect.php');
	
	function IDtoSQL($str){
		$MID = explode('|',$str);
		$sql ="";
		for($i=0;$i<= count($MID)-2;$i++){
			if ($i==0){
				$sql = $sql."`id` LIKE '".$MID[$i]."' ";
			}else{
				$sql = $sql."OR `id` LIKE '".$MID[$i]."' ";
			}			
		}
		return $sql;
	}
	
	$table = $_POST["table"];
	$ID = $_POST["ID"];
	
	if ($table != "" and $ID != "0"){
		
		$table = "calc_".$table;
		
		$SQL = "SELECT SUM(`cash`) FROM `{$table}` WHERE ".IDtoSQL($ID);
		$res = $db->query($SQL);
		$sum = $res->fetch_assoc();
		if($sum["SUM(`cash`)"] != ""){echo $sum["SUM(`cash`)"];}else{echo "0";}
	}else{
		echo "0";
	}
	
?>