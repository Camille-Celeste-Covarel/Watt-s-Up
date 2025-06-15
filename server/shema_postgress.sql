
-- Désactivation des contraintes de clés étrangères temporairement pour faciliter la création des tables
SET session_replication_role = 'replica';

DROP TABLE IF EXISTS vehicule CASCADE;
DROP TABLE IF EXISTS book_terminal CASCADE;
DROP TABLE IF EXISTS terminal_plug CASCADE;
DROP TABLE IF EXISTS book CASCADE;
DROP TABLE IF EXISTS terminal CASCADE;
DROP TABLE IF EXISTS station CASCADE;
DROP TABLE IF EXISTS "user" CASCADE;
DROP TABLE IF EXISTS plug CASCADE;
DROP TABLE IF EXISTS power CASCADE;
DROP TABLE IF EXISTS access CASCADE;
DROP TABLE IF EXISTS provider CASCADE;

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updatedAt = NOW();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE access (
                        id SERIAL PRIMARY KEY,
                        name VARCHAR(255) NOT NULL,
                        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
                        "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE TABLE book (
                      id SERIAL PRIMARY KEY,
                      start_time TIMESTAMP NOT NULL,
                      price NUMERIC(10,0) NOT NULL,
                      actived BOOLEAN NOT NULL DEFAULT TRUE,
                      "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
                      "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);
CREATE TRIGGER update_book_updatedAt
    BEFORE UPDATE ON book
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE plug (
                      id SERIAL PRIMARY KEY,
                      name VARCHAR(255) NOT NULL,
                      "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
                      "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);
CREATE TRIGGER update_plug_updatedAt
    BEFORE UPDATE ON plug
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE power (
                       id SERIAL PRIMARY KEY,
                       max_power NUMERIC(10,0) NOT NULL,
                       type VARCHAR(255) NOT NULL,
                       "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
                       "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);
CREATE TRIGGER update_power_updatedAt
    BEFORE UPDATE ON power
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE provider (
                          id SERIAL PRIMARY KEY,
                          name VARCHAR(255) NOT NULL,
                          "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
                          "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);
CREATE TRIGGER update_provider_updatedAt
    BEFORE UPDATE ON provider
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE "user" (
                        id SERIAL PRIMARY KEY,
                        name VARCHAR(255) NOT NULL,
                        email VARCHAR(255) NOT NULL,
                        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
                        "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);
CREATE TRIGGER update_user_updatedAt
    BEFORE UPDATE ON "user"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE station (
                         id SERIAL PRIMARY KEY,
                         id_station_itinerance VARCHAR(255) UNIQUE,
                         id_access INT,
                         id_provider INT,
                         id_book INT,
                         nom_amenageur VARCHAR(255),
                         siren_amenageur VARCHAR(255),
                         contact_amenageur VARCHAR(255),
                         nom_operateur VARCHAR(255),
                         contact_operateur VARCHAR(255),
                         telephone_operateur VARCHAR(255),
                         nom_enseigne VARCHAR(255),
                         id_station_local VARCHAR(255),
                         nom_station VARCHAR(255) NOT NULL,
                         implantation_station VARCHAR(255),
                         adresse_station VARCHAR(255),
                         code_insee_commune VARCHAR(255),
                         nbre_pdc INT,
                         gratuit BOOLEAN,
                         paiement_acte BOOLEAN,
                         paiement_cb BOOLEAN,
                         paiement_autre VARCHAR(255),
                         tarification VARCHAR(255),
                         condition_acces VARCHAR(255),
                         reservation BOOLEAN,
                         horaires VARCHAR(255),
                         accessibilite_pmr VARCHAR(255),
                         restriction_gabarit VARCHAR(255),
                         station_deux_roues BOOLEAN,
                         raccordement VARCHAR(255),
                         num_pdl VARCHAR(255),
                         date_mise_en_service TIMESTAMP,
                         observations TEXT, -- Changé en TEXT
                         date_maj TIMESTAMP,
                         cable_t2_attache BOOLEAN,
                         last_modified TIMESTAMP,
                         datagouv_dataset_id VARCHAR(255),
                         datagouv_resource_id VARCHAR(255),
                         datagouv_organization_or_owner VARCHAR(255),
                         consolidated_latitude DOUBLE PRECISION,
                         consolidated_longitude DOUBLE PRECISION,
                         consolidated_code_postal VARCHAR(255),
                         consolidated_commune VARCHAR(255),
                         consolidated_is_lon_lat_correct BOOLEAN,
                         consolidated_is_code_insee_verified BOOLEAN,
                         consolidated_is_code_insee_modified BOOLEAN,
                         coordonneesXY VARCHAR(255),
                         geom GEOMETRY(Point, 4326),
                         "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
                         "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);
CREATE TRIGGER update_station_updatedAt
    BEFORE UPDATE ON station
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE terminal (
                          id SERIAL PRIMARY KEY,
                          id_station INT NOT NULL,
                          id_book INT NOT NULL,
                          id_power INT NOT NULL,
                          charge_speed VARCHAR(255) NOT NULL,
                          "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
                          "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);
CREATE TRIGGER update_terminal_updatedAt
    BEFORE UPDATE ON terminal
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();


CREATE TABLE book_terminal (
                               id SERIAL PRIMARY KEY,
                               id_book INT NOT NULL,
                               id_terminal INT NOT NULL,
                               "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
                               "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);
CREATE TRIGGER update_book_terminal_updatedAt
    BEFORE UPDATE ON book_terminal
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE terminal_plug (
                               id SERIAL PRIMARY KEY,
                               id_terminal INT NOT NULL,
                               id_plug INT NOT NULL,
                               "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
                               "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);
CREATE TRIGGER update_terminal_plug_updatedAt
    BEFORE UPDATE ON terminal_plug
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE vehicule (
                          id SERIAL PRIMARY KEY,
                          id_plug INT,
                          id_user INT NOT NULL,
                          make VARCHAR(255) NOT NULL,
                          model VARCHAR(255) NOT NULL,
                          "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
                          "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);
CREATE TRIGGER update_vehicule_updatedAt
    BEFORE UPDATE ON vehicule
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE book_terminal
    ADD CONSTRAINT fk_bookterminal_book FOREIGN KEY (id_book) REFERENCES book (id) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT fk_bookterminal_terminal FOREIGN KEY (id_terminal) REFERENCES terminal (id) ON DELETE NO ACTION ON UPDATE NO ACTION;

ALTER TABLE station
    ADD CONSTRAINT station_fk1 FOREIGN KEY (id_access) REFERENCES access (id) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT station_fk2 FOREIGN KEY (id_book) REFERENCES book (id) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT station_fk3 FOREIGN KEY (id_provider) REFERENCES provider (id) ON DELETE NO ACTION ON UPDATE NO ACTION;

ALTER TABLE terminal
    ADD CONSTRAINT fk_terminal_station FOREIGN KEY (id_station) REFERENCES station (id) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT terminal_ibfk_1 FOREIGN KEY (id_book) REFERENCES book (id) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT terminal_ibfk_2 FOREIGN KEY (id_power) REFERENCES power (id) ON DELETE NO ACTION ON UPDATE NO ACTION;

ALTER TABLE terminal_plug
    ADD CONSTRAINT fk_terminalplug_plug FOREIGN KEY (id_plug) REFERENCES plug (id) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT fk_terminalplug_terminal FOREIGN KEY (id_terminal) REFERENCES terminal (id) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE vehicule
    ADD CONSTRAINT vehicule_ibfk_1 FOREIGN KEY (id_plug) REFERENCES plug (id) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT vehicule_ibfk_2 FOREIGN KEY (id_user) REFERENCES "user" (id) ON DELETE CASCADE ON UPDATE CASCADE;

SET session_replication_role = 'origin';

