<?php

$host = "thomassteinke.db";
$username = "thomassteink";
$password = "2bORNOT2b";
$database = "threetris";

header('Access-Control-Allow-Origin: *');  

$ip_addr = $_SERVER['REMOTE_ADDR'];

$connect = new mysqli($host, $username, $password, $database);

if ($connect->connect_error) {
  die("Failed to connect to MySQL: " . $connect->connect_error);
}

if ($_POST['message']) {
   $msg = $ip_addr . ': ' . $_POST['message'];

   if (strlen($msg) > 0) {
      mail("exyphnos@gmail.com", "Error in Threetris", $msg);
   }
}
else if ($_POST['type']) {
   $query = $connect->prepare("INSERT INTO views (version, IP, timestamp, type, data) VALUES (2, '" . $ip_addr . "', NOW(), ?, ?)");

   $query->bind_param("ss", $_POST['type'], $_POST['data'] ?: '{}');

   $query->execute();
}
else if (isset($_POST['score'])) {
   $query = $connect->prepare("INSERT INTO scores (IP, timestamp, name, score, replay, game_type) VALUES ('" . $ip_addr . "', NOW(), ?, ?, ?, ?)");

   $query->bind_param("sdss", $_POST['name'], $_POST['score'], $_POST['replay'], $_POST['game_type']);

   $query->execute();
}
else if ($_GET['scores']) {
   $q = "SELECT id, name, score FROM scores WHERE game_type = ?";
   if ($_GET['type'] == 'daily') {
      $q .= " AND timestamp >= CONCAT(CURDATE(), ' 07:00:00')";
   }

   $q .= " ORDER BY score DESC";

   if ($_GET['limit']) {
      $q .= " LIMIT ?";
   }

   $query = $connect->prepare($q);

   if ($_GET['limit']) {
      $query->bind_param("sd", $_GET['scores'], $_GET['limit']);
   }
   else {
      $query->bind_param("s", $_GET['scores']);
   }

   $query->execute();
   $result = $query->get_result();

   header('Content-Type: application/json');
   print json_encode($result->fetch_all(MYSQLI_ASSOC));
}
?>