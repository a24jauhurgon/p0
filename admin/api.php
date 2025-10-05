<?php
// /admin/api.php
declare(strict_types=1);
header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/../db.php'; // ajusta si tu db.php está en otra ruta

try {
    $method = $_SERVER['REQUEST_METHOD'];

    if ($method === 'GET') {
        $action = $_GET['action'] ?? 'list';

        if ($action === 'list') {
            $stmt = $pdo->query("SELECT id, pregunta, resposta1, resposta2, resposta3, respostaCorrecta, imatge FROM preguntes ORDER BY id DESC");
            echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC), JSON_UNESCAPED_UNICODE);
            exit;
        }

        if ($action === 'get') {
            $id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
            if ($id <= 0) {
                http_response_code(400);
                echo json_encode(['error' => 'ID invàlid']);
                exit;
            }
            $stmt = $pdo->prepare("SELECT id, pregunta, resposta1, resposta2, resposta3, respostaCorrecta, imatge FROM preguntes WHERE id = :id");
            $stmt->execute([':id' => $id]);
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            if (!$row) {
                http_response_code(404);
                echo json_encode(['error' => 'No trobat']);
                exit;
            }
            echo json_encode($row, JSON_UNESCAPED_UNICODE);
            exit;
        }

        http_response_code(400);
        echo json_encode(['error' => 'Acció GET desconeguda']);
        exit;
    }

    if ($method === 'POST') {
        $action = $_POST['action'] ?? '';

        if ($action === 'add') {
            $pregunta = trim($_POST['pregunta'] ?? '');
            $r1 = trim($_POST['resposta1'] ?? '');
            $r2 = trim($_POST['resposta2'] ?? '');
            $r3 = trim($_POST['resposta3'] ?? '');
            $rc = (int)($_POST['respostaCorrecta'] ?? 1);
            if ($rc < 1 || $rc > 3) $rc = 1;

            if ($pregunta === '' || $r1 === '' || $r2 === '' || $r3 === '') {
                http_response_code(400);
                echo json_encode(['error' => 'Camps obligatoris buits']);
                exit;
            }

            // Subida de imagen (opcional)
            $imatgeName = null;
            if (!empty($_FILES['imatge']['name'])) {
                $imatgeName = handleUpload($_FILES['imatge']);
                if ($imatgeName === null) {
                    http_response_code(400);
                    echo json_encode(['error' => 'Imatge no vàlida']);
                    exit;
                }
            }

            $sql = "INSERT INTO preguntes (pregunta, resposta1, resposta2, resposta3, respostaCorrecta, imatge)
                    VALUES (:pregunta, :r1, :r2, :r3, :rc, :img)";
            $stmt = $pdo->prepare($sql);
            $ok = $stmt->execute([
                ':pregunta' => $pregunta,
                ':r1' => $r1,
                ':r2' => $r2,
                ':r3' => $r3,
                ':rc' => $rc,
                ':img' => $imatgeName
            ]);

            echo json_encode(['ok' => (bool)$ok]);
            exit;
        }

        if ($action === 'update') {
            $id = (int)($_POST['id'] ?? 0);
            if ($id <= 0) {
                http_response_code(400);
                echo json_encode(['error' => 'ID invàlid']);
                exit;
            }
            $pregunta = trim($_POST['pregunta'] ?? '');
            $r1 = trim($_POST['resposta1'] ?? '');
            $r2 = trim($_POST['resposta2'] ?? '');
            $r3 = trim($_POST['resposta3'] ?? '');
            $rc = (int)($_POST['respostaCorrecta'] ?? 1);
            if ($rc < 1 || $rc > 3) $rc = 1;

            if ($pregunta === '' || $r1 === '' || $r2 === '' || $r3 === '') {
                http_response_code(400);
                echo json_encode(['error' => 'Camps obligatoris buits']);
                exit;
            }

            // ¿Nueva imagen?
            $imatgeName = null;
            if (!empty($_FILES['imatge']['name'])) {
                $imatgeName = handleUpload($_FILES['imatge']);
                if ($imatgeName === null) {
                    http_response_code(400);
                    echo json_encode(['error' => 'Imatge no vàlida']);
                    exit;
                }
                $sql = "UPDATE preguntes
                        SET pregunta=:pregunta, resposta1=:r1, resposta2=:r2, resposta3=:r3,
                            respostaCorrecta=:rc, imatge=:img
                        WHERE id=:id";
                $params = [
                    ':pregunta' => $pregunta, ':r1' => $r1, ':r2' => $r2, ':r3' => $r3,
                    ':rc' => $rc, ':img' => $imatgeName, ':id' => $id
                ];
            } else {
                $sql = "UPDATE preguntes
                        SET pregunta=:pregunta, resposta1=:r1, resposta2=:r2, resposta3=:r3,
                            respostaCorrecta=:rc
                        WHERE id=:id";
                $params = [
                    ':pregunta' => $pregunta, ':r1' => $r1, ':r2' => $r2, ':r3' => $r3,
                    ':rc' => $rc, ':id' => $id
                ];
            }

            $stmt = $pdo->prepare($sql);
            $ok = $stmt->execute($params);
            echo json_encode(['ok' => (bool)$ok]);
            exit;
        }

        if ($action === 'delete') {
            $id = (int)($_POST['id'] ?? 0);
            if ($id <= 0) {
                http_response_code(400);
                echo json_encode(['error' => 'ID invàlid']);
                exit;
            }
            $stmt = $pdo->prepare("DELETE FROM preguntes WHERE id = :id");
            $ok = $stmt->execute([':id' => $id]);
            echo json_encode(['ok' => (bool)$ok]);
            exit;
        }

        http_response_code(400);
        echo json_encode(['error' => 'Acció POST desconeguda']);
        exit;
    }

    http_response_code(405);
    echo json_encode(['error' => 'Mètode no permès']);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Error intern']);
}

/**
 * Maneja la subida de imagen.
 * Devuelve el nombre de archivo guardado (string) o null si no es válida.
 */
function handleUpload(array $file): ?string {
    if (!isset($file['tmp_name']) || $file['error'] !== UPLOAD_ERR_OK) return null;

    $allowed = [
        'image/png'      => 'png',
        'image/jpeg'     => 'jpg',
        'image/svg+xml'  => 'svg'
    ];
    $type = mime_content_type($file['tmp_name']) ?: $file['type'];
    if (!isset($allowed[$type])) return null;

    // Límite 2MB
    if (($file['size'] ?? 0) > 2 * 1024 * 1024) return null;

    $ext = $allowed[$type];
    $name = uniqid('img_', true) . '.' . $ext;

    $dest = realpath(__DIR__ . '/../img');
    if ($dest === false) {
        // intenta crear si no existe
        @mkdir(__DIR__ . '/../img', 0775, true);
        $dest = realpath(__DIR__ . '/../img');
        if ($dest === false) return null;
    }

    $ok = move_uploaded_file($file['tmp_name'], $dest . DIRECTORY_SEPARATOR . $name);
    return $ok ? $name : null;
}
