import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import "../style/editprofilpage.css";

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
        birthdate: data.birthdate || "",
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setAvatarFile(e.target.files[0]);
      setAvatarPreview(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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

    navigate("/profil");
  };

  return (
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
        </div>
        <div className="fields-block">
          <label>
            Prénom
            <input
              name="first_name"
              value={form.first_name}
              onChange={handleChange}
            />
          </label>
          <label>
            Nom de famille
            <input
              name="last_name"
              value={form.last_name}
              onChange={handleChange}
            />
          </label>
          <label>
            Email
            <input name="email" value={form.email} onChange={handleChange} />
          </label>
          <label>
            Date de naissance
            <input
              name="birthdate"
              value={form.birthdate}
              onChange={handleChange}
              type="date"
            />
          </label>
          <label>
            Adresse
            <input
              name="address"
              value={form.address}
              onChange={handleChange}
            />
          </label>
          <label>
            Complément d'adresse
            <input
              name="address_bis"
              value={form.address_bis}
              onChange={handleChange}
            />
          </label>
          <label>
            Ville
            <input name="city" value={form.city} onChange={handleChange} />
          </label>
          <label>
            Code postal
            <input
              name="postcode"
              value={form.postcode}
              onChange={handleChange}
            />
          </label>
          <label>
            Pays
            <input
              name="country"
              value={form.country}
              onChange={handleChange}
            />
          </label>
          <label>
            Genre
            <input name="gender" value={form.gender} onChange={handleChange} />
          </label>
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
  );
}

export default EditProfilPage;
