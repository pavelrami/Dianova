-- MySQL dump 10.13  Distrib 8.0.46, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: dianova
-- ------------------------------------------------------
-- Server version	8.0.46

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Current Database: `dianova`
--

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `dianova` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;

USE `dianova`;

--
-- Table structure for table `eventos`
--

DROP TABLE IF EXISTS `eventos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `eventos` (
  `id_evento` bigint NOT NULL AUTO_INCREMENT,
  `id_creador` bigint NOT NULL,
  `id_materia` bigint DEFAULT NULL,
  `titulo` varchar(150) NOT NULL,
  `descripcion` varchar(2000) DEFAULT NULL,
  `ubicacion` varchar(150) DEFAULT NULL,
  `inicio` datetime(6) NOT NULL,
  `fin` datetime(6) NOT NULL,
  `tipo` varchar(12) NOT NULL,
  `estado` varchar(12) NOT NULL DEFAULT 'PROGRAMADO',
  `creado_en` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `actualizado_en` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id_evento`),
  KEY `fk_eventos_creador` (`id_creador`),
  KEY `fk_eventos_materia` (`id_materia`),
  KEY `ix_eventos_inicio` (`inicio`),
  CONSTRAINT `fk_eventos_creador` FOREIGN KEY (`id_creador`) REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE,
  CONSTRAINT `fk_eventos_materia` FOREIGN KEY (`id_materia`) REFERENCES `materias` (`id_materia`) ON DELETE CASCADE,
  CONSTRAINT `ck_eventos_estado` CHECK ((`estado` in (_utf8mb4'PROGRAMADO',_utf8mb4'CANCELADO',_utf8mb4'FINALIZADO'))),
  CONSTRAINT `ck_eventos_rango` CHECK ((`fin` > `inicio`)),
  CONSTRAINT `ck_eventos_tipo` CHECK ((`tipo` in (_utf8mb4'CLASE',_utf8mb4'EXAMEN',_utf8mb4'ENTREGA',_utf8mb4'TALLER',_utf8mb4'ESTUDIO',_utf8mb4'ASESORIA',_utf8mb4'SOCIAL',_utf8mb4'PERSONAL')))
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `eventos`
--

LOCK TABLES `eventos` WRITE;
/*!40000 ALTER TABLE `eventos` DISABLE KEYS */;
INSERT INTO `eventos` VALUES (1,3,2,'Examen parcial de Física III','Temas: inducción, circuitos RLC y óptica geométrica.','Aula Magna','2026-11-26 16:00:00.000000','2026-11-26 17:30:00.000000','EXAMEN','FINALIZADO','2026-11-26 17:30:03.058246','2026-11-26 17:30:03.058246'),(2,6,5,'Taller de prototipado en Figma','Componentes, variantes y auto-layout para el proyecto final.','Laboratorio de Cómputo 4','2026-11-26 16:00:00.000000','2026-11-26 18:00:00.000000','TALLER','PROGRAMADO','2026-11-26 17:30:03.069444','2026-11-26 17:30:03.069444'),(3,3,2,'Repaso general: electromagnetismo','Sesión grupal para resolver la guía del parcial.','Biblioteca Central, sala B','2026-11-27 15:30:00.000000','2026-11-27 17:30:00.000000','ESTUDIO','PROGRAMADO','2026-11-26 17:30:03.077444','2026-11-26 17:30:03.077444'),(4,2,1,'Asesoría de Cálculo Vectorial','Dudas sobre la entrega de integrales de línea.','Cubículo Prof. Méndez','2026-12-04 12:00:00.000000','2026-12-04 13:00:00.000000','ASESORIA','PROGRAMADO','2026-11-26 17:30:03.085463','2026-11-26 17:30:03.085463'),(5,5,4,'Demo del sprint 3','Cada equipo presenta su incremento.','Cubículo 5','2026-11-30 11:00:00.000000','2026-11-30 12:30:00.000000','ENTREGA','PROGRAMADO','2026-11-26 17:30:03.094460','2026-11-26 17:30:03.094460'),(6,4,8,'Examen de Bases de Datos','Modelo E-R, normalización y SQL.','Lab. de Cómputo 1','2026-12-05 11:00:00.000000','2026-12-05 13:00:00.000000','EXAMEN','PROGRAMADO','2026-11-26 17:30:03.104561','2026-11-26 17:30:03.104561'),(7,6,7,'Code review de proyectos web','Revisión en parejas de los repositorios.','Lab. de Cómputo 2','2026-11-23 16:00:00.000000','2026-11-23 18:00:00.000000','TALLER','FINALIZADO','2026-11-26 17:30:03.113557','2026-11-26 17:30:03.113557'),(8,5,6,'Debate: ética e inteligencia artificial','Lectura previa obligatoria.','Aula 12','2026-12-02 12:00:00.000000','2026-12-02 13:30:00.000000','CLASE','PROGRAMADO','2026-11-26 17:30:03.125555','2026-11-26 17:30:03.125555'),(9,2,9,'Examen de Probabilidad','Unidades 3 y 4.','Aula 106','2026-12-07 07:00:00.000000','2026-12-07 08:30:00.000000','EXAMEN','PROGRAMADO','2026-11-26 17:30:03.134572','2026-11-26 17:30:03.134572'),(10,3,10,'Práctica de cableado estructurado','Traer pinzas y cable UTP.','Lab. de Redes','2026-11-28 13:00:00.000000','2026-11-28 15:00:00.000000','TALLER','PROGRAMADO','2026-11-26 17:30:03.144575','2026-11-26 17:30:03.144575'),(11,1,NULL,'Feria de Proyectos de Innovación','Exposición abierta a toda la comunidad.','Explanada principal','2026-12-03 09:00:00.000000','2026-12-03 15:00:00.000000','SOCIAL','PROGRAMADO','2026-11-26 17:30:03.155109','2026-11-26 17:30:03.155109'),(12,1,NULL,'Conferencia: IA aplicada en ingeniería','Ponencia magistral de investigadores invitados.','Auditorio principal','2026-11-29 11:00:00.000000','2026-11-29 13:00:00.000000','SOCIAL','PROGRAMADO','2026-11-26 17:30:03.157108','2026-11-26 17:30:03.157108'),(13,7,NULL,'Reunión de equipo: proyecto final UX','Definir el flujo del prototipo.','Cubículo 3, biblioteca','2026-11-30 16:00:00.000000','2026-11-30 17:00:00.000000','PERSONAL','PROGRAMADO','2026-11-26 17:30:03.158110','2026-11-26 17:30:03.158110'),(14,7,NULL,'Cita con tutora académica',NULL,'Coordinación de Ingeniería','2026-12-01 10:00:00.000000','2026-12-01 10:30:00.000000','PERSONAL','PROGRAMADO','2026-11-26 17:30:03.159107','2026-11-26 17:30:03.159107'),(15,8,NULL,'Estudio en grupo de Álgebra',NULL,'Biblioteca','2026-11-28 18:00:00.000000','2026-11-28 19:30:00.000000','ESTUDIO','PROGRAMADO','2026-11-26 17:30:03.161106','2026-11-26 17:30:03.161106');
/*!40000 ALTER TABLE `eventos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `flyway_schema_history`
--

DROP TABLE IF EXISTS `flyway_schema_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `flyway_schema_history` (
  `installed_rank` int NOT NULL,
  `version` varchar(50) DEFAULT NULL,
  `description` varchar(200) NOT NULL,
  `type` varchar(20) NOT NULL,
  `script` varchar(1000) NOT NULL,
  `checksum` int DEFAULT NULL,
  `installed_by` varchar(100) NOT NULL,
  `installed_on` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `execution_time` int NOT NULL,
  `success` tinyint(1) NOT NULL,
  PRIMARY KEY (`installed_rank`),
  KEY `flyway_schema_history_s_idx` (`success`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `flyway_schema_history`
--

LOCK TABLES `flyway_schema_history` WRITE;
/*!40000 ALTER TABLE `flyway_schema_history` DISABLE KEYS */;
INSERT INTO `flyway_schema_history` VALUES (1,'1','crear esquema','SQL','V1__crear_esquema.sql',842718259,'root','2026-11-26 23:29:54',401,1),(2,'2','catalogo roles','SQL','V2__catalogo_roles.sql',531005439,'root','2026-11-26 23:29:54',6,1),(3,'3','codigos verificacion','SQL','V3__codigos_verificacion.sql',1568630038,'root','2026-11-26 23:29:54',97,1);
/*!40000 ALTER TABLE `flyway_schema_history` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `horarios_clase`
--

DROP TABLE IF EXISTS `horarios_clase`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `horarios_clase` (
  `id_horario` bigint NOT NULL AUTO_INCREMENT,
  `id_materia` bigint NOT NULL,
  `dia_semana` int NOT NULL,
  `hora_inicio` time NOT NULL,
  `hora_fin` time NOT NULL,
  `aula` varchar(60) DEFAULT NULL,
  PRIMARY KEY (`id_horario`),
  KEY `fk_horarios_materia` (`id_materia`),
  CONSTRAINT `fk_horarios_materia` FOREIGN KEY (`id_materia`) REFERENCES `materias` (`id_materia`) ON DELETE CASCADE,
  CONSTRAINT `ck_horarios_dia` CHECK ((`dia_semana` between 1 and 7)),
  CONSTRAINT `ck_horarios_rango` CHECK ((`hora_fin` > `hora_inicio`))
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `horarios_clase`
--

LOCK TABLES `horarios_clase` WRITE;
/*!40000 ALTER TABLE `horarios_clase` DISABLE KEYS */;
INSERT INTO `horarios_clase` VALUES (1,1,1,'08:30:00','10:00:00','Aula 204'),(2,1,3,'08:30:00','10:00:00','Aula 204'),(3,2,2,'09:00:00','11:00:00','Lab. de Física 2'),(4,2,4,'10:00:00','12:00:00','Lab. de Física 2'),(5,3,1,'14:00:00','15:30:00','Aula 108'),(6,3,3,'14:00:00','15:30:00','Aula 108'),(7,4,5,'11:00:00','12:30:00','Cubículo 5'),(8,5,5,'08:30:00','10:30:00','Laboratorio 4'),(9,6,2,'12:00:00','13:30:00','Aula 12'),(10,7,2,'16:00:00','18:00:00','Lab. de Cómputo 2'),(11,7,4,'16:00:00','18:00:00','Lab. de Cómputo 2'),(12,8,1,'11:00:00','13:00:00','Lab. de Cómputo 1'),(13,8,3,'11:00:00','13:00:00','Lab. de Cómputo 1'),(14,9,2,'07:00:00','08:30:00','Aula 106'),(15,9,4,'07:00:00','08:30:00','Aula 106'),(16,10,5,'13:00:00','15:00:00','Lab. de Redes'),(17,11,1,'16:00:00','17:30:00','Aula 210'),(18,11,3,'16:00:00','17:30:00','Aula 210'),(19,12,4,'12:30:00','14:30:00','Aula 301');
/*!40000 ALTER TABLE `horarios_clase` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `inscripciones`
--

DROP TABLE IF EXISTS `inscripciones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `inscripciones` (
  `id_inscripcion` bigint NOT NULL AUTO_INCREMENT,
  `id_estudiante` bigint NOT NULL,
  `id_materia` bigint NOT NULL,
  `fecha_inscripcion` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `estado` varchar(12) NOT NULL DEFAULT 'ACTIVA',
  PRIMARY KEY (`id_inscripcion`),
  UNIQUE KEY `uq_inscripciones_estudiante_materia` (`id_estudiante`,`id_materia`),
  KEY `fk_inscripciones_materia` (`id_materia`),
  CONSTRAINT `fk_inscripciones_estudiante` FOREIGN KEY (`id_estudiante`) REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE,
  CONSTRAINT `fk_inscripciones_materia` FOREIGN KEY (`id_materia`) REFERENCES `materias` (`id_materia`) ON DELETE CASCADE,
  CONSTRAINT `ck_inscripciones_estado` CHECK ((`estado` in (_utf8mb4'ACTIVA',_utf8mb4'BAJA',_utf8mb4'FINALIZADA')))
) ENGINE=InnoDB AUTO_INCREMENT=70 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inscripciones`
--

LOCK TABLES `inscripciones` WRITE;
/*!40000 ALTER TABLE `inscripciones` DISABLE KEYS */;
INSERT INTO `inscripciones` VALUES (1,7,1,'2026-08-21 18:30:01.198733','ACTIVA'),(2,7,2,'2026-08-21 23:30:01.198733','ACTIVA'),(3,7,3,'2026-08-22 05:30:01.198733','ACTIVA'),(4,7,4,'2026-08-22 08:30:01.198733','ACTIVA'),(5,7,5,'2026-08-23 10:30:01.198733','ACTIVA'),(6,7,6,'2026-08-22 03:30:01.198733','ACTIVA'),(7,8,9,'2026-08-21 02:30:01.198733','ACTIVA'),(8,8,4,'2026-08-23 13:30:01.198733','ACTIVA'),(9,8,3,'2026-08-22 15:30:01.198733','ACTIVA'),(10,8,2,'2026-08-21 01:30:01.198733','ACTIVA'),(11,9,11,'2026-08-23 11:30:01.198733','ACTIVA'),(12,9,5,'2026-08-20 22:30:01.198733','ACTIVA'),(13,9,1,'2026-08-21 11:30:01.198733','ACTIVA'),(14,9,7,'2026-08-22 03:30:01.198733','ACTIVA'),(15,10,6,'2026-08-22 20:30:01.198733','ACTIVA'),(16,10,1,'2026-08-22 23:30:01.198733','ACTIVA'),(17,10,3,'2026-08-21 23:30:01.198733','ACTIVA'),(18,10,12,'2026-08-22 15:30:01.198733','ACTIVA'),(19,11,10,'2026-08-22 09:30:01.198733','ACTIVA'),(20,11,7,'2026-08-22 17:30:01.198733','ACTIVA'),(21,11,5,'2026-08-23 03:30:01.198733','ACTIVA'),(22,11,3,'2026-08-21 21:30:01.198733','ACTIVA'),(23,11,8,'2026-08-20 18:30:01.198733','ACTIVA'),(24,12,8,'2026-08-21 16:30:01.198733','ACTIVA'),(25,12,10,'2026-08-21 00:30:01.198733','ACTIVA'),(26,12,12,'2026-08-23 11:30:01.198733','ACTIVA'),(27,12,1,'2026-08-23 16:30:01.198733','BAJA'),(28,12,5,'2026-08-20 20:30:01.198733','ACTIVA'),(29,12,7,'2026-08-21 07:30:01.198733','ACTIVA'),(30,13,4,'2026-08-23 07:30:01.198733','ACTIVA'),(31,13,5,'2026-08-21 23:30:01.198733','ACTIVA'),(32,13,10,'2026-08-23 15:30:01.198733','ACTIVA'),(33,13,9,'2026-08-23 14:30:01.198733','ACTIVA'),(34,13,11,'2026-08-21 22:30:01.198733','ACTIVA'),(35,13,8,'2026-08-23 15:30:01.198733','ACTIVA'),(36,14,7,'2026-08-23 05:30:01.198733','ACTIVA'),(37,14,9,'2026-08-21 09:30:01.198733','ACTIVA'),(38,14,12,'2026-08-22 06:30:01.198733','ACTIVA'),(39,14,6,'2026-08-23 10:30:01.198733','ACTIVA'),(40,14,2,'2026-08-21 03:30:01.198733','ACTIVA'),(41,15,10,'2026-08-23 15:30:01.198733','ACTIVA'),(42,15,7,'2026-08-23 04:30:01.198733','ACTIVA'),(43,15,4,'2026-08-20 22:30:01.198733','ACTIVA'),(44,15,8,'2026-08-20 23:30:01.198733','ACTIVA'),(45,16,4,'2026-08-21 16:30:01.198733','ACTIVA'),(46,16,10,'2026-08-20 22:30:01.198733','ACTIVA'),(47,16,1,'2026-08-23 14:30:01.198733','ACTIVA'),(48,16,2,'2026-08-23 13:30:01.198733','ACTIVA'),(49,16,7,'2026-08-22 01:30:01.198733','ACTIVA'),(50,17,10,'2026-08-22 03:30:01.198733','ACTIVA'),(51,17,7,'2026-08-22 01:30:01.198733','ACTIVA'),(52,17,8,'2026-08-23 02:30:01.198733','ACTIVA'),(53,17,12,'2026-08-21 14:30:01.198733','ACTIVA'),(54,17,1,'2026-08-20 18:30:01.198733','ACTIVA'),(55,18,9,'2026-08-21 09:30:01.198733','ACTIVA'),(56,18,11,'2026-08-21 07:30:01.198733','ACTIVA'),(57,18,12,'2026-08-21 04:30:01.198733','ACTIVA'),(58,18,7,'2026-08-21 10:30:01.198733','ACTIVA'),(59,18,5,'2026-08-23 02:30:01.198733','ACTIVA'),(60,19,10,'2026-08-22 23:30:01.198733','ACTIVA'),(61,19,8,'2026-08-21 10:30:01.198733','ACTIVA'),(62,19,9,'2026-08-21 00:30:01.198733','ACTIVA'),(63,19,3,'2026-08-23 07:30:01.198733','ACTIVA'),(64,19,6,'2026-08-21 02:30:01.198733','ACTIVA'),(65,20,2,'2026-08-22 17:30:01.198733','ACTIVA'),(66,20,4,'2026-08-22 16:30:01.198733','ACTIVA'),(67,20,9,'2026-08-20 18:30:01.198733','ACTIVA'),(68,20,11,'2026-08-21 21:30:01.198733','ACTIVA'),(69,7,13,'2026-01-26 17:30:01.198733','FINALIZADA');
/*!40000 ALTER TABLE `inscripciones` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `materias`
--

DROP TABLE IF EXISTS `materias`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `materias` (
  `id_materia` bigint NOT NULL AUTO_INCREMENT,
  `id_periodo` bigint NOT NULL,
  `id_docente` bigint DEFAULT NULL,
  `codigo_grupo` varchar(20) NOT NULL,
  `nombre` varchar(120) NOT NULL,
  `creditos` int NOT NULL,
  `color` varchar(7) NOT NULL DEFAULT '#C99A4B',
  `aula` varchar(60) DEFAULT NULL,
  `descripcion` varchar(1000) DEFAULT NULL,
  `creado_en` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `actualizado_en` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id_materia`),
  UNIQUE KEY `uq_materias_periodo_grupo` (`id_periodo`,`codigo_grupo`),
  KEY `fk_materias_docente` (`id_docente`),
  CONSTRAINT `fk_materias_docente` FOREIGN KEY (`id_docente`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL,
  CONSTRAINT `fk_materias_periodo` FOREIGN KEY (`id_periodo`) REFERENCES `periodos_academicos` (`id_periodo`),
  CONSTRAINT `ck_materias_color` CHECK (regexp_like(`color`,_utf8mb4'^#[0-9A-Fa-f]{6}$')),
  CONSTRAINT `ck_materias_creditos` CHECK ((`creditos` between 1 and 20))
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `materias`
--

LOCK TABLES `materias` WRITE;
/*!40000 ALTER TABLE `materias` DISABLE KEYS */;
INSERT INTO `materias` VALUES (1,2,2,'MAT-301-A','Cálculo Vectorial',6,'#C99A4B','Aula 204','Curso del periodo 2026-2 impartido por Alejandro Méndez Ruiz.','2026-11-26 17:30:02.585910','2026-11-26 17:30:02.585910'),(2,2,3,'FIS-302-A','Física General III',6,'#8FAF8B','Lab. de Física 2','Curso del periodo 2026-2 impartido por Elena Santos Ibarra.','2026-11-26 17:30:02.599013','2026-11-26 17:30:02.599013'),(3,2,4,'MAT-303-A','Álgebra Lineal',5,'#9A5530','Aula 108','Curso del periodo 2026-2 impartido por Roberto Castillo Peña.','2026-11-26 17:30:02.604012','2026-11-26 17:30:02.604012'),(4,2,5,'ING-304-A','Metodologías Ágiles',4,'#D9A441','Cubículo 5','Curso del periodo 2026-2 impartido por Carmen Silva Robles.','2026-11-26 17:30:02.609017','2026-11-26 17:30:02.609017'),(5,2,6,'ING-305-A','Diseño de Interfaces UX/UI',4,'#7A1F1F','Laboratorio 4','Curso del periodo 2026-2 impartido por Daniel Ortega Luna.','2026-11-26 17:30:02.613013','2026-11-26 17:30:02.613013'),(6,2,5,'HUM-201-A','Ética y Sociedad',3,'#B9A48A','Aula 12','Curso del periodo 2026-2 impartido por Carmen Silva Robles.','2026-11-26 17:30:02.619016','2026-11-26 17:30:02.619016'),(7,2,6,'PRG-310-A','Programación Web',6,'#B5653B','Lab. de Cómputo 2','Curso del periodo 2026-2 impartido por Daniel Ortega Luna.','2026-11-26 17:30:02.622044','2026-11-26 17:30:02.622044'),(8,2,4,'BDD-320-A','Bases de Datos',6,'#6B4A3A','Lab. de Cómputo 1','Curso del periodo 2026-2 impartido por Roberto Castillo Peña.','2026-11-26 17:30:02.627043','2026-11-26 17:30:02.627043'),(9,2,2,'EST-210-A','Probabilidad y Estadística',5,'#7F8A4E','Aula 106','Curso del periodo 2026-2 impartido por Alejandro Méndez Ruiz.','2026-11-26 17:30:02.633036','2026-11-26 17:30:02.633036'),(10,2,3,'RED-330-A','Redes de Computadoras',5,'#5F7F7A','Lab. de Redes','Curso del periodo 2026-2 impartido por Elena Santos Ibarra.','2026-11-26 17:30:02.638031','2026-11-26 17:30:02.638031'),(11,2,6,'SIS-340-A','Sistemas Operativos',5,'#7B4B5E','Aula 210','Curso del periodo 2026-2 impartido por Daniel Ortega Luna.','2026-11-26 17:30:02.642029','2026-11-26 17:30:02.642029'),(12,2,5,'ING-350-A','Ingeniería de Software',6,'#C47A6B','Aula 301','Curso del periodo 2026-2 impartido por Carmen Silva Robles.','2026-11-26 17:30:02.650429','2026-11-26 17:30:02.650429'),(13,1,2,'MAT-201-A','Cálculo Diferencial',6,'#C99A4B',NULL,NULL,'2026-11-26 17:30:02.654428','2026-11-26 17:30:02.654428'),(14,1,6,'PRG-110-A','Fundamentos de Programación',6,'#B5653B',NULL,NULL,'2026-11-26 17:30:02.656431','2026-11-26 17:30:02.656431');
/*!40000 ALTER TABLE `materias` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `participaciones_evento`
--

DROP TABLE IF EXISTS `participaciones_evento`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `participaciones_evento` (
  `id_participacion` bigint NOT NULL AUTO_INCREMENT,
  `id_evento` bigint NOT NULL,
  `id_usuario` bigint NOT NULL,
  `respuesta` varchar(12) NOT NULL DEFAULT 'PENDIENTE',
  `asistio` tinyint(1) DEFAULT NULL,
  `respondido_en` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id_participacion`),
  UNIQUE KEY `uq_participaciones_evento_usuario` (`id_evento`,`id_usuario`),
  KEY `fk_participaciones_usuario` (`id_usuario`),
  CONSTRAINT `fk_participaciones_evento` FOREIGN KEY (`id_evento`) REFERENCES `eventos` (`id_evento`) ON DELETE CASCADE,
  CONSTRAINT `fk_participaciones_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE,
  CONSTRAINT `ck_participaciones_respuesta` CHECK ((`respuesta` in (_utf8mb4'PENDIENTE',_utf8mb4'CONFIRMADA',_utf8mb4'RECHAZADA')))
) ENGINE=InnoDB AUTO_INCREMENT=55 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `participaciones_evento`
--

LOCK TABLES `participaciones_evento` WRITE;
/*!40000 ALTER TABLE `participaciones_evento` DISABLE KEYS */;
INSERT INTO `participaciones_evento` VALUES (1,1,7,'CONFIRMADA',0,'2026-11-25 23:30:03.060256'),(2,1,8,'CONFIRMADA',1,'2026-11-25 10:30:03.062768'),(3,1,14,'CONFIRMADA',1,'2026-11-25 15:30:03.065443'),(4,1,16,'CONFIRMADA',1,'2026-11-26 14:30:03.066442'),(5,1,20,'PENDIENTE',0,NULL),(6,2,7,'CONFIRMADA',NULL,'2026-11-26 00:30:03.070444'),(7,2,9,'CONFIRMADA',NULL,'2026-11-25 15:30:03.072437'),(8,2,11,'RECHAZADA',NULL,'2026-11-24 19:30:03.073439'),(9,2,13,'CONFIRMADA',NULL,'2026-11-26 08:30:03.074442'),(10,2,18,'CONFIRMADA',NULL,'2026-11-25 07:30:03.076444'),(11,3,7,'PENDIENTE',NULL,NULL),(12,3,8,'PENDIENTE',NULL,NULL),(13,3,14,'CONFIRMADA',NULL,'2026-11-26 03:30:03.082438'),(14,3,16,'PENDIENTE',NULL,NULL),(15,3,20,'CONFIRMADA',NULL,'2026-11-25 18:30:03.084462'),(16,4,7,'CONFIRMADA',NULL,'2026-11-25 10:30:03.087464'),(17,4,9,'RECHAZADA',NULL,'2026-11-25 08:30:03.088464'),(18,4,10,'PENDIENTE',NULL,NULL),(19,4,16,'CONFIRMADA',NULL,'2026-11-25 02:30:03.091457'),(20,4,17,'CONFIRMADA',NULL,'2026-11-26 14:30:03.092458'),(21,5,7,'RECHAZADA',NULL,'2026-11-25 18:30:03.096460'),(22,5,8,'CONFIRMADA',NULL,'2026-11-26 08:30:03.097458'),(23,5,13,'CONFIRMADA',NULL,'2026-11-26 06:30:03.098966'),(24,5,15,'CONFIRMADA',NULL,'2026-11-26 02:30:03.100545'),(25,5,16,'PENDIENTE',NULL,NULL),(26,5,20,'PENDIENTE',NULL,NULL),(27,6,11,'PENDIENTE',NULL,NULL),(28,6,13,'CONFIRMADA',NULL,'2026-11-25 23:30:03.106560'),(29,6,15,'CONFIRMADA',NULL,'2026-11-26 09:30:03.108557'),(30,6,17,'RECHAZADA',NULL,'2026-11-24 12:30:03.109556'),(31,6,19,'RECHAZADA',NULL,'2026-11-24 17:30:03.110559'),(32,7,9,'RECHAZADA',1,'2026-11-26 05:30:03.115567'),(33,7,11,'RECHAZADA',1,'2026-11-25 02:30:03.117554'),(34,7,14,'PENDIENTE',1,NULL),(35,7,15,'CONFIRMADA',1,'2026-11-24 11:30:03.120560'),(36,7,16,'CONFIRMADA',1,'2026-11-25 10:30:03.121562'),(37,7,17,'PENDIENTE',1,NULL),(38,7,18,'CONFIRMADA',1,'2026-11-26 16:30:03.123564'),(39,8,7,'CONFIRMADA',NULL,'2026-11-25 09:30:03.126557'),(40,8,10,'RECHAZADA',NULL,'2026-11-26 03:30:03.128555'),(41,8,14,'PENDIENTE',NULL,NULL),(42,8,19,'RECHAZADA',NULL,'2026-11-25 19:30:03.132573'),(43,9,8,'CONFIRMADA',NULL,'2026-11-25 17:30:03.135574'),(44,9,13,'PENDIENTE',NULL,NULL),(45,9,14,'CONFIRMADA',NULL,'2026-11-24 15:30:03.138572'),(46,9,18,'CONFIRMADA',NULL,'2026-11-26 08:30:03.139575'),(47,9,19,'RECHAZADA',NULL,'2026-11-25 17:30:03.141577'),(48,9,20,'CONFIRMADA',NULL,'2026-11-26 00:30:03.142581'),(49,10,11,'CONFIRMADA',NULL,'2026-11-25 15:30:03.146090'),(50,10,13,'CONFIRMADA',NULL,'2026-11-26 04:30:03.148103'),(51,10,15,'CONFIRMADA',NULL,'2026-11-24 15:30:03.150104'),(52,10,16,'CONFIRMADA',NULL,'2026-11-26 09:30:03.151111'),(53,10,17,'CONFIRMADA',NULL,'2026-11-25 06:30:03.153107'),(54,10,19,'CONFIRMADA',NULL,'2026-11-24 14:30:03.154109');
/*!40000 ALTER TABLE `participaciones_evento` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `periodos_academicos`
--

DROP TABLE IF EXISTS `periodos_academicos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `periodos_academicos` (
  `id_periodo` bigint NOT NULL AUTO_INCREMENT,
  `nombre` varchar(40) NOT NULL,
  `fecha_inicio` date NOT NULL,
  `fecha_fin` date NOT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id_periodo`),
  UNIQUE KEY `uq_periodos_nombre` (`nombre`),
  CONSTRAINT `ck_periodos_rango` CHECK ((`fecha_fin` > `fecha_inicio`))
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `periodos_academicos`
--

LOCK TABLES `periodos_academicos` WRITE;
/*!40000 ALTER TABLE `periodos_academicos` DISABLE KEYS */;
INSERT INTO `periodos_academicos` VALUES (1,'2026-1','2026-01-19','2026-06-12',0),(2,'2026-2','2026-08-20','2026-12-31',1),(3,'2027-1','2027-01-28','2027-06-17',0),(4,'2025-2','2025-08-10','2025-12-18',0),(5,'2025-1','2025-01-19','2025-06-12',0),(6,'2024-2','2024-08-10','2024-12-18',0),(7,'2024-1','2024-01-19','2024-06-12',0),(8,'2023-2','2023-08-10','2023-12-18',0),(9,'2023-1','2023-01-19','2023-06-12',0),(10,'2022-2','2022-08-10','2022-12-18',0),(11,'2022-1','2022-01-19','2022-06-12',0);
/*!40000 ALTER TABLE `periodos_academicos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `preferencias_notificacion`
--

DROP TABLE IF EXISTS `preferencias_notificacion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `preferencias_notificacion` (
  `id_usuario` bigint NOT NULL,
  `email_habilitado` tinyint(1) NOT NULL DEFAULT '1',
  `sms_habilitado` tinyint(1) NOT NULL DEFAULT '0',
  `whatsapp_habilitado` tinyint(1) NOT NULL DEFAULT '0',
  `minutos_anticipacion` int NOT NULL DEFAULT '60',
  `consentimiento_en` datetime(6) DEFAULT NULL,
  `actualizado_en` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id_usuario`),
  CONSTRAINT `fk_preferencias_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE,
  CONSTRAINT `ck_preferencias_anticipacion` CHECK ((`minutos_anticipacion` between 5 and 10080))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `preferencias_notificacion`
--

LOCK TABLES `preferencias_notificacion` WRITE;
/*!40000 ALTER TABLE `preferencias_notificacion` DISABLE KEYS */;
INSERT INTO `preferencias_notificacion` VALUES (1,1,0,0,60,'2026-11-16 17:30:01.198733','2026-11-26 17:30:02.536377'),(2,1,0,0,60,'2026-11-16 17:30:01.198733','2026-11-26 17:30:02.540378'),(3,1,0,0,60,'2026-11-16 17:30:01.198733','2026-11-26 17:30:02.541380'),(4,1,0,0,60,'2026-11-16 17:30:01.198733','2026-11-26 17:30:02.541380'),(5,1,0,0,60,'2026-11-16 17:30:01.198733','2026-11-26 17:30:02.541380'),(6,1,0,0,60,'2026-11-16 17:30:01.198733','2026-11-26 17:30:02.542381'),(7,1,0,0,120,'2026-11-16 17:30:01.198733','2026-11-26 17:30:02.542381'),(8,1,0,0,60,'2026-11-16 17:30:01.198733','2026-11-26 17:30:02.542381'),(9,1,0,0,60,'2026-11-16 17:30:01.198733','2026-11-26 17:30:02.542381'),(10,1,0,0,60,'2026-11-16 17:30:01.198733','2026-11-26 17:30:02.543495'),(11,1,0,0,60,'2026-11-16 17:30:01.198733','2026-11-26 17:30:02.543495'),(12,1,0,0,60,'2026-11-16 17:30:01.198733','2026-11-26 17:30:02.543495'),(13,1,0,0,60,'2026-11-16 17:30:01.198733','2026-11-26 17:30:02.543495'),(14,1,0,0,60,'2026-11-16 17:30:01.198733','2026-11-26 17:30:02.544388'),(15,1,0,0,60,'2026-11-16 17:30:01.198733','2026-11-26 17:30:02.544388'),(16,1,0,0,60,'2026-11-16 17:30:01.198733','2026-11-26 17:30:02.544388'),(17,1,0,0,60,'2026-11-16 17:30:01.198733','2026-11-26 17:30:02.544388'),(18,1,0,0,60,'2026-11-16 17:30:01.198733','2026-11-26 17:30:02.545381'),(19,1,0,0,60,'2026-11-16 17:30:01.198733','2026-11-26 17:30:02.545892'),(20,1,0,0,60,'2026-11-16 17:30:01.198733','2026-11-26 17:30:02.545892');
/*!40000 ALTER TABLE `preferencias_notificacion` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `recordatorios`
--

DROP TABLE IF EXISTS `recordatorios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `recordatorios` (
  `id_recordatorio` bigint NOT NULL AUTO_INCREMENT,
  `id_usuario` bigint NOT NULL,
  `id_tarea` bigint DEFAULT NULL,
  `id_evento` bigint DEFAULT NULL,
  `canal` varchar(10) NOT NULL,
  `programado_para` datetime(6) NOT NULL,
  `mensaje` varchar(500) DEFAULT NULL,
  `estado` varchar(12) NOT NULL DEFAULT 'PENDIENTE',
  `intentos` int NOT NULL DEFAULT '0',
  `enviado_en` datetime(6) DEFAULT NULL,
  `detalle_error` varchar(500) DEFAULT NULL,
  `creado_en` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id_recordatorio`),
  KEY `fk_recordatorios_usuario` (`id_usuario`),
  KEY `fk_recordatorios_tarea` (`id_tarea`),
  KEY `fk_recordatorios_evento` (`id_evento`),
  KEY `ix_recordatorios_cola` (`estado`,`programado_para`),
  CONSTRAINT `fk_recordatorios_evento` FOREIGN KEY (`id_evento`) REFERENCES `eventos` (`id_evento`),
  CONSTRAINT `fk_recordatorios_tarea` FOREIGN KEY (`id_tarea`) REFERENCES `tareas` (`id_tarea`),
  CONSTRAINT `fk_recordatorios_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE,
  CONSTRAINT `ck_recordatorios_canal` CHECK ((`canal` in (_utf8mb4'EMAIL',_utf8mb4'SMS',_utf8mb4'WHATSAPP'))),
  CONSTRAINT `ck_recordatorios_destino` CHECK (((`id_tarea` is null) <> (`id_evento` is null))),
  CONSTRAINT `ck_recordatorios_estado` CHECK ((`estado` in (_utf8mb4'PENDIENTE',_utf8mb4'ENVIADO',_utf8mb4'FALLIDO',_utf8mb4'CANCELADO')))
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `recordatorios`
--

LOCK TABLES `recordatorios` WRITE;
/*!40000 ALTER TABLE `recordatorios` DISABLE KEYS */;
INSERT INTO `recordatorios` VALUES (1,7,1,NULL,'WHATSAPP','2026-11-26 21:59:00.000000',NULL,'PENDIENTE',0,NULL,NULL,'2026-11-26 17:30:03.182104'),(2,7,2,NULL,'EMAIL','2026-11-29 16:00:00.000000',NULL,'PENDIENTE',0,NULL,NULL,'2026-11-26 17:30:03.186103'),(3,7,3,NULL,'EMAIL','2026-11-27 21:59:00.000000',NULL,'PENDIENTE',0,NULL,NULL,'2026-11-26 17:30:03.187104'),(4,7,4,NULL,'WHATSAPP','2026-12-02 16:00:00.000000',NULL,'PENDIENTE',0,NULL,NULL,'2026-11-26 17:30:03.188105'),(5,7,5,NULL,'EMAIL','2026-11-29 21:59:00.000000',NULL,'PENDIENTE',0,NULL,NULL,'2026-11-26 17:30:03.190101'),(6,7,6,NULL,'EMAIL','2026-12-05 16:00:00.000000',NULL,'PENDIENTE',0,NULL,NULL,'2026-11-26 17:30:03.192101'),(7,7,7,NULL,'WHATSAPP','2026-11-23 21:59:00.000000',NULL,'FALLIDO',3,NULL,'Twilio respondió 400: el número no se ha unido al sandbox de WhatsApp','2026-11-26 17:30:03.193141'),(8,7,8,NULL,'EMAIL','2026-11-30 16:00:00.000000',NULL,'PENDIENTE',0,NULL,NULL,'2026-11-26 17:30:03.195130'),(9,7,NULL,1,'EMAIL','2026-11-26 15:00:00.000000',NULL,'ENVIADO',1,'2026-11-26 15:00:00.000000',NULL,'2026-11-26 17:30:03.197138'),(10,7,NULL,2,'EMAIL','2026-11-26 15:00:00.000000',NULL,'ENVIADO',1,'2026-11-26 15:00:00.000000',NULL,'2026-11-26 17:30:03.198136'),(11,7,NULL,3,'EMAIL','2026-11-27 14:30:00.000000',NULL,'PENDIENTE',0,NULL,NULL,'2026-11-26 17:30:03.199137'),(12,8,3,NULL,'EMAIL','2026-11-25 17:30:01.198733',NULL,'ENVIADO',1,'2026-11-25 17:30:01.198733',NULL,'2026-11-26 17:30:03.201141'),(13,9,1,NULL,'SMS','2026-11-24 17:30:01.198733',NULL,'ENVIADO',1,'2026-11-24 17:30:01.198733',NULL,'2026-11-26 17:30:03.202135'),(14,10,1,NULL,'EMAIL','2026-11-23 17:30:01.198733',NULL,'CANCELADO',0,NULL,NULL,'2026-11-26 17:30:03.203137'),(15,11,5,NULL,'SMS','2026-11-22 17:30:01.198733',NULL,'ENVIADO',1,'2026-11-22 17:30:01.198733',NULL,'2026-11-26 17:30:03.205138');
/*!40000 ALTER TABLE `recordatorios` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles` (
  `id_rol` bigint NOT NULL AUTO_INCREMENT,
  `codigo` varchar(20) NOT NULL,
  `nombre` varchar(60) NOT NULL,
  `descripcion` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id_rol`),
  UNIQUE KEY `uq_roles_codigo` (`codigo`),
  CONSTRAINT `ck_roles_codigo` CHECK ((`codigo` in (_utf8mb4'ADMIN',_utf8mb4'DOCENTE',_utf8mb4'ESTUDIANTE')))
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES (1,'ADMIN','Administrador','Acceso total: gestión de usuarios y CRUD de todos los módulos'),(2,'DOCENTE','Docente','Publica tareas y eventos de sus materias y consulta a sus inscritos'),(3,'ESTUDIANTE','Estudiante','Gestiona sus tareas, calendario, eventos y recordatorios');
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `seguimientos_tarea`
--

DROP TABLE IF EXISTS `seguimientos_tarea`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `seguimientos_tarea` (
  `id_seguimiento` bigint NOT NULL AUTO_INCREMENT,
  `id_tarea` bigint NOT NULL,
  `id_estudiante` bigint NOT NULL,
  `estado` varchar(12) NOT NULL DEFAULT 'PENDIENTE',
  `completada_en` datetime(6) DEFAULT NULL,
  `actualizado_en` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id_seguimiento`),
  UNIQUE KEY `uq_seguimientos_tarea_estudiante` (`id_tarea`,`id_estudiante`),
  KEY `fk_seguimientos_estudiante` (`id_estudiante`),
  CONSTRAINT `fk_seguimientos_estudiante` FOREIGN KEY (`id_estudiante`) REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE,
  CONSTRAINT `fk_seguimientos_tarea` FOREIGN KEY (`id_tarea`) REFERENCES `tareas` (`id_tarea`) ON DELETE CASCADE,
  CONSTRAINT `ck_seguimientos_completada` CHECK (((`estado` <> _utf8mb4'COMPLETADA') or (`completada_en` is not null))),
  CONSTRAINT `ck_seguimientos_estado` CHECK ((`estado` in (_utf8mb4'PENDIENTE',_utf8mb4'EN_PROCESO',_utf8mb4'COMPLETADA')))
) ENGINE=InnoDB AUTO_INCREMENT=120 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `seguimientos_tarea`
--

LOCK TABLES `seguimientos_tarea` WRITE;
/*!40000 ALTER TABLE `seguimientos_tarea` DISABLE KEYS */;
INSERT INTO `seguimientos_tarea` VALUES (1,1,7,'EN_PROCESO',NULL,'2026-11-26 17:30:02.840765'),(2,1,9,'EN_PROCESO',NULL,'2026-11-26 17:30:02.842767'),(3,1,10,'PENDIENTE',NULL,'2026-11-26 17:30:02.844760'),(4,1,16,'PENDIENTE',NULL,'2026-11-26 17:30:02.846939'),(5,1,17,'COMPLETADA','2026-11-25 15:30:01.198733','2026-11-26 17:30:02.848937'),(6,2,7,'PENDIENTE',NULL,'2026-11-26 17:30:02.852930'),(7,2,9,'PENDIENTE',NULL,'2026-11-26 17:30:02.854930'),(8,2,10,'COMPLETADA','2026-11-25 00:30:01.198733','2026-11-26 17:30:02.855933'),(9,2,16,'PENDIENTE',NULL,'2026-11-26 17:30:02.857933'),(10,2,17,'COMPLETADA','2026-11-26 03:30:01.198733','2026-11-26 17:30:02.859936'),(11,3,7,'EN_PROCESO',NULL,'2026-11-26 17:30:02.863928'),(12,3,8,'EN_PROCESO',NULL,'2026-11-26 17:30:02.864927'),(13,3,14,'PENDIENTE',NULL,'2026-11-26 17:30:02.866934'),(14,3,16,'EN_PROCESO',NULL,'2026-11-26 17:30:02.867936'),(15,3,20,'EN_PROCESO',NULL,'2026-11-26 17:30:02.869939'),(16,4,7,'COMPLETADA','2026-11-26 08:30:01.198733','2026-11-26 17:30:02.872936'),(17,4,8,'COMPLETADA','2026-11-25 12:30:01.198733','2026-11-26 17:30:02.873936'),(18,4,14,'PENDIENTE',NULL,'2026-11-26 17:30:02.875932'),(19,4,16,'PENDIENTE',NULL,'2026-11-26 17:30:02.876935'),(20,4,20,'EN_PROCESO',NULL,'2026-11-26 17:30:02.878929'),(21,5,7,'PENDIENTE',NULL,'2026-11-26 17:30:02.881933'),(22,5,8,'PENDIENTE',NULL,'2026-11-26 17:30:02.883935'),(23,5,10,'EN_PROCESO',NULL,'2026-11-26 17:30:02.884938'),(24,5,11,'COMPLETADA','2026-11-26 01:30:01.198733','2026-11-26 17:30:02.885953'),(25,5,19,'EN_PROCESO',NULL,'2026-11-26 17:30:02.887953'),(26,6,7,'COMPLETADA','2026-11-26 09:30:01.198733','2026-11-26 17:30:02.889953'),(27,6,8,'EN_PROCESO',NULL,'2026-11-26 17:30:02.891955'),(28,6,10,'PENDIENTE',NULL,'2026-11-26 17:30:02.892955'),(29,6,11,'EN_PROCESO',NULL,'2026-11-26 17:30:02.894954'),(30,6,19,'PENDIENTE',NULL,'2026-11-26 17:30:02.896947'),(31,7,7,'COMPLETADA','2026-11-23 12:59:00.000000','2026-11-26 17:30:02.898950'),(32,7,8,'COMPLETADA','2026-11-23 04:59:00.000000','2026-11-26 17:30:02.900457'),(33,7,13,'EN_PROCESO',NULL,'2026-11-26 17:30:02.901469'),(34,7,15,'PENDIENTE',NULL,'2026-11-26 17:30:02.903469'),(35,7,16,'EN_PROCESO',NULL,'2026-11-26 17:30:02.904469'),(36,7,20,'COMPLETADA','2026-11-22 23:59:00.000000','2026-11-26 17:30:02.905468'),(37,8,7,'PENDIENTE',NULL,'2026-11-26 17:30:02.908469'),(38,8,8,'PENDIENTE',NULL,'2026-11-26 17:30:02.909475'),(39,8,13,'PENDIENTE',NULL,'2026-11-26 17:30:02.911474'),(40,8,15,'PENDIENTE',NULL,'2026-11-26 17:30:02.912469'),(41,8,16,'PENDIENTE',NULL,'2026-11-26 17:30:02.914470'),(42,8,20,'COMPLETADA','2026-11-25 19:30:01.198733','2026-11-26 17:30:02.915499'),(43,9,7,'PENDIENTE',NULL,'2026-11-26 17:30:02.918470'),(44,9,9,'PENDIENTE',NULL,'2026-11-26 17:30:02.920472'),(45,9,11,'COMPLETADA','2026-11-25 16:30:01.198733','2026-11-26 17:30:02.921471'),(46,9,13,'PENDIENTE',NULL,'2026-11-26 17:30:02.922470'),(47,9,18,'PENDIENTE',NULL,'2026-11-26 17:30:02.923476'),(48,10,7,'COMPLETADA','2026-11-24 18:30:01.198733','2026-11-26 17:30:02.927472'),(49,10,9,'PENDIENTE',NULL,'2026-11-26 17:30:02.928468'),(50,10,11,'PENDIENTE',NULL,'2026-11-26 17:30:02.930468'),(51,10,13,'EN_PROCESO',NULL,'2026-11-26 17:30:02.931481'),(52,10,18,'EN_PROCESO',NULL,'2026-11-26 17:30:02.932481'),(53,11,7,'COMPLETADA','2026-11-24 18:59:00.000000','2026-11-26 17:30:02.935478'),(54,11,10,'COMPLETADA','2026-11-25 08:59:00.000000','2026-11-26 17:30:02.936477'),(55,11,14,'COMPLETADA','2026-11-25 05:59:00.000000','2026-11-26 17:30:02.938478'),(56,11,19,'COMPLETADA','2026-11-24 17:59:00.000000','2026-11-26 17:30:02.939919'),(57,12,7,'EN_PROCESO',NULL,'2026-11-26 17:30:02.942932'),(58,12,10,'EN_PROCESO',NULL,'2026-11-26 17:30:02.943934'),(59,12,14,'COMPLETADA','2026-11-25 20:30:01.198733','2026-11-26 17:30:02.946986'),(60,12,19,'COMPLETADA','2026-11-25 14:30:01.198733','2026-11-26 17:30:02.948022'),(61,13,9,'EN_PROCESO',NULL,'2026-11-26 17:30:02.950986'),(62,13,11,'PENDIENTE',NULL,'2026-11-26 17:30:02.951986'),(63,13,14,'PENDIENTE',NULL,'2026-11-26 17:30:02.952989'),(64,13,15,'COMPLETADA','2026-11-25 20:30:01.198733','2026-11-26 17:30:02.954991'),(65,13,16,'EN_PROCESO',NULL,'2026-11-26 17:30:02.955987'),(66,13,17,'EN_PROCESO',NULL,'2026-11-26 17:30:02.958265'),(67,13,18,'COMPLETADA','2026-11-26 10:30:01.198733','2026-11-26 17:30:02.959290'),(68,15,11,'COMPLETADA','2026-11-20 20:59:00.000000','2026-11-26 17:30:02.965279'),(69,15,13,'COMPLETADA','2026-11-20 23:59:00.000000','2026-11-26 17:30:02.966279'),(70,15,15,'COMPLETADA','2026-11-20 19:59:00.000000','2026-11-26 17:30:02.967282'),(71,15,17,'EN_PROCESO',NULL,'2026-11-26 17:30:02.968280'),(72,15,19,'PENDIENTE',NULL,'2026-11-26 17:30:02.969277'),(73,16,11,'EN_PROCESO',NULL,'2026-11-26 17:30:02.973276'),(74,16,13,'PENDIENTE',NULL,'2026-11-26 17:30:02.974283'),(75,16,15,'PENDIENTE',NULL,'2026-11-26 17:30:02.975281'),(76,16,17,'PENDIENTE',NULL,'2026-11-26 17:30:02.976278'),(77,16,19,'COMPLETADA','2026-11-25 10:30:01.198733','2026-11-26 17:30:02.977315'),(78,17,8,'PENDIENTE',NULL,'2026-11-26 17:30:02.982385'),(79,17,13,'EN_PROCESO',NULL,'2026-11-26 17:30:02.983384'),(80,17,14,'PENDIENTE',NULL,'2026-11-26 17:30:02.985385'),(81,17,18,'PENDIENTE',NULL,'2026-11-26 17:30:02.986387'),(82,17,19,'PENDIENTE',NULL,'2026-11-26 17:30:02.988384'),(83,17,20,'PENDIENTE',NULL,'2026-11-26 17:30:02.989385'),(84,18,8,'PENDIENTE',NULL,'2026-11-26 17:30:02.992387'),(85,18,13,'COMPLETADA','2026-11-25 02:30:01.198733','2026-11-26 17:30:02.994384'),(86,18,14,'PENDIENTE',NULL,'2026-11-26 17:30:02.995680'),(87,18,18,'COMPLETADA','2026-11-26 15:30:01.198733','2026-11-26 17:30:02.997730'),(88,18,19,'COMPLETADA','2026-11-24 19:30:01.198733','2026-11-26 17:30:02.998691'),(89,18,20,'EN_PROCESO',NULL,'2026-11-26 17:30:02.999694'),(90,19,11,'PENDIENTE',NULL,'2026-11-26 17:30:03.002697'),(91,19,13,'PENDIENTE',NULL,'2026-11-26 17:30:03.003693'),(92,19,15,'COMPLETADA','2026-11-24 16:59:00.000000','2026-11-26 17:30:03.005689'),(93,19,16,'COMPLETADA','2026-11-24 15:59:00.000000','2026-11-26 17:30:03.006691'),(94,19,17,'COMPLETADA','2026-11-24 11:59:00.000000','2026-11-26 17:30:03.007696'),(95,19,19,'EN_PROCESO',NULL,'2026-11-26 17:30:03.009696'),(96,20,11,'EN_PROCESO',NULL,'2026-11-26 17:30:03.012690'),(97,20,13,'EN_PROCESO',NULL,'2026-11-26 17:30:03.014694'),(98,20,15,'COMPLETADA','2026-11-24 21:30:01.198733','2026-11-26 17:30:03.015693'),(99,20,16,'COMPLETADA','2026-11-25 23:30:01.198733','2026-11-26 17:30:03.016694'),(100,20,17,'PENDIENTE',NULL,'2026-11-26 17:30:03.018694'),(101,20,19,'EN_PROCESO',NULL,'2026-11-26 17:30:03.019695'),(102,21,9,'EN_PROCESO',NULL,'2026-11-26 17:30:03.022696'),(103,21,13,'COMPLETADA','2026-11-25 20:30:01.198733','2026-11-26 17:30:03.023690'),(104,21,18,'EN_PROCESO',NULL,'2026-11-26 17:30:03.025697'),(105,21,20,'EN_PROCESO',NULL,'2026-11-26 17:30:03.026693'),(106,23,10,'EN_PROCESO',NULL,'2026-11-26 17:30:03.030691'),(107,23,14,'PENDIENTE',NULL,'2026-11-26 17:30:03.032708'),(108,23,17,'EN_PROCESO',NULL,'2026-11-26 17:30:03.033704'),(109,23,18,'EN_PROCESO',NULL,'2026-11-26 17:30:03.034708'),(110,24,10,'EN_PROCESO',NULL,'2026-11-26 17:30:03.037702'),(111,24,14,'PENDIENTE',NULL,'2026-11-26 17:30:03.038703'),(112,24,17,'PENDIENTE',NULL,'2026-11-26 17:30:03.039706'),(113,24,18,'PENDIENTE',NULL,'2026-11-26 17:30:03.040705'),(114,25,7,'PENDIENTE',NULL,'2026-11-26 17:30:03.042737'),(115,26,7,'EN_PROCESO',NULL,'2026-11-26 17:30:03.046217'),(116,27,7,'COMPLETADA','2026-11-25 10:00:00.000000','2026-11-26 17:30:03.049245'),(117,28,7,'PENDIENTE',NULL,'2026-11-26 17:30:03.051240'),(118,29,8,'PENDIENTE',NULL,'2026-11-26 17:30:03.054275'),(119,30,9,'EN_PROCESO',NULL,'2026-11-26 17:30:03.056239');
/*!40000 ALTER TABLE `seguimientos_tarea` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tareas`
--

DROP TABLE IF EXISTS `tareas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tareas` (
  `id_tarea` bigint NOT NULL AUTO_INCREMENT,
  `id_creador` bigint NOT NULL,
  `id_materia` bigint DEFAULT NULL,
  `titulo` varchar(150) NOT NULL,
  `descripcion` varchar(2000) DEFAULT NULL,
  `fecha_entrega` datetime(6) NOT NULL,
  `prioridad` varchar(10) NOT NULL DEFAULT 'MEDIA',
  `origen` varchar(10) NOT NULL,
  `estado_publicacion` varchar(12) NOT NULL DEFAULT 'PUBLICADA',
  `publicada_en` datetime(6) DEFAULT NULL,
  `creado_en` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `actualizado_en` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id_tarea`),
  KEY `fk_tareas_creador` (`id_creador`),
  KEY `fk_tareas_materia` (`id_materia`),
  KEY `ix_tareas_entrega` (`fecha_entrega`),
  CONSTRAINT `fk_tareas_creador` FOREIGN KEY (`id_creador`) REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE,
  CONSTRAINT `fk_tareas_materia` FOREIGN KEY (`id_materia`) REFERENCES `materias` (`id_materia`) ON DELETE CASCADE,
  CONSTRAINT `ck_tareas_origen` CHECK ((`origen` in (_utf8mb4'PERSONAL',_utf8mb4'DOCENTE'))),
  CONSTRAINT `ck_tareas_prioridad` CHECK ((`prioridad` in (_utf8mb4'ALTA',_utf8mb4'MEDIA',_utf8mb4'BAJA'))),
  CONSTRAINT `ck_tareas_publicacion` CHECK ((`estado_publicacion` in (_utf8mb4'BORRADOR',_utf8mb4'PUBLICADA')))
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tareas`
--

LOCK TABLES `tareas` WRITE;
/*!40000 ALTER TABLE `tareas` DISABLE KEYS */;
INSERT INTO `tareas` VALUES (1,2,1,'Entrega de reporte: integrales de línea','Actividad de Cálculo Vectorial. Revisa las instrucciones en clase y entrega en la plataforma.','2026-11-26 23:59:00.000000','ALTA','DOCENTE','PUBLICADA','2026-11-15 17:30:01.198733','2026-11-26 17:30:02.836760','2026-11-26 17:30:02.836760'),(2,2,1,'Ejercicios de campos vectoriales','Actividad de Cálculo Vectorial. Revisa las instrucciones en clase y entrega en la plataforma.','2026-11-29 18:00:00.000000','MEDIA','DOCENTE','PUBLICADA','2026-11-15 17:30:01.198733','2026-11-26 17:30:02.850938','2026-11-26 17:30:02.850938'),(3,3,2,'Reporte de laboratorio: inducción','Actividad de Física General III. Revisa las instrucciones en clase y entrega en la plataforma.','2026-11-27 23:59:00.000000','MEDIA','DOCENTE','PUBLICADA','2026-11-18 17:30:01.198733','2026-11-26 17:30:02.860932','2026-11-26 17:30:02.860932'),(4,3,2,'Problemario de óptica','Actividad de Física General III. Revisa las instrucciones en clase y entrega en la plataforma.','2026-12-02 18:00:00.000000','BAJA','DOCENTE','PUBLICADA','2026-11-15 17:30:01.198733','2026-11-26 17:30:02.870935','2026-11-26 17:30:02.870935'),(5,4,3,'Ejercicios de matrices y determinantes','Actividad de Álgebra Lineal. Revisa las instrucciones en clase y entrega en la plataforma.','2026-11-29 23:59:00.000000','BAJA','DOCENTE','PUBLICADA','2026-11-15 17:30:01.198733','2026-11-26 17:30:02.880932','2026-11-26 17:30:02.880932'),(6,4,3,'Proyecto: transformaciones lineales','Actividad de Álgebra Lineal. Revisa las instrucciones en clase y entrega en la plataforma.','2026-12-05 18:00:00.000000','ALTA','DOCENTE','PUBLICADA','2026-11-18 17:30:01.198733','2026-11-26 17:30:02.888954','2026-11-26 17:30:02.888954'),(7,5,4,'Retrospectiva del sprint 3','Actividad de Metodologías Ágiles. Revisa las instrucciones en clase y entrega en la plataforma.','2026-11-23 23:59:00.000000','ALTA','DOCENTE','PUBLICADA','2026-11-15 17:30:01.198733','2026-11-26 17:30:02.897948','2026-11-26 17:30:02.897948'),(8,5,4,'Tablero Kanban del proyecto','Actividad de Metodologías Ágiles. Revisa las instrucciones en clase y entrega en la plataforma.','2026-11-30 18:00:00.000000','MEDIA','DOCENTE','PUBLICADA','2026-11-18 17:30:01.198733','2026-11-26 17:30:02.906468','2026-11-26 17:30:02.906468'),(9,6,5,'Proyecto final: prototipo navegable','Actividad de Diseño de Interfaces UX/UI. Revisa las instrucciones en clase y entrega en la plataforma.','2026-11-26 23:59:00.000000','MEDIA','DOCENTE','PUBLICADA','2026-11-15 17:30:01.198733','2026-11-26 17:30:02.917472','2026-11-26 17:30:02.917472'),(10,6,5,'Pruebas de usabilidad con 5 usuarios','Actividad de Diseño de Interfaces UX/UI. Revisa las instrucciones en clase y entrega en la plataforma.','2026-12-08 18:00:00.000000','BAJA','DOCENTE','PUBLICADA','2026-11-17 17:30:01.198733','2026-11-26 17:30:02.925468','2026-11-26 17:30:02.925468'),(11,5,6,'Ensayo de ética profesional','Actividad de Ética y Sociedad. Revisa las instrucciones en clase y entrega en la plataforma.','2026-11-25 23:59:00.000000','BAJA','DOCENTE','PUBLICADA','2026-11-18 17:30:01.198733','2026-11-26 17:30:02.933483','2026-11-26 17:30:02.933483'),(12,5,6,'Análisis de caso: privacidad de datos','Actividad de Ética y Sociedad. Revisa las instrucciones en clase y entrega en la plataforma.','2026-12-01 18:00:00.000000','ALTA','DOCENTE','PUBLICADA','2026-11-18 17:30:01.198733','2026-11-26 17:30:02.941936','2026-11-26 17:30:02.941936'),(13,6,7,'Landing responsiva con React','Actividad de Programación Web. Revisa las instrucciones en clase y entrega en la plataforma.','2026-11-28 23:59:00.000000','ALTA','DOCENTE','PUBLICADA','2026-11-19 17:30:01.198733','2026-11-26 17:30:02.949988','2026-11-26 17:30:02.949988'),(14,6,7,'Consumo de API REST con Axios','Actividad de Programación Web. Revisa las instrucciones en clase y entrega en la plataforma.','2026-12-04 18:00:00.000000','MEDIA','DOCENTE','BORRADOR',NULL,'2026-11-26 17:30:02.961281','2026-11-26 17:30:02.961281'),(15,4,8,'Modelo entidad-relación','Actividad de Bases de Datos. Revisa las instrucciones en clase y entrega en la plataforma.','2026-11-21 23:59:00.000000','MEDIA','DOCENTE','PUBLICADA','2026-11-16 17:30:01.198733','2026-11-26 17:30:02.963275','2026-11-26 17:30:02.963275'),(16,4,8,'Normalización hasta 3FN','Actividad de Bases de Datos. Revisa las instrucciones en clase y entrega en la plataforma.','2026-12-03 18:00:00.000000','BAJA','DOCENTE','PUBLICADA','2026-11-16 17:30:01.198733','2026-11-26 17:30:02.971306','2026-11-26 17:30:02.971306'),(17,2,9,'Práctica de distribuciones','Actividad de Probabilidad y Estadística. Revisa las instrucciones en clase y entrega en la plataforma.','2026-11-30 23:59:00.000000','BAJA','DOCENTE','PUBLICADA','2026-11-16 17:30:01.198733','2026-11-26 17:30:02.980386','2026-11-26 17:30:02.980386'),(18,2,9,'Examen de práctica: intervalos de confianza','Actividad de Probabilidad y Estadística. Revisa las instrucciones en clase y entrega en la plataforma.','2026-12-06 18:00:00.000000','ALTA','DOCENTE','PUBLICADA','2026-11-19 17:30:01.198733','2026-11-26 17:30:02.991383','2026-11-26 17:30:02.991383'),(19,3,10,'Configuración de VLANs','Actividad de Redes de Computadoras. Revisa las instrucciones en clase y entrega en la plataforma.','2026-11-24 23:59:00.000000','ALTA','DOCENTE','PUBLICADA','2026-11-19 17:30:01.198733','2026-11-26 17:30:03.000717','2026-11-26 17:30:03.000717'),(20,3,10,'Análisis de tráfico con Wireshark','Actividad de Redes de Computadoras. Revisa las instrucciones en clase y entrega en la plataforma.','2026-12-07 18:00:00.000000','MEDIA','DOCENTE','PUBLICADA','2026-11-19 17:30:01.198733','2026-11-26 17:30:03.010697','2026-11-26 17:30:03.010697'),(21,6,11,'Simulación de planificador de procesos','Actividad de Sistemas Operativos. Revisa las instrucciones en clase y entrega en la plataforma.','2026-12-02 23:59:00.000000','MEDIA','DOCENTE','PUBLICADA','2026-11-16 17:30:01.198733','2026-11-26 17:30:03.021699','2026-11-26 17:30:03.021699'),(22,6,11,'Reporte de memoria virtual','Actividad de Sistemas Operativos. Revisa las instrucciones en clase y entrega en la plataforma.','2026-12-09 18:00:00.000000','BAJA','DOCENTE','BORRADOR',NULL,'2026-11-26 17:30:03.027694','2026-11-26 17:30:03.027694'),(23,5,12,'Historias de usuario del proyecto','Actividad de Ingeniería de Software. Revisa las instrucciones en clase y entrega en la plataforma.','2026-11-27 23:59:00.000000','BAJA','DOCENTE','PUBLICADA','2026-11-15 17:30:01.198733','2026-11-26 17:30:03.029691','2026-11-26 17:30:03.029691'),(24,5,12,'Diagrama de despliegue','Actividad de Ingeniería de Software. Revisa las instrucciones en clase y entrega en la plataforma.','2026-12-11 18:00:00.000000','ALTA','DOCENTE','PUBLICADA','2026-11-18 17:30:01.198733','2026-11-26 17:30:03.035702','2026-11-26 17:30:03.035702'),(25,7,NULL,'Preparación de exposición',NULL,'2026-11-30 09:00:00.000000','MEDIA','PERSONAL','PUBLICADA','2026-11-24 17:30:03.041709','2026-11-26 17:30:03.041709','2026-11-26 17:30:03.041709'),(26,7,2,'Repasar notas para el examen parcial',NULL,'2026-11-28 20:00:00.000000','ALTA','PERSONAL','PUBLICADA','2026-11-24 17:30:03.043733','2026-11-26 17:30:03.044706','2026-11-26 17:30:03.044706'),(27,7,NULL,'Renovar credencial de la biblioteca',NULL,'2026-11-25 13:00:00.000000','BAJA','PERSONAL','PUBLICADA','2026-11-24 17:30:03.047229','2026-11-26 17:30:03.047229','2026-11-26 17:30:03.047229'),(28,7,5,'Investigar referencias de diseño',NULL,'2026-12-02 18:00:00.000000','BAJA','PERSONAL','PUBLICADA','2026-11-24 17:30:03.050240','2026-11-26 17:30:03.050239','2026-11-26 17:30:03.050239'),(29,8,NULL,'Comprar material de laboratorio',NULL,'2026-11-29 10:00:00.000000','MEDIA','PERSONAL','PUBLICADA','2026-11-24 17:30:03.052244','2026-11-26 17:30:03.053243','2026-11-26 17:30:03.052244'),(30,9,NULL,'Organizar apuntes del parcial',NULL,'2026-11-27 19:00:00.000000','ALTA','PERSONAL','PUBLICADA','2026-11-24 17:30:03.055241','2026-11-26 17:30:03.055241','2026-11-26 17:30:03.055241');
/*!40000 ALTER TABLE `tareas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuarios` (
  `id_usuario` bigint NOT NULL AUTO_INCREMENT,
  `id_rol` bigint NOT NULL,
  `nombre` varchar(80) NOT NULL,
  `apellidos` varchar(120) NOT NULL,
  `correo` varchar(160) NOT NULL,
  `correo_verificado_en` datetime(6) DEFAULT NULL,
  `password_hash` varchar(100) NOT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `carrera` varchar(120) DEFAULT NULL,
  `avatar_url` varchar(500) DEFAULT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT '1',
  `ultimo_acceso` datetime(6) DEFAULT NULL,
  `creado_en` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `actualizado_en` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id_usuario`),
  UNIQUE KEY `uq_usuarios_correo` (`correo`),
  KEY `fk_usuarios_rol` (`id_rol`),
  CONSTRAINT `fk_usuarios_rol` FOREIGN KEY (`id_rol`) REFERENCES `roles` (`id_rol`),
  CONSTRAINT `ck_usuarios_telefono` CHECK (((`telefono` is null) or regexp_like(`telefono`,_utf8mb4'^\\+[1-9][0-9]{7,14}$')))
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuarios`
--

LOCK TABLES `usuarios` WRITE;
/*!40000 ALTER TABLE `usuarios` DISABLE KEYS */;
INSERT INTO `usuarios` VALUES (1,1,'Administración','Dianova','admin@dianova.test','2026-11-26 17:30:02.418871','$2a$12$EfFt6W7ZONWtlRLRbv0MUO7ZyqlpjWoFkwSaahBkGBOPhaTg7480y',NULL,NULL,NULL,1,'2026-11-24 18:30:01.198733','2026-11-26 17:30:02.440788','2026-11-26 17:30:02.788714'),(2,2,'Alejandro','Méndez Ruiz','docente@dianova.test','2026-11-26 17:30:02.464763','$2a$12$0dhCwOx/QjW6Z4Iyi0OLrO16Vyk7rBlZJT3vQP6KXovmKmZmMOz8S',NULL,NULL,NULL,1,'2026-11-24 07:30:01.198733','2026-11-26 17:30:02.464763','2026-11-26 17:30:02.803714'),(3,2,'Elena','Santos Ibarra','esantos@dianova.test','2026-11-26 17:30:02.467670','$2a$12$0dhCwOx/QjW6Z4Iyi0OLrO16Vyk7rBlZJT3vQP6KXovmKmZmMOz8S',NULL,NULL,NULL,1,'2026-11-25 04:30:01.198733','2026-11-26 17:30:02.467669','2026-11-26 17:30:02.803714'),(4,2,'Roberto','Castillo Peña','rcastillo@dianova.test','2026-11-26 17:30:02.470668','$2a$12$0dhCwOx/QjW6Z4Iyi0OLrO16Vyk7rBlZJT3vQP6KXovmKmZmMOz8S',NULL,NULL,NULL,1,'2026-11-25 23:30:01.198733','2026-11-26 17:30:02.470667','2026-11-26 17:30:02.804717'),(5,2,'Carmen','Silva Robles','csilva@dianova.test','2026-11-26 17:30:02.472666','$2a$12$0dhCwOx/QjW6Z4Iyi0OLrO16Vyk7rBlZJT3vQP6KXovmKmZmMOz8S',NULL,NULL,NULL,1,'2026-11-26 08:30:01.198733','2026-11-26 17:30:02.473671','2026-11-26 17:30:02.804717'),(6,2,'Daniel','Ortega Luna','dortega@dianova.test','2026-11-26 17:30:02.475667','$2a$12$0dhCwOx/QjW6Z4Iyi0OLrO16Vyk7rBlZJT3vQP6KXovmKmZmMOz8S',NULL,NULL,NULL,1,'2026-11-23 19:30:01.198733','2026-11-26 17:30:02.475667','2026-11-26 17:30:02.804717'),(7,3,'Sofía','Martínez López','estudiante@dianova.test','2026-11-26 17:30:02.477679','$2a$12$Fap5vEIVxjYXAGMxxhSiCuq0Gxn0Wu0nDL6rw5oN/kZyiMxK2Jzze',NULL,'Ingeniería en Software',NULL,1,'2026-11-26 12:30:01.198733','2026-11-26 17:30:02.478678','2026-11-26 17:30:02.804717'),(8,3,'Diego','Hernández Cruz','dhernandez@dianova.test','2026-11-26 17:30:02.481679','$2a$12$Fap5vEIVxjYXAGMxxhSiCuq0Gxn0Wu0nDL6rw5oN/kZyiMxK2Jzze',NULL,'Ingeniería en Software',NULL,1,'2026-11-25 13:30:01.198733','2026-11-26 17:30:02.482679','2026-11-26 17:30:02.805716'),(9,3,'Valeria','Gómez Torres','vgomez@dianova.test','2026-11-26 17:30:02.484679','$2a$12$Fap5vEIVxjYXAGMxxhSiCuq0Gxn0Wu0nDL6rw5oN/kZyiMxK2Jzze',NULL,'Ingeniería en Software',NULL,1,'2026-11-26 07:30:01.198733','2026-11-26 17:30:02.484678','2026-11-26 17:30:02.805716'),(10,3,'Mateo','Ramírez Vega','mramirez@dianova.test','2026-11-26 17:30:02.486674','$2a$12$Fap5vEIVxjYXAGMxxhSiCuq0Gxn0Wu0nDL6rw5oN/kZyiMxK2Jzze',NULL,'Ingeniería Mecatrónica',NULL,1,'2026-11-25 23:30:01.198733','2026-11-26 17:30:02.486674','2026-11-26 17:30:02.805716'),(11,3,'Camila','Flores Rivas','cflores@dianova.test','2026-11-26 17:30:02.489678','$2a$12$Fap5vEIVxjYXAGMxxhSiCuq0Gxn0Wu0nDL6rw5oN/kZyiMxK2Jzze',NULL,'Ingeniería en Software',NULL,1,'2026-11-25 02:30:01.198733','2026-11-26 17:30:02.489677','2026-11-26 17:30:02.805716'),(12,3,'Santiago','Morales Díaz','smorales@dianova.test','2026-11-26 17:30:02.491679','$2a$12$Fap5vEIVxjYXAGMxxhSiCuq0Gxn0Wu0nDL6rw5oN/kZyiMxK2Jzze',NULL,'Ingeniería Industrial',NULL,1,'2026-11-23 18:30:01.198733','2026-11-26 17:30:02.491678','2026-11-26 17:30:02.806715'),(13,3,'Regina','Navarro Soto','rnavarro@dianova.test','2026-11-26 17:30:02.495369','$2a$12$Fap5vEIVxjYXAGMxxhSiCuq0Gxn0Wu0nDL6rw5oN/kZyiMxK2Jzze',NULL,'Ingeniería en Software',NULL,1,'2026-11-25 02:30:01.198733','2026-11-26 17:30:02.495369','2026-11-26 17:30:02.806715'),(14,3,'Emiliano','Reyes Campos','ereyes@dianova.test','2026-11-26 17:30:02.498373','$2a$12$Fap5vEIVxjYXAGMxxhSiCuq0Gxn0Wu0nDL6rw5oN/kZyiMxK2Jzze',NULL,'Ingeniería Mecatrónica',NULL,1,'2026-11-23 23:30:01.198733','2026-11-26 17:30:02.499371','2026-11-26 17:30:02.806715'),(15,3,'Ximena','Aguilar Mora','xaguilar@dianova.test','2026-11-26 17:30:02.501371','$2a$12$Fap5vEIVxjYXAGMxxhSiCuq0Gxn0Wu0nDL6rw5oN/kZyiMxK2Jzze',NULL,'Ingeniería en Software',NULL,1,'2026-11-25 23:30:01.198733','2026-11-26 17:30:02.502370','2026-11-26 17:30:02.806715'),(16,3,'Leonardo','Castro Ortiz','lcastro@dianova.test','2026-11-26 17:30:02.504371','$2a$12$Fap5vEIVxjYXAGMxxhSiCuq0Gxn0Wu0nDL6rw5oN/kZyiMxK2Jzze',NULL,'Ingeniería Industrial',NULL,1,'2026-11-25 15:30:01.198733','2026-11-26 17:30:02.505369','2026-11-26 17:30:02.807715'),(17,3,'Renata','Jiménez Salas','rjimenez@dianova.test','2026-11-26 17:30:02.508377','$2a$12$Fap5vEIVxjYXAGMxxhSiCuq0Gxn0Wu0nDL6rw5oN/kZyiMxK2Jzze',NULL,'Ingeniería en Software',NULL,1,'2026-11-25 11:30:01.198733','2026-11-26 17:30:02.509371','2026-11-26 17:30:02.807715'),(18,3,'Sebastián','Vargas Luna','svargas@dianova.test','2026-11-26 17:30:02.512370','$2a$12$Fap5vEIVxjYXAGMxxhSiCuq0Gxn0Wu0nDL6rw5oN/kZyiMxK2Jzze',NULL,'Ingeniería Mecatrónica',NULL,1,'2026-11-25 01:30:01.198733','2026-11-26 17:30:02.513367','2026-11-26 17:30:02.807715'),(19,3,'Fernanda','Rojas Medina','frojas@dianova.test','2026-11-26 17:30:02.516544','$2a$12$Fap5vEIVxjYXAGMxxhSiCuq0Gxn0Wu0nDL6rw5oN/kZyiMxK2Jzze',NULL,'Ingeniería en Software',NULL,1,'2026-11-23 20:30:01.198733','2026-11-26 17:30:02.517369','2026-11-26 17:30:02.807715'),(20,3,'Andrés','Guerrero Paz','aguerrero@dianova.test','2026-11-26 17:30:02.519372','$2a$12$Fap5vEIVxjYXAGMxxhSiCuq0Gxn0Wu0nDL6rw5oN/kZyiMxK2Jzze',NULL,'Ingeniería Industrial',NULL,1,'2026-11-24 04:30:01.198733','2026-11-26 17:30:02.519371','2026-11-26 17:30:02.808714');
/*!40000 ALTER TABLE `usuarios` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping routines for database 'dianova'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-11-26 17:30:28

-- Tablas de seguridad: solo estructura (sesiones, tokens y códigos no se respaldan)
-- MySQL dump 10.13  Distrib 8.0.46, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: dianova
-- ------------------------------------------------------
-- Server version	8.0.46

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `sesiones_jwt`
--

DROP TABLE IF EXISTS `sesiones_jwt`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sesiones_jwt` (
  `id_sesion` bigint NOT NULL AUTO_INCREMENT,
  `id_usuario` bigint NOT NULL,
  `jti_hash` varchar(64) NOT NULL,
  `emitida_en` datetime(6) NOT NULL,
  `expira_en` datetime(6) NOT NULL,
  `revocada_en` datetime(6) DEFAULT NULL,
  `ip` varchar(45) DEFAULT NULL,
  `user_agent` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id_sesion`),
  UNIQUE KEY `uq_sesiones_jti` (`jti_hash`),
  KEY `fk_sesiones_usuario` (`id_usuario`),
  CONSTRAINT `fk_sesiones_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `tokens_recuperacion`
--

DROP TABLE IF EXISTS `tokens_recuperacion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tokens_recuperacion` (
  `id_token` bigint NOT NULL AUTO_INCREMENT,
  `id_usuario` bigint NOT NULL,
  `token_hash` varchar(64) NOT NULL,
  `expira_en` datetime(6) NOT NULL,
  `usado_en` datetime(6) DEFAULT NULL,
  `creado_en` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id_token`),
  UNIQUE KEY `uq_tokens_hash` (`token_hash`),
  KEY `fk_tokens_usuario` (`id_usuario`),
  CONSTRAINT `fk_tokens_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `codigos_verificacion`
--

DROP TABLE IF EXISTS `codigos_verificacion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `codigos_verificacion` (
  `id_codigo` bigint NOT NULL AUTO_INCREMENT,
  `id_usuario` bigint DEFAULT NULL,
  `proposito` varchar(12) NOT NULL,
  `canal` varchar(10) NOT NULL,
  `destino` varchar(160) NOT NULL,
  `codigo_hash` varchar(64) NOT NULL,
  `intentos` int NOT NULL DEFAULT '0',
  `expira_en` datetime(6) NOT NULL,
  `usado_en` datetime(6) DEFAULT NULL,
  `ip` varchar(45) DEFAULT NULL,
  `creado_en` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id_codigo`),
  KEY `ix_codigos_destino` (`proposito`,`destino`,`creado_en`),
  KEY `ix_codigos_usuario` (`id_usuario`,`proposito`,`creado_en`),
  CONSTRAINT `fk_codigos_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE,
  CONSTRAINT `ck_codigos_canal` CHECK ((`canal` in (_utf8mb4'EMAIL',_utf8mb4'SMS'))),
  CONSTRAINT `ck_codigos_expira` CHECK ((`expira_en` > `creado_en`)),
  CONSTRAINT `ck_codigos_intentos` CHECK ((`intentos` between 0 and 10)),
  CONSTRAINT `ck_codigos_proposito` CHECK ((`proposito` in (_utf8mb4'REGISTRO',_utf8mb4'RECUPERACION'))),
  CONSTRAINT `ck_codigos_registro_email` CHECK (((`proposito` <> _utf8mb4'REGISTRO') or (`canal` = _utf8mb4'EMAIL')))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-11-26 17:30:28
