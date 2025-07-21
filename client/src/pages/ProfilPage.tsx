import { useEffect, useState } from "react";
import avatarIcon from "../assets/images/icon/avatar.svg";
import "../style/profilpage.css";

interface Vehicule {
  id: number;
  name: string;
  license_plate: string;
  id_plug: string;
  photo_url?: string;
}

interface User {
  avatar_url?: string;
  last_name: string;
  first_name: string;
  email: string;
  gender?: string;
  birthdate?: string;
  address?: string;
  address_bis?: string;
  city?: string;
  postcode?: string;
  country?: string;
  vehicles?: Vehicule[];
}

function ProfilPage() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/users/me`, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => setUser(data));
  }, []);

  if (!user) return <div>Chargement...</div>;

  return (
    <div className="profil-container">
      <section className="profil-section">
        <h2>Mon profil</h2>
        <div className="profil-avatar-block">
          <img
            src={
              user.avatar_url
                ? `${import.meta.env.VITE_API_URL}${user.avatar_url}`
                : avatarIcon
            }
            className="profil-avatar"
            alt="avatar du compte"
          />
          <div className="profil-names">
            <p>
              <strong>Nom :</strong> {user.last_name}
            </p>
            <p>
              <strong>Prénom :</strong> {user.first_name}
            </p>
          </div>
        </div>
        <div className="profil-infos">
          <p>
            <strong>Email :</strong> {user.email}
          </p>
          <p>
            <strong>Genre :</strong> {user.gender}
          </p>
          <p>
            <strong>Date de naissance :</strong>{" "}
            {user.birthdate
              ? new Date(user.birthdate).toLocaleDateString("fr-FR")
              : ""}
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
      </section>
      <section className="profil-vehicle-section">
        <h2>Mes véhicules</h2>
        {user.vehicles && user.vehicles.length > 0 ? (
          user.vehicles.map((vehicule) => (
            <div className="profil-vehicle-infos" key={vehicule.id}>
              {vehicule.photo_url && (
                <img
                  src={`${import.meta.env.VITE_API_URL}${vehicule.photo_url}`}
                  alt="véhicule"
                  className="vehicle-photo"
                />
              )}
              <p>
                <strong>Nom :</strong> {vehicule.name}
              </p>
              <p>
                <strong>Plaque d'immatriculation :</strong>{" "}
                {vehicule.license_plate}
              </p>
              <p>
                <strong>Type de prise :</strong> {vehicule.id_plug}
              </p>
            </div>
          ))
        ) : (
          <p>Vous n'avez pas encore de véhicule enregistré.</p>
        )}
      </section>
    </div>
  );
}

export default ProfilPage;
