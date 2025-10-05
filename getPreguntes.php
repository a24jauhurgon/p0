<?php
// getPreguntes.php
declare(strict_types=1);
session_start();
header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/db.php'; // ajusta ruta si hace falta

try {
    // Validar n (1..50 por si acaso; cambia a 10 si lo prefieres)
    $n = filter_input(INPUT_GET, 'n', FILTER_VALIDATE_INT, [
        'options' => ['default' => 10, 'min_range' => 1, 'max_range' => 50]
    ]);

    // Query aleatoria (volumen pequeño -> RAND() está bien)
    $sql = "SELECT id, pregunta, resposta1, resposta2, resposta3, imatge
            FROM preguntes
            ORDER BY RAND()
            LIMIT :n";
    $stmt = $pdo->prepare($sql);
    $stmt->bindValue(':n', $n, PDO::PARAM_INT);
    $stmt->execute();

    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Guardamos los IDs en sesión para validar en finalitza.php
    $_SESSION['ids_quiz'] = array_map('intval', array_column($rows, 'id'));

    echo json_encode($rows, JSON_UNESCAPED_UNICODE);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Error carregant preguntes']);
}
