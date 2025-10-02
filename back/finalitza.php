<?php
header("Content-Type: application/json; charset=utf-8");
require_once "db.php";

$input = json_decode(file_get_contents("php://input"), true);
if (!isset($input['respostes']) || !is_array($input['respostes'])) {
    http_response_code(400);
    echo json_encode(["error" => "Formato de entrada inválido"]);
    exit;
}

$respostesUsuari = $input['respostes'];
$total = count($respostesUsuari);
$encerts = 0;

foreach ($respostesUsuari as $r) {
    if (!isset($r['id']) || !isset($r['resposta']))
        continue;

    $stmt = $pdo->prepare("SELECT respostaCorrecta FROM preguntes WHERE id = :id");
    $stmt->execute([':id' => $r['id']]);
    $row = $stmt->fetch();

    if ($row && (int) $r['resposta'] + 1 === (int) $row['respostaCorrecta']) {
        $encerts++;
    }
}

echo json_encode([
    "total" => $total,
    "encerts" => $encerts
]);
