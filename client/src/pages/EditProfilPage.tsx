import { useEffect, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { useNavigate } from "react-router";
import Modal from "../components/Modal/Modal";
import "../stylesheets/editprofilpage.css";

function EditProfilPage() {
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    birthdate: "",
    address: "",
    address_bis: "",
    city: "",
    postcode: "",
    country: "",
    gender: "",
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [modalState, setModalState] = useState({
    isOpen: false,
    title: "",
    message: "",
    isSuccess: false,
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/users/me`, {
        credentials: "include",
      });
      const data = await res.json();
      setForm({
        first_name: data.first_name || "",
        last_name: data.last_name || "",
        email: data.email || "",
        birthdate: data.birthdate ? data.birthdate.split("T")[0] : "",
        address: data.address || "",
        address_bis: data.address_bis || "",
        city: data.city || "",
        postcode: data.postcode || "",
        country: data.country || "",
        gender: data.gender || "",
      });
      setAvatarUrl(
        data.avatar_url
          ? `${import.meta.env.VITE_API_URL}${data.avatar_url}`
          : null,
      );
    };
    fetchUser();
  }, []);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
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
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api/users/me`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (avatarFile) {
        const formData = new FormData();
        formData.append("avatar", avatarFile);
        await fetch(`${import.meta.env.VITE_API_URL}/api/users/me/avatar`, {
          method: "PUT",
          credentials: "include",
          body: formData,
        });
      }

      setModalState({
        isOpen: true,
        title: "Profil mis à jour",
        message: "Vos informations ont été enregistrées avec succès.",
        isSuccess: true,
      });
    } catch (err) {
      console.error(err);
      setModalState({
        isOpen: true,
        title: "Erreur",
        message: "Une erreur est survenue lors de la mise à jour.",
        isSuccess: false,
      });
    }
  };

  const handleModalClose = () => {
    if (modalState.isSuccess) {
      navigate("/profil");
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
      <div className="edit-profil-page-container">
        <h2>Modifier mon profil</h2>
        <form className="edit-profil-form" onSubmit={handleSubmit}>
          <div className="avatar-block">
            <img
              src={avatarPreview || avatarUrl || "/default-avatar.png"}
              alt="avatar actuel"
              className="avatar-img"
            />
            <input
              id="avatar-upload"
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleAvatarChange}
            />
            <button
              type="button"
              onClick={() => document.getElementById("avatar-upload")?.click()}
              className="avatar-upload-btn"
            >
              Changer l'avatar
            </button>
            <p className="info-text">Taille max : 1Mo</p>
          </div>
          <div className="fields-block">
            <label htmlFor="first_name">Prénom</label>
            <input
              id="first_name"
              name="first_name"
              value={form.first_name}
              onChange={handleChange}
            />

            <label htmlFor="last_name">Nom de famille</label>
            <input
              id="last_name"
              name="last_name"
              value={form.last_name}
              onChange={handleChange}
            />

            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              value={form.email}
              onChange={handleChange}
            />

            <label htmlFor="birthdate">Date de naissance</label>
            <input
              id="birthdate"
              name="birthdate"
              value={form.birthdate}
              onChange={handleChange}
              type="date"
            />

            <label htmlFor="address">Adresse</label>
            <input
              id="address"
              name="address"
              value={form.address}
              onChange={handleChange}
            />

            <label htmlFor="address_bis">Complément d'adresse</label>
            <input
              id="address_bis"
              name="address_bis"
              value={form.address_bis}
              onChange={handleChange}
            />

            <label htmlFor="city">Ville</label>
            <input
              id="city"
              name="city"
              value={form.city}
              onChange={handleChange}
            />

            <label htmlFor="postcode">Code postal</label>
            <input
              id="postcode"
              name="postcode"
              value={form.postcode}
              onChange={handleChange}
            />

            <label htmlFor="country">Pays</label>
            <input
              id="country"
              name="country"
              value={form.country}
              onChange={handleChange}
            />

            <label htmlFor="gender">Genre</label>
            <input
              id="gender"
              name="gender"
              value={form.gender}
              onChange={handleChange}
            />
          </div>
          <div className="form-actions">
            <button
              type="button"
              className="cancel-btn"
              onClick={() => navigate("/profil")}
            >
              Annuler
            </button>
            <button type="submit" className="save-btn">
              Enregistrer
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

export default EditProfilPage;
