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
INSERT INTO `eventos` VALUES (1,3,2,'Examen parcial de Física III','Temas: inducción, circuitos RLC y óptica geométrica.','Aula Magna','2026-11-26 16:00:00.000000','2026-11-26 17:30:00.000000','EXAMEN','PROGRAMADO','2026-11-23 04:06:49.062176','2026-11-23 04:06:49.062176'),(2,6,5,'Taller de prototipado en Figma','Componentes, variantes y auto-layout para el proyecto final.','Laboratorio de Cómputo 4','2026-11-23 16:00:00.000000','2026-11-23 18:00:00.000000','TALLER','PROGRAMADO','2026-11-23 04:06:49.071165','2026-11-23 04:06:49.071165'),(3,3,2,'Repaso general: electromagnetismo','Sesión grupal para resolver la guía del parcial.','Biblioteca Central, sala B','2026-11-24 15:30:00.000000','2026-11-24 17:30:00.000000','ESTUDIO','PROGRAMADO','2026-11-23 04:06:49.077162','2026-11-23 04:06:49.077162'),(4,2,1,'Asesoría de Cálculo Vectorial','Dudas sobre la entrega de integrales de línea.','Cubículo Prof. Méndez','2026-12-01 12:00:00.000000','2026-12-01 13:00:00.000000','ASESORIA','PROGRAMADO','2026-11-23 04:06:49.082162','2026-11-23 04:06:49.082162'),(5,5,4,'Demo del sprint 3','Cada equipo presenta su incremento.','Cubículo 5','2026-11-27 11:00:00.000000','2026-11-27 12:30:00.000000','ENTREGA','PROGRAMADO','2026-11-23 04:06:49.091163','2026-11-23 04:06:49.091163'),(6,4,8,'Examen de Bases de Datos','Modelo E-R, normalización y SQL.','Lab. de Cómputo 1','2026-12-02 11:00:00.000000','2026-12-02 13:00:00.000000','EXAMEN','PROGRAMADO','2026-11-23 04:06:49.101165','2026-11-23 04:06:49.101165'),(7,6,7,'Code review de proyectos web','Revisión en parejas de los repositorios.','Lab. de Cómputo 2','2026-11-20 16:00:00.000000','2026-11-20 18:00:00.000000','TALLER','FINALIZADO','2026-11-23 04:06:49.107168','2026-11-23 04:06:49.107168'),(8,5,6,'Debate: ética e inteligencia artificial','Lectura previa obligatoria.','Aula 12','2026-11-29 12:00:00.000000','2026-11-29 13:30:00.000000','CLASE','PROGRAMADO','2026-11-23 04:06:49.115612','2026-11-23 04:06:49.115612'),(9,2,9,'Examen de Probabilidad','Unidades 3 y 4.','Aula 106','2026-12-04 07:00:00.000000','2026-12-04 08:30:00.000000','EXAMEN','PROGRAMADO','2026-11-23 04:06:49.120612','2026-11-23 04:06:49.120612'),(10,3,10,'Práctica de cableado estructurado','Traer pinzas y cable UTP.','Lab. de Redes','2026-11-25 13:00:00.000000','2026-11-25 15:00:00.000000','TALLER','PROGRAMADO','2026-11-23 04:06:49.125611','2026-11-23 04:06:49.125611'),(11,1,NULL,'Feria de Proyectos de Innovación','Exposición abierta a toda la comunidad.','Explanada principal','2026-11-30 09:00:00.000000','2026-11-30 15:00:00.000000','SOCIAL','PROGRAMADO','2026-11-23 04:06:49.131611','2026-11-23 04:06:49.131611'),(12,1,NULL,'Conferencia: IA aplicada en ingeniería','Ponencia magistral de investigadores invitados.','Auditorio principal','2026-11-26 11:00:00.000000','2026-11-26 13:00:00.000000','SOCIAL','PROGRAMADO','2026-11-23 04:06:49.132611','2026-11-23 04:06:49.132611'),(13,7,NULL,'Reunión de equipo: proyecto final UX','Definir el flujo del prototipo.','Cubículo 3, biblioteca','2026-11-27 16:00:00.000000','2026-11-27 17:00:00.000000','PERSONAL','PROGRAMADO','2026-11-23 04:06:49.133610','2026-11-23 04:06:49.133610'),(14,7,NULL,'Cita con tutora académica',NULL,'Coordinación de Ingeniería','2026-11-28 10:00:00.000000','2026-11-28 10:30:00.000000','PERSONAL','PROGRAMADO','2026-11-23 04:06:49.135612','2026-11-23 04:06:49.135612'),(15,8,NULL,'Estudio en grupo de Álgebra',NULL,'Biblioteca','2026-11-25 18:00:00.000000','2026-11-25 19:30:00.000000','ESTUDIO','PROGRAMADO','2026-11-23 04:06:49.136613','2026-11-23 04:06:49.136613');
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
INSERT INTO `flyway_schema_history` VALUES (1,'1','crear esquema','SQL','V1__crear_esquema.sql',842718259,'root','2026-11-23 10:06:43',274,1),(2,'2','catalogo roles','SQL','V2__catalogo_roles.sql',531005439,'root','2026-11-23 10:06:43',6,1);
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
INSERT INTO `inscripciones` VALUES (1,7,1,'2026-08-18 05:06:47.599144','ACTIVA'),(2,7,2,'2026-08-18 10:06:47.599144','ACTIVA'),(3,7,3,'2026-08-18 16:06:47.599144','ACTIVA'),(4,7,4,'2026-08-18 19:06:47.599144','ACTIVA'),(5,7,5,'2026-08-19 21:06:47.599144','ACTIVA'),(6,7,6,'2026-08-18 14:06:47.599144','ACTIVA'),(7,8,9,'2026-08-17 13:06:47.599144','ACTIVA'),(8,8,4,'2026-08-20 00:06:47.599144','ACTIVA'),(9,8,3,'2026-08-19 02:06:47.599144','ACTIVA'),(10,8,2,'2026-08-17 12:06:47.599144','ACTIVA'),(11,9,11,'2026-08-19 22:06:47.599144','ACTIVA'),(12,9,5,'2026-08-17 09:06:47.599144','ACTIVA'),(13,9,1,'2026-08-17 22:06:47.599144','ACTIVA'),(14,9,7,'2026-08-18 14:06:47.599144','ACTIVA'),(15,10,6,'2026-08-19 07:06:47.599144','ACTIVA'),(16,10,1,'2026-08-19 10:06:47.599144','ACTIVA'),(17,10,3,'2026-08-18 10:06:47.599144','ACTIVA'),(18,10,12,'2026-08-19 02:06:47.599144','ACTIVA'),(19,11,10,'2026-08-18 20:06:47.599144','ACTIVA'),(20,11,7,'2026-08-19 04:06:47.599144','ACTIVA'),(21,11,5,'2026-08-19 14:06:47.599144','ACTIVA'),(22,11,3,'2026-08-18 08:06:47.599144','ACTIVA'),(23,11,8,'2026-08-17 05:06:47.599144','ACTIVA'),(24,12,8,'2026-08-18 03:06:47.599144','ACTIVA'),(25,12,10,'2026-08-17 11:06:47.599144','ACTIVA'),(26,12,12,'2026-08-19 22:06:47.599144','ACTIVA'),(27,12,1,'2026-08-20 03:06:47.599144','BAJA'),(28,12,5,'2026-08-17 07:06:47.599144','ACTIVA'),(29,12,7,'2026-08-17 18:06:47.599144','ACTIVA'),(30,13,4,'2026-08-19 18:06:47.599144','ACTIVA'),(31,13,5,'2026-08-18 10:06:47.599144','ACTIVA'),(32,13,10,'2026-08-20 02:06:47.599144','ACTIVA'),(33,13,9,'2026-08-20 01:06:47.599144','ACTIVA'),(34,13,11,'2026-08-18 09:06:47.599144','ACTIVA'),(35,13,8,'2026-08-20 02:06:47.599144','ACTIVA'),(36,14,7,'2026-08-19 16:06:47.599144','ACTIVA'),(37,14,9,'2026-08-17 20:06:47.599144','ACTIVA'),(38,14,12,'2026-08-18 17:06:47.599144','ACTIVA'),(39,14,6,'2026-08-19 21:06:47.599144','ACTIVA'),(40,14,2,'2026-08-17 14:06:47.599144','ACTIVA'),(41,15,10,'2026-08-20 02:06:47.599144','ACTIVA'),(42,15,7,'2026-08-19 15:06:47.599144','ACTIVA'),(43,15,4,'2026-08-17 09:06:47.599144','ACTIVA'),(44,15,8,'2026-08-17 10:06:47.599144','ACTIVA'),(45,16,4,'2026-08-18 03:06:47.599144','ACTIVA'),(46,16,10,'2026-08-17 09:06:47.599144','ACTIVA'),(47,16,1,'2026-08-20 01:06:47.599144','ACTIVA'),(48,16,2,'2026-08-20 00:06:47.599144','ACTIVA'),(49,16,7,'2026-08-18 12:06:47.599144','ACTIVA'),(50,17,10,'2026-08-18 14:06:47.599144','ACTIVA'),(51,17,7,'2026-08-18 12:06:47.599144','ACTIVA'),(52,17,8,'2026-08-19 13:06:47.599144','ACTIVA'),(53,17,12,'2026-08-18 01:06:47.599144','ACTIVA'),(54,17,1,'2026-08-17 05:06:47.599144','ACTIVA'),(55,18,9,'2026-08-17 20:06:47.599144','ACTIVA'),(56,18,11,'2026-08-17 18:06:47.599144','ACTIVA'),(57,18,12,'2026-08-17 15:06:47.599144','ACTIVA'),(58,18,7,'2026-08-17 21:06:47.599144','ACTIVA'),(59,18,5,'2026-08-19 13:06:47.599144','ACTIVA'),(60,19,10,'2026-08-19 10:06:47.599144','ACTIVA'),(61,19,8,'2026-08-17 21:06:47.599144','ACTIVA'),(62,19,9,'2026-08-17 11:06:47.599144','ACTIVA'),(63,19,3,'2026-08-19 18:06:47.599144','ACTIVA'),(64,19,6,'2026-08-17 13:06:47.599144','ACTIVA'),(65,20,2,'2026-08-19 04:06:47.599144','ACTIVA'),(66,20,4,'2026-08-19 03:06:47.599144','ACTIVA'),(67,20,9,'2026-08-17 05:06:47.599144','ACTIVA'),(68,20,11,'2026-08-18 08:06:47.599144','ACTIVA'),(69,7,13,'2026-01-23 04:06:47.599144','FINALIZADA');
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
INSERT INTO `materias` VALUES (1,2,2,'MAT-301-A','Cálculo Vectorial',6,'#C99A4B','Aula 204','Curso del periodo 2026-2 impartido por Alejandro Méndez Ruiz.','2026-11-23 04:06:48.665095','2026-11-23 04:06:48.665095'),(2,2,3,'FIS-302-A','Física General III',6,'#8FAF8B','Lab. de Física 2','Curso del periodo 2026-2 impartido por Elena Santos Ibarra.','2026-11-23 04:06:48.674093','2026-11-23 04:06:48.674093'),(3,2,4,'MAT-303-A','Álgebra Lineal',5,'#9A5530','Aula 108','Curso del periodo 2026-2 impartido por Roberto Castillo Peña.','2026-11-23 04:06:48.680096','2026-11-23 04:06:48.680096'),(4,2,5,'ING-304-A','Metodologías Ágiles',4,'#D9A441','Cubículo 5','Curso del periodo 2026-2 impartido por Carmen Silva Robles.','2026-11-23 04:06:48.685095','2026-11-23 04:06:48.685095'),(5,2,6,'ING-305-A','Diseño de Interfaces UX/UI',4,'#7A1F1F','Laboratorio 4','Curso del periodo 2026-2 impartido por Daniel Ortega Luna.','2026-11-23 04:06:48.687111','2026-11-23 04:06:48.687111'),(6,2,5,'HUM-201-A','Ética y Sociedad',3,'#B9A48A','Aula 12','Curso del periodo 2026-2 impartido por Carmen Silva Robles.','2026-11-23 04:06:48.690135','2026-11-23 04:06:48.690135'),(7,2,6,'PRG-310-A','Programación Web',6,'#B5653B','Lab. de Cómputo 2','Curso del periodo 2026-2 impartido por Daniel Ortega Luna.','2026-11-23 04:06:48.692095','2026-11-23 04:06:48.692095'),(8,2,4,'BDD-320-A','Bases de Datos',6,'#6B4A3A','Lab. de Cómputo 1','Curso del periodo 2026-2 impartido por Roberto Castillo Peña.','2026-11-23 04:06:48.697094','2026-11-23 04:06:48.697094'),(9,2,2,'EST-210-A','Probabilidad y Estadística',5,'#7F8A4E','Aula 106','Curso del periodo 2026-2 impartido por Alejandro Méndez Ruiz.','2026-11-23 04:06:48.702149','2026-11-23 04:06:48.702149'),(10,2,3,'RED-330-A','Redes de Computadoras',5,'#5F7F7A','Lab. de Redes','Curso del periodo 2026-2 impartido por Elena Santos Ibarra.','2026-11-23 04:06:48.706103','2026-11-23 04:06:48.706103'),(11,2,6,'SIS-340-A','Sistemas Operativos',5,'#7B4B5E','Aula 210','Curso del periodo 2026-2 impartido por Daniel Ortega Luna.','2026-11-23 04:06:48.709137','2026-11-23 04:06:48.709137'),(12,2,5,'ING-350-A','Ingeniería de Software',6,'#C47A6B','Aula 301','Curso del periodo 2026-2 impartido por Carmen Silva Robles.','2026-11-23 04:06:48.713100','2026-11-23 04:06:48.713100'),(13,1,2,'MAT-201-A','Cálculo Diferencial',6,'#C99A4B',NULL,NULL,'2026-11-23 04:06:48.716613','2026-11-23 04:06:48.716613'),(14,1,6,'PRG-110-A','Fundamentos de Programación',6,'#B5653B',NULL,NULL,'2026-11-23 04:06:48.718629','2026-11-23 04:06:48.718629');
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
INSERT INTO `participaciones_evento` VALUES (1,1,7,'CONFIRMADA',NULL,'2026-11-22 10:06:49.064175'),(2,1,8,'PENDIENTE',NULL,NULL),(3,1,14,'CONFIRMADA',NULL,'2026-11-21 21:06:49.067161'),(4,1,16,'CONFIRMADA',NULL,'2026-11-21 02:06:49.068165'),(5,1,20,'PENDIENTE',NULL,NULL),(6,2,7,'RECHAZADA',NULL,'2026-11-20 20:06:49.072179'),(7,2,9,'PENDIENTE',NULL,NULL),(8,2,11,'CONFIRMADA',NULL,'2026-11-21 08:06:49.074163'),(9,2,13,'CONFIRMADA',NULL,'2026-11-23 03:06:49.075162'),(10,2,18,'CONFIRMADA',NULL,'2026-11-22 11:06:49.076162'),(11,3,7,'CONFIRMADA',NULL,'2026-11-22 02:06:49.078161'),(12,3,8,'RECHAZADA',NULL,'2026-11-21 06:06:49.079164'),(13,3,14,'CONFIRMADA',NULL,'2026-11-22 19:06:49.080163'),(14,3,16,'CONFIRMADA',NULL,'2026-11-21 18:06:49.080163'),(15,3,20,'PENDIENTE',NULL,NULL),(16,4,7,'PENDIENTE',NULL,NULL),(17,4,9,'CONFIRMADA',NULL,'2026-11-22 14:06:49.084161'),(18,4,10,'PENDIENTE',NULL,NULL),(19,4,16,'CONFIRMADA',NULL,'2026-11-22 05:06:49.087169'),(20,4,17,'CONFIRMADA',NULL,'2026-11-21 21:06:49.089169'),(21,5,7,'RECHAZADA',NULL,'2026-11-21 19:06:49.092161'),(22,5,8,'PENDIENTE',NULL,NULL),(23,5,13,'CONFIRMADA',NULL,'2026-11-21 13:06:49.094162'),(24,5,15,'CONFIRMADA',NULL,'2026-11-23 01:06:49.096161'),(25,5,16,'RECHAZADA',NULL,'2026-11-22 05:06:49.097161'),(26,5,20,'CONFIRMADA',NULL,'2026-11-22 19:06:49.099159'),(27,6,11,'CONFIRMADA',NULL,'2026-11-22 17:06:49.103166'),(28,6,13,'CONFIRMADA',NULL,'2026-11-22 13:06:49.104168'),(29,6,15,'PENDIENTE',NULL,NULL),(30,6,17,'PENDIENTE',NULL,NULL),(31,6,19,'PENDIENTE',NULL,NULL),(32,7,9,'CONFIRMADA',1,'2026-11-22 10:06:49.108169'),(33,7,11,'RECHAZADA',1,'2026-11-21 05:06:49.109169'),(34,7,14,'RECHAZADA',1,'2026-11-20 23:06:49.110167'),(35,7,15,'CONFIRMADA',0,'2026-11-22 12:06:49.111169'),(36,7,16,'CONFIRMADA',1,'2026-11-22 10:06:49.112166'),(37,7,17,'CONFIRMADA',1,'2026-11-22 18:06:49.113169'),(38,7,18,'PENDIENTE',0,NULL),(39,8,7,'RECHAZADA',NULL,'2026-11-22 18:06:49.116659'),(40,8,10,'CONFIRMADA',NULL,'2026-11-20 22:06:49.117612'),(41,8,14,'CONFIRMADA',NULL,'2026-11-23 03:06:49.118613'),(42,8,19,'CONFIRMADA',NULL,'2026-11-23 00:06:49.119612'),(43,9,8,'CONFIRMADA',NULL,'2026-11-21 00:06:49.121611'),(44,9,13,'PENDIENTE',NULL,NULL),(45,9,14,'PENDIENTE',NULL,NULL),(46,9,18,'RECHAZADA',NULL,'2026-11-22 06:06:49.123612'),(47,9,19,'CONFIRMADA',NULL,'2026-11-22 04:06:49.124611'),(48,9,20,'PENDIENTE',NULL,NULL),(49,10,11,'CONFIRMADA',NULL,'2026-11-21 02:06:49.126609'),(50,10,13,'CONFIRMADA',NULL,'2026-11-22 19:06:49.127640'),(51,10,15,'RECHAZADA',NULL,'2026-11-22 04:06:49.128611'),(52,10,16,'CONFIRMADA',NULL,'2026-11-22 11:06:49.129611'),(53,10,17,'CONFIRMADA',NULL,'2026-11-22 02:06:49.129611'),(54,10,19,'CONFIRMADA',NULL,'2026-11-22 15:06:49.130634');
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
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `periodos_academicos`
--

LOCK TABLES `periodos_academicos` WRITE;
/*!40000 ALTER TABLE `periodos_academicos` DISABLE KEYS */;
INSERT INTO `periodos_academicos` VALUES (1,'2026-1','2026-01-19','2026-06-12',0),(2,'2026-2','2026-08-17','2026-12-28',1),(3,'2027-1','2027-01-25','2027-06-14',0);
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
INSERT INTO `preferencias_notificacion` VALUES (1,1,0,0,60,'2026-11-13 04:06:47.599144','2026-11-23 04:06:48.637093'),(2,1,0,0,60,'2026-11-13 04:06:47.599144','2026-11-23 04:06:48.640208'),(3,1,0,0,60,'2026-11-13 04:06:47.599144','2026-11-23 04:06:48.640208'),(4,1,0,0,60,'2026-11-13 04:06:47.599144','2026-11-23 04:06:48.640208'),(5,1,0,0,60,'2026-11-13 04:06:47.599144','2026-11-23 04:06:48.640208'),(6,1,0,0,60,'2026-11-13 04:06:47.599144','2026-11-23 04:06:48.640208'),(7,1,0,0,120,'2026-11-13 04:06:47.599144','2026-11-23 04:06:48.640208'),(8,1,0,0,60,'2026-11-13 04:06:47.599144','2026-11-23 04:06:48.641097'),(9,1,0,0,60,'2026-11-13 04:06:47.599144','2026-11-23 04:06:48.641097'),(10,1,0,0,60,'2026-11-13 04:06:47.599144','2026-11-23 04:06:48.641097'),(11,1,0,0,60,'2026-11-13 04:06:47.599144','2026-11-23 04:06:48.641097'),(12,1,0,0,60,'2026-11-13 04:06:47.599144','2026-11-23 04:06:48.641097'),(13,1,0,0,60,'2026-11-13 04:06:47.599144','2026-11-23 04:06:48.641097'),(14,1,0,0,60,'2026-11-13 04:06:47.599144','2026-11-23 04:06:48.641097'),(15,1,0,0,60,'2026-11-13 04:06:47.599144','2026-11-23 04:06:48.641097'),(16,1,0,0,60,'2026-11-13 04:06:47.599144','2026-11-23 04:06:48.642096'),(17,1,0,0,60,'2026-11-13 04:06:47.599144','2026-11-23 04:06:48.642096'),(18,1,0,0,60,'2026-11-13 04:06:47.599144','2026-11-23 04:06:48.642096'),(19,1,0,0,60,'2026-11-13 04:06:47.599144','2026-11-23 04:06:48.642096'),(20,1,0,0,60,'2026-11-13 04:06:47.599144','2026-11-23 04:06:48.642096');
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
INSERT INTO `recordatorios` VALUES (1,7,1,NULL,'WHATSAPP','2026-11-23 21:59:00.000000',NULL,'PENDIENTE',0,NULL,NULL,'2026-11-23 04:06:49.151613'),(2,7,2,NULL,'EMAIL','2026-11-26 16:00:00.000000',NULL,'PENDIENTE',0,NULL,NULL,'2026-11-23 04:06:49.153609'),(3,7,3,NULL,'EMAIL','2026-11-24 21:59:00.000000',NULL,'PENDIENTE',0,NULL,NULL,'2026-11-23 04:06:49.155619'),(4,7,4,NULL,'WHATSAPP','2026-11-29 16:00:00.000000',NULL,'PENDIENTE',0,NULL,NULL,'2026-11-23 04:06:49.156617'),(5,7,5,NULL,'EMAIL','2026-11-26 21:59:00.000000',NULL,'PENDIENTE',0,NULL,NULL,'2026-11-23 04:06:49.157616'),(6,7,6,NULL,'EMAIL','2026-12-02 16:00:00.000000',NULL,'PENDIENTE',0,NULL,NULL,'2026-11-23 04:06:49.158618'),(7,7,7,NULL,'WHATSAPP','2026-11-20 21:59:00.000000',NULL,'FALLIDO',3,NULL,'Twilio respondió 400: el número no se ha unido al sandbox de WhatsApp','2026-11-23 04:06:49.158618'),(8,7,8,NULL,'EMAIL','2026-11-27 16:00:00.000000',NULL,'PENDIENTE',0,NULL,NULL,'2026-11-23 04:06:49.159618'),(9,7,NULL,1,'EMAIL','2026-11-26 15:00:00.000000',NULL,'PENDIENTE',0,NULL,NULL,'2026-11-23 04:06:49.161618'),(10,7,NULL,2,'EMAIL','2026-11-23 15:00:00.000000',NULL,'PENDIENTE',0,NULL,NULL,'2026-11-23 04:06:49.161618'),(11,7,NULL,3,'EMAIL','2026-11-24 14:30:00.000000',NULL,'PENDIENTE',0,NULL,NULL,'2026-11-23 04:06:49.162619'),(12,8,3,NULL,'EMAIL','2026-11-22 04:06:47.599144',NULL,'ENVIADO',1,'2026-11-22 04:06:47.599144',NULL,'2026-11-23 04:06:49.164618'),(13,9,1,NULL,'SMS','2026-11-21 04:06:47.599144',NULL,'ENVIADO',1,'2026-11-21 04:06:47.599144',NULL,'2026-11-23 04:06:49.166620'),(14,10,1,NULL,'EMAIL','2026-11-20 04:06:47.599144',NULL,'CANCELADO',0,NULL,NULL,'2026-11-23 04:06:49.168622'),(15,11,5,NULL,'SMS','2026-11-19 04:06:47.599144',NULL,'ENVIADO',1,'2026-11-19 04:06:47.599144',NULL,'2026-11-23 04:06:49.170134');
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
INSERT INTO `seguimientos_tarea` VALUES (1,1,7,'EN_PROCESO',NULL,'2026-11-23 04:06:48.888663'),(2,1,9,'EN_PROCESO',NULL,'2026-11-23 04:06:48.891663'),(3,1,10,'PENDIENTE',NULL,'2026-11-23 04:06:48.892663'),(4,1,16,'PENDIENTE',NULL,'2026-11-23 04:06:48.893663'),(5,1,17,'COMPLETADA','2026-11-22 02:06:47.599144','2026-11-23 04:06:48.894662'),(6,2,7,'PENDIENTE',NULL,'2026-11-23 04:06:48.898662'),(7,2,9,'PENDIENTE',NULL,'2026-11-23 04:06:48.899668'),(8,2,10,'COMPLETADA','2026-11-21 11:06:47.599144','2026-11-23 04:06:48.901672'),(9,2,16,'PENDIENTE',NULL,'2026-11-23 04:06:48.902670'),(10,2,17,'COMPLETADA','2026-11-22 14:06:47.599144','2026-11-23 04:06:48.903704'),(11,3,7,'EN_PROCESO',NULL,'2026-11-23 04:06:48.906671'),(12,3,8,'EN_PROCESO',NULL,'2026-11-23 04:06:48.908670'),(13,3,14,'PENDIENTE',NULL,'2026-11-23 04:06:48.909671'),(14,3,16,'EN_PROCESO',NULL,'2026-11-23 04:06:48.911671'),(15,3,20,'EN_PROCESO',NULL,'2026-11-23 04:06:48.912669'),(16,4,7,'COMPLETADA','2026-11-22 19:06:47.599144','2026-11-23 04:06:48.915184'),(17,4,8,'COMPLETADA','2026-11-21 23:06:47.599144','2026-11-23 04:06:48.916182'),(18,4,14,'PENDIENTE',NULL,'2026-11-23 04:06:48.917185'),(19,4,16,'PENDIENTE',NULL,'2026-11-23 04:06:48.919185'),(20,4,20,'EN_PROCESO',NULL,'2026-11-23 04:06:48.920186'),(21,5,7,'PENDIENTE',NULL,'2026-11-23 04:06:48.922185'),(22,5,8,'PENDIENTE',NULL,'2026-11-23 04:06:48.923199'),(23,5,10,'EN_PROCESO',NULL,'2026-11-23 04:06:48.924186'),(24,5,11,'COMPLETADA','2026-11-22 12:06:47.599144','2026-11-23 04:06:48.925212'),(25,5,19,'EN_PROCESO',NULL,'2026-11-23 04:06:48.925212'),(26,6,7,'COMPLETADA','2026-11-22 20:06:47.599144','2026-11-23 04:06:48.927184'),(27,6,8,'EN_PROCESO',NULL,'2026-11-23 04:06:48.929185'),(28,6,10,'PENDIENTE',NULL,'2026-11-23 04:06:48.930186'),(29,6,11,'EN_PROCESO',NULL,'2026-11-23 04:06:48.931186'),(30,6,19,'PENDIENTE',NULL,'2026-11-23 04:06:48.932186'),(31,7,7,'COMPLETADA','2026-11-20 12:59:00.000000','2026-11-23 04:06:48.935187'),(32,7,8,'COMPLETADA','2026-11-20 04:59:00.000000','2026-11-23 04:06:48.937202'),(33,7,13,'EN_PROCESO',NULL,'2026-11-23 04:06:48.938199'),(34,7,15,'PENDIENTE',NULL,'2026-11-23 04:06:48.939182'),(35,7,16,'EN_PROCESO',NULL,'2026-11-23 04:06:48.939182'),(36,7,20,'COMPLETADA','2026-11-19 23:59:00.000000','2026-11-23 04:06:48.940198'),(37,8,7,'PENDIENTE',NULL,'2026-11-23 04:06:48.942183'),(38,8,8,'PENDIENTE',NULL,'2026-11-23 04:06:48.943184'),(39,8,13,'PENDIENTE',NULL,'2026-11-23 04:06:48.944184'),(40,8,15,'PENDIENTE',NULL,'2026-11-23 04:06:48.945184'),(41,8,16,'PENDIENTE',NULL,'2026-11-23 04:06:48.946185'),(42,8,20,'COMPLETADA','2026-11-22 06:06:47.599144','2026-11-23 04:06:48.947184'),(43,9,7,'PENDIENTE',NULL,'2026-11-23 04:06:48.950184'),(44,9,9,'PENDIENTE',NULL,'2026-11-23 04:06:48.951187'),(45,9,11,'COMPLETADA','2026-11-22 03:06:47.599144','2026-11-23 04:06:48.952184'),(46,9,13,'PENDIENTE',NULL,'2026-11-23 04:06:48.953186'),(47,9,18,'PENDIENTE',NULL,'2026-11-23 04:06:48.954193'),(48,10,7,'COMPLETADA','2026-11-21 05:06:47.599144','2026-11-23 04:06:48.956193'),(49,10,9,'PENDIENTE',NULL,'2026-11-23 04:06:48.957205'),(50,10,11,'PENDIENTE',NULL,'2026-11-23 04:06:48.959196'),(51,10,13,'EN_PROCESO',NULL,'2026-11-23 04:06:48.960193'),(52,10,18,'EN_PROCESO',NULL,'2026-11-23 04:06:48.962194'),(53,11,7,'COMPLETADA','2026-11-21 18:59:00.000000','2026-11-23 04:06:48.964193'),(54,11,10,'COMPLETADA','2026-11-22 08:59:00.000000','2026-11-23 04:06:48.965194'),(55,11,14,'COMPLETADA','2026-11-22 05:59:00.000000','2026-11-23 04:06:48.966192'),(56,11,19,'COMPLETADA','2026-11-21 17:59:00.000000','2026-11-23 04:06:48.968195'),(57,12,7,'EN_PROCESO',NULL,'2026-11-23 04:06:48.970598'),(58,12,10,'EN_PROCESO',NULL,'2026-11-23 04:06:48.972598'),(59,12,14,'COMPLETADA','2026-11-22 07:06:47.599144','2026-11-23 04:06:48.973598'),(60,12,19,'COMPLETADA','2026-11-22 01:06:47.599144','2026-11-23 04:06:48.974598'),(61,13,9,'EN_PROCESO',NULL,'2026-11-23 04:06:48.976597'),(62,13,11,'PENDIENTE',NULL,'2026-11-23 04:06:48.978598'),(63,13,14,'PENDIENTE',NULL,'2026-11-23 04:06:48.979598'),(64,13,15,'COMPLETADA','2026-11-22 07:06:47.599144','2026-11-23 04:06:48.980599'),(65,13,16,'EN_PROCESO',NULL,'2026-11-23 04:06:48.981598'),(66,13,17,'EN_PROCESO',NULL,'2026-11-23 04:06:48.983599'),(67,13,18,'COMPLETADA','2026-11-22 21:06:47.599144','2026-11-23 04:06:48.984601'),(68,15,11,'COMPLETADA','2026-11-17 20:59:00.000000','2026-11-23 04:06:48.988598'),(69,15,13,'COMPLETADA','2026-11-17 23:59:00.000000','2026-11-23 04:06:48.989598'),(70,15,15,'COMPLETADA','2026-11-17 19:59:00.000000','2026-11-23 04:06:48.990598'),(71,15,17,'EN_PROCESO',NULL,'2026-11-23 04:06:48.991598'),(72,15,19,'PENDIENTE',NULL,'2026-11-23 04:06:48.992600'),(73,16,11,'EN_PROCESO',NULL,'2026-11-23 04:06:48.994596'),(74,16,13,'PENDIENTE',NULL,'2026-11-23 04:06:48.995631'),(75,16,15,'PENDIENTE',NULL,'2026-11-23 04:06:48.996627'),(76,16,17,'PENDIENTE',NULL,'2026-11-23 04:06:48.997625'),(77,16,19,'COMPLETADA','2026-11-21 21:06:47.599144','2026-11-23 04:06:48.998627'),(78,17,8,'PENDIENTE',NULL,'2026-11-23 04:06:49.001644'),(79,17,13,'EN_PROCESO',NULL,'2026-11-23 04:06:49.002644'),(80,17,14,'PENDIENTE',NULL,'2026-11-23 04:06:49.003675'),(81,17,18,'PENDIENTE',NULL,'2026-11-23 04:06:49.004639'),(82,17,19,'PENDIENTE',NULL,'2026-11-23 04:06:49.005655'),(83,17,20,'PENDIENTE',NULL,'2026-11-23 04:06:49.006660'),(84,18,8,'PENDIENTE',NULL,'2026-11-23 04:06:49.009641'),(85,18,13,'COMPLETADA','2026-11-21 13:06:47.599144','2026-11-23 04:06:49.010641'),(86,18,14,'PENDIENTE',NULL,'2026-11-23 04:06:49.011643'),(87,18,18,'COMPLETADA','2026-11-23 02:06:47.599144','2026-11-23 04:06:49.012643'),(88,18,19,'COMPLETADA','2026-11-21 06:06:47.599144','2026-11-23 04:06:49.012643'),(89,18,20,'EN_PROCESO',NULL,'2026-11-23 04:06:49.014153'),(90,19,11,'PENDIENTE',NULL,'2026-11-23 04:06:49.016163'),(91,19,13,'PENDIENTE',NULL,'2026-11-23 04:06:49.017163'),(92,19,15,'COMPLETADA','2026-11-21 16:59:00.000000','2026-11-23 04:06:49.018163'),(93,19,16,'COMPLETADA','2026-11-21 15:59:00.000000','2026-11-23 04:06:49.019163'),(94,19,17,'COMPLETADA','2026-11-21 11:59:00.000000','2026-11-23 04:06:49.020181'),(95,19,19,'EN_PROCESO',NULL,'2026-11-23 04:06:49.021161'),(96,20,11,'EN_PROCESO',NULL,'2026-11-23 04:06:49.023160'),(97,20,13,'EN_PROCESO',NULL,'2026-11-23 04:06:49.024163'),(98,20,15,'COMPLETADA','2026-11-21 08:06:47.599144','2026-11-23 04:06:49.025160'),(99,20,16,'COMPLETADA','2026-11-22 10:06:47.599144','2026-11-23 04:06:49.026163'),(100,20,17,'PENDIENTE',NULL,'2026-11-23 04:06:49.027161'),(101,20,19,'EN_PROCESO',NULL,'2026-11-23 04:06:49.028163'),(102,21,9,'EN_PROCESO',NULL,'2026-11-23 04:06:49.030162'),(103,21,13,'COMPLETADA','2026-11-22 07:06:47.599144','2026-11-23 04:06:49.031162'),(104,21,18,'EN_PROCESO',NULL,'2026-11-23 04:06:49.032161'),(105,21,20,'EN_PROCESO',NULL,'2026-11-23 04:06:49.033161'),(106,23,10,'EN_PROCESO',NULL,'2026-11-23 04:06:49.039163'),(107,23,14,'PENDIENTE',NULL,'2026-11-23 04:06:49.040163'),(108,23,17,'EN_PROCESO',NULL,'2026-11-23 04:06:49.041162'),(109,23,18,'EN_PROCESO',NULL,'2026-11-23 04:06:49.042162'),(110,24,10,'EN_PROCESO',NULL,'2026-11-23 04:06:49.045198'),(111,24,14,'PENDIENTE',NULL,'2026-11-23 04:06:49.045198'),(112,24,17,'PENDIENTE',NULL,'2026-11-23 04:06:49.046163'),(113,24,18,'PENDIENTE',NULL,'2026-11-23 04:06:49.047162'),(114,25,7,'PENDIENTE',NULL,'2026-11-23 04:06:49.049163'),(115,26,7,'EN_PROCESO',NULL,'2026-11-23 04:06:49.052164'),(116,27,7,'COMPLETADA','2026-11-22 10:00:00.000000','2026-11-23 04:06:49.054184'),(117,28,7,'PENDIENTE',NULL,'2026-11-23 04:06:49.057194'),(118,29,8,'PENDIENTE',NULL,'2026-11-23 04:06:49.059161'),(119,30,9,'EN_PROCESO',NULL,'2026-11-23 04:06:49.061178');
/*!40000 ALTER TABLE `seguimientos_tarea` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `sesiones_jwt`
--

LOCK TABLES `sesiones_jwt` WRITE;
/*!40000 ALTER TABLE `sesiones_jwt` DISABLE KEYS */;
/*!40000 ALTER TABLE `sesiones_jwt` ENABLE KEYS */;
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
INSERT INTO `tareas` VALUES (1,2,1,'Entrega de reporte: integrales de línea','Actividad de Cálculo Vectorial. Revisa las instrucciones en clase y entrega en la plataforma.','2026-11-23 23:59:00.000000','ALTA','DOCENTE','PUBLICADA','2026-11-12 04:06:47.599144','2026-11-23 04:06:48.885663','2026-11-23 04:06:48.885663'),(2,2,1,'Ejercicios de campos vectoriales','Actividad de Cálculo Vectorial. Revisa las instrucciones en clase y entrega en la plataforma.','2026-11-26 18:00:00.000000','MEDIA','DOCENTE','PUBLICADA','2026-11-12 04:06:47.599144','2026-11-23 04:06:48.896670','2026-11-23 04:06:48.896670'),(3,3,2,'Reporte de laboratorio: inducción','Actividad de Física General III. Revisa las instrucciones en clase y entrega en la plataforma.','2026-11-24 23:59:00.000000','MEDIA','DOCENTE','PUBLICADA','2026-11-15 04:06:47.599144','2026-11-23 04:06:48.904693','2026-11-23 04:06:48.904693'),(4,3,2,'Problemario de óptica','Actividad de Física General III. Revisa las instrucciones en clase y entrega en la plataforma.','2026-11-29 18:00:00.000000','BAJA','DOCENTE','PUBLICADA','2026-11-12 04:06:47.599144','2026-11-23 04:06:48.914176','2026-11-23 04:06:48.914176'),(5,4,3,'Ejercicios de matrices y determinantes','Actividad de Álgebra Lineal. Revisa las instrucciones en clase y entrega en la plataforma.','2026-11-26 23:59:00.000000','BAJA','DOCENTE','PUBLICADA','2026-11-12 04:06:47.599144','2026-11-23 04:06:48.921183','2026-11-23 04:06:48.921183'),(6,4,3,'Proyecto: transformaciones lineales','Actividad de Álgebra Lineal. Revisa las instrucciones en clase y entrega en la plataforma.','2026-12-02 18:00:00.000000','ALTA','DOCENTE','PUBLICADA','2026-11-15 04:06:47.599144','2026-11-23 04:06:48.926210','2026-11-23 04:06:48.926210'),(7,5,4,'Retrospectiva del sprint 3','Actividad de Metodologías Ágiles. Revisa las instrucciones en clase y entrega en la plataforma.','2026-11-20 23:59:00.000000','ALTA','DOCENTE','PUBLICADA','2026-11-12 04:06:47.599144','2026-11-23 04:06:48.933187','2026-11-23 04:06:48.933187'),(8,5,4,'Tablero Kanban del proyecto','Actividad de Metodologías Ágiles. Revisa las instrucciones en clase y entrega en la plataforma.','2026-11-27 18:00:00.000000','MEDIA','DOCENTE','PUBLICADA','2026-11-15 04:06:47.599144','2026-11-23 04:06:48.941199','2026-11-23 04:06:48.941199'),(9,6,5,'Proyecto final: prototipo navegable','Actividad de Diseño de Interfaces UX/UI. Revisa las instrucciones en clase y entrega en la plataforma.','2026-11-23 23:59:00.000000','MEDIA','DOCENTE','PUBLICADA','2026-11-12 04:06:47.599144','2026-11-23 04:06:48.949185','2026-11-23 04:06:48.949185'),(10,6,5,'Pruebas de usabilidad con 5 usuarios','Actividad de Diseño de Interfaces UX/UI. Revisa las instrucciones en clase y entrega en la plataforma.','2026-12-05 18:00:00.000000','BAJA','DOCENTE','PUBLICADA','2026-11-14 04:06:47.599144','2026-11-23 04:06:48.955193','2026-11-23 04:06:48.955193'),(11,5,6,'Ensayo de ética profesional','Actividad de Ética y Sociedad. Revisa las instrucciones en clase y entrega en la plataforma.','2026-11-22 23:59:00.000000','BAJA','DOCENTE','PUBLICADA','2026-11-15 04:06:47.599144','2026-11-23 04:06:48.963194','2026-11-23 04:06:48.963194'),(12,5,6,'Análisis de caso: privacidad de datos','Actividad de Ética y Sociedad. Revisa las instrucciones en clase y entrega en la plataforma.','2026-11-28 18:00:00.000000','ALTA','DOCENTE','PUBLICADA','2026-11-15 04:06:47.599144','2026-11-23 04:06:48.969194','2026-11-23 04:06:48.969194'),(13,6,7,'Landing responsiva con React','Actividad de Programación Web. Revisa las instrucciones en clase y entrega en la plataforma.','2026-11-25 23:59:00.000000','ALTA','DOCENTE','PUBLICADA','2026-11-16 04:06:47.599144','2026-11-23 04:06:48.975598','2026-11-23 04:06:48.975598'),(14,6,7,'Consumo de API REST con Axios','Actividad de Programación Web. Revisa las instrucciones en clase y entrega en la plataforma.','2026-12-01 18:00:00.000000','MEDIA','DOCENTE','BORRADOR',NULL,'2026-11-23 04:06:48.986598','2026-11-23 04:06:48.986598'),(15,4,8,'Modelo entidad-relación','Actividad de Bases de Datos. Revisa las instrucciones en clase y entrega en la plataforma.','2026-11-18 23:59:00.000000','MEDIA','DOCENTE','PUBLICADA','2026-11-13 04:06:47.599144','2026-11-23 04:06:48.987597','2026-11-23 04:06:48.987597'),(16,4,8,'Normalización hasta 3FN','Actividad de Bases de Datos. Revisa las instrucciones en clase y entrega en la plataforma.','2026-11-30 18:00:00.000000','BAJA','DOCENTE','PUBLICADA','2026-11-13 04:06:47.599144','2026-11-23 04:06:48.993601','2026-11-23 04:06:48.993601'),(17,2,9,'Práctica de distribuciones','Actividad de Probabilidad y Estadística. Revisa las instrucciones en clase y entrega en la plataforma.','2026-11-27 23:59:00.000000','BAJA','DOCENTE','PUBLICADA','2026-11-13 04:06:47.599144','2026-11-23 04:06:48.999657','2026-11-23 04:06:48.999657'),(18,2,9,'Examen de práctica: intervalos de confianza','Actividad de Probabilidad y Estadística. Revisa las instrucciones en clase y entrega en la plataforma.','2026-12-03 18:00:00.000000','ALTA','DOCENTE','PUBLICADA','2026-11-16 04:06:47.599144','2026-11-23 04:06:49.007640','2026-11-23 04:06:49.007640'),(19,3,10,'Configuración de VLANs','Actividad de Redes de Computadoras. Revisa las instrucciones en clase y entrega en la plataforma.','2026-11-21 23:59:00.000000','ALTA','DOCENTE','PUBLICADA','2026-11-16 04:06:47.599144','2026-11-23 04:06:49.015163','2026-11-23 04:06:49.015163'),(20,3,10,'Análisis de tráfico con Wireshark','Actividad de Redes de Computadoras. Revisa las instrucciones en clase y entrega en la plataforma.','2026-12-04 18:00:00.000000','MEDIA','DOCENTE','PUBLICADA','2026-11-16 04:06:47.599144','2026-11-23 04:06:49.022196','2026-11-23 04:06:49.022196'),(21,6,11,'Simulación de planificador de procesos','Actividad de Sistemas Operativos. Revisa las instrucciones en clase y entrega en la plataforma.','2026-11-29 23:59:00.000000','MEDIA','DOCENTE','PUBLICADA','2026-11-13 04:06:47.599144','2026-11-23 04:06:49.028163','2026-11-23 04:06:49.028163'),(22,6,11,'Reporte de memoria virtual','Actividad de Sistemas Operativos. Revisa las instrucciones en clase y entrega en la plataforma.','2026-12-06 18:00:00.000000','BAJA','DOCENTE','BORRADOR',NULL,'2026-11-23 04:06:49.034161','2026-11-23 04:06:49.034161'),(23,5,12,'Historias de usuario del proyecto','Actividad de Ingeniería de Software. Revisa las instrucciones en clase y entrega en la plataforma.','2026-11-24 23:59:00.000000','BAJA','DOCENTE','PUBLICADA','2026-11-12 04:06:47.599144','2026-11-23 04:06:49.037162','2026-11-23 04:06:49.037162'),(24,5,12,'Diagrama de despliegue','Actividad de Ingeniería de Software. Revisa las instrucciones en clase y entrega en la plataforma.','2026-12-08 18:00:00.000000','ALTA','DOCENTE','PUBLICADA','2026-11-15 04:06:47.599144','2026-11-23 04:06:49.043164','2026-11-23 04:06:49.043164'),(25,7,NULL,'Preparación de exposición',NULL,'2026-11-27 09:00:00.000000','MEDIA','PERSONAL','PUBLICADA','2026-11-21 04:06:49.048161','2026-11-23 04:06:49.048161','2026-11-23 04:06:49.048161'),(26,7,2,'Repasar notas para el examen parcial',NULL,'2026-11-25 20:00:00.000000','ALTA','PERSONAL','PUBLICADA','2026-11-21 04:06:49.050164','2026-11-23 04:06:49.050164','2026-11-23 04:06:49.050164'),(27,7,NULL,'Renovar credencial de la biblioteca',NULL,'2026-11-22 13:00:00.000000','BAJA','PERSONAL','PUBLICADA','2026-11-21 04:06:49.053162','2026-11-23 04:06:49.053162','2026-11-23 04:06:49.053162'),(28,7,5,'Investigar referencias de diseño',NULL,'2026-11-29 18:00:00.000000','BAJA','PERSONAL','PUBLICADA','2026-11-21 04:06:49.055162','2026-11-23 04:06:49.056193','2026-11-23 04:06:49.056193'),(29,8,NULL,'Comprar material de laboratorio',NULL,'2026-11-26 10:00:00.000000','MEDIA','PERSONAL','PUBLICADA','2026-11-21 04:06:49.058162','2026-11-23 04:06:49.058161','2026-11-23 04:06:49.058161'),(30,9,NULL,'Organizar apuntes del parcial',NULL,'2026-11-24 19:00:00.000000','ALTA','PERSONAL','PUBLICADA','2026-11-21 04:06:49.060161','2026-11-23 04:06:49.060160','2026-11-23 04:06:49.060160');
/*!40000 ALTER TABLE `tareas` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `tokens_recuperacion`
--

LOCK TABLES `tokens_recuperacion` WRITE;
/*!40000 ALTER TABLE `tokens_recuperacion` DISABLE KEYS */;
/*!40000 ALTER TABLE `tokens_recuperacion` ENABLE KEYS */;
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
INSERT INTO `usuarios` VALUES (1,1,'Administración','Dianova','admin@dianova.test','$2a$12$ghXEVAtufosp/RElVRGpouz2MpVdOguvQe3WD8sa4MJjw3zEZAfDm',NULL,NULL,NULL,1,'2026-11-21 05:06:47.599144','2026-11-23 04:06:48.558380','2026-11-23 04:06:48.861659'),(2,2,'Alejandro','Méndez Ruiz','docente@dianova.test','$2a$12$fA1rVXF89w6ppJ.Q0tWiYOBAheIQ/BIi3l/Dn35x0S/EZemxsX23K',NULL,NULL,NULL,1,'2026-11-20 18:06:47.599144','2026-11-23 04:06:48.576417','2026-11-23 04:06:48.864653'),(3,2,'Elena','Santos Ibarra','esantos@dianova.test','$2a$12$fA1rVXF89w6ppJ.Q0tWiYOBAheIQ/BIi3l/Dn35x0S/EZemxsX23K',NULL,NULL,NULL,1,'2026-11-21 15:06:47.599144','2026-11-23 04:06:48.579314','2026-11-23 04:06:48.864653'),(4,2,'Roberto','Castillo Peña','rcastillo@dianova.test','$2a$12$fA1rVXF89w6ppJ.Q0tWiYOBAheIQ/BIi3l/Dn35x0S/EZemxsX23K',NULL,NULL,NULL,1,'2026-11-22 10:06:47.599144','2026-11-23 04:06:48.584318','2026-11-23 04:06:48.864653'),(5,2,'Carmen','Silva Robles','csilva@dianova.test','$2a$12$fA1rVXF89w6ppJ.Q0tWiYOBAheIQ/BIi3l/Dn35x0S/EZemxsX23K',NULL,NULL,NULL,1,'2026-11-22 19:06:47.599144','2026-11-23 04:06:48.588316','2026-11-23 04:06:48.864653'),(6,2,'Daniel','Ortega Luna','dortega@dianova.test','$2a$12$fA1rVXF89w6ppJ.Q0tWiYOBAheIQ/BIi3l/Dn35x0S/EZemxsX23K',NULL,NULL,NULL,1,'2026-11-20 06:06:47.599144','2026-11-23 04:06:48.590314','2026-11-23 04:06:48.865667'),(7,3,'Sofía','Martínez López','estudiante@dianova.test','$2a$12$9wljTv/RIx.Z6A0/Nf7eKuRY7s5T9P4FxoXB2O696ZaqVZSIruQH.',NULL,'Ingeniería en Software',NULL,1,'2026-11-22 23:06:47.599144','2026-11-23 04:06:48.592314','2026-11-23 04:06:48.865667'),(8,3,'Diego','Hernández Cruz','dhernandez@dianova.test','$2a$12$9wljTv/RIx.Z6A0/Nf7eKuRY7s5T9P4FxoXB2O696ZaqVZSIruQH.',NULL,'Ingeniería en Software',NULL,1,'2026-11-22 00:06:47.599144','2026-11-23 04:06:48.594323','2026-11-23 04:06:48.865667'),(9,3,'Valeria','Gómez Torres','vgomez@dianova.test','$2a$12$9wljTv/RIx.Z6A0/Nf7eKuRY7s5T9P4FxoXB2O696ZaqVZSIruQH.',NULL,'Ingeniería en Software',NULL,1,'2026-11-22 18:06:47.599144','2026-11-23 04:06:48.595322','2026-11-23 04:06:48.865667'),(10,3,'Mateo','Ramírez Vega','mramirez@dianova.test','$2a$12$9wljTv/RIx.Z6A0/Nf7eKuRY7s5T9P4FxoXB2O696ZaqVZSIruQH.',NULL,'Ingeniería Mecatrónica',NULL,1,'2026-11-22 10:06:47.599144','2026-11-23 04:06:48.597323','2026-11-23 04:06:48.865667'),(11,3,'Camila','Flores Rivas','cflores@dianova.test','$2a$12$9wljTv/RIx.Z6A0/Nf7eKuRY7s5T9P4FxoXB2O696ZaqVZSIruQH.',NULL,'Ingeniería en Software',NULL,1,'2026-11-21 13:06:47.599144','2026-11-23 04:06:48.601324','2026-11-23 04:06:48.866666'),(12,3,'Santiago','Morales Díaz','smorales@dianova.test','$2a$12$9wljTv/RIx.Z6A0/Nf7eKuRY7s5T9P4FxoXB2O696ZaqVZSIruQH.',NULL,'Ingeniería Industrial',NULL,1,'2026-11-20 05:06:47.599144','2026-11-23 04:06:48.604321','2026-11-23 04:06:48.866666'),(13,3,'Regina','Navarro Soto','rnavarro@dianova.test','$2a$12$9wljTv/RIx.Z6A0/Nf7eKuRY7s5T9P4FxoXB2O696ZaqVZSIruQH.',NULL,'Ingeniería en Software',NULL,1,'2026-11-21 13:06:47.599144','2026-11-23 04:06:48.607830','2026-11-23 04:06:48.866666'),(14,3,'Emiliano','Reyes Campos','ereyes@dianova.test','$2a$12$9wljTv/RIx.Z6A0/Nf7eKuRY7s5T9P4FxoXB2O696ZaqVZSIruQH.',NULL,'Ingeniería Mecatrónica',NULL,1,'2026-11-20 10:06:47.599144','2026-11-23 04:06:48.609838','2026-11-23 04:06:48.866666'),(15,3,'Ximena','Aguilar Mora','xaguilar@dianova.test','$2a$12$9wljTv/RIx.Z6A0/Nf7eKuRY7s5T9P4FxoXB2O696ZaqVZSIruQH.',NULL,'Ingeniería en Software',NULL,1,'2026-11-22 10:06:47.599144','2026-11-23 04:06:48.612838','2026-11-23 04:06:48.866666'),(16,3,'Leonardo','Castro Ortiz','lcastro@dianova.test','$2a$12$9wljTv/RIx.Z6A0/Nf7eKuRY7s5T9P4FxoXB2O696ZaqVZSIruQH.',NULL,'Ingeniería Industrial',NULL,1,'2026-11-22 02:06:47.599144','2026-11-23 04:06:48.615099','2026-11-23 04:06:48.866666'),(17,3,'Renata','Jiménez Salas','rjimenez@dianova.test','$2a$12$9wljTv/RIx.Z6A0/Nf7eKuRY7s5T9P4FxoXB2O696ZaqVZSIruQH.',NULL,'Ingeniería en Software',NULL,1,'2026-11-21 22:06:47.599144','2026-11-23 04:06:48.617096','2026-11-23 04:06:48.867666'),(18,3,'Sebastián','Vargas Luna','svargas@dianova.test','$2a$12$9wljTv/RIx.Z6A0/Nf7eKuRY7s5T9P4FxoXB2O696ZaqVZSIruQH.',NULL,'Ingeniería Mecatrónica',NULL,1,'2026-11-21 12:06:47.599144','2026-11-23 04:06:48.619094','2026-11-23 04:06:48.867666'),(19,3,'Fernanda','Rojas Medina','frojas@dianova.test','$2a$12$9wljTv/RIx.Z6A0/Nf7eKuRY7s5T9P4FxoXB2O696ZaqVZSIruQH.',NULL,'Ingeniería en Software',NULL,1,'2026-11-20 07:06:47.599144','2026-11-23 04:06:48.622094','2026-11-23 04:06:48.867666'),(20,3,'Andrés','Guerrero Paz','aguerrero@dianova.test','$2a$12$9wljTv/RIx.Z6A0/Nf7eKuRY7s5T9P4FxoXB2O696ZaqVZSIruQH.',NULL,'Ingeniería Industrial',NULL,1,'2026-11-20 15:06:47.599144','2026-11-23 04:06:48.624094','2026-11-23 04:06:48.867666');
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

-- Dump completed on 2026-11-23  4:06:56
