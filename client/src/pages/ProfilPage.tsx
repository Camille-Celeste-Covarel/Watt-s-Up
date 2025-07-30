import { useQuery } from "@tanstack/react-query";
import avatarIcon from "../assets/images/icon/avatar.svg";
import type { ProfilePageUser } from "../types/pages/pagesTypes";
import "../style/profilpage.css";

function ProfilPage() {
  const {
    data: user,
    isLoading,
    isError,
    error,
  } = useQuery<ProfilePageUser, Error>({
    queryKey: ["user", "me"],
    queryFn: async () => {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/users/me`,
        {
          credentials: "include",
        },
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Impossible de charger les données du profil.",
        );
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) {
    return <div>Chargement du profil...</div>;
  }

  if (isError) {
    return <div>Erreur lors du chargement du profil : {error.message}</div>;
  }

  if (!user) {
    return <div>Aucune donnée utilisateur trouvée.</div>;
  }

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
              <p>
                <strong>Nom :</strong> {vehicule.name}
              </p>
              {vehicule.photo_url && (
                <div className="vehicle-photo-container">
                  <img
                    src={`${import.meta.env.VITE_API_URL}${vehicule.photo_url}`}
                    alt="véhicule"
                    className="vehicle-photo"
                  />
                </div>
              )}
              <p>
                <strong>Plaque d'immatriculation :</strong>{" "}
                {vehicule.license_plate}
              </p>
              <p>
                <strong>Type de prise :</strong> {vehicule.plug?.name}
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
