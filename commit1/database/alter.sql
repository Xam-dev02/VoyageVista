-- ============================================================
-- VoyageVista — Correctifs sur la base existante
-- À exécuter si la base a déjà été importée via schema.sql
-- ============================================================

USE voyagevista;

-- Bug #1 : 'rejete' manquant dans l'ENUM hebergement.statut
ALTER TABLE hebergement
  MODIFY COLUMN statut ENUM('disponible','indisponible','en_attente','rejete') NOT NULL DEFAULT 'en_attente';

-- Bug #1 : 'rejete' manquant dans l'ENUM activite.statut
ALTER TABLE activite
  MODIFY COLUMN statut ENUM('disponible','complet','annule','en_attente','rejete') NOT NULL DEFAULT 'en_attente';
