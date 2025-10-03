<?php
require_once "../db.php";
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $stmt = $pdo->query("SELECT * FROM preguntes");
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);
    $sql = "INSERT INTO preguntes (pregunta, resposta1, resposta2, resposta3, respostaCorrecta, imatge) 
            VALUES (:pregunta, :r1, :r2, :r3, :correcta, :imatge)";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        ":pregunta" => $data['pregunta'],
        ":r1" => $data['r1'],
        ":r2" => $data['r2'],
        ":r3" => $data['r3'],
        ":correcta" => intval($data['correcta']),
        ":imatge" => $data['imatge'] ?? null
    ]);
    echo json_encode(["success" => true]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    $data = json_decode(file_get_contents("php://input"), true);
    $sql = "UPDATE preguntes 
            SET pregunta=:pregunta, resposta1=:r1, resposta2=:r2, resposta3=:r3, respostaCorrecta=:correcta, imatge=:imatge
            WHERE id=:id";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        ":pregunta" => $data['pregunta'],
        ":r1" => $data['r1'],
        ":r2" => $data['r2'],
        ":r3" => $data['r3'],
        ":correcta" => intval($data['correcta']),
        ":imatge" => $data['imatge'] ?? null,
        ":id" => intval($data['id'])
    ]);
    echo json_encode(["success" => true]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    parse_str(file_get_contents("php://input"), $data);
    $stmt = $pdo->prepare("DELETE FROM preguntes WHERE id=:id");
    $stmt->execute([":id" => $data['id']]);
    echo json_encode(["success" => true]);
    exit;
}
