<?php
// finalitza.php
declare(strict_types=1);
session_start();
header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/db.php'; // ajusta ruta si hace falta

try {
    $inputRaw = file_get_contents('php://input');
    $input = json_decode($inputRaw, true);

    if (!is_array($input)) {
        http_response_code(400);
        echo json_encode(['error' => 'JSON invàlid']);
        exit;
    }

    $ids = $input['ids'] ?? [];
    $respostes = $input['respostes'] ?? [];

    if (!is_array($ids) || !is_array($respostes) || count($ids) !== count($respostes)) {
        http_response_code(400);
        echo json_encode(['error' => 'Dades invàlides']);
        exit;
    }

    // Validar ids sean enteros
    $ids = array_values($ids);
    foreach ($ids as $i) {
        if (!ctype_digit((string)$i)) {
            http_response_code(400);
            echo json_encode(['error' => 'IDs invàlids']);
            exit;
        }
    }
    $ids = array_map('intval', $ids);

    // Validar que coincide con la sesión (si existe)
    if (!isset($_SESSION['ids_quiz']) || !is_array($_SESSION['ids_quiz'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Sessió no vàlida o caducada']);
        exit;
    }
    $idsSessio = array_map('intval', $_SESSION['ids_quiz']);

    if ($ids !== $idsSessio) {
        // Si quieres ser menos estricto podrías intersectar, pero por rúbrica validamos exactitud.
        http_response_code(400);
        echo json_encode(['error' => 'IDs de partida no coincideixen amb la sessió']);
        exit;
    }

    // Normalizar respostes: permitir null o 1..3
    $respostes = array_map(function ($v) {
        if ($v === null) return null;
        $vi = (int)$v;
        return ($vi >= 1 && $vi <= 3) ? $vi : null;
    }, $respostes);

    if (count($ids) === 0) {
        echo json_encode(['total' => 0, 'correctes' => 0]);
        exit;
    }

    // Cargar las correctas de BD
    $in = implode(',', array_fill(0, count($ids), '?'));
    $sql = "SELECT id, respostaCorrecta FROM preguntes WHERE id IN ($in)";
    $stmt = $pdo->prepare($sql);
    foreach ($ids as $k => $id) {
        $stmt->bindValue($k + 1, $id, PDO::PARAM_INT);
    }
    $stmt->execute();

    $map = [];
    foreach ($stmt->fetchAll(PDO::FETCH_ASSOC) as $row) {
        $map[(int)$row['id']] = (int)$row['respostaCorrecta'];
    }

    // Calcular aciertos
    $correctes = 0;
    foreach ($ids as $idx => $id) {
        $rUsuari = $respostes[$idx]; // null|int
        if ($rUsuari !== null && isset($map[$id]) && $map[$id] === $rUsuari) {
            $correctes++;
        }
    }

    echo json_encode([
        'total'     => count($ids),
        'correctes' => $correctes
    ], JSON_UNESCAPED_UNICODE);

} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Error finalitzant']);
}
