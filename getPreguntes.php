<?php
require_once "db.php";

$n = isset($_GET['n']) ? intval($_GET['n']) : 10;

try {
    $stmt = $pdo->prepare("SELECT id, pregunta, resposta1, resposta2, resposta3, imatge 
                           FROM preguntes 
                           ORDER BY RAND() 
                           LIMIT :n");
    $stmt->bindValue(':n', $n, PDO::PARAM_INT);
    $stmt->execute();

    $preguntes = $stmt->fetchAll(PDO::FETCH_ASSOC);

    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($preguntes);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Error en la BD: " . $e->getMessage()]);
}
