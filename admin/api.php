<?php
require_once "../db.php"; // connexió PDO

header("Content-Type: application/json; charset=UTF-8");

$action = $_GET['action'] ?? '';

try {
    switch ($action) {
        case 'list':
            $stmt = $pdo->query("SELECT * FROM preguntes ORDER BY id ASC");
            $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode($rows);
            break;

        case 'get':
            $id = intval($_GET['id']);
            $stmt = $pdo->prepare("SELECT * FROM preguntes WHERE id = ?");
            $stmt->execute([$id]);
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            echo json_encode($row);
            break;

        case 'add':
            $pregunta = $_POST['pregunta'] ?? '';
            $r1 = $_POST['resposta1'] ?? '';
            $r2 = $_POST['resposta2'] ?? '';
            $r3 = $_POST['resposta3'] ?? '';
            $correcta = intval($_POST['respostaCorrecta'] ?? 1);
            $imatge = $_POST['imatge'] ?? '';

            $stmt = $pdo->prepare("INSERT INTO preguntes (pregunta, resposta1, resposta2, resposta3, respostaCorrecta, imatge) 
                                   VALUES (?, ?, ?, ?, ?, ?)");
            $stmt->execute([$pregunta, $r1, $r2, $r3, $correcta, $imatge]);
            echo json_encode(["status" => "ok"]);
            break;

        case 'update':
            $id = intval($_POST['id']);
            $pregunta = $_POST['pregunta'] ?? '';
            $r1 = $_POST['resposta1'] ?? '';
            $r2 = $_POST['resposta2'] ?? '';
            $r3 = $_POST['resposta3'] ?? '';
            $correcta = intval($_POST['respostaCorrecta'] ?? 1);
            $imatge = $_POST['imatge'] ?? '';

            $stmt = $pdo->prepare("UPDATE preguntes 
                                   SET pregunta=?, resposta1=?, resposta2=?, resposta3=?, respostaCorrecta=?, imatge=? 
                                   WHERE id=?");
            $stmt->execute([$pregunta, $r1, $r2, $r3, $correcta, $imatge, $id]);
            echo json_encode(["status" => "ok"]);
            break;

        case 'delete':
            $id = intval($_GET['id']);
            $stmt = $pdo->prepare("DELETE FROM preguntes WHERE id = ?");
            $stmt->execute([$id]);
            echo json_encode(["status" => "ok"]);
            break;

        default:
            echo json_encode(["error" => "Acció no vàlida"]);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}
