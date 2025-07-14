import "../style/profilpage.css";
import avatarIcon from "../assets/images/icon/avatar.svg";

const user = {
  avatar_url: avatarIcon,
  first_name: "Jean",
  last_name: "Dupont",
  email: "jean.dupont@email.com",
  gender: "Homme",
  birthdate: "1990-01-01",
  address: "123 rue de la Paix",
  address_bis: "",
  city: "Toulouse",
  postcode: "31000",
  country: "France",
};

const vehicule = {
  name: "Renault Zoé",
  license_plate: "AB-123-CD",
  id_plug: "Type 2",
};

function ProfilPage() {
  return (
    <div className="profil-container">
      <section className="profil-section">
        <h2>Mon profil</h2>
        <div className="profil-avatar-block">
          <img
            src={user.avatar_url}
            className="profil-avatar"
            alt="avatar du compte"
          />
          <div className="profil-infos">
            <p>
              <strong>Nom :</strong> {user.last_name}
            </p>
            <p>
              <strong>Prénom :</strong> {user.first_name}
            </p>
            <p>
              <strong>Email :</strong> {user.email}
            </p>
            <p>
              <strong>Genre :</strong> {user.gender}
            </p>
            <p>
              <strong>Date de naissance :</strong> {user.birthdate}
            </p>
            <p>
              <strong>Adresse :</strong> {user.address}
            </p>
            {user.address_bis && (
              <p>
                <strong>Complément :</strong> {user.address_bis}
              </p>
            )}
            <p>
              <strong>Ville :</strong> {user.city}
            </p>
            <p>
              <strong>Code postal :</strong> {user.postcode}
            </p>
            <p>
              <strong>Pays :</strong> {user.country}
            </p>
          </div>
        </div>
      </section>
      <section className="profil-vehicle-section">
        <h2>Mes véhicules</h2>
        <div className="profil-vehicle-infos">
          <p>
            <strong>Nom :</strong> {vehicule.name}
          </p>
          <p>
            <strong>Plaque d'immatriculation :</strong> {vehicule.license_plate}
          </p>
          <p>
            <strong>Type de prise :</strong> {vehicule.id_plug}
          </p>
        </div>
      </section>
    </div>
  );
}

export default ProfilPage;
