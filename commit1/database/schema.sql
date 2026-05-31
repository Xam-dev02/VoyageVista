-- =====================================================================
-- VoyageVista — Schéma de la base de données
-- Projet Web dynamique 2026 — ECE ING2
-- MySQL 8.0 / 5.7 compatible (InnoDB, utf8mb4)
-- =====================================================================

DROP DATABASE IF EXISTS voyagevista;
CREATE DATABASE voyagevista CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE voyagevista;

-- ---------------------------------------------------------------------
-- 1. UTILISATEUR
-- ---------------------------------------------------------------------
CREATE TABLE utilisateur (
    id_utilisateur    INT AUTO_INCREMENT PRIMARY KEY,
    nom               VARCHAR(50)  NOT NULL,
    prenom            VARCHAR(50)  NOT NULL,
    email             VARCHAR(100) NOT NULL UNIQUE,
    mot_de_passe      VARCHAR(255) NOT NULL,
    telephone         VARCHAR(20),
    date_inscription  DATE NOT NULL DEFAULT (CURRENT_DATE),
    role              ENUM('voyageur','prestataire','admin') NOT NULL DEFAULT 'voyageur',
    photo_profil      VARCHAR(255),
    statut            ENUM('actif','inactif') NOT NULL DEFAULT 'actif',
    INDEX idx_user_role (role),
    INDEX idx_user_email (email)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 2. DESTINATION
-- ---------------------------------------------------------------------
CREATE TABLE destination (
    id_destination INT AUTO_INCREMENT PRIMARY KEY,
    nom            VARCHAR(100) NOT NULL,
    pays           VARCHAR(100) NOT NULL,
    continent      VARCHAR(50),
    description    TEXT,
    latitude       DECIMAL(10,7),
    longitude      DECIMAL(10,7),
    photo_url      VARCHAR(255),
    categorie      ENUM('plage','montagne','ville','culture','aventure') NOT NULL,
    INDEX idx_dest_categorie (categorie),
    INDEX idx_dest_pays (pays)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 3. HEBERGEMENT
-- ---------------------------------------------------------------------
CREATE TABLE hebergement (
    id_hebergement INT AUTO_INCREMENT PRIMARY KEY,
    nom            VARCHAR(100) NOT NULL,
    type           ENUM('hotel','villa','auberge','resort','appartement') NOT NULL,
    etoiles        TINYINT CHECK (etoiles BETWEEN 1 AND 5),
    prix_nuit      DECIMAL(8,2) NOT NULL,
    capacite       INT NOT NULL DEFAULT 2,
    description    TEXT,
    adresse        VARCHAR(255),
    equipements    TEXT,
    photo_url      VARCHAR(255),
    statut         ENUM('disponible','indisponible','en_attente','rejete') NOT NULL DEFAULT 'en_attente',
    id_destination INT NOT NULL,
    id_prestataire INT NOT NULL,
    FOREIGN KEY (id_destination) REFERENCES destination(id_destination) ON DELETE CASCADE,
    FOREIGN KEY (id_prestataire) REFERENCES utilisateur(id_utilisateur) ON DELETE CASCADE,
    INDEX idx_heb_dest (id_destination),
    INDEX idx_heb_statut (statut),
    INDEX idx_heb_prestataire (id_prestataire)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 4. TRANSPORT
-- ---------------------------------------------------------------------
CREATE TABLE transport (
    id_transport       INT AUTO_INCREMENT PRIMARY KEY,
    type               ENUM('avion','train','voiture','ferry') NOT NULL,
    compagnie          VARCHAR(100) NOT NULL,
    numero             VARCHAR(20),
    date_depart        DATETIME NOT NULL,
    date_arrivee       DATETIME NOT NULL,
    classe             ENUM('economique','business','premiere') NOT NULL DEFAULT 'economique',
    prix               DECIMAL(8,2) NOT NULL,
    places_totales     INT NOT NULL DEFAULT 100,
    places_disponibles INT NOT NULL DEFAULT 100,
    id_origine         INT NOT NULL,
    id_arrivee         INT NOT NULL,
    id_prestataire     INT NOT NULL,
    FOREIGN KEY (id_origine)     REFERENCES destination(id_destination) ON DELETE CASCADE,
    FOREIGN KEY (id_arrivee)     REFERENCES destination(id_destination) ON DELETE CASCADE,
    FOREIGN KEY (id_prestataire) REFERENCES utilisateur(id_utilisateur) ON DELETE CASCADE,
    INDEX idx_trans_type (type),
    INDEX idx_trans_origine (id_origine),
    INDEX idx_trans_arrivee (id_arrivee),
    CONSTRAINT chk_trans_dates CHECK (date_arrivee > date_depart)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 5. ACTIVITE
-- ---------------------------------------------------------------------
CREATE TABLE activite (
    id_activite        INT AUTO_INCREMENT PRIMARY KEY,
    nom                VARCHAR(100) NOT NULL,
    description        TEXT,
    type               ENUM('culture','aventure','gastronomie','nature','bienetre','sport') NOT NULL,
    prix_personne      DECIMAL(6,2) NOT NULL,
    duree_heures       DECIMAL(4,1),
    capacite_max       INT NOT NULL DEFAULT 20,
    places_disponibles INT NOT NULL DEFAULT 20,
    photo_url          VARCHAR(255),
    statut             ENUM('disponible','complet','annule','en_attente','rejete') NOT NULL DEFAULT 'en_attente',
    id_destination     INT NOT NULL,
    id_prestataire     INT NOT NULL,
    FOREIGN KEY (id_destination) REFERENCES destination(id_destination) ON DELETE CASCADE,
    FOREIGN KEY (id_prestataire) REFERENCES utilisateur(id_utilisateur) ON DELETE CASCADE,
    INDEX idx_act_dest (id_destination),
    INDEX idx_act_type (type),
    INDEX idx_act_statut (statut)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 6. VOYAGE  (itinéraire en cours = panier si statut 'brouillon')
-- ---------------------------------------------------------------------
CREATE TABLE voyage (
    id_voyage     INT AUTO_INCREMENT PRIMARY KEY,
    titre         VARCHAR(150) NOT NULL,
    date_creation DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    statut        ENUM('brouillon','confirme','annule','termine') NOT NULL DEFAULT 'brouillon',
    nb_voyageurs  INT NOT NULL DEFAULT 1,
    prix_total    DECIMAL(10,2) NOT NULL DEFAULT 0,
    est_modele    BOOLEAN NOT NULL DEFAULT FALSE,
    id_utilisateur INT NOT NULL,
    FOREIGN KEY (id_utilisateur) REFERENCES utilisateur(id_utilisateur) ON DELETE CASCADE,
    INDEX idx_voyage_user (id_utilisateur),
    INDEX idx_voyage_statut (statut)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 7. ETAPE  (une ville dans un voyage multi-destinations)
-- ---------------------------------------------------------------------
CREATE TABLE etape (
    id_etape       INT AUTO_INCREMENT PRIMARY KEY,
    ordre          INT NOT NULL DEFAULT 1,
    date_arrivee   DATE,
    date_depart    DATE,
    id_voyage      INT NOT NULL,
    id_destination INT NOT NULL,
    id_hebergement INT,
    id_transport   INT,
    FOREIGN KEY (id_voyage)      REFERENCES voyage(id_voyage)           ON DELETE CASCADE,
    FOREIGN KEY (id_destination) REFERENCES destination(id_destination) ON DELETE CASCADE,
    FOREIGN KEY (id_hebergement) REFERENCES hebergement(id_hebergement) ON DELETE SET NULL,
    FOREIGN KEY (id_transport)   REFERENCES transport(id_transport)     ON DELETE SET NULL,
    INDEX idx_etape_voyage (id_voyage)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 8. ETAPE_ACTIVITE  (jonction Etape <-> Activite)
-- ---------------------------------------------------------------------
CREATE TABLE etape_activite (
    id_etape_activite INT AUTO_INCREMENT PRIMARY KEY,
    date_heure        DATETIME,
    nb_personnes      INT NOT NULL DEFAULT 1,
    prix_calcule      DECIMAL(8,2) NOT NULL DEFAULT 0,
    id_etape          INT NOT NULL,
    id_activite       INT NOT NULL,
    FOREIGN KEY (id_etape)    REFERENCES etape(id_etape)       ON DELETE CASCADE,
    FOREIGN KEY (id_activite) REFERENCES activite(id_activite) ON DELETE CASCADE,
    INDEX idx_ea_etape (id_etape)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 9. RESERVATION  (confirmation finale d'un voyage)
-- ---------------------------------------------------------------------
CREATE TABLE reservation (
    id_reservation   INT AUTO_INCREMENT PRIMARY KEY,
    reference        VARCHAR(20) NOT NULL UNIQUE,
    date_reservation DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    statut           ENUM('en_attente','confirmee','annulee') NOT NULL DEFAULT 'en_attente',
    montant_total    DECIMAL(10,2) NOT NULL,
    methode_paiement ENUM('carte','paypal','virement') NOT NULL DEFAULT 'carte',
    infos_paiement   TEXT,
    id_voyage        INT NOT NULL,
    id_utilisateur   INT NOT NULL,
    FOREIGN KEY (id_voyage)      REFERENCES voyage(id_voyage)         ON DELETE CASCADE,
    FOREIGN KEY (id_utilisateur) REFERENCES utilisateur(id_utilisateur) ON DELETE CASCADE,
    INDEX idx_resa_user (id_utilisateur),
    INDEX idx_resa_statut (statut)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 10. NOTIFICATION
-- ---------------------------------------------------------------------
CREATE TABLE notification (
    id_notification INT AUTO_INCREMENT PRIMARY KEY,
    titre           VARCHAR(100) NOT NULL,
    message         TEXT,
    type            ENUM('reservation','modification','rappel','promotion','systeme') NOT NULL DEFAULT 'systeme',
    date_creation   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    est_lue         BOOLEAN NOT NULL DEFAULT FALSE,
    id_utilisateur  INT NOT NULL,
    id_voyage       INT,
    FOREIGN KEY (id_utilisateur) REFERENCES utilisateur(id_utilisateur) ON DELETE CASCADE,
    FOREIGN KEY (id_voyage)      REFERENCES voyage(id_voyage)           ON DELETE SET NULL,
    INDEX idx_notif_user (id_utilisateur),
    INDEX idx_notif_lue (est_lue)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 11. AVIS
-- ---------------------------------------------------------------------
CREATE TABLE avis (
    id_avis        INT AUTO_INCREMENT PRIMARY KEY,
    note           TINYINT NOT NULL CHECK (note BETWEEN 1 AND 5),
    commentaire    TEXT,
    date_avis      DATE NOT NULL DEFAULT (CURRENT_DATE),
    type_cible     ENUM('hebergement','activite','destination') NOT NULL,
    id_utilisateur INT NOT NULL,
    id_hebergement INT,
    id_activite    INT,
    id_destination INT,
    FOREIGN KEY (id_utilisateur) REFERENCES utilisateur(id_utilisateur) ON DELETE CASCADE,
    FOREIGN KEY (id_hebergement) REFERENCES hebergement(id_hebergement) ON DELETE CASCADE,
    FOREIGN KEY (id_activite)    REFERENCES activite(id_activite)       ON DELETE CASCADE,
    FOREIGN KEY (id_destination) REFERENCES destination(id_destination) ON DELETE CASCADE,
    INDEX idx_avis_heb (id_hebergement),
    INDEX idx_avis_act (id_activite),
    INDEX idx_avis_dest (id_destination)
) ENGINE=InnoDB;
