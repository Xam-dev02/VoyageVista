-- =====================================================================
-- VoyageVista — Données de démonstration
-- Tous les comptes ont pour mot de passe : password123
-- =====================================================================
USE voyagevista;

SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE avis;
TRUNCATE TABLE notification;
TRUNCATE TABLE reservation;
TRUNCATE TABLE etape_activite;
TRUNCATE TABLE etape;
TRUNCATE TABLE voyage;
TRUNCATE TABLE activite;
TRUNCATE TABLE transport;
TRUNCATE TABLE hebergement;
TRUNCATE TABLE destination;
TRUNCATE TABLE utilisateur;
SET FOREIGN_KEY_CHECKS = 1;

-- ------------------------------------------------------------------
-- UTILISATEURS  (mot de passe = password123)
-- ------------------------------------------------------------------
INSERT INTO utilisateur (id_utilisateur, nom, prenom, email, mot_de_passe, telephone, date_inscription, role, statut) VALUES
(1, 'Admin',     'VoyageVista', 'admin@voyagevista.fr',       '$2y$10$ATc9BDWCc3hOx06lONws8OQFeXsdaVH87YWg.IIFcHdPjUQHtcX0C', '0100000000', '2026-01-10', 'admin',       'actif'),
(2, 'Martin',    'Sophie',      'sophie.martin@email.fr',     '$2y$10$ATc9BDWCc3hOx06lONws8OQFeXsdaVH87YWg.IIFcHdPjUQHtcX0C', '0612345678', '2026-02-15', 'voyageur',    'actif'),
(3, 'Dubois',    'Lucas',       'lucas.dubois@email.fr',      '$2y$10$ATc9BDWCc3hOx06lONws8OQFeXsdaVH87YWg.IIFcHdPjUQHtcX0C', '0623456789', '2026-03-01', 'voyageur',    'actif'),
(4, 'Nakamura',  'Hôtels Pro',  'contact@nakamura-hotels.jp', '$2y$10$ATc9BDWCc3hOx06lONws8OQFeXsdaVH87YWg.IIFcHdPjUQHtcX0C', '0698765432', '2026-01-20', 'prestataire', 'actif'),
(5, 'Voyage',    'Air Express', 'pro@airexpress.com',         '$2y$10$ATc9BDWCc3hOx06lONws8OQFeXsdaVH87YWg.IIFcHdPjUQHtcX0C', '0687654321', '2026-01-25', 'prestataire', 'actif'),
(6, 'Aventure',  'Tours & Co',  'hello@aventuretours.com',    '$2y$10$ATc9BDWCc3hOx06lONws8OQFeXsdaVH87YWg.IIFcHdPjUQHtcX0C', '0676543210', '2026-02-05', 'prestataire', 'actif');

-- ------------------------------------------------------------------
-- DESTINATIONS
-- ------------------------------------------------------------------
INSERT INTO destination (id_destination, nom, pays, continent, description, latitude, longitude, photo_url, categorie) VALUES
(1, 'Tokyo',        'Japon',      'Asie',      'Mégalopole vibrante mêlant traditions séculaires et modernité futuriste. Temples, gastronomie raffinée et quartiers électriques.', 35.6761900, 139.6503100, 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800', 'ville'),
(2, 'Paris',        'France',     'Europe',    'La ville lumière, capitale de l''art de vivre, des musées et de la gastronomie. Monuments iconiques et balades romantiques.',       48.8566000, 2.3522000,   'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800', 'ville'),
(3, 'Bali',         'Indonésie',  'Asie',      'Île paradisiaque aux plages dorées, rizières en terrasses et temples hindous. Détente, surf et spiritualité.',                       -8.4095200, 115.1889200, 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800', 'plage'),
(4, 'Cusco',        'Pérou',      'Amérique',  'Porte d''entrée du Machu Picchu, ancienne capitale inca perchée dans les Andes. Histoire, culture et randonnées mythiques.',         -13.5319500, -71.9674600, 'https://images.unsplash.com/photo-1526392060635-9d6019884377?w=800', 'aventure'),
(5, 'New York',     'États-Unis', 'Amérique',  'La ville qui ne dort jamais. Gratte-ciels, Central Park, Broadway et une énergie unique au monde.',                                   40.7127800, -74.0060000, 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800', 'ville'),
(6, 'Barcelone',    'Espagne',    'Europe',    'Cité catalane au bord de la Méditerranée, architecture de Gaudí, plages urbaines et tapas. Soleil et culture.',                       41.3851000, 2.1734000,   'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800', 'plage'),
(7, 'Kyoto',        'Japon',      'Asie',      'Ancienne capitale impériale du Japon. Temples zen, jardins, geishas et forêts de bambous. Sérénité et patrimoine.',                  35.0116000, 135.7681000, 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800', 'culture'),
(8, 'Santorin',     'Grèce',      'Europe',    'Joyau des Cyclades, maisons blanches aux toits bleus surplombant la mer Égée. Couchers de soleil légendaires.',                       36.3932000, 25.4615000,  'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800', 'plage'),
(9, 'Interlaken',   'Suisse',     'Europe',    'Station alpine entre deux lacs, paradis des sports de montagne. Randonnée, parapente et panoramas grandioses.',                       46.6863000, 7.8632000,   'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?w=800', 'montagne'),
(10,'Marrakech',    'Maroc',      'Afrique',   'Cité impériale aux souks colorés, palais et jardins. Médina animée, riads et portes du désert.',                                     31.6295000, -7.9811000,  'https://images.unsplash.com/photo-1597212618440-806262de4f6b?w=800', 'culture');

-- ------------------------------------------------------------------
-- HEBERGEMENTS  (prestataire 4)
-- ------------------------------------------------------------------
INSERT INTO hebergement (nom, type, etoiles, prix_nuit, capacite, description, adresse, equipements, photo_url, statut, id_destination, id_prestataire) VALUES
('Shinjuku Granbell Hotel', 'hotel',  4, 140.00, 2, 'Hôtel design au cœur de Shinjuku, proche de la vie nocturne.', '2-14-5 Kabukicho, Shinjuku, Tokyo', 'Wifi, Climatisation, Restaurant, Bar sur le toit', 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800', 'disponible', 1, 4),
('Park Hyatt Tokyo',        'hotel',  5, 420.00, 2, 'Luxe absolu avec vue panoramique sur la ville et le mont Fuji.', '3-7-1-2 Nishi Shinjuku, Tokyo', 'Wifi, Spa, Piscine, Restaurant étoilé', 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800', 'disponible', 1, 4),
('Hôtel Le Marais',         'hotel',  3, 110.00, 2, 'Charme parisien au cœur du quartier historique du Marais.', '12 Rue de Rivoli, 75004 Paris', 'Wifi, Petit-déjeuner inclus', 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800', 'disponible', 2, 4),
('Villa Umah Sunset',       'villa',  4, 180.00, 6, 'Villa privée avec piscine à débordement face aux rizières.', 'Canggu, Bali', 'Wifi, Piscine privée, Cuisine, Climatisation', 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800', 'disponible', 3, 4),
('The Kayon Resort',        'resort', 5, 250.00, 4, 'Resort de luxe niché dans la jungle d''Ubud.', 'Ubud, Bali', 'Wifi, Spa, Piscine, Restaurant, Yoga', 'https://images.unsplash.com/photo-1540541338287-41700207dee6?w=800', 'disponible', 3, 4),
('Aqua Blue Suites',        'hotel',  4, 220.00, 2, 'Suites avec vue mer et jacuzzi privé à Oia.', 'Oia, Santorin', 'Wifi, Jacuzzi, Vue mer, Petit-déjeuner', 'https://images.unsplash.com/photo-1559599189-fe84dea4eb79?w=800', 'disponible', 8, 4),
('Andes Boutique Hotel',    'hotel',  3, 95.00,  3, 'Hôtel colonial au centre historique de Cusco.', 'Plaza de Armas, Cusco', 'Wifi, Chauffage, Restaurant', 'https://images.unsplash.com/photo-1455587734955-081b22074882?w=800', 'disponible', 4, 4),
('Auberge des Alpes',       'auberge',3, 130.00, 4, 'Chalet alpin chaleureux avec vue sur les sommets.', 'Höheweg, Interlaken', 'Wifi, Cheminée, Petit-déjeuner', 'https://images.unsplash.com/photo-1502784444187-359ac186c5bb?w=800', 'en_attente', 9, 4);

-- ------------------------------------------------------------------
-- TRANSPORTS  (prestataire 5)
-- ------------------------------------------------------------------
INSERT INTO transport (type, compagnie, numero, date_depart, date_arrivee, classe, prix, places_totales, places_disponibles, id_origine, id_arrivee, id_prestataire) VALUES
('avion', 'Air France',       'AF276',  '2026-06-15 11:30:00', '2026-06-16 05:15:00', 'economique', 1250.00, 250, 42,  2, 1, 5),
('avion', 'Japan Airlines',   'JL416',  '2026-06-15 13:00:00', '2026-06-16 08:30:00', 'business',   2890.00, 60,  8,   2, 1, 5),
('avion', 'Qatar Airways',    'QR040',  '2026-06-15 22:00:00', '2026-06-16 17:50:00', 'economique', 1180.00, 300, 0,   2, 1, 5),
('train', 'Shinkansen',       'NZM311', '2026-06-20 09:00:00', '2026-06-20 11:15:00', 'economique', 95.00,   400, 210, 1, 7, 5),
('avion', 'Garuda Indonesia', 'GA881',  '2026-06-22 10:00:00', '2026-06-22 16:30:00', 'economique', 640.00,  280, 95,  1, 3, 5),
('avion', 'Vueling',          'VY8001', '2026-07-01 08:45:00', '2026-07-01 10:30:00', 'economique', 89.00,   180, 60,  2, 6, 5),
('ferry', 'Blue Star Ferries','BS502',  '2026-07-05 07:30:00', '2026-07-05 15:00:00', 'economique', 65.00,   500, 320, 6, 8, 5),
('avion', 'LATAM',            'LA2470', '2026-07-10 06:00:00', '2026-07-10 12:45:00', 'economique', 410.00,  200, 75,  5, 4, 5);

-- ------------------------------------------------------------------
-- ACTIVITES  (prestataire 6)
-- ------------------------------------------------------------------
INSERT INTO activite (nom, description, type, prix_personne, duree_heures, capacite_max, places_disponibles, photo_url, statut, id_destination, id_prestataire) VALUES
-- Tokyo (1)
('Visite des temples de Tokyo',      'Découverte guidée des temples emblématiques : Senso-ji, Meiji-jingu et jardins zen.', 'culture',     45.00,  4.0, 15,  8, 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=800', 'disponible', 1, 6),
('Cours de cuisine japonaise',       'Apprenez à préparer sushis, ramen et gyoza avec un chef local à Tokyo.',              'gastronomie', 75.00,  3.0, 10,  4, 'https://images.unsplash.com/photo-1553621042-f6e147245754?w=800', 'disponible', 1, 6),
('Randonnée au Mont Fuji',           'Ascension guidée du symbole du Japon avec vue panoramique au lever du soleil.',        'aventure',    95.00,  8.0, 20, 12, 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800', 'disponible', 1, 6),
('Visite du quartier Shibuya by night','Tour nocturne de Shibuya, Akihabara et des ruelles de Shinjuku avec un guide.',    'culture',     40.00,  3.0, 25, 20, 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800', 'disponible', 1, 6),
-- Paris (2)
('Croisière sur la Seine',           'Croisière commentée d''1h30 le long des monuments parisiens illuminés.',               'culture',     35.00,  1.5, 50, 30, 'https://images.unsplash.com/photo-1471623320832-752e8bbf8413?w=800', 'disponible', 2, 6),
('Visite guidée du Louvre',          'Découverte des chefs-d''œuvre incontournables avec coupe-file et audioguide.',         'culture',     50.00,  3.0, 30, 18, 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=800', 'disponible', 2, 6),
('Cours de pâtisserie française',    'Créez croissants et macarons avec un pâtissier MOF dans un atelier parisien.',         'gastronomie', 95.00,  3.0, 12,  8, 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800', 'disponible', 2, 6),
('Balade à vélo Paris Vintage',      'Parcours en vélo rétro dans les quartiers de Montmartre et le Marais.',                'sport',       40.00,  2.5, 20,  0, 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800', 'complet',   2, 6),
-- Bali (3)
('Randonnée rizières de Tegallalang','Marche guidée à travers les spectaculaires rizières en terrasses d''Ubud.',            'nature',      35.00,  5.0, 12,  9, 'https://images.unsplash.com/photo-1518002171953-a080ee817e1f?w=800', 'disponible', 3, 6),
('Cours de surf à Kuta',             'Initiation ou perfectionnement au surf sur la célèbre plage de Kuta.',                 'sport',       65.00,  3.0, 10,  6, 'https://images.unsplash.com/photo-1519619091416-f5d671ea7ea9?w=800', 'disponible', 3, 6),
('Snorkeling à Blue Lagoon',         'Plongée avec masque et tuba dans les eaux cristallines de Padangbai.',                 'nature',      45.00,  2.5, 15, 10, 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800', 'disponible', 3, 6),
('Atelier poterie & spa balinais',   'Créez un objet en argile puis détendez-vous avec un soin traditionnel balinais.',      'bienetre',    55.00,  3.0, 10,  7, 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800', 'disponible', 3, 6),
-- Cusco (4)
('Trek du Machu Picchu',             'Randonnée de 2 jours sur le Chemin des Incas vers la citadelle mythique.',             'aventure',   220.00, 16.0,  8,  3, 'https://images.unsplash.com/photo-1526392060635-9d6019884377?w=800', 'disponible', 4, 6),
('Visite des salines de Maras',      'Découverte des terrasses salines incas perchées dans la Vallée Sacrée.',               'culture',     40.00,  3.0, 20, 14, 'https://images.unsplash.com/photo-1580619305218-8423a7ef79b4?w=800', 'disponible', 4, 6),
('Randonnée Rainbow Mountain',       'Ascension de la montagne aux 7 couleurs à 5 200 m d''altitude.',                       'aventure',    90.00,  6.0, 12,  0, 'https://images.unsplash.com/photo-1604537529428-15bcbeecfe4d?w=800', 'complet',   4, 6),
-- New York (5)
('Tour en hélicoptère Manhattan',    'Survol panoramique de Manhattan, Central Park et la Statue de la Liberté.',            'aventure',   180.00,  1.0,  8,  5, 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800', 'disponible', 5, 6),
('Visite Empire State Building',     'Accès aux observatoires du 86e et 102e étage avec vue à 360° sur NYC.',                'culture',     40.00,  2.0, 40, 25, 'https://images.unsplash.com/photo-1485871981521-5b1fd3805eee?w=800', 'disponible', 5, 6),
('Balade à Brooklyn & DUMBO',        'Promenade guidée sur le Brooklyn Bridge et dans le quartier artistique de DUMBO.',     'culture',     30.00,  3.0, 25, 18, 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800', 'disponible', 5, 6),
('Food tour à Manhattan',            'Dégustation de 8 adresses culte à Chelsea Market, Little Italy et Chinatown.',         'gastronomie', 75.00,  3.0, 15,  9, 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800', 'disponible', 5, 6),
-- Barcelone (6)
('Visite guidée Sagrada Família',    'Découverte de la basilique de Gaudí avec coupe-file et guide expert.',                 'culture',     45.00,  2.5, 25, 18, 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800', 'disponible', 6, 6),
('Cours de flamenco',                'Initiation à la danse flamenco avec une danseuse professionnelle de Barcelone.',        'culture',     55.00,  2.0, 20, 14, 'https://images.unsplash.com/photo-1518611540400-6b85a0704342?w=800', 'disponible', 6, 6),
('Dégustation tapas et cava',        'Tour gastronomique dans le marché de la Boqueria et les meilleurs bars à tapas.',      'gastronomie', 60.00,  2.5, 16,  0, 'https://images.unsplash.com/photo-1541614101331-1a5a3a194e92?w=800', 'complet',   6, 6),
-- Kyoto (7)
('Forêt de bambous d''Arashiyama',   'Promenade dans la forêt de bambous géants et visite du temple Tenryu-ji.',             'nature',      25.00,  2.0, 30, 22, 'https://images.unsplash.com/photo-1478436127897-769e1b3f0f36?w=800', 'disponible', 7, 6),
('Cérémonie du thé traditionnelle',  'Initiation à la cérémonie du thé matcha dans un salon historique de Kyoto.',           'culture',     50.00,  1.5, 10,  7, 'https://images.unsplash.com/photo-1544979590-37e9b47eb705?w=800', 'disponible', 7, 6),
('Visite de Fushimi Inari',          'Randonnée au lever du soleil parmi les milliers de torii vermillon.',                  'culture',     35.00,  3.0, 25, 15, 'https://images.unsplash.com/photo-1478659419992-f4eda9a2a17b?w=800', 'disponible', 7, 6),
('Balade en kimono dans Gion',       'Location de kimono et promenade dans le quartier historique des geishas.',              'bienetre',    70.00,  2.0,  8,  4, 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800', 'disponible', 7, 6),
-- Santorin (8)
('Croisière coucher de soleil',      'Croisière romantique le long de la caldeira avec dîner et vin local.',                 'nature',      90.00,  3.5, 20, 12, 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800', 'disponible', 8, 6),
('Dégustation de vins de Santorin',  'Visite d''un domaine viticole avec dégustation de l''Assyrtiko local au coucher du soleil.','gastronomie',80.00,2.0,16,  5, 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=800', 'disponible', 8, 6),
('Plongée sous-marine',              'Exploration des fonds marins volcaniques de la caldeira avec moniteur certifié.',       'sport',       95.00,  4.0, 10,  6, 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800', 'disponible', 8, 6),
-- Interlaken (9)
('Parapente sur les lacs alpins',    'Vol en parapente tandem au-dessus du lac de Thoune et de Brienz.',                     'sport',      160.00,  2.0,  6,  0, 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800', 'complet',   9, 6),
('Randonnée Jungfraujoch',           'Excursion au Toit de l''Europe (3 454 m) en train de montagne panoramique.',           'aventure',   140.00,  6.0, 20, 15, 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?w=800', 'disponible', 9, 6),
('Ski et snowboard',                 'Journée sur les pistes de la région Jungfrau avec moniteur et équipement inclus.',     'sport',      120.00,  5.0, 15, 10, 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800', 'disponible', 9, 6),
-- Marrakech (10)
('Visite de la Médina et des souks', 'Tour guidé dans les ruelles de la Médina, la place Jemaa el-Fna et les souks.',        'culture',     30.00,  3.0, 25, 18, 'https://images.unsplash.com/photo-1597212618440-806262de4f6b?w=800', 'disponible',10, 6),
('Hammam traditionnel & massage',    'Gommage au savon beldi et massage à l''huile d''argan dans un hammam historique.',      'bienetre',    70.00,  2.0, 20, 12, 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800', 'disponible',10, 6),
('Balade en quad dans les dunes',    'Aventure en quad dans les dunes de l''Agafay et coucher de soleil sur l''Atlas.',       'aventure',    85.00,  2.5, 12,  8, 'https://images.unsplash.com/photo-1516912481808-3406841bd33c?w=800', 'disponible',10, 6),
('Cours de cuisine marocaine',       'Marché, épices et tajine : apprenez les secrets de la gastronomie marocaine.',          'gastronomie', 65.00,  3.0, 10,  6, 'https://images.unsplash.com/photo-1541614101331-1a5a3a194e92?w=800', 'disponible',10, 6);

-- ------------------------------------------------------------------
-- VOYAGE de démo (voyageur 2) — un itinéraire en brouillon (panier)
-- ------------------------------------------------------------------
INSERT INTO voyage (id_voyage, titre, date_creation, statut, nb_voyageurs, prix_total, est_modele, id_utilisateur) VALUES
(1, 'Mon voyage au Japon', '2026-05-20 14:30:00', 'brouillon', 2, 1995.00, FALSE, 2),
(2, 'Découverte du Japon 14j', '2026-04-01 10:00:00', 'confirme', 2, 3200.00, TRUE, 1);

INSERT INTO etape (id_etape, ordre, date_arrivee, date_depart, id_voyage, id_destination, id_hebergement, id_transport) VALUES
(1, 1, '2026-06-16', '2026-06-20', 1, 1, 1, 1),
(2, 2, '2026-06-20', '2026-06-24', 1, 7, NULL, 4);

INSERT INTO etape_activite (date_heure, nb_personnes, prix_calcule, id_etape, id_activite) VALUES
('2026-06-17 09:00:00', 2, 90.00, 1, 1);

-- ------------------------------------------------------------------
-- NOTIFICATIONS (voyageur 2)
-- ------------------------------------------------------------------
INSERT INTO notification (titre, message, type, date_creation, est_lue, id_utilisateur, id_voyage) VALUES
('Bienvenue sur VoyageVista !', 'Commencez à composer votre premier itinéraire dès maintenant.', 'systeme', '2026-05-20 14:00:00', TRUE, 2, NULL),
('Itinéraire mis à jour', 'Votre voyage "Mon voyage au Japon" a été enregistré.', 'modification', '2026-05-20 14:30:00', FALSE, 2, 1),
('Offre spéciale', '-10% sur certaines activités à Bali jusqu''au 30 juin.', 'promotion', '2026-05-22 09:00:00', FALSE, 2, NULL);

-- ------------------------------------------------------------------
-- AVIS
-- ------------------------------------------------------------------
INSERT INTO avis (note, commentaire, date_avis, type_cible, id_utilisateur, id_hebergement, id_activite, id_destination) VALUES
(5, 'Hôtel parfait, emplacement idéal !', '2026-05-01', 'hebergement', 3, 1, NULL, NULL),
(4, 'Très belle expérience, guide passionnant.', '2026-05-03', 'activite', 2, NULL, 1, NULL),
(5, 'Tokyo est une ville incroyable.', '2026-05-05', 'destination', 2, NULL, NULL, 1);

-- Aligne l'AUTO_INCREMENT après insertion d'IDs explicites
ALTER TABLE voyage AUTO_INCREMENT = 3;
ALTER TABLE etape  AUTO_INCREMENT = 3;

-- Destinations supplémentaires (catalogue enrichi)
INSERT INTO destination (nom, pays, continent, description, latitude, longitude, photo_url, categorie) VALUES
('Rome','Italie','Europe','Patrimoine, histoire et traditions à découvrir sur place.',41.9028,12.4964,'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800','culture'),
('Londres','Royaume-Uni','Europe','Métropole vibrante : monuments, culture urbaine et vie animée.',51.5074,-0.1278,'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800','ville'),
('Amsterdam','Pays-Bas','Europe','Métropole vibrante : monuments, culture urbaine et vie animée.',52.3676,4.9041,'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800','ville'),
('Berlin','Allemagne','Europe','Métropole vibrante : monuments, culture urbaine et vie animée.',52.52,13.405,'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800','ville'),
('Lisbonne','Portugal','Europe','Métropole vibrante : monuments, culture urbaine et vie animée.',38.7223,-9.1393,'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800','ville'),
('Prague','Tchéquie','Europe','Patrimoine, histoire et traditions à découvrir sur place.',50.0755,14.4378,'https://images.unsplash.com/photo-1597212618440-806262de4f6b?w=800','culture'),
('Vienne','Autriche','Europe','Patrimoine, histoire et traditions à découvrir sur place.',48.2082,16.3738,'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800','culture'),
('Dubaï','Émirats arabes unis','Asie','Métropole vibrante : monuments, culture urbaine et vie animée.',25.2048,55.2708,'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800','ville'),
('Singapour','Singapour','Asie','Métropole vibrante : monuments, culture urbaine et vie animée.',1.3521,103.8198,'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800','ville'),
('Séoul','Corée du Sud','Asie','Métropole vibrante : monuments, culture urbaine et vie animée.',37.5665,126.978,'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800','ville'),
('Bangkok','Thaïlande','Asie','Métropole vibrante : monuments, culture urbaine et vie animée.',13.7563,100.5018,'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800','ville'),
('Istanbul','Turquie','Europe','Patrimoine, histoire et traditions à découvrir sur place.',41.0082,28.9784,'https://images.unsplash.com/photo-1597212618440-806262de4f6b?w=800','culture'),
('Rio de Janeiro','Brésil','Amérique','Eaux turquoise, plages de sable et farniente sous le soleil.',-22.9068,-43.1729,'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800','plage'),
('Sydney','Australie','Océanie','Métropole vibrante : monuments, culture urbaine et vie animée.',-33.8688,151.2093,'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800','ville'),
('San Francisco','États-Unis','Amérique','Métropole vibrante : monuments, culture urbaine et vie animée.',37.7749,-122.4194,'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800','ville'),
('Hong Kong','Chine','Asie','Métropole vibrante : monuments, culture urbaine et vie animée.',22.3193,114.1694,'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800','ville'),
('Montréal','Canada','Amérique','Métropole vibrante : monuments, culture urbaine et vie animée.',45.5017,-73.5673,'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800','ville'),
('Maldives','Maldives','Asie','Eaux turquoise, plages de sable et farniente sous le soleil.',3.2028,73.2207,'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800','plage'),
('Phuket','Thaïlande','Asie','Eaux turquoise, plages de sable et farniente sous le soleil.',7.8804,98.3923,'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800','plage'),
('Cancún','Mexique','Amérique','Eaux turquoise, plages de sable et farniente sous le soleil.',21.1619,-86.8515,'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800','plage'),
('Bora Bora','Polynésie française','Océanie','Eaux turquoise, plages de sable et farniente sous le soleil.',-16.5004,-151.7415,'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800','plage'),
('Zanzibar','Tanzanie','Afrique','Eaux turquoise, plages de sable et farniente sous le soleil.',-6.1659,39.2026,'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800','plage'),
('Mykonos','Grèce','Europe','Eaux turquoise, plages de sable et farniente sous le soleil.',37.4467,25.3289,'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800','plage'),
('Ibiza','Espagne','Europe','Eaux turquoise, plages de sable et farniente sous le soleil.',38.9067,1.4206,'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800','plage'),
('Seychelles','Seychelles','Afrique','Eaux turquoise, plages de sable et farniente sous le soleil.',-4.6796,55.492,'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800','plage'),
('Chamonix','France','Europe','Sommets, grands espaces et sports de plein air toute l''année.',45.9237,6.8694,'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?w=800','montagne'),
('Zermatt','Suisse','Europe','Sommets, grands espaces et sports de plein air toute l''année.',46.0207,7.7491,'https://images.unsplash.com/photo-1526392060635-9d6019884377?w=800','montagne'),
('Banff','Canada','Amérique','Sommets, grands espaces et sports de plein air toute l''année.',51.1784,-115.5708,'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?w=800','montagne'),
('Queenstown','Nouvelle-Zélande','Océanie','Nature brute et expériences fortes pour les explorateurs.',-45.0312,168.6626,'https://images.unsplash.com/photo-1526392060635-9d6019884377?w=800','aventure'),
('Aspen','États-Unis','Amérique','Sommets, grands espaces et sports de plein air toute l''année.',39.1911,-106.8175,'https://images.unsplash.com/photo-1526392060635-9d6019884377?w=800','montagne'),
('Le Caire','Égypte','Afrique','Patrimoine, histoire et traditions à découvrir sur place.',30.0444,31.2357,'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800','culture'),
('Athènes','Grèce','Europe','Patrimoine, histoire et traditions à découvrir sur place.',37.9838,23.7275,'https://images.unsplash.com/photo-1597212618440-806262de4f6b?w=800','culture'),
('Pékin','Chine','Asie','Patrimoine, histoire et traditions à découvrir sur place.',39.9042,116.4074,'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800','culture'),
('Agra','Inde','Asie','Patrimoine, histoire et traditions à découvrir sur place.',27.1767,78.0081,'https://images.unsplash.com/photo-1597212618440-806262de4f6b?w=800','culture'),
('Petra','Jordanie','Asie','Patrimoine, histoire et traditions à découvrir sur place.',30.3285,35.4444,'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800','culture'),
('Siem Reap','Cambodge','Asie','Patrimoine, histoire et traditions à découvrir sur place.',13.3671,103.8448,'https://images.unsplash.com/photo-1597212618440-806262de4f6b?w=800','culture'),
('Reykjavik','Islande','Europe','Nature brute et expériences fortes pour les explorateurs.',64.1466,-21.9426,'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?w=800','aventure'),
('Serengeti','Tanzanie','Afrique','Nature brute et expériences fortes pour les explorateurs.',-2.3333,34.8333,'https://images.unsplash.com/photo-1526392060635-9d6019884377?w=800','aventure'),
('Katmandou','Népal','Asie','Nature brute et expériences fortes pour les explorateurs.',27.7172,85.324,'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?w=800','aventure'),
('Ushuaïa','Argentine','Amérique','Nature brute et expériences fortes pour les explorateurs.',-54.8019,-68.303,'https://images.unsplash.com/photo-1526392060635-9d6019884377?w=800','aventure');

-- Photos par ville (LoremFlickr, mot-clé + lock stable)
UPDATE destination SET photo_url='https://loremflickr.com/800/600/tokyo?lock=1' WHERE id_destination=1;
UPDATE destination SET photo_url='https://loremflickr.com/800/600/paris,eiffel?lock=2' WHERE id_destination=2;
UPDATE destination SET photo_url='https://loremflickr.com/800/600/bali?lock=3' WHERE id_destination=3;
UPDATE destination SET photo_url='https://loremflickr.com/800/600/cusco,peru?lock=4' WHERE id_destination=4;
UPDATE destination SET photo_url='https://loremflickr.com/800/600/newyork,manhattan?lock=5' WHERE id_destination=5;
UPDATE destination SET photo_url='https://loremflickr.com/800/600/barcelona?lock=6' WHERE id_destination=6;
UPDATE destination SET photo_url='https://loremflickr.com/800/600/kyoto,temple?lock=7' WHERE id_destination=7;
UPDATE destination SET photo_url='https://loremflickr.com/800/600/santorini?lock=8' WHERE id_destination=8;
UPDATE destination SET photo_url='https://loremflickr.com/800/600/interlaken,alps?lock=9' WHERE id_destination=9;
UPDATE destination SET photo_url='https://loremflickr.com/800/600/marrakech?lock=10' WHERE id_destination=10;
UPDATE destination SET photo_url='https://loremflickr.com/800/600/rome,colosseum?lock=11' WHERE id_destination=11;
UPDATE destination SET photo_url='https://loremflickr.com/800/600/london?lock=12' WHERE id_destination=12;
UPDATE destination SET photo_url='https://loremflickr.com/800/600/amsterdam,canal?lock=13' WHERE id_destination=13;
UPDATE destination SET photo_url='https://loremflickr.com/800/600/berlin?lock=14' WHERE id_destination=14;
UPDATE destination SET photo_url='https://loremflickr.com/800/600/lisbon?lock=15' WHERE id_destination=15;
UPDATE destination SET photo_url='https://loremflickr.com/800/600/prague?lock=16' WHERE id_destination=16;
UPDATE destination SET photo_url='https://loremflickr.com/800/600/vienna?lock=17' WHERE id_destination=17;
UPDATE destination SET photo_url='https://loremflickr.com/800/600/dubai?lock=18' WHERE id_destination=18;
UPDATE destination SET photo_url='https://loremflickr.com/800/600/singapore?lock=19' WHERE id_destination=19;
UPDATE destination SET photo_url='https://loremflickr.com/800/600/seoul?lock=20' WHERE id_destination=20;
UPDATE destination SET photo_url='https://loremflickr.com/800/600/bangkok?lock=21' WHERE id_destination=21;
UPDATE destination SET photo_url='https://loremflickr.com/800/600/istanbul?lock=22' WHERE id_destination=22;
UPDATE destination SET photo_url='https://loremflickr.com/800/600/rio,de,janeiro?lock=23' WHERE id_destination=23;
UPDATE destination SET photo_url='https://loremflickr.com/800/600/sydney,opera?lock=24' WHERE id_destination=24;
UPDATE destination SET photo_url='https://loremflickr.com/800/600/san,francisco?lock=25' WHERE id_destination=25;
UPDATE destination SET photo_url='https://loremflickr.com/800/600/hongkong?lock=26' WHERE id_destination=26;
UPDATE destination SET photo_url='https://loremflickr.com/800/600/montreal?lock=27' WHERE id_destination=27;
UPDATE destination SET photo_url='https://loremflickr.com/800/600/maldives?lock=28' WHERE id_destination=28;
UPDATE destination SET photo_url='https://loremflickr.com/800/600/phuket?lock=29' WHERE id_destination=29;
UPDATE destination SET photo_url='https://loremflickr.com/800/600/cancun?lock=30' WHERE id_destination=30;
UPDATE destination SET photo_url='https://loremflickr.com/800/600/borabora,lagoon?lock=31' WHERE id_destination=31;
UPDATE destination SET photo_url='https://loremflickr.com/800/600/zanzibar?lock=32' WHERE id_destination=32;
UPDATE destination SET photo_url='https://loremflickr.com/800/600/mykonos?lock=33' WHERE id_destination=33;
UPDATE destination SET photo_url='https://loremflickr.com/800/600/ibiza?lock=34' WHERE id_destination=34;
UPDATE destination SET photo_url='https://loremflickr.com/800/600/seychelles?lock=35' WHERE id_destination=35;
UPDATE destination SET photo_url='https://loremflickr.com/800/600/chamonix,montblanc?lock=36' WHERE id_destination=36;
UPDATE destination SET photo_url='https://loremflickr.com/800/600/matterhorn,zermatt?lock=37' WHERE id_destination=37;
UPDATE destination SET photo_url='https://loremflickr.com/800/600/banff?lock=38' WHERE id_destination=38;
UPDATE destination SET photo_url='https://loremflickr.com/800/600/queenstown?lock=39' WHERE id_destination=39;
UPDATE destination SET photo_url='https://loremflickr.com/800/600/aspen,colorado?lock=40' WHERE id_destination=40;
UPDATE destination SET photo_url='https://loremflickr.com/800/600/cairo,pyramids?lock=41' WHERE id_destination=41;
UPDATE destination SET photo_url='https://loremflickr.com/800/600/athens,acropolis?lock=42' WHERE id_destination=42;
UPDATE destination SET photo_url='https://loremflickr.com/800/600/beijing?lock=43' WHERE id_destination=43;
UPDATE destination SET photo_url='https://loremflickr.com/800/600/tajmahal?lock=44' WHERE id_destination=44;
UPDATE destination SET photo_url='https://loremflickr.com/800/600/petra,jordan?lock=45' WHERE id_destination=45;
UPDATE destination SET photo_url='https://loremflickr.com/800/600/angkor,wat?lock=46' WHERE id_destination=46;
UPDATE destination SET photo_url='https://loremflickr.com/800/600/reykjavik,iceland?lock=47' WHERE id_destination=47;
UPDATE destination SET photo_url='https://loremflickr.com/800/600/serengeti,safari?lock=48' WHERE id_destination=48;
UPDATE destination SET photo_url='https://loremflickr.com/800/600/kathmandu?lock=49' WHERE id_destination=49;
UPDATE destination SET photo_url='https://loremflickr.com/800/600/ushuaia,patagonia?lock=50' WHERE id_destination=50;

-- Descriptions uniques par destination
UPDATE destination SET description='Ville éternelle aux 2 500 ans d''histoire : Colisée, Vatican, fontaines baroques et dolce vita à chaque coin de rue.' WHERE nom='Rome';
UPDATE destination SET description='Capitale cosmopolite entre tradition et modernité : Big Ben, musées gratuits, marchés vintage et parcs royaux.' WHERE nom='Londres';
UPDATE destination SET description='Cité des canaux à parcourir à vélo : maisons à pignons, musées de maîtres flamands et ambiance bohème décontractée.' WHERE nom='Amsterdam';
UPDATE destination SET description='Capitale créative et underground : histoire intense, street art, clubs légendaires et galeries dans d''anciens entrepôts.' WHERE nom='Berlin';
UPDATE destination SET description='Cité aux sept collines baignée de lumière : tramways jaunes, azulejos, fado et pastéis de nata face au Tage.' WHERE nom='Lisbonne';
UPDATE destination SET description='La ville aux cent clochers : château médiéval, pont Charles et ruelles pavées tout droit sortis d''un conte.' WHERE nom='Prague';
UPDATE destination SET description='Élégance impériale et valses : palais des Habsbourg, cafés viennois et capitale mondiale de la musique classique.' WHERE nom='Vienne';
UPDATE destination SET description='Démesure futuriste posée sur le désert : gratte-ciels vertigineux, souks dorés, plages et luxe sans limite.' WHERE nom='Dubaï';
UPDATE destination SET description='Cité-jardin ultramoderne d''Asie : jardins suspendus, mosaïque de cultures et street food primée dans le monde entier.' WHERE nom='Singapour';
UPDATE destination SET description='Mégapole où la K-pop côtoie les palais anciens : quartiers branchés, temples, haute technologie et cuisine épicée.' WHERE nom='Séoul';
UPDATE destination SET description='Capitale trépidante de la Thaïlande : temples dorés, marchés flottants, street food et nuits électriques.' WHERE nom='Bangkok';
UPDATE destination SET description='Pont entre l''Europe et l''Asie : Sainte-Sophie, Grand Bazar, croisières sur le Bosphore et mille ans d''empires.' WHERE nom='Istanbul';
UPDATE destination SET description='Merveille entre mer et montagnes : Christ Rédempteur, plages de Copacabana, samba et carnaval enflammé.' WHERE nom='Rio de Janeiro';
UPDATE destination SET description='Perle ensoleillée du Pacifique : opéra iconique, surf à Bondi Beach et l''une des plus belles baies du monde.' WHERE nom='Sydney';
UPDATE destination SET description='Ville des collines et du Golden Gate : cable cars, brouillard mythique, esprit tech et quartiers colorés.' WHERE nom='San Francisco';
UPDATE destination SET description='Jungle urbaine verticale : skyline électrique sur la baie, dim sum, marchés de nuit et pics verdoyants.' WHERE nom='Hong Kong';
UPDATE destination SET description='Charme européen en Amérique du Nord : Vieux-Montréal pavé, festivals à foison et joie de vivre bilingue.' WHERE nom='Montréal';
UPDATE destination SET description='Paradis sur l''océan Indien : bungalows sur pilotis, lagons turquoise et fonds marins parmi les plus riches.' WHERE nom='Maldives';
UPDATE destination SET description='Perle de la mer d''Andaman : plages de carte postale, falaises calcaires, vie nocturne et excursions en longtail.' WHERE nom='Phuket';
UPDATE destination SET description='Caraïbes mexicaines au sable blanc : eaux cristallines, cénotes secrets et vestiges mayas tout proches.' WHERE nom='Cancún';
UPDATE destination SET description='Joyau de Polynésie au lagon irréel : mont Otemanu, eaux translucides et romantisme absolu sur pilotis.' WHERE nom='Bora Bora';
UPDATE destination SET description='Île aux épices de l''océan Indien : plages immaculées, Stone Town historique et dhows au coucher du soleil.' WHERE nom='Zanzibar';
UPDATE destination SET description='Star festive des Cyclades : moulins blancs, ruelles immaculées, plages chic et nuits qui ne finissent jamais.' WHERE nom='Mykonos';
UPDATE destination SET description='Île baléare à double visage : clubbing mythique la nuit, criques sauvages et couchers de soleil hypnotiques le jour.' WHERE nom='Ibiza';
UPDATE destination SET description='Archipel d''Éden au granit rose : plages classées parmi les plus belles, jungle luxuriante et tortues géantes.' WHERE nom='Seychelles';
UPDATE destination SET description='Capitale mondiale de l''alpinisme : mont Blanc majestueux, glaciers, ski de légende et sensations en altitude.' WHERE nom='Chamonix';
UPDATE destination SET description='Village sans voiture au pied du Cervin : pistes mythiques, air pur et panorama alpin à couper le souffle.' WHERE nom='Zermatt';
UPDATE destination SET description='Cœur des Rocheuses canadiennes : lacs turquoise, forêts infinies, faune sauvage et sources thermales.' WHERE nom='Banff';
UPDATE destination SET description='Capitale néo-zélandaise de l''adrénaline : saut à l''élastique, lac Wakatipu et décors du Seigneur des Anneaux.' WHERE nom='Queenstown';
UPDATE destination SET description='Station chic du Colorado : poudreuse de rêve, sommets enneigés et ambiance montagnarde raffinée.' WHERE nom='Aspen';
UPDATE destination SET description='Porte des pharaons : pyramides de Gizeh, Sphinx, trésors antiques et Nil légendaire.' WHERE nom='Le Caire';
UPDATE destination SET description='Berceau de la civilisation occidentale : Acropole, Parthénon, tavernes animées et 2 500 ans d''histoire.' WHERE nom='Athènes';
UPDATE destination SET description='Capitale millénaire de la Chine : Cité interdite, Grande Muraille toute proche et contrastes saisissants.' WHERE nom='Pékin';
UPDATE destination SET description='Écrin du Taj Mahal : chef-d''œuvre de marbre blanc, forteresses moghholes et romance immortelle.' WHERE nom='Agra';
UPDATE destination SET description='Cité rose taillée dans la roche : trésor nabatéen surgissant du désert, l''une des sept merveilles du monde.' WHERE nom='Petra';
UPDATE destination SET description='Porte des temples d''Angkor : Angkor Wat au lever du soleil, jungle mystérieuse et héritage khmer.' WHERE nom='Siem Reap';
UPDATE destination SET description='Capitale du feu et de la glace : aurores boréales, geysers, sources chaudes et nature islandaise brute.' WHERE nom='Reykjavik';
UPDATE destination SET description='Royaume du safari africain : grande migration, lions, savane à perte de vue et couchers de soleil flamboyants.' WHERE nom='Serengeti';
UPDATE destination SET description='Porte de l''Himalaya : temples bouddhistes, stupas, ruelles animées et tremplin vers les plus hauts sommets.' WHERE nom='Katmandou';
UPDATE destination SET description='Ville du bout du monde : fin de la Patagonie, glaciers, manchots et embarquements vers l''Antarctique.' WHERE nom='Ushuaïa';


-- ---------------------------------------------------------------
-- Activités pour les destinations 11-50
-- ---------------------------------------------------------------
INSERT INTO activite (nom, description, type, prix_personne, duree_heures, capacite_max, places_disponibles, photo_url, statut, id_destination, id_prestataire) VALUES
-- Rome (11)
('Visite du Colisée et Forum romain',  'Découverte guidée des symboles de la Rome antique avec coupe-file.',                'culture',     50.00, 3.0, 30, 20, 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800', 'disponible', 11, 6),
('Tour en Vespa dans Rome',            'Balade iconique dans Rome à bord d''une Vespa avec guide et casque fournis.',        'aventure',    75.00, 3.5, 12,  8, 'https://images.unsplash.com/photo-1555993539-1732b0258235?w=800', 'disponible', 11, 6),
-- Londres (12)
('Visite de Buckingham & Tower Bridge','Découverte des monuments emblématiques de Londres avec guide expert.',               'culture',     45.00, 3.0, 25, 18, 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800', 'disponible', 12, 6),
('Balade en bateau sur la Tamise',     'Croisière commentée de Westminster au Tower Bridge au coucher du soleil.',           'nature',      35.00, 1.5, 40, 30, 'https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=800', 'disponible', 12, 6),
-- Amsterdam (13)
('Croisière sur les canaux',           'Tour en bateau à travers les canaux historiques d''Amsterdam.',                     'culture',     30.00, 1.5, 20, 14, 'https://images.unsplash.com/photo-1567037782747-0fe1e418fc05?w=800', 'disponible', 13, 6),
('Visite du Rijksmuseum',              'Découverte des chefs-d''œuvre hollandais : Rembrandt, Vermeer et van Gogh.',        'culture',     25.00, 2.0, 30, 22, 'https://images.unsplash.com/photo-1576400883215-7083980b6674?w=800', 'disponible', 13, 6),
-- Berlin (14)
('Tour historique du Mur de Berlin',   'Visite guidée du Checkpoint Charlie, East Side Gallery et Brandebourg.',            'culture',     35.00, 3.0, 25, 18, 'https://images.unsplash.com/photo-1560969184-10fe8719e047?w=800', 'disponible', 14, 6),
('Street food tour à Berlin',          'Découverte des saveurs de Berlin : currywurst, döner et brunchs branchés.',          'gastronomie', 55.00, 2.5, 15, 10, 'https://images.unsplash.com/photo-1555993539-1732b0258235?w=800', 'disponible', 14, 6),
-- Lisbonne (15)
('Visite d''Alfama & tramway 28',      'Exploration du quartier historique Alfama et balade en tramway vintage.',            'culture',     30.00, 2.5, 20, 15, 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=800', 'disponible', 15, 6),
('Dégustation de pastéis de Belém',    'Visite de Belém avec tour gastronomique : pastéis, vins et fromages portugais.',    'gastronomie', 50.00, 2.0, 16, 12, 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800', 'disponible', 15, 6),
-- Prague (16)
('Visite du château de Prague',        'Découverte du château médiéval dominant la ville et de la cathédrale Saint-Guy.',   'culture',     40.00, 3.0, 25, 18, 'https://images.unsplash.com/photo-1519677100203-a0e668c92439?w=800', 'disponible', 16, 6),
('Croisière sur la Vltava',            'Croisière panoramique sur la Vltava avec vue sur les ponts historiques.',           'nature',      30.00, 1.5, 30, 22, 'https://images.unsplash.com/photo-1500462918081-acca4aa44a04?w=800', 'disponible', 16, 6),
-- Vienne (17)
('Visite du Palais de Schönbrunn',     'Exploration des appartements impériaux et jardins du palais baroque.',               'culture',     45.00, 2.5, 30, 20, 'https://images.unsplash.com/photo-1516550893885-985c836c5fbf?w=800', 'disponible', 17, 6),
('Concert de musique classique',       'Soirée concert de Mozart et Strauss dans un palais viennois historique.',            'culture',     80.00, 2.0, 40, 25, 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=800', 'disponible', 17, 6),
-- Dubaï (18)
('Montée au Burj Khalifa',             'Accès aux observatoires du 124e et 148e étage de la plus haute tour du monde.',     'culture',     55.00, 2.0, 30, 20, 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800', 'disponible', 18, 6),
('Safari dans le désert de Dubaï',     'Aventure en 4x4 dans les dunes, dîner bédouin et spectacle de danse du ventre.',   'aventure',    90.00, 5.0, 20,  0, 'https://images.unsplash.com/photo-1516912481808-3406841bd33c?w=800', 'complet',   18, 6),
-- Singapour (19)
('Gardens by the Bay & Supertrees',    'Visite des serres futuristes et spectacle lumineux des Supertrees.',                 'nature',      35.00, 2.0, 30, 22, 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=800', 'disponible', 19, 6),
('Food tour à Hawker Centre',          'Dégustation de street food singapourienne : laksa, chili crab et char kway teow.', 'gastronomie', 50.00, 2.5, 15, 10, 'https://images.unsplash.com/photo-1555993539-1732b0258235?w=800', 'disponible', 19, 6),
-- Séoul (20)
('Visite du Palais de Gyeongbokgung',  'Exploration du palais royal de la dynastie Joseon en hanbok traditionnel.',         'culture',     35.00, 2.5, 25, 18, 'https://images.unsplash.com/photo-1538485399081-7191377e8241?w=800', 'disponible', 20, 6),
('Cours de cuisine coréenne',          'Préparez bibimbap, kimchi et japchae avec une famille coréenne.',                   'gastronomie', 70.00, 3.0, 12,  8, 'https://images.unsplash.com/photo-1553621042-f6e147245754?w=800', 'disponible', 20, 6),
-- Bangkok (21)
('Temples & tuk-tuk tour',             'Visite de Wat Pho, Wat Arun et Grand Palais en tuk-tuk avec guide.',                'culture',     40.00, 4.0, 15, 10, 'https://images.unsplash.com/photo-1508009603885-50cf7c8dd0d5?w=800', 'disponible', 21, 6),
('Marché flottant de Damnoen Saduak',  'Excursion au marché flottant mythique pour achats et dégustation locaux.',          'gastronomie', 55.00, 4.0, 20, 14, 'https://images.unsplash.com/photo-1555993539-1732b0258235?w=800', 'disponible', 21, 6),
-- Istanbul (22)
('Visite Sainte-Sophie & Bosphore',    'Découverte de Sainte-Sophie, Mosquée Bleue et croisière sur le Bosphore.',          'culture',     50.00, 4.0, 20, 14, 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=800', 'disponible', 22, 6),
('Dégustation du Grand Bazar',         'Tour gastronomique au Grand Bazar : épices, baklavas et thé turc.',                 'gastronomie', 45.00, 2.5, 16, 12, 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800', 'disponible', 22, 6),
-- Rio de Janeiro (23)
('Ascension du Pain de Sucre',         'Téléphérique jusqu''au sommet avec vue panoramique sur la baie de Rio.',            'aventure',    45.00, 2.0, 30, 20, 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=800', 'disponible', 23, 6),
('Cours de samba à Rio',               'Initiation à la samba avec un danseur professionnel dans un studio local.',         'culture',     60.00, 2.0, 15, 10, 'https://images.unsplash.com/photo-1518611540400-6b85a0704342?w=800', 'disponible', 23, 6),
-- Sydney (24)
('Visite de l''Opéra & Harbour Bridge','Tour guidé de l''Opéra de Sydney et balade sur le Harbour Bridge.',                'culture',     50.00, 2.5, 25, 18, 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=800', 'disponible', 24, 6),
('Snorkeling à Bondi Beach',           'Initiation au snorkeling dans les eaux turquoise de la célèbre Bondi Beach.',       'sport',       55.00, 2.5, 12,  8, 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800', 'disponible', 24, 6),
-- San Francisco (25)
('Tour à vélo Golden Gate Park',       'Balade guidée à vélo de Golden Gate Park jusqu''au pont iconique.',                 'sport',       45.00, 3.0, 20, 14, 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800', 'disponible', 25, 6),
('Visite d''Alcatraz',                 'Traversée en ferry et visite audioguidée de l''île-prison d''Alcatraz.',            'culture',     40.00, 3.0, 30, 20, 'https://images.unsplash.com/photo-1564182842519-8a3b2af3e228?w=800', 'disponible', 25, 6),
-- Hong Kong (26)
('Montée au Victoria Peak',            'Téléphérique jusqu''au sommet avec vue nocturne sur le skyline de Hong Kong.',      'aventure',    35.00, 2.0, 30, 22, 'https://images.unsplash.com/photo-1536599018102-9f803c140fc1?w=800', 'disponible', 26, 6),
('Dim sum & Temple Street tour',       'Dégustation de dim sum et exploration du marché nocturne de Temple Street.',        'gastronomie', 55.00, 3.0, 15, 10, 'https://images.unsplash.com/photo-1555993539-1732b0258235?w=800', 'disponible', 26, 6),
-- Montréal (27)
('Visite du Vieux-Montréal',           'Balade dans le quartier historique, basilique Notre-Dame et marchés du port.',      'culture',     30.00, 2.5, 25, 18, 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800', 'disponible', 27, 6),
('Raquettes dans les Laurentides',     'Randonnée en raquettes dans la forêt laurentienne enneigée.',                      'sport',       65.00, 4.0, 12,  8, 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800', 'disponible', 27, 6),
-- Maldives (28)
('Plongée & snorkeling lagon privé',   'Exploration des récifs coralliens avec moniteur certifié dans un lagon turquoise.', 'sport',       90.00, 3.0, 10,  7, 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800', 'disponible', 28, 6),
('Excursion dauphins au lever du soleil','Sortie en bateau pour observer les dauphins sauvages au lever du soleil.',        'nature',      70.00, 2.5, 12,  8, 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800', 'disponible', 28, 6),
-- Phuket (29)
('Îles Phi Phi en bateau rapide',      'Excursion d''une journée aux îles Phi Phi avec snorkeling et plages désertes.',    'aventure',    65.00, 8.0, 20, 14, 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800', 'disponible', 29, 6),
('Cours de Muay Thai',                 'Initiation à la boxe thaïlandaise avec un champion local dans un camp d''entraînement.','sport',   50.00, 2.0, 10,  6, 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800', 'disponible', 29, 6),
-- Cancún (30)
('Plongée dans les cénotes',           'Exploration des grottes sous-marines sacrées des Mayas en plongée ou snorkeling.',  'aventure',    75.00, 4.0, 12,  8, 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800', 'disponible', 30, 6),
('Visite des ruines de Chichén Itzá',  'Excursion d''une journée vers la pyramide maya classée patrimoine mondial.',        'culture',     85.00, 8.0, 20, 14, 'https://images.unsplash.com/photo-1526392060635-9d6019884377?w=800', 'disponible', 30, 6),
-- Bora Bora (31)
('Snorkeling avec raies et requins',   'Excursion guidée pour nager avec les raies manta et requins citron inoffensifs.',   'nature',      80.00, 3.0, 10,  7, 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800', 'disponible', 31, 6),
('Kayak & pique-nique île déserte',    'Paddle jusqu''à un motu privé avec pique-nique de fruits tropicaux.',               'sport',       60.00, 4.0, 12,  8, 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800', 'disponible', 31, 6),
-- Zanzibar (32)
('Tour épices et Stone Town',          'Visite des plantations d''épices et du quartier historique de Stone Town.',         'culture',     40.00, 4.0, 20, 14, 'https://images.unsplash.com/photo-1597212618440-806262de4f6b?w=800', 'disponible', 32, 6),
('Plongée à Mnemba Atoll',             'Plongée dans l''atoll corallien de Mnemba, l''un des meilleurs sites d''Afrique.',  'sport',       85.00, 3.5, 10,  6, 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800', 'disponible', 32, 6),
-- Mykonos (33)
('Tour des villages traditionnels',    'Découverte des villages blancs et bleus de Mykonos avec guide local.',              'culture',     45.00, 3.0, 20, 14, 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800', 'disponible', 33, 6),
('Dégustation de cuisine grecque',     'Cours de cuisine grecque : moussaka, souvlaki et baklava avec chef local.',         'gastronomie', 70.00, 3.0, 12,  8, 'https://images.unsplash.com/photo-1541614101331-1a5a3a194e92?w=800', 'disponible', 33, 6),
-- Ibiza (34)
('Excursion en bateau Formentera',     'Journée sur l''île de Formentera avec eaux cristallines et plages désertes.',       'aventure',    60.00, 8.0, 20, 14, 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800', 'disponible', 34, 6),
('Yoga au lever du soleil',            'Séance de yoga face à la mer au lever du soleil avec instructeur certifié.',        'bienetre',    45.00, 1.5, 15, 10, 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800', 'disponible', 34, 6),
-- Seychelles (35)
('Randonnée à Vallée de Mai',          'Trek dans la forêt primaire abritant les fameux cocotiers de mer (coco de mer).',   'nature',      55.00, 3.0, 15, 10, 'https://images.unsplash.com/photo-1526392060635-9d6019884377?w=800', 'disponible', 35, 6),
('Plongée à Sainte-Anne Marine Park',  'Exploration du parc marin avec tortues marines, coraux et poissons tropicaux.',    'sport',       90.00, 3.5, 10,  6, 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800', 'disponible', 35, 6),
-- Chamonix (36)
('Aiguille du Midi & Mer de Glace',    'Téléphérique jusqu''à 3 842 m et visite de la mer de glace en train à crémaillère.','aventure',   75.00, 5.0, 20, 14, 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?w=800', 'disponible', 36, 6),
('Ski hors-piste & freeride',          'Descente hors-piste dans les poudreuses de Chamonix avec guide de haute montagne.','sport',      120.00, 5.0, 8,   4, 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800', 'disponible', 36, 6),
-- Zermatt (37)
('Randonnée face au Cervin',           'Trek panoramique avec vue imprenable sur le Cervin au coucher du soleil.',          'aventure',    60.00, 5.0, 15, 10, 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?w=800', 'disponible', 37, 6),
('Ski sur les pistes de Zermatt',      'Journée ski toutes pistes avec télésiège Klein Matterhorn inclus.',                 'sport',      110.00, 6.0, 12,  0, 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800', 'complet',   37, 6),
-- Banff (38)
('Randonnée au Lake Louise',           'Balade autour du lac turquoise de Lake Louise avec guide naturaliste.',             'nature',      55.00, 4.0, 20, 14, 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800', 'disponible', 38, 6),
('Canot sur la rivière Bow',           'Descente en canot sur la rivière Bow avec paysages des Rocheuses canadiennes.',     'sport',       65.00, 3.0, 12,  8, 'https://images.unsplash.com/photo-1519619091416-f5d671ea7ea9?w=800', 'disponible', 38, 6),
-- Queenstown (39)
('Saut en parachute tandem',           'Saut à 15 000 pieds au-dessus des lacs et montagnes de Queenstown.',               'aventure',   250.00, 2.0, 6,   4, 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800', 'disponible', 39, 6),
('Jet boat sur la rivière Shotover',   'Sensations fortes en jet boat dans les gorges de la rivière Shotover.',             'aventure',    85.00, 1.0, 10,  6, 'https://images.unsplash.com/photo-1519619091416-f5d671ea7ea9?w=800', 'disponible', 39, 6),
-- Aspen (40)
('Ski sur les pistes d''Aspen',        'Journée ski sur les 4 stations d''Aspen avec moniteur et équipement.',              'sport',      140.00, 6.0, 10,  6, 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800', 'disponible', 40, 6),
('Snowshoe & Hot Spring',              'Randonnée en raquettes et détente dans les sources chaudes naturelles d''Aspen.',   'bienetre',    90.00, 4.0, 12,  8, 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800', 'disponible', 40, 6),
-- Le Caire (41)
('Pyramides de Gizeh & Sphinx',        'Visite guidée des pyramides et du Sphinx avec option entrée intérieure.',           'culture',     60.00, 4.0, 25, 18, 'https://images.unsplash.com/photo-1539768942893-daf53e448371?w=800', 'disponible', 41, 6),
('Croisière sur le Nil au coucher du soleil','Croisière en felouque sur le Nil avec dîner traditionnel égyptien.',         'nature',      55.00, 2.5, 20, 14, 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800', 'disponible', 41, 6),
-- Athènes (42)
('Visite de l''Acropole & Parthénon',  'Découverte guidée de l''Acropole, du Parthénon et du musée de l''Acropole.',       'culture',     45.00, 3.0, 25, 18, 'https://images.unsplash.com/photo-1555993539-1732b0258235?w=800', 'disponible', 42, 6),
('Dégustation de cuisine grecque',     'Tour gastronomique dans Monastiraki : mezze, souvlaki et vins grecs.',              'gastronomie', 60.00, 2.5, 15, 10, 'https://images.unsplash.com/photo-1541614101331-1a5a3a194e92?w=800', 'disponible', 42, 6),
-- Pékin (43)
('Grande Muraille de Chine',           'Excursion à Badaling avec randonnée sur l''une des sept merveilles du monde.',      'aventure',    70.00, 6.0, 20, 14, 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=800', 'disponible', 43, 6),
('Cité interdite & Temple du Ciel',    'Visite guidée de la Cité interdite et du Temple du Ciel impérial.',                 'culture',     55.00, 5.0, 20, 14, 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=800', 'disponible', 43, 6),
-- Agra (44)
('Visite du Taj Mahal au lever du soleil','Découverte de l''emblème de l''amour éternel à l''heure dorée du lever du soleil.','culture',  50.00, 3.0, 25, 18, 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800', 'disponible', 44, 6),
('Tour en rickshaw dans Agra',         'Balade en rickshaw dans le vieux bazar d''Agra et visite du fort mogol.',           'culture',     35.00, 2.5, 15, 10, 'https://images.unsplash.com/photo-1555993539-1732b0258235?w=800', 'disponible', 44, 6),
-- Petra (45)
('Randonnée jusqu''au Trésor',         'Trek à travers le Siq vers le légendaire trésor nabatéen de Petra.',                'aventure',    55.00, 4.0, 20, 14, 'https://images.unsplash.com/photo-1539768942893-daf53e448371?w=800', 'disponible', 45, 6),
('Petra by Night',                     'Visite nocturne du Siq illuminé par des milliers de bougies et musique traditionnelle.','culture', 40.00, 2.0, 30, 20, 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800', 'disponible', 45, 6),
-- Siem Reap (46)
('Angkor Wat au lever du soleil',      'Visite du plus grand temple du monde au lever du soleil avec guide expert.',        'culture',     45.00, 4.0, 20, 14, 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=800', 'disponible', 46, 6),
('Balade en vélo temples d''Angkor',   'Tour à vélo dans la jungle entre les temples d''Angkor Thom et Ta Prohm.',          'sport',       35.00, 5.0, 15, 10, 'https://images.unsplash.com/photo-1526392060635-9d6019884377?w=800', 'disponible', 46, 6),
-- Reykjavik (47)
('Chasse aux aurores boréales',        'Excursion nocturne en 4x4 pour observer les aurores boréales loin des lumières.', 'nature',       85.00, 4.0, 12,  8, 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=800', 'disponible', 47, 6),
('Bain dans le Lagon Bleu',            'Détente dans les eaux géothermales à 38°C du célèbre Lagon Bleu islandais.',       'bienetre',    90.00, 3.0, 20, 14, 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800', 'disponible', 47, 6),
-- Serengeti (48)
('Safari game drive au lever du soleil','Safari 4x4 au lever du soleil pour observer lions, éléphants et girafes.',        'aventure',   150.00, 4.0, 8,   5, 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800', 'disponible', 48, 6),
('Vol en montgolfière sur la savane',  'Survol de la grande migration en montgolfière au lever du soleil.',                 'aventure',   350.00, 3.0, 6,   3, 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800', 'disponible', 48, 6),
-- Katmandou (49)
('Trek du camp de base de l''Everest','Randonnée de 14 jours vers le camp de base avec guide sherpa certifié.',            'aventure',   800.00,16.0, 8,   4, 'https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?w=800', 'disponible', 49, 6),
('Visite des stupas de Boudhanath',    'Découverte du plus grand stupa bouddhiste du monde avec cérémonie au crépuscule.',  'culture',     30.00, 2.0, 20, 14, 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800', 'disponible', 49, 6),
-- Ushuaïa (50)
('Croisière en Terre de Feu',          'Navigation entre glaciers, manchots et forêts australes à bord d''un catamaran.',  'aventure',   120.00, 4.0, 12,  8, 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800', 'disponible', 50, 6),
('Trek dans le parc national',         'Randonnée guidée dans le parc national de Tierra del Fuego avec faune sauvage.',   'nature',      65.00, 5.0, 15, 10, 'https://images.unsplash.com/photo-1526392060635-9d6019884377?w=800', 'disponible', 50, 6);

-- ---------------------------------------------------------------
-- Hébergements supplémentaires (2 par destination 5-50)
-- ---------------------------------------------------------------
INSERT INTO hebergement (nom, type, etoiles, prix_nuit, capacite, description, adresse, equipements, photo_url, statut, id_destination, id_prestataire) VALUES
-- New York (5)
('The Manhattan Grand', 'hotel', 5, 380.00, 2, 'Hôtel de luxe en plein cœur de Midtown avec vue sur Central Park.', '100 Central Park South, New York', 'Wifi, Spa, Piscine, Restaurant gastronomique, Concierge 24h', 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800', 'disponible', 5, 4),
('Brooklyn Boutique Hotel', 'hotel', 3, 145.00, 2, 'Hôtel tendance à DUMBO avec vue sur le pont de Brooklyn.', '60 Water St, Brooklyn, New York', 'Wifi, Bar rooftop, Petit-déjeuner', 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800', 'disponible', 5, 4),
-- Barcelone (6)
('Hotel Arts Barcelona', 'hotel', 5, 350.00, 2, 'Gratte-ciel de luxe face à la mer avec piscine panoramique.', 'Carrer de la Marina 19, Barcelone', 'Wifi, Piscine, Spa, Restaurant étoilé, Plage privée', 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800', 'disponible', 6, 4),
('Apartamentos Gòtic', 'appartement', 3, 110.00, 4, 'Appartements modernes dans le quartier gothique historique.', 'Carrer del Call 12, Barcelone', 'Wifi, Climatisation, Cuisine équipée', 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800', 'disponible', 6, 4),
-- Kyoto (7)
('Ryokan Yoshida-Sanso', 'hotel', 5, 420.00, 2, 'Ryokan traditionnel avec onsen privé, jardin zen et repas kaiseki.', 'Yoshida, Sakyo-ku, Kyoto', 'Onsen privé, Jardin zen, Repas kaiseki, Yukata', 'https://images.unsplash.com/photo-1540541338287-41700207dee6?w=800', 'disponible', 7, 4),
('Kyoto Garden Machiya', 'appartement', 3, 180.00, 4, 'Maison de ville japonaise traditionnelle (machiya) rénovée avec cour intérieure.', 'Nishiki, Nakagyo-ku, Kyoto', 'Wifi, Cuisine traditionnelle, Jardin intérieur', 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800', 'disponible', 7, 4),
-- Marrakech (10)
('Riad Yasmine', 'hotel', 4, 160.00, 2, 'Riad authentique avec piscine à carreaux de zellige et rooftop.', 'Derb Sidi Ahmed Ou Moussa, Médina, Marrakech', 'Wifi, Piscine, Hammam, Petit-déjeuner marocain, Rooftop', 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800', 'disponible', 10, 4),
('La Mamounia Suite', 'hotel', 5, 650.00, 2, 'Palace légendaire au cœur des jardins royaux de Marrakech.', 'Avenue Bab Jdid, Marrakech', 'Wifi, 3 piscines, Spa royal, Jardins historiques, Casino', 'https://images.unsplash.com/photo-1540541338287-41700207dee6?w=800', 'disponible', 10, 4),
-- Rome (11)
('Hotel Colosseo Roma', 'hotel', 4, 200.00, 2, 'Hôtel élégant avec vue directe sur le Colisée depuis les chambres supérieures.', 'Via Sacra 10, Rome', 'Wifi, Restaurant panoramique, Bar, Concierge', 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800', 'disponible', 11, 4),
('Trastevere Apartment', 'appartement', 3, 120.00, 4, 'Appartement romain au cœur du quartier authentique de Trastevere.', 'Via della Lungaretta 45, Rome', 'Wifi, Cuisine équipée, Terrasse', 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800', 'disponible', 11, 4),
-- Londres (12)
('The Savoy London', 'hotel', 5, 500.00, 2, 'Hôtel légendaire sur la Tamise, symbole du luxe britannique depuis 1889.', 'Strand, London WC2R 0EU', 'Wifi, Spa, Piscine intérieure, American Bar, Butler service', 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800', 'disponible', 12, 4),
('Shoreditch Boutique Hotel', 'hotel', 3, 160.00, 2, 'Hôtel branché dans le quartier artistique de Shoreditch, East London.', '100 Shoreditch High St, London', 'Wifi, Bar, Restaurant, Rooftop', 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800', 'disponible', 12, 4),
-- Amsterdam (13)
('Canal House Amsterdam', 'hotel', 4, 220.00, 2, 'Maison de canal du XVIIe siècle transformée en hôtel de charme.', 'Keizersgracht 148, Amsterdam', 'Wifi, Vue sur canal, Petit-déjeuner, Bar', 'https://images.unsplash.com/photo-1567037782747-0fe1e418fc05?w=800', 'disponible', 13, 4),
('Jordaan Studio', 'appartement', 3, 140.00, 2, 'Studio moderne dans le quartier Jordaan, à deux pas des musées.', 'Prinsengracht 500, Amsterdam', 'Wifi, Cuisine équipée, Vélos disponibles', 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800', 'disponible', 13, 4),
-- Berlin (14)
('Hotel Adlon Kempinski', 'hotel', 5, 420.00, 2, 'Palace historique face à la porte de Brandebourg, icône de Berlin.', 'Unter den Linden 77, Berlin', 'Wifi, Spa, 2 restaurants étoilés, Bar, Salle de sport', 'https://images.unsplash.com/photo-1560969184-10fe8719e047?w=800', 'disponible', 14, 4),
('Kreuzberg Loft', 'appartement', 3, 100.00, 4, 'Loft industriel dans le quartier branché de Kreuzberg.', 'Oranienstrasse 25, Berlin', 'Wifi, Cuisine équipée, Climatisation', 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800', 'disponible', 14, 4),
-- Lisbonne (15)
('Bairro Alto Hotel', 'hotel', 5, 280.00, 2, 'Design contemporain au sommet de Lisbonne avec rooftop panoramique.', 'Praça Luis de Camões 2, Lisbonne', 'Wifi, Spa, Rooftop, Restaurant gastronomique', 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=800', 'disponible', 15, 4),
('Alfama Vintage Apartment', 'appartement', 3, 110.00, 3, 'Appartement avec azulejos authentiques et vue sur le Tage.', 'Rua das Escolas Gerais 8, Lisbonne', 'Wifi, Vue sur le Tage, Cuisine équipée', 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800', 'disponible', 15, 4),
-- Prague (16)
('Four Seasons Prague', 'hotel', 5, 380.00, 2, 'Hôtel de luxe sur la Vltava avec vue sur le château de Prague.', 'Veleslavínova 2a, Prague', 'Wifi, Spa, Restaurant, Terrasse avec vue château', 'https://images.unsplash.com/photo-1519677100203-a0e668c92439?w=800', 'disponible', 16, 4),
('Malá Strana B&B', 'auberge', 3, 90.00, 2, 'Maison baroque rénovée dans le quartier Malá Strana.', 'Nerudova 15, Prague', 'Wifi, Petit-déjeuner inclus', 'https://images.unsplash.com/photo-1455587734955-081b22074882?w=800', 'disponible', 16, 4),
-- Vienne (17)
('Hotel Sacher Wien', 'hotel', 5, 450.00, 2, 'L''hôtel le plus célèbre de Vienne, face à l''Opéra national.', 'Philharmoniker Str. 4, Vienne', 'Wifi, Spa, Café Sacher, Restaurant, Bar', 'https://images.unsplash.com/photo-1516550893885-985c836c5fbf?w=800', 'disponible', 17, 4),
('Ringstrasse Apartment', 'appartement', 3, 130.00, 3, 'Appartement haussmannien face aux musées de la Ringstrasse.', 'Burgring 5, Vienne', 'Wifi, Cuisine équipée, Parking', 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800', 'disponible', 17, 4),
-- Dubaï (18)
('Burj Al Arab', 'hotel', 5, 1500.00, 2, 'L''hôtel le plus luxueux du monde en forme de voile, sur son île privée.', 'Jumeirah Beach Road, Dubai', 'Butler 24h, Hélipad, Piscines, Restaurants étoilés, Plage privée', 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800', 'disponible', 18, 4),
('Dubai Marina Hotel', 'hotel', 4, 250.00, 2, 'Hôtel moderne avec vue sur la marina et accès à la plage.', 'Dubai Marina Walk, Dubai', 'Wifi, Piscine, Plage, Salle de sport', 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800', 'disponible', 18, 4),
-- Singapour (19)
('Marina Bay Sands', 'hotel', 5, 500.00, 2, 'Icône de Singapour avec piscine à débordement au 57e étage.', '10 Bayfront Avenue, Singapore', 'Wifi, Piscine infinie, Casino, Restaurants étoilés, Sands SkyPark', 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=800', 'disponible', 19, 4),
('Clarke Quay Boutique', 'hotel', 3, 160.00, 2, 'Hôtel boutique dans le quartier animé de Clarke Quay.', '3 River Valley Road, Singapore', 'Wifi, Bar, Restaurant', 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800', 'disponible', 19, 4),
-- Séoul (20)
('Shilla Hotel Seoul', 'hotel', 5, 350.00, 2, 'Palace coréen de luxe avec spa traditionnel et jardins impériaux.', '249 Dongho-ro, Jung-gu, Seoul', 'Wifi, Spa, Piscine, Restaurants, Jardin', 'https://images.unsplash.com/photo-1538485399081-7191377e8241?w=800', 'disponible', 20, 4),
('Hongdae Guesthouse', 'auberge', 2, 65.00, 2, 'Guesthouse branchée dans le quartier universitaire de Hongdae.', 'Wausan-ro 29, Mapo-gu, Seoul', 'Wifi, Cuisine partagée, Rooftop', 'https://images.unsplash.com/photo-1455587734955-081b22074882?w=800', 'disponible', 20, 4),
-- Bangkok (21)
('Mandarin Oriental Bangkok', 'hotel', 5, 400.00, 2, 'Hôtel légendaire sur le Chao Phraya, ouvert depuis 1876.', '48 Oriental Avenue, Bangkok', 'Wifi, Spa, 5 restaurants, Piscine, Navette fluviale', 'https://images.unsplash.com/photo-1508009603885-50cf7c8dd0d5?w=800', 'disponible', 21, 4),
('Silom Boutique Hotel', 'hotel', 3, 80.00, 2, 'Hôtel confortable dans le quartier d''affaires de Silom.', 'Silom Road 100, Bangkok', 'Wifi, Piscine, Restaurant', 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800', 'disponible', 21, 4),
-- Istanbul (22)
('Ciragan Palace Kempinski', 'hotel', 5, 600.00, 2, 'Palais ottoman sur le Bosphore, ancienne résidence sultans.', 'Ciragan Caddesi 32, Istanbul', 'Wifi, Piscine sur le Bosphore, Spa, Restaurants', 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=800', 'disponible', 22, 4),
('Sultanahmet Boutique', 'hotel', 3, 120.00, 2, 'Hôtel à deux pas de la Mosquée Bleue avec vue sur Sainte-Sophie.', 'Sultanahmet Mh., Istanbul', 'Wifi, Terrasse panoramique, Petit-déjeuner turc', 'https://images.unsplash.com/photo-1455587734955-081b22074882?w=800', 'disponible', 22, 4),
-- Rio de Janeiro (23)
('Hotel Fasano Rio', 'hotel', 5, 450.00, 2, 'Palace sur Ipanema avec piscine face à l''océan et design Oscar Niemeyer.', 'Avenida Vieira Souto 80, Rio de Janeiro', 'Wifi, Piscine, Spa, Restaurant, Bar panoramique', 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=800', 'disponible', 23, 4),
('Copacabana Apartment', 'appartement', 3, 120.00, 4, 'Appartement avec vue sur la plage de Copacabana et le Pain de Sucre.', 'Avenida Atlantica 200, Rio de Janeiro', 'Wifi, Vue mer, Climatisation, Cuisine', 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800', 'disponible', 23, 4),
-- Sydney (24)
('Park Hyatt Sydney', 'hotel', 5, 500.00, 2, 'Vue imprenable sur l''Opéra de Sydney et le Harbour Bridge.', '7 Hickson Road, Sydney', 'Wifi, Spa, Piscine, Restaurant, Bar vue port', 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=800', 'disponible', 24, 4),
('Bondi Beach Hostel', 'auberge', 2, 70.00, 4, 'Auberge conviviale à 2 minutes de la plage de Bondi.', '2 Campbell Parade, Bondi Beach, Sydney', 'Wifi, Cuisine partagée, Rooftop', 'https://images.unsplash.com/photo-1455587734955-081b22074882?w=800', 'disponible', 24, 4),
-- San Francisco (25)
('The St. Regis San Francisco', 'hotel', 5, 420.00, 2, 'Hôtel de luxe au cœur de SoMa avec spa et restaurant gastronomique.', '125 3rd Street, San Francisco', 'Wifi, Spa, Piscine, Restaurant Michelin, Bar', 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800', 'disponible', 25, 4),
('Mission District Loft', 'appartement', 3, 160.00, 4, 'Loft artistique dans le quartier Mission avec murales et cafés.', 'Valencia Street 500, San Francisco', 'Wifi, Cuisine, Climatisation', 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800', 'disponible', 25, 4),
-- Hong Kong (26)
('The Peninsula Hong Kong', 'hotel', 5, 550.00, 2, 'L''hôtel le plus légendaire d''Asie, dominant le port de Hong Kong.', 'Salisbury Road, Tsim Sha Tsui, Hong Kong', 'Wifi, Spa, Piscine, 7 restaurants, Rolls-Royce fleet', 'https://images.unsplash.com/photo-1536599018102-9f803c140fc1?w=800', 'disponible', 26, 4),
('Mong Kok Boutique Hotel', 'hotel', 3, 130.00, 2, 'Hôtel moderne dans le quartier animé de Mong Kok.', 'Nathan Road 600, Kowloon, Hong Kong', 'Wifi, Bar, Restaurant', 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800', 'disponible', 26, 4),
-- Montréal (27)
('Hotel Nelligan Montréal', 'hotel', 4, 220.00, 2, 'Hôtel boutique dans un bâtiment victorien du Vieux-Montréal.', '106 Rue Saint-Paul Ouest, Montréal', 'Wifi, Rooftop, Restaurant, Bar', 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800', 'disponible', 27, 4),
('Plateau Mont-Royal Loft', 'appartement', 3, 130.00, 4, 'Appartement spacieux dans le quartier bohème du Plateau.', 'Boulevard Saint-Laurent 800, Montréal', 'Wifi, Cuisine équipée, Parking', 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800', 'disponible', 27, 4),
-- Maldives (28)
('Soneva Jani Maldives', 'resort', 5, 2000.00, 2, 'Resort ultra-luxe avec villas sur pilotis et toits rétractables pour voir les étoiles.', 'Noonu Atoll, Maldives', 'Piscine privée, Butler 24h, Plongée, Water slide, Cuisine sur demande', 'https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=800', 'disponible', 28, 4),
('Maldives Beach Villa', 'villa', 4, 800.00, 2, 'Villa de plage avec accès direct au lagon turquoise.', 'South Malé Atoll, Maldives', 'Piscine privée, Vue lagon, Snorkeling, Petit-déjeuner inclus', 'https://images.unsplash.com/photo-1559599189-fe84dea4eb79?w=800', 'disponible', 28, 4),
-- Phuket (29)
('Amanpuri Phuket', 'resort', 5, 700.00, 2, 'Resort de luxe sur la côte ouest de Phuket avec pavillons thaïlandais.', 'Pansea Beach, Phuket', 'Wifi, 2 piscines, Spa, Plage privée, Restaurants', 'https://images.unsplash.com/photo-1540541338287-41700207dee6?w=800', 'disponible', 29, 4),
('Patong Beach Hotel', 'hotel', 3, 80.00, 2, 'Hôtel bien situé à Patong, à 5 minutes de la plage.', 'Thaweewong Road, Patong, Phuket', 'Wifi, Piscine, Restaurant', 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800', 'disponible', 29, 4),
-- Cancún (30)
('Iberostar Cancún', 'resort', 5, 350.00, 4, 'Resort all-inclusive face à la mer des Caraïbes.', 'Blvd Kukulcan Km 17, Cancún', 'Wifi, 5 piscines, 7 restaurants, Spa, Sports nautiques', 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800', 'disponible', 30, 4),
('Downtown Cancún Hotel', 'hotel', 3, 70.00, 2, 'Hôtel pratique dans le centre-ville, proche du marché.', 'Avenida Yaxchilan 100, Cancún', 'Wifi, Piscine, Restaurant', 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800', 'disponible', 30, 4),
-- Bora Bora (31)
('Four Seasons Bora Bora', 'resort', 5, 1200.00, 2, 'Bungalows sur pilotis au-dessus du lagon avec vue sur le Mont Otemanu.', 'Motu Tehotu, Bora Bora', 'Piscine privée, Butler, Plongée, Spa, Restaurants', 'https://images.unsplash.com/photo-1559599189-fe84dea4eb79?w=800', 'disponible', 31, 4),
('Matira Beach Pension', 'auberge', 3, 150.00, 2, 'Pension familiale sur la plus belle plage de Bora Bora.', 'Matira Beach, Bora Bora', 'Wifi, Vue lagune, Petit-déjeuner, Kayaks', 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800', 'disponible', 31, 4),
-- Zanzibar (32)
('Baraza Resort Zanzibar', 'resort', 5, 500.00, 2, 'Resort arabe de luxe sur la côte est de Zanzibar avec plage de sable blanc.', 'Bwejuu Beach, Zanzibar', 'Wifi, Piscine, Plage privée, Spa, Restaurant', 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800', 'disponible', 32, 4),
('Stone Town Heritage Hotel', 'hotel', 3, 100.00, 2, 'Hôtel historique dans une maison arabe de Stone Town.', 'Kenyatta Road, Stone Town, Zanzibar', 'Wifi, Rooftop, Petit-déjeuner swahili', 'https://images.unsplash.com/photo-1455587734955-081b22074882?w=800', 'disponible', 32, 4),
-- Mykonos (33)
('Cavo Tagoo Mykonos', 'hotel', 5, 700.00, 2, 'Hôtel de caverne moderne avec piscine à débordement et vue sur la mer Égée.', 'Chora, Mykonos', 'Wifi, Piscine infinie, Bar, Restaurant, Vue mer', 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800', 'disponible', 33, 4),
('Mykonos Town Boutique', 'hotel', 3, 200.00, 2, 'Petit hôtel blanc dans le labyrinthe de Mykonos Town.', 'Little Venice, Mykonos', 'Wifi, Vue moulins, Terrasse', 'https://images.unsplash.com/photo-1559599189-fe84dea4eb79?w=800', 'disponible', 33, 4),
-- Ibiza (34)
('Atzaro Agroturismo', 'resort', 5, 400.00, 2, 'Finca classée XVIIe siècle au cœur de la forêt de caroubiers.', 'Carretera Sant Joan Km 15, Ibiza', 'Wifi, Piscine, Spa, Restaurant bio, Jardins', 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800', 'disponible', 34, 4),
('Ibiza Town Apartment', 'appartement', 3, 160.00, 2, 'Appartement moderne à 5 min de Dalt Vila et de la marina.', 'Plaça de la Constitució, Ibiza', 'Wifi, Terrasse, Climatisation', 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800', 'disponible', 34, 4),
-- Seychelles (35)
('North Island Seychelles', 'resort', 5, 3000.00, 2, 'L''une des îles privées les plus exclusives du monde, paradise absolu.', 'North Island, Seychelles', 'Villa privée, Plage privée, Butler, Snorkeling, Spa', 'https://images.unsplash.com/photo-1559599189-fe84dea4eb79?w=800', 'disponible', 35, 4),
('Mahe Beach Bungalow', 'villa', 3, 200.00, 3, 'Bungalow de plage sur la côte ouest de Mahé avec lagon privé.', 'Beau Vallon Beach, Mahé, Seychelles', 'Wifi, Plage, Snorkeling, Cuisine', 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800', 'disponible', 35, 4),
-- Chamonix (36)
('Le Hameau Albert 1er', 'hotel', 5, 380.00, 2, 'Chalet de luxe au pied du Mont-Blanc avec restaurant étoilé.', '119 Impasse du Montenvers, Chamonix', 'Wifi, Spa, 2 restaurants étoilés, Piscine, Vue Mont-Blanc', 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?w=800', 'disponible', 36, 4),
('Chamonix Mountain Chalet', 'auberge', 3, 140.00, 6, 'Chalet traditionnel savoyard avec sauna et vue sur les aiguilles.', 'Les Bossons, Chamonix', 'Wifi, Sauna, Cheminée, Cuisine, Parking ski', 'https://images.unsplash.com/photo-1455587734955-081b22074882?w=800', 'disponible', 36, 4),
-- Zermatt (37)
('Mont Cervin Palace', 'hotel', 5, 700.00, 2, 'Palace Belle Époque avec vue directe sur le Cervin.', 'Bahnhofstrasse 31, Zermatt', 'Wifi, Spa, Piscine, Restaurant gastronomique, Vue Cervin', 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?w=800', 'disponible', 37, 4),
('Zermatt Alpine Lodge', 'auberge', 3, 160.00, 4, 'Lodge montagnard avec terrasse panoramique sur les glaciers.', 'Kirchstrasse 25, Zermatt', 'Wifi, Sauna, Petit-déjeuner, Terrasse glacier', 'https://images.unsplash.com/photo-1455587734955-081b22074882?w=800', 'disponible', 37, 4),
-- Banff (38)
('Fairmont Banff Springs', 'hotel', 5, 450.00, 2, 'Château des Rocheuses canadiennes surnommé le Château dans les Montagnes.', '405 Spray Avenue, Banff', 'Wifi, Spa, Golf, Ski, 5 restaurants', 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800', 'disponible', 38, 4),
('Lake Louise Inn', 'hotel', 3, 180.00, 3, 'Hôtel confortable face au lac Louise turquoise.', '210 Village Road, Lake Louise, Banff', 'Wifi, Restaurant, Vue lac, Ski accès direct', 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800', 'disponible', 38, 4),
-- Queenstown (39)
('Eichardt Private Hotel', 'hotel', 5, 500.00, 2, 'Boutique hotel victorien face au lac Wakatipu et les Remarkables.', 'Marine Parade, Queenstown', 'Wifi, Bar historique, Vue lac, Service personnalisé', 'https://images.unsplash.com/photo-1526392060635-9d6019884377?w=800', 'disponible', 39, 4),
('Queenstown Adventure Lodge', 'auberge', 2, 80.00, 6, 'Lodge animé pour voyageurs aventuriers, à 5 min du centre.', 'Shotover Street 100, Queenstown', 'Wifi, Cuisine partagée, Bar, Organisation activités', 'https://images.unsplash.com/photo-1455587734955-081b22074882?w=800', 'disponible', 39, 4),
-- Aspen (40)
('The Little Nell Aspen', 'hotel', 5, 900.00, 2, 'Seul hôtel ski-in/ski-out 5 étoiles d''Aspen, au pied des remontées.', '675 E Durant Avenue, Aspen', 'Wifi, Ski-in/out, Spa, Restaurant gastronomique, Conciergerie', 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800', 'disponible', 40, 4),
('Aspen Mountain Condo', 'appartement', 3, 350.00, 6, 'Appartement spacieux au pied des pistes avec sauna privé.', 'Galena Street 400, Aspen', 'Wifi, Sauna, Cuisine équipée, Parking ski', 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800', 'disponible', 40, 4),
-- Le Caire (41)
('Four Seasons Nile Plaza', 'hotel', 5, 300.00, 2, 'Hôtel de luxe sur le Nil avec vue sur les pyramides au coucher du soleil.', '1089 Corniche El Nil, Cairo', 'Wifi, Spa, Piscine, Vue Nil & pyramides, 6 restaurants', 'https://images.unsplash.com/photo-1539768942893-daf53e448371?w=800', 'disponible', 41, 4),
('Cairo Heritage Hotel', 'hotel', 3, 90.00, 2, 'Hôtel historique dans le Caire islamique près du Khan el-Khalili.', 'Al-Azhar Street, Cairo', 'Wifi, Restaurant égyptien, Terrasse', 'https://images.unsplash.com/photo-1455587734955-081b22074882?w=800', 'disponible', 41, 4),
-- Athènes (42)
('Hotel Grande Bretagne', 'hotel', 5, 350.00, 2, 'Palace historique de 1874 face au Parlement grec sur Syntagma.', 'Syntagma Square, Athens', 'Wifi, Rooftop avec vue Acropole, Spa, Restaurant', 'https://images.unsplash.com/photo-1555993539-1732b0258235?w=800', 'disponible', 42, 4),
('Plaka Boutique Hotel', 'hotel', 3, 130.00, 2, 'Hôtel charme dans le quartier historique de Plaka, sous l''Acropole.', 'Adrianou Street 50, Athens', 'Wifi, Terrasse vue Acropole, Petit-déjeuner grec', 'https://images.unsplash.com/photo-1559599189-fe84dea4eb79?w=800', 'disponible', 42, 4),
-- Pékin (43)
('Aman Summer Palace', 'hotel', 5, 800.00, 2, 'Hôtel de luxe dans une cour impériale adjacente au Palais d''Été.', 'Gong Men Qian St, Beijing', 'Wifi, Spa, Piscine, Restaurant gastronomique, Jardins impériaux', 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=800', 'disponible', 43, 4),
('Hutong Courtyard Hotel', 'hotel', 3, 140.00, 4, 'Maison de cour traditionnelle dans les hutongs historiques de Pékin.', 'Dongcheng District, Beijing', 'Wifi, Cour intérieure, Cuisine traditionnelle', 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=800', 'disponible', 43, 4),
-- Agra (44)
('The Oberoi Amarvilas', 'hotel', 5, 700.00, 2, 'Chaque chambre offre une vue directe sur le Taj Mahal.', 'Taj East Gate Road, Agra', 'Wifi, Piscine, Spa, Restaurant, Vue Taj Mahal garantie', 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800', 'disponible', 44, 4),
('Agra Heritage Inn', 'hotel', 3, 60.00, 2, 'Hôtel familial confortable à 10 min du Taj Mahal.', 'Fatehabad Road, Agra', 'Wifi, Restaurant indien, Parking', 'https://images.unsplash.com/photo-1455587734955-081b22074882?w=800', 'disponible', 44, 4),
-- Petra (45)
('Mövenpick Petra', 'hotel', 5, 250.00, 2, 'Hôtel de luxe à l''entrée de la cité rose nabatéenne.', 'Tourism Street, Wadi Musa, Petra', 'Wifi, Piscine, Spa, Restaurant, Vue Siq', 'https://images.unsplash.com/photo-1539768942893-daf53e448371?w=800', 'disponible', 45, 4),
('Petra Guest House', 'auberge', 3, 90.00, 2, 'Guest house authentique tenue par une famille bédouine.', 'Wadi Musa, Petra', 'Wifi, Petit-déjeuner bédouin, Terrasse', 'https://images.unsplash.com/photo-1455587734955-081b22074882?w=800', 'disponible', 45, 4),
-- Siem Reap (46)
('Amansara Siem Reap', 'resort', 5, 600.00, 2, 'Villa de Sihanouk rénovée en resort ultra-luxe, accès privé à Angkor.', 'Road to Angkor, Siem Reap', 'Wifi, Piscine, Cyclo-tuk-tuk privé, Petit-déjeuner, Accès Angkor', 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=800', 'disponible', 46, 4),
('Pub Street Boutique', 'hotel', 3, 50.00, 2, 'Hôtel central animé à deux pas de Pub Street.', 'Pub Street, Siem Reap', 'Wifi, Piscine, Restaurant khmer', 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800', 'disponible', 46, 4),
-- Reykjavik (47)
('Ion Adventure Hotel', 'hotel', 4, 280.00, 2, 'Hôtel design sur les champs de lave avec bar à aurores boréales.', 'Nesjavellir, Selfoss (nr. Reykjavik)', 'Wifi, Piscine géothermale, Spa, Bar aurores, Restaurant', 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=800', 'disponible', 47, 4),
('Reykjavik Downtown Guesthouse', 'auberge', 3, 120.00, 2, 'Guest house conviviale au cœur de la ville, face à Hallgrímskirkja.', 'Skólavörðustígur 10, Reykjavik', 'Wifi, Cuisine partagée, Petit-déjeuner islandais', 'https://images.unsplash.com/photo-1455587734955-081b22074882?w=800', 'disponible', 47, 4),
-- Serengeti (48)
('Four Seasons Serengeti', 'resort', 5, 1500.00, 2, 'Lodge de luxe en plein cœur du Serengeti avec migration visible depuis la piscine.', 'Serengeti National Park, Tanzania', 'Wifi, Piscine infinie, Safari privé, Spa, Restaurant', 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800', 'disponible', 48, 4),
('Serengeti Tented Camp', 'villa', 4, 400.00, 2, 'Tentes de luxe intégrées dans la nature, avec vue sur la savane.', 'Central Serengeti, Tanzania', 'Tente privée, Safari, Pension complète, Guide privé', 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800', 'disponible', 48, 4),
-- Katmandou (49)
('Dwarika Hotel Kathmandu', 'hotel', 5, 300.00, 2, 'Hôtel-musée célébrant l''art népalais dans des pavillons du XVe siècle.', 'Battisputali, Kathmandu', 'Wifi, Spa ayurvédique, 4 restaurants, Jardins historiques', 'https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?w=800', 'disponible', 49, 4),
('Thamel Budget Guesthouse', 'auberge', 2, 25.00, 4, 'Guesthouse bien placée dans le quartier touristique de Thamel.', 'Thamel, Kathmandu', 'Wifi, Cuisine partagée, Location de matériel trek', 'https://images.unsplash.com/photo-1455587734955-081b22074882?w=800', 'disponible', 49, 4),
-- Ushuaïa (50)
('Las Hayas Ushuaia Resort', 'resort', 5, 350.00, 2, 'Resort panoramique sur la forêt australe avec vue sur le canal Beagle.', 'Luis Fernando Martial 1650, Ushuaia', 'Wifi, Spa, Piscine, Restaurant, Vue canal Beagle', 'https://images.unsplash.com/photo-1526392060635-9d6019884377?w=800', 'disponible', 50, 4),
('Fin del Mundo Hostel', 'auberge', 2, 60.00, 4, 'Auberge chaleureuse au bout du monde, idéale pour les aventuriers.', 'San Martin 321, Ushuaia', 'Wifi, Cuisine partagée, Organisation excursions', 'https://images.unsplash.com/photo-1455587734955-081b22074882?w=800', 'disponible', 50, 4);
