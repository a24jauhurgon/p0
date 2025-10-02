<?php
$host = 'localhost';
$dbname = 'a24jauhurgon_autoescola';
$username = 'a24jauhurgon_autoescola';
$password = 'Jaume12345';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    die("Error de connexió: " . $e->getMessage());
}