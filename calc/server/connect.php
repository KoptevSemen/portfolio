<?php

	$dbHost='localhost';
	$dbName='madagascarpark';// название вашей базы
	$dbUser='madagascarpark';// пользователь базы данных
	$dbPass='madagascarpark';// пароль пользователя
	 
	$db = new mysqli($dbHost,$dbUser,$dbPass,$dbName);
	$db->set_charset('utf8');
	
	if ($db->connect_errno) {
		die("Не удалось подключиться к MySQL: (" . $db->connect_errno . ") " . $db->connect_error);
	}
?>