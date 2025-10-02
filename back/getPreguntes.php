<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

header("Content-Type: application/json; charset=utf-8");

require_once "db.php";

$n = isset($_GET['n']) ? (int) $_GET['n'] : 6;
if ($n <= 0)
    $n = 6;

$sql = "SELECT id, pregunta, resposta1, resposta2, resposta3, imatge
        FROM preguntes
        ORDER BY RAND()
        LIMIT :n";

$stmt = $pdo->prepare($sql);
$stmt->bindValue(":n", $n, PDO::PARAM_INT);
$stmt->execute();
$preguntes = $stmt->fetchAll();

$result = [];
foreach ($preguntes as $p) {
    $result[] = [
        "id" => (int) $p['id'],
        "pregunta" => $p['pregunta'],
        "respostes" => [
            $p['resposta1'],
            $p['resposta2'],
            $p['resposta3']
        ],
        "imatge" => $p['imatge'] ?: null
    ];
}

echo json_encode($result, JSON_UNESCAPED_UNICODE);
