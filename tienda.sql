USE tienda;

CREATE TABLE usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(100) NOT NULL,
  rol VARCHAR(20) NOT NULL DEFAULT 'usuario'
);

-- password guarda el hash, nunca la clave:
-- await bcrypt.hash(password, 10)

SELECT id, email, rol FROM usuarios;