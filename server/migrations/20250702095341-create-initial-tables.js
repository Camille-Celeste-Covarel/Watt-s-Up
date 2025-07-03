/** @type {import('sequelize-cli').Migration} */
const { DataTypes } = require("sequelize");
module.exports = {
  async up(queryInterface, Sequelize) {
    // Ordre de création des tables :
    // 1. Tables de lookup (sans dépendances)
    // 2. Tables parentes (User)
    // 3. Tables enfants (Book, Terminal, Vehicule, ImportLog, Observation, Request)
    // 4. Tables de jointure (BookTerminal, TerminalPlug)
    // Note: Station est maintenant traitée comme une table parente après les lookups
    // et sa FK id_book est ajoutée après la création de la table book.

    // --- Création de la table 'access' ---
    await queryInterface.createTable("access", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true,
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });

    // --- Création de la table 'compagny' ---
    await queryInterface.createTable("compagny", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true,
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });

    // --- Création de la table 'operator' ---
    await queryInterface.createTable("operator", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true,
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });

    // --- Création de la table 'plug' ---
    await queryInterface.createTable("plug", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true,
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });

    // --- Création de la table 'power' ---
    await queryInterface.createTable("power", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      name: {
        type: Sequelize.DOUBLE,
        allowNull: false,
        unique: true,
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });

    // --- Création de la table 'provider' ---
    await queryInterface.createTable("provider", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true,
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });

    // --- Création de la table 'user' ---
    await queryInterface.createTable("user", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      first_name: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      last_name: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      email: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true,
      },
      gender: {
        type: Sequelize.ENUM("Femme", "Homme", "Autre"),
        allowNull: true,
      },
      birthdate: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      address: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      address_bis: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      city: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      postcode: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      country: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      password: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      avatar_url: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      is_admin: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });

    // --- Création de la table 'station' ---
    await queryInterface.createTable("station", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      id_station_itinerance: {
        type: Sequelize.STRING(255),
        allowNull: true,
        unique: true,
      },
      id_access: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: "access",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      id_provider: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: "provider",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      nom_amenageur: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      siren_amenageur: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      contact_amenageur: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      nom_operateur: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      id_operator: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: "operator",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      contact_operateur: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      telephone_operateur: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      nom_enseigne: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      id_compagny: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: "compagny",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      id_station_local: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      nom_station: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      implantation_station: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      adresse_station: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      code_insee_commune: {
        type: Sequelize.STRING(5),
        allowNull: true,
      },
      nbre_pdc: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      puissance_max: {
        type: Sequelize.DOUBLE,
        allowNull: true,
      },
      gratuit: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
      },
      paiement_acte: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
      },
      paiement_cb: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
      },
      paiement_autre: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      tarification: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      condition_acces: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      reservation: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
      },
      horaires: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      accessibilite_pmr: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      restriction_gabarit: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      station_deux_roues: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
      },
      raccordement: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      num_pdl: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      date_mise_en_service: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      observations: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      date_maj: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      cable_t2_attache: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
      },
      last_modified: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      datagouv_dataset_id: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      datagouv_resource_id: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      datagouv_organization_or_owner: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      consolidated_latitude: {
        type: Sequelize.DOUBLE,
        allowNull: true,
      },
      consolidated_longitude: {
        type: Sequelize.DOUBLE,
        allowNull: true,
      },
      consolidated_code_postal: {
        type: Sequelize.STRING(10),
        allowNull: true,
      },
      consolidated_commune: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      consolidated_is_lon_lat_correct: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
      },
      consolidated_is_code_insee_verified: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
      },
      consolidated_is_code_insee_modified: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
      },
      coordonnees_x_y: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      geom: {
        type: Sequelize.GEOMETRY("POINT", 4326),
        allowNull: true,
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });

    // --- Création de la table 'book' ---
    await queryInterface.createTable("book", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      start_time: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      price: {
        type: Sequelize.DOUBLE,
        allowNull: true,
      },
      actived: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
      },
      id_user: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "user",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });

    // --- Ajout de la clé étrangère id_book à la table 'station' après la création de 'book' ---
    await queryInterface.addColumn("station", "id_book", {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: "book",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });

    // --- Création de la table 'terminal' ---
    await queryInterface.createTable("terminal", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      id_station: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "station",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      id_power: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: "power",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      id_pdc_itinerance: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      id_pdc_local: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      latitude: {
        type: Sequelize.DOUBLE,
        allowNull: true,
      },
      longitude: {
        type: Sequelize.DOUBLE,
        allowNull: true,
      },
      geom: {
        type: Sequelize.GEOMETRY("POINT", 4326),
        allowNull: true,
      },
      type_de_prise: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      puissance_nominale: {
        type: Sequelize.DOUBLE,
        allowNull: false,
      },
      prise_type_2: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      prise_type_ef: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      prise_chademo: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      prise_combo_ccs: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      prise_autre: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      status: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      num_pdc: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    });

    // --- Création de la table 'vehicule' ---
    await queryInterface.createTable("vehicule", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      license_plate: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      color: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      id_plug: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "plug",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      id_user: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "user",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });

    // --- Création de la table 'import_log' ---
    await queryInterface.createTable("import_log", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      import_id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
      },
      file_name: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      total_lines_processed: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      successful_lines: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      error_summary: {
        type: Sequelize.JSONB,
        allowNull: true,
      },
      error_log_file_path: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM(
          "IN_PROGRESS",
          "COMPLETED",
          "PARTIAL_SUCCESS",
          "FAILED",
        ),
        allowNull: false,
      },
      import_date: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });

    // --- Création de la table 'observation' ---
    await queryInterface.createTable("observation", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      comment: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      id_station: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "station",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      id_user: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "user",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });

    // --- Création de la table 'request' ---
    await queryInterface.createTable("request", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      message: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      date_request: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      status: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      response: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      id_user: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "user",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      id_terminal: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "terminal",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });

    await queryInterface.createTable("book_terminal", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      id_book: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "book",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      id_terminal: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "terminal",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });

    // --- Création de la table de jointure 'terminal_plug' (Many-to-Many) ---
    await queryInterface.createTable("terminal_plug", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      id_plug: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "plug",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      id_terminal: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "terminal",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    // Ordre de suppression des tables (inverse de la création) :
    // 1. Tables de jointure
    // 2. Tables enfants
    // 3. Tables parentes
    // 4. Tables de lookup

    // --- Suppression des tables de jointure ---
    await queryInterface.dropTable("book_terminal");
    await queryInterface.dropTable("terminal_plug");

    // --- Suppression des tables enfants ---
    await queryInterface.dropTable("request");
    await queryInterface.dropTable("observation");
    await queryInterface.dropTable("import_log");
    await queryInterface.dropTable("vehicule");
    await queryInterface.dropTable("terminal");
    await queryInterface.dropTable("book");

    // --- Suppression de la colonne id_book de la table 'station' ---
    await queryInterface.removeColumn("station", "id_book");

    // --- Suppression des tables parentes ---
    await queryInterface.dropTable("station");
    await queryInterface.dropTable("user");

    // --- Suppression des tables de lookup ---
    await queryInterface.dropTable("access");
    await queryInterface.dropTable("compagny");
    await queryInterface.dropTable("operator");
    await queryInterface.dropTable("plug");
    await queryInterface.dropTable("power");
    await queryInterface.dropTable("provider");
  },
};
