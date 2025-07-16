import { useState } from "react";

import "../style/registerpage.css";
import { useNavigate } from "react-router";
import avatarIcon from "../assets/images/icon/avatar.svg";

interface FormData {
  // Champs User selon le modèle
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  confirmPassword: string;
  gender: string;
  birthdate: string;
  address: string;
  address_bis: string;
  city: string;
  postcode: string;
  country: string;

  // Champs Vehicule selon le modèle
  vehicle_name: string;
  license_plate: string;
  color: string;
  id_plug: string;
  vehicle_photo_url: string;
}

interface FormErrors {
  first_name?: string;
  last_name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  gender?: string;
  birthdate?: string;
  address?: string;
  city?: string;
  postcode?: string;
  country?: string;
  vehicle_name?: string;
  license_plate?: string;
  color?: string;
  id_plug?: string;
}

function RegisterPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<FormData>({
    // User
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    confirmPassword: "",
    gender: "",
    birthdate: "",
    address: "",
    address_bis: "",
    city: "",
    postcode: "",
    country: "",

    // Vehicule
    vehicle_name: "",
    license_plate: "",
    color: "",
    id_plug: "",
    vehicle_photo_url: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [avatar, setAvatar] = useState<string>(avatarIcon);

  const validateForm = () => {
    const newErrors: FormErrors = {};

    // Validation User (champs obligatoires selon le modèle)
    if (!formData.first_name.trim()) {
      newErrors.first_name = "Le prénom est requis";
    }

    if (!formData.last_name.trim()) {
      newErrors.last_name = "Le nom est requis";
    }

    if (!formData.email.trim()) {
      newErrors.email = "L'email est requis";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "L'email n'est pas valide";
    }

    if (!formData.password) {
      newErrors.password = "Le mot de passe est requis";
    } else if (formData.password.length < 6) {
      newErrors.password =
        "Le mot de passe doit contenir au moins 6 caractères";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Veuillez confirmer votre mot de passe";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Les mots de passe ne correspondent pas";
    }

    if (!formData.birthdate) {
      newErrors.birthdate = "La date de naissance est requise";
    }

    if (!formData.address.trim()) {
      newErrors.address = "L'adresse est requise";
    }

    if (!formData.city.trim()) {
      newErrors.city = "La ville est requise";
    }

    if (!formData.postcode.trim()) {
      newErrors.postcode = "Le code postal est requis";
    }

    if (!formData.country.trim()) {
      newErrors.country = "Le pays est requis";
    }

    // Validation Vehicule (champs obligatoires selon le modèle)
    if (!formData.vehicle_name.trim()) {
      newErrors.vehicle_name = "Le nom du véhicule est requis";
    }

    if (!formData.id_plug) {
      newErrors.id_plug = "Le type de prise est requis";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/auth/register`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: formData.email,
              password: formData.password,
              first_name: formData.first_name,
              last_name: formData.last_name,
              birthdate: formData.birthdate,
              address: formData.address,
              address_bis: formData.address_bis,
              city: formData.city,
              postcode: formData.postcode,
              country: formData.country,
              gender: formData.gender,
              avatar_url: avatar,
            }),
          },
        );

        const data = await response.json();

        if (response.ok) {
          alert("Compte créé avec succès !");
          navigate("/login");
        } else {
          alert(data.error || "Erreur lors de la création du compte");
        }
      } catch (err) {
        alert("Erreur réseau");
      }
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setAvatar(imageUrl);
    }
  };

  const triggerFileInput = () => {
    const fileInput = document.getElementById(
      "profile-image-input",
    ) as HTMLInputElement;
    fileInput?.click();
  };

  const handleVehicleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setFormData((prev) => ({
        ...prev,
        vehicle_photo_url: imageUrl,
      }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="register-form">
      <div className="register-container">
        <section className="register-profil-section">
          <h2>Mon profil</h2>
          <div className="profil-picture-container">
            <img
              src={avatar}
              className="profil-avatar"
              alt="avatar du compte"
            />
            <button type="button" onClick={triggerFileInput}>
              Télécharger une photo
            </button>
            <input
              id="profile-image-input"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              style={{ display: "none" }}
            />
          </div>
          <div className="form-group">
            <h3>Prénom</h3>
            <input
              type="text"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              className={errors.first_name ? "error" : ""}
              placeholder="Entrez votre prénom"
            />
            {errors.first_name && (
              <span className="error-message">{errors.first_name}</span>
            )}
          </div>

          <div className="form-group">
            <h3>Nom</h3>
            <input
              type="text"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              className={errors.last_name ? "error" : ""}
              placeholder="Entrez votre nom"
            />
            {errors.last_name && (
              <span className="error-message">{errors.last_name}</span>
            )}
          </div>

          <div className="form-group">
            <h3>Email</h3>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={errors.email ? "error" : ""}
              placeholder="Entrez votre email"
            />
            {errors.email && (
              <span className="error-message">{errors.email}</span>
            )}
          </div>

          <div className="form-group">
            <h3>Mot de passe</h3>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={errors.password ? "error" : ""}
              placeholder="Entrez votre mot de passe"
            />
            {errors.password && (
              <span className="error-message">{errors.password}</span>
            )}
          </div>

          <div className="form-group">
            <h3>Confirmer le mot de passe</h3>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={errors.confirmPassword ? "error" : ""}
              placeholder="Confirmez votre mot de passe"
            />
            {errors.confirmPassword && (
              <span className="error-message">{errors.confirmPassword}</span>
            )}
          </div>

          <div className="form-group">
            <h3>Genre</h3>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className={errors.gender ? "error" : ""}
            >
              <option value="">Sélectionnez votre genre</option>
              <option value="Femme">Femme</option>
              <option value="Homme">Homme</option>
              <option value="Autre">Autre</option>
            </select>
            {errors.gender && (
              <span className="error-message">{errors.gender}</span>
            )}
          </div>

          <div className="form-group">
            <h3>Date de naissance</h3>
            <input
              type="date"
              name="birthdate"
              value={formData.birthdate}
              onChange={handleChange}
              className={errors.birthdate ? "error" : ""}
            />
            {errors.birthdate && (
              <span className="error-message">{errors.birthdate}</span>
            )}
          </div>

          <div className="form-group">
            <h3>Adresse</h3>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className={errors.address ? "error" : ""}
              placeholder="Entrez votre adresse"
            />
            {errors.address && (
              <span className="error-message">{errors.address}</span>
            )}
          </div>

          <div className="form-group">
            <h3>Complément d'adresse</h3>
            <input
              type="text"
              name="address_bis"
              value={formData.address_bis}
              onChange={handleChange}
              placeholder="Appartement, étage, etc. (optionnel)"
            />
          </div>

          <div className="form-group">
            <h3>Ville</h3>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              className={errors.city ? "error" : ""}
              placeholder="Entrez votre ville"
            />
            {errors.city && (
              <span className="error-message">{errors.city}</span>
            )}
          </div>

          <div className="form-group">
            <h3>Code postal</h3>
            <input
              type="text"
              name="postcode"
              value={formData.postcode}
              onChange={handleChange}
              className={errors.postcode ? "error" : ""}
              placeholder="Entrez votre code postal"
            />
            {errors.postcode && (
              <span className="error-message">{errors.postcode}</span>
            )}
          </div>

          <div className="form-group">
            <h3>Pays</h3>
            <input
              type="text"
              name="country"
              value={formData.country}
              onChange={handleChange}
              className={errors.country ? "error" : ""}
              placeholder="Entrez votre pays"
            />
            {errors.country && (
              <span className="error-message">{errors.country}</span>
            )}
          </div>
        </section>

        <section className="register-vehicle-section">
          <div className="form-group">
            <h3>Photo du véhicule</h3>
            <button
              type="button"
              onClick={() => {
                const fileInput = document.getElementById(
                  "vehicle-photo-input",
                ) as HTMLInputElement;
                fileInput?.click();
              }}
            >
              Télécharger une photo pour votre véhicule
            </button>
            <input
              id="vehicle-photo-input"
              type="file"
              accept="image/*"
              onChange={handleVehicleImageUpload}
              style={{ display: "none" }}
            />
            {formData.vehicle_photo_url && (
              <img
                src={formData.vehicle_photo_url}
                alt="Aperçu véhicule"
                className="vehicle-photo-preview"
              />
            )}
          </div>
          <h2>Mon véhicule</h2>
          <div className="form-group">
            <h3>Nom du véhicule</h3>
            <input
              type="text"
              name="vehicle_name"
              value={formData.vehicle_name}
              onChange={handleChange}
              className={errors.vehicle_name ? "error" : ""}
              placeholder="Tapez le nom"
            />
            {errors.vehicle_name && (
              <span className="error-message">{errors.vehicle_name}</span>
            )}
          </div>
          <div className="form-group">
            <h3>Plaque d'immatriculation</h3>
            <input
              type="text"
              name="license_plate"
              value={formData.license_plate}
              onChange={handleChange}
              className={errors.license_plate ? "error" : ""}
              placeholder="Tapez votre plaque d'immatriculation"
            />
            {errors.license_plate && (
              <span className="error-message">{errors.license_plate}</span>
            )}
          </div>
          <div className="form-group">
            <h3>Type de prise</h3>
            <select
              name="id_plug"
              value={formData.id_plug}
              onChange={handleChange}
              className={errors.id_plug ? "error" : ""}
            >
              <option value="">Sélectionnez votre prise</option>
              <option value="chademo">CHAdeMO</option>
              <option value="type2">Type 2</option>
              <option value="combo-ccs">Combo CCS</option>
              <option value="type-ef">Type EF</option>
            </select>
            {errors.id_plug && (
              <span className="error-message">{errors.id_plug}</span>
            )}
          </div>
          <button type="submit" className="submit-btn">
            Valider mes informations
          </button>
        </section>
      </div>
    </form>
  );
}

export default RegisterPage;
