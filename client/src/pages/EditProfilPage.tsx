import { useEffect, useState } from "react";
import { useNavigate } from "react-router";

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
    };
    fetchUser();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setAvatarFile(e.target.files[0]);
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
      <form onSubmit={handleSubmit}>
        <input
          name="first_name"
          value={form.first_name}
          onChange={handleChange}
          placeholder="Prénom"
        />
        <input
          name="last_name"
          value={form.last_name}
          onChange={handleChange}
          placeholder="Nom"
        />
        <input
          name="email"
          value={form.email}
          onChange={handleChange}
          placeholder="Email"
        />
        <input
          name="birthdate"
          value={form.birthdate}
          onChange={handleChange}
          placeholder="Date de naissance"
          type="date"
        />
        <input
          name="address"
          value={form.address}
          onChange={handleChange}
          placeholder="Adresse"
        />
        <input
          name="address_bis"
          value={form.address_bis}
          onChange={handleChange}
          placeholder="Complément"
        />
        <input
          name="city"
          value={form.city}
          onChange={handleChange}
          placeholder="Ville"
        />
        <input
          name="postcode"
          value={form.postcode}
          onChange={handleChange}
          placeholder="Code postal"
        />
        <input
          name="country"
          value={form.country}
          onChange={handleChange}
          placeholder="Pays"
        />
        <input
          name="gender"
          value={form.gender}
          onChange={handleChange}
          placeholder="Genre"
        />
        <div>
          <label>
            Changer l'avatar :
            <input type="file" accept="image/*" onChange={handleAvatarChange} />
          </label>
        </div>
        <button type="submit">Enregistrer</button>
      </form>
    </div>
  );
}

export default EditProfilPage;
