<?php
require_once "db.php";

error_reporting(E_ALL);
ini_set('display_errors', 1);
header("Content-Type: application/json; charset=UTF-8");

$input = json_decode(file_get_contents("php://input"), true);

if (!$input || !isset($input['respostes']) || !isset($input['ids'])) {
    echo json_encode(["error" => "Falten dades d'entrada"]);
    exit;
}

$respostes = $input['respostes'];
$ids = $input['ids'];

$total = count($ids);
$correctes = 0;

$placeholders = implode(',', array_fill(0, count($ids), '?'));

$sql = "SELECT id, respostaCorrecta FROM preguntes WHERE id IN ($placeholders)";
$stmt = $pdo->prepare($sql);
$stmt->execute($ids);

$map = [];
while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
    $map[$row['id']] = $row['respostaCorrecta'];
}

foreach ($ids as $i => $id) {
    if (isset($respostes[$i]) && $respostes[$i] !== null) {
        if ((int) $respostes[$i] === (int) $map[$id]) {
            $correctes++;
        }
    }
}

echo json_encode([
    "total" => $total,
    "correctes" => $correctes
]);
