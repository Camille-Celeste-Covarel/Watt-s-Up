/* globals fetch, console, URL, FormData, document */
import { useEffect, useState } from "react";
import type React from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useNavigate } from "react-router";
import Modal from "../components/Modal/Modal";
import avatarIcon from "../assets/images/icon/avatar.svg";
import vehicleDefaultIcon from "../assets/images/vehicleIcons/carProfile.svg";
import "../stylesheets/registerpage.css";
import type { FormData, FormErrors } from "../types/pages/pagesTypes";

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
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [vehiclePhotoFile, setVehiclePhotoFile] = useState<File | null>(null);
  const [plugs, setPlugs] = useState<{ id: string; name: string }[]>([]);

  const [modalState, setModalState] = useState({
    isOpen: false,
    title: "",
    message: "",
    isSuccess: false,
  });

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/plugs`)
      .then((res) => res.json())
      .then((data) => setPlugs(data));
  }, []);

  const validateForm = () => {
    const newErrors: FormErrors = {};
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,}$/;

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
    } else if (!passwordRegex.test(formData.password)) {
      newErrors.password =
        "Il faut une majuscule, une minuscule, un chiffre, un caractère spécial et au moins 12 caractères.";
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
    if (!formData.vehicle_name.trim()) {
      newErrors.vehicle_name = "Le nom du véhicule est requis";
    }
    if (!formData.id_plug) {
      newErrors.id_plug = "Le type de prise est requis";
    }
    const plateRegex = /^[A-Z]{2}-\d{3}-[A-Z]{2}$/i;
    if (!formData.license_plate) {
      newErrors.license_plate = "La plaque d'immatriculation est requise";
    } else if (!plateRegex.test(formData.license_plate.trim())) {
      newErrors.license_plate = "Format attendu : AA-123-AA";
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
        const formDataToSend = new FormData();
        formDataToSend.append("email", formData.email);
        formDataToSend.append("password", formData.password);
        formDataToSend.append("first_name", formData.first_name);
        formDataToSend.append("last_name", formData.last_name);
        formDataToSend.append("birthdate", formData.birthdate);
        formDataToSend.append("address", formData.address);
        formDataToSend.append("address_bis", formData.address_bis);
        formDataToSend.append("city", formData.city);
        formDataToSend.append("postcode", formData.postcode);
        formDataToSend.append("country", formData.country);
        formDataToSend.append("gender", formData.gender);
        formDataToSend.append("vehicle_name", formData.vehicle_name);
        formDataToSend.append("license_plate", formData.license_plate);
        formDataToSend.append("id_plug", formData.id_plug);

        if (avatarFile) {
          formDataToSend.append("avatar", avatarFile);
        }

        if (vehiclePhotoFile) {
          formDataToSend.append("vehicle_photo", vehiclePhotoFile);
        }

        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/auth/register`,
          {
            method: "POST",
            body: formDataToSend,
          },
        );

        const data = await response.json();

        if (response.ok) {
          setModalState({
            isOpen: true,
            title: "Compte créé avec succès !",
            message: "Vous allez être redirigé vers la page de connexion.",
            isSuccess: true,
          });
        } else {
          setModalState({
            isOpen: true,
            title: "Erreur",
            message: data.error || "Erreur lors de la création du compte",
            isSuccess: false,
          });
        }
      } catch (err) {
        console.error(err);
        setModalState({
          isOpen: true,
          title: "Erreur réseau",
          message: "Impossible de contacter le serveur.",
          isSuccess: false,
        });
      }
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1 * 1024 * 1024) {
        // 1MB
        setModalState({
          isOpen: true,
          title: "Fichier trop volumineux",
          message: "La taille maximale de l'image est de 1Mo.",
          isSuccess: false,
        });
        return;
      }
      setAvatarFile(file);
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
      if (file.size > 1 * 1024 * 1024) {
        // 1MB
        setModalState({
          isOpen: true,
          title: "Fichier trop volumineux",
          message: "La taille maximale de l'image est de 1Mo.",
          isSuccess: false,
        });
        return;
      }
      setVehiclePhotoFile(file);
      const imageUrl = URL.createObjectURL(file);
      setFormData((prev) => ({
        ...prev,
        vehicle_photo_url: imageUrl,
      }));
    }
  };

  const handleModalClose = () => {
    if (modalState.isSuccess) {
      navigate("/login");
    }
    setModalState({ isOpen: false, title: "", message: "", isSuccess: false });
  };

  return (
    <>
      <Modal
        isOpen={modalState.isOpen}
        onClose={handleModalClose}
        title={modalState.title}
      >
        <p>{modalState.message}</p>
      </Modal>
      <form onSubmit={handleSubmit} className="register-form">
        <div className="register-container">
          <section className="register-profil-section">
            <h2>Mon profil</h2>
            <div className="profil-picture-container">
              <img
                src={avatar}
                className="profil-avatar"
                alt="Aperçu de l'avatar du compte"
              />
              <div className="upload-container">
                <button
                  type="button"
                  className="button-classic"
                  onClick={triggerFileInput}
                >
                  Télécharger une photo
                </button>
                <p className="info-text">Taille max : 1Mo</p>
              </div>
              <input
                id="profile-image-input"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                style={{ display: "none" }}
              />
            </div>
            <div className="form-group">
              <label htmlFor="first_name">Prénom</label>
              <input
                id="first_name"
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                className={errors.first_name ? "error" : ""}
                placeholder="Entrez votre prénom"
                aria-describedby={
                  errors.first_name ? "first_name-error" : undefined
                }
              />
              {errors.first_name && (
                <span id="first_name-error" className="error-message">
                  {errors.first_name}
                </span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="last_name">Nom</label>
              <input
                id="last_name"
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                className={errors.last_name ? "error" : ""}
                placeholder="Entrez votre nom"
                aria-describedby={
                  errors.last_name ? "last_name-error" : undefined
                }
              />
              {errors.last_name && (
                <span id="last_name-error" className="error-message">
                  {errors.last_name}
                </span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={errors.email ? "error" : ""}
                placeholder="Entrez votre email"
                aria-describedby={errors.email ? "email-error" : undefined}
              />
              {errors.email && (
                <span id="email-error" className="error-message">
                  {errors.email}
                </span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="password">Mot de passe</label>
              <div className="password-input-container">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={errors.password ? "error" : ""}
                  placeholder="Entrez votre mot de passe"
                  aria-describedby={
                    errors.password ? "password-error" : "password-info"
                  }
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword((v) => !v)}
                  tabIndex={-1}
                  aria-label={
                    showPassword
                      ? "Masquer le mot de passe"
                      : "Afficher le mot de passe"
                  }
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              <p id="password-info" className="info-text">
                Il faut une majuscule, une minuscule, un chiffre, un caractère
                spécial et au moins 12 caractères.
              </p>
              {errors.password && (
                <span id="password-error" className="error-message">
                  {errors.password}
                </span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirmer le mot de passe</label>
              <div className="password-input-container">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={errors.confirmPassword ? "error" : ""}
                  placeholder="Confirmez votre mot de passe"
                  aria-describedby={
                    errors.confirmPassword
                      ? "confirmPassword-error"
                      : undefined
                  }
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowConfirmPassword((v) => !v)}
                  tabIndex={-1}
                  aria-label={
                    showConfirmPassword
                      ? "Masquer le mot de passe"
                      : "Afficher le mot de passe"
                  }
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {errors.confirmPassword && (
                <span id="confirmPassword-error" className="error-message">
                  {errors.confirmPassword}
                </span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="gender">Genre</label>
              <select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className={errors.gender ? "error" : ""}
                aria-describedby={errors.gender ? "gender-error" : undefined}
              >
                <option value="">Sélectionnez votre genre</option>
                <option value="Femme">Femme</option>
                <option value="Homme">Homme</option>
                <option value="Autre">Autre</option>
              </select>
              {errors.gender && (
                <span id="gender-error" className="error-message">
                  {errors.gender}
                </span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="birthdate">Date de naissance</label>
              <input
                id="birthdate"
                type="date"
                name="birthdate"
                value={formData.birthdate}
                onChange={handleChange}
                className={errors.birthdate ? "error" : ""}
                aria-describedby={
                  errors.birthdate ? "birthdate-error" : undefined
                }
              />
              {errors.birthdate && (
                <span id="birthdate-error" className="error-message">
                  {errors.birthdate}
                </span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="address">Adresse</label>
              <input
                id="address"
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className={errors.address ? "error" : ""}
                placeholder="Entrez votre adresse"
                aria-describedby={errors.address ? "address-error" : undefined}
              />
              {errors.address && (
                <span id="address-error" className="error-message">
                  {errors.address}
                </span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="address_bis">Complément d'adresse</label>
              <input
                id="address_bis"
                type="text"
                name="address_bis"
                value={formData.address_bis}
                onChange={handleChange}
                placeholder="Appartement, étage, etc. (optionnel)"
              />
            </div>

            <div className="form-group">
              <label htmlFor="city">Ville</label>
              <input
                id="city"
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className={errors.city ? "error" : ""}
                placeholder="Entrez votre ville"
                aria-describedby={errors.city ? "city-error" : undefined}
              />
              {errors.city && (
                <span id="city-error" className="error-message">
                  {errors.city}
                </span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="postcode">Code postal</label>
              <input
                id="postcode"
                type="text"
                name="postcode"
                value={formData.postcode}
                onChange={handleChange}
                className={errors.postcode ? "error" : ""}
                placeholder="Entrez votre code postal"
                aria-describedby={
                  errors.postcode ? "postcode-error" : undefined
                }
              />
              {errors.postcode && (
                <span id="postcode-error" className="error-message">
                  {errors.postcode}
                </span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="country">Pays</label>
              <input
                id="country"
                type="text"
                name="country"
                value={formData.country}
                onChange={handleChange}
                className={errors.country ? "error" : ""}
                placeholder="Entrez votre pays"
                aria-describedby={errors.country ? "country-error" : undefined}
              />
              {errors.country && (
                <span id="country-error" className="error-message">
                  {errors.country}
                </span>
              )}
            </div>
          </section>

          <section className="register-vehicle-section">
            <h2>Mon véhicule</h2>
            <div className="form-group">
              <label htmlFor="vehicle-photo-input">Photo du véhicule</label>
              <div className="vehicle-photo-box">
                {formData.vehicle_photo_url ? (
                  <img
                    src={formData.vehicle_photo_url}
                    alt="Aperçu véhicule"
                    className="vehicle-photo-preview"
                  />
                ) : (
                  <img
                    src={vehicleDefaultIcon}
                    alt="Aperçu véhicule"
                    className="vehicle-photo-preview vehicle-photo-default"
                  />
                )}
              </div>
              <button
                type="button"
                className="button-classic"
                onClick={() => {
                  const fileInput = document.getElementById(
                    "vehicle-photo-input",
                  ) as HTMLInputElement;
                  fileInput?.click();
                }}
              >
                Télécharger une photo
              </button>
              <p className="info-text">Taille max : 1Mo</p>
              <input
                id="vehicle-photo-input"
                type="file"
                accept="image/*"
                onChange={handleVehicleImageUpload}
                style={{ display: "none" }}
              />
            </div>
            <div className="form-group">
              <label htmlFor="vehicle_name">Nom du véhicule</label>
              <input
                id="vehicle_name"
                type="text"
                name="vehicle_name"
                value={formData.vehicle_name}
                onChange={handleChange}
                className={errors.vehicle_name ? "error" : ""}
                placeholder="Tapez le nom"
                aria-describedby={
                  errors.vehicle_name ? "vehicle_name-error" : undefined
                }
              />
              {errors.vehicle_name && (
                <span id="vehicle_name-error" className="error-message">
                  {errors.vehicle_name}
                </span>
              )}
            </div>
            <div className="form-group">
              <label htmlFor="license_plate">Plaque d'immatriculation</label>
              <input
                id="license_plate"
                type="text"
                name="license_plate"
                value={formData.license_plate}
                onChange={handleChange}
                className={errors.license_plate ? "error" : ""}
                placeholder="Format : AA-123-AA"
                aria-describedby={
                  errors.license_plate ? "license_plate-error" : undefined
                }
              />
              {errors.license_plate && (
                <span id="license_plate-error" className="error-message">
                  {errors.license_plate}
                </span>
              )}
            </div>
            <div className="form-group">
              <label htmlFor="id_plug">Type de prise</label>
              <select
                id="id_plug"
                name="id_plug"
                value={formData.id_plug}
                onChange={handleChange}
                className={errors.id_plug ? "error" : ""}
                aria-describedby={errors.id_plug ? "id_plug-error" : undefined}
              >
                <option value="">Sélectionnez votre prise</option>                {Array.isArray(plugs) &&
                  plugs.map((plug) => (
                    <option key={plug.id} value={plug.id}>
                      {plug.name}
                    </option>
                  ))}
              </select>
              {errors.id_plug && (
                <span id="id_plug-error" className="error-message">
                  {errors.id_plug}
                </span>
              )}
            </div>
            <button type="submit" className="button-classic">
              Valider mes informations
            </button>
          </section>
        </div>
      </form>
    </>
  );
}

export default RegisterPage;
