# 🚦 Quiz Trànsit — Jaume Hurtado

Aplicació web interactiva per practicar preguntes del **carnet de conduir tipus B**.  
Inclou **temporitzador**, **emmagatzematge local**, **puntuació automàtica** i **panell d’administració complet** per gestionar preguntes i imatges.

---

## ✨ Funcionalitats principals

- 🧩 Test de **10 preguntes aleatòries** amb imatges.
- ⏱️ **Temporitzador** amb barra de progrés (30 segons).
- 💾 **Guardat automàtic** de la partida amb `localStorage`.
- 📱 **Interfície responsive** per a mòbil i escriptori.
- 📊 **Resultat final** amb nombre d’encerts.
- 🔁 **Reinici manual** de partida sense recarregar el joc.
- ⚙️ **Panell d’administració (CRUD)** amb afegir, editar, eliminar i pujada d’imatges.
- 🔄 **Ordenació ascendent/descendent** de les preguntes.
- 🎨 Disseny net i intuïtiu, tipus app d’aprendre teòrica.

---

## 🧱 Estructura del projecte

```
p0/
├── index.html           # Pàgina principal del quiz
├── script.js            # Lògica del joc i gestió de partida
├── style.css            # Estil principal per a desktop
├── style-mobil.css      # Adaptació responsive per a mòbils
│
├── db.php               # Connexió PDO a la base de dades
├── getPreguntes.php     # Retorna preguntes aleatòries (JSON)
├── finalitza.php        # Calcula el resultat i retorna encerts
│
├── admin/
│   ├── index.html       # Panell d’administració
│   ├── admin.js         # CRUD complet (AJAX / fetch)
│   ├── admin.css        # Estils per l’administració
│   └── api.php          # API CRUD (add, update, delete, list)
│
└── img/                 # Carpeta per les imatges pujades
```

---

## 🗄️ Estructura de la base de dades

### 🧩 Taula `preguntes`

| Columna           | Tipus           | Descripció                                 |
|-------------------|-----------------|---------------------------------------------|
| `id`              | INT, PK, AI     | Identificador únic de la pregunta           |
| `pregunta`        | TEXT            | Text de la pregunta                         |
| `resposta1`       | TEXT            | Primera opció de resposta                   |
| `resposta2`       | TEXT            | Segona opció de resposta                    |
| `resposta3`       | TEXT            | Tercera opció de resposta                   |
| `respostaCorrecta`| TINYINT         | Valor (1-3) que indica la resposta correcta |
| `imatge`          | VARCHAR(255)    | Nom del fitxer de la imatge (opcional)      |

---

## 🧰 Requisits

- PHP 8.0 o superior  
- MySQL / MariaDB  
- Servidor local (XAMPP, Laragon, MAMP o similar)
- Extensió **PDO** activada

---

## ⚙️ Instal·lació

1. **Copia el projecte** dins del teu servidor local (`htdocs` o equivalent).

2. **Crea la base de dades** i la taula `preguntes`:

   ```sql
   CREATE DATABASE quiz_transit CHARACTER SET utf8mb4;
   USE quiz_transit;

   CREATE TABLE preguntes (
     id INT AUTO_INCREMENT PRIMARY KEY,
     pregunta TEXT NOT NULL,
     resposta1 TEXT NOT NULL,
     resposta2 TEXT NOT NULL,
     resposta3 TEXT NOT NULL,
     respostaCorrecta TINYINT NOT NULL,
     imatge VARCHAR(255)
   );
   ```

3. **Configura la connexió** a `db.php`:
   ```php
   <?php
   $pdo = new PDO(
     "mysql:host=localhost;dbname=quiz_transit;charset=utf8mb4",
     "usuari",
     "contrasenya",
     [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
   );
   ?>
   ```

4. **Accedeix al joc:**
   ```
   http://localhost/p0/
   ```

5. **Panell d’administració:**
   ```
   http://localhost/p0/admin/
   ```

---

## 🧠 Funcionament

### 🎮 Joc (usuari)
- Carrega 10 preguntes de manera aleatòria via `getPreguntes.php`.
- Cada resposta es desa automàticament a `localStorage`.
- El progrés i el temps es mantenen encara que es recarregui la pàgina.
- En acabar (o en esgotar el temps), s’envien les respostes a `finalitza.php` per calcular el resultat.

### 🧑‍💻 Administració
- Llistat dinàmic de totes les preguntes.
- Pujar imatges (`png`, `jpg`, `svg`) amb validació i límit de mida (2 MB).
- Botons d’**afegir**, **editar**, **eliminar** i **ordenar**.
- Tot es gestiona mitjançant crides `fetch()` sense recarregar la pàgina.

---

## 📈 Extres implementats

- Barra de progrés animada per al temps.
- Menú inferior per navegar entre preguntes.
- Respostes marcades visualment com a contestades.
- Botó de **reiniciar partida**.
- Estètica responsive inspirada en aplicacions reals d’autoescoles.
- Fletxes d’ordenació a l’admin (asc/desc).

---

## 🧩 Rúbrica de lliurament

| Punt | Descripció | Estat |
|------|-------------|--------|
| 1 | Estructura correcta del projecte | ✅ |
| 2 | Lògica client i asincronia amb `fetch` | ✅ |
| 3 | Persistència i CRUD PHP-MySQL | ✅ |
| 4 | Gestió d’imatges | ✅ |
| 5 | Temporitzador funcional | ✅ |
| 6 | Interfície responsive | ✅ |
| 7 | Reinici i navegació per preguntes | ✅ |
| 8 | Documentació i netedat del codi | ✅ |

---

## 👨‍💻 Autor

**Jaume Hurtado González**  
🎓 CFGS Desenvolupament d’Aplicacions Web — *Institut Pedralbes (2025)*  
📍 Sant Andreu de la Barca
💬 Email: *a24jauhurgon@inspedralbes.cat*