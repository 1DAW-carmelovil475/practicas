import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY // debe ser service_role key
);

// --------------------- REGISTER ---------------------
app.post("/register", async (req, res) => {
  const { email, password, nombre, rol = "usuario" } = req.body;

  if (!email || !password || password.length < 6) {
    return res
      .status(400)
      .json({ error: "Email o password inválido (mínimo 6 caracteres)" });
  }

  try {
    // 1️⃣ Crear usuario en Supabase Auth
    const { data: authData, error: authError } =
      await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true
      });

    if (authError) {
      if (authError.code === "email_exists") {
        return res.status(400).json({ error: "El email ya está registrado." });
      }
      return res.status(400).json({ error: authError.message });
    }

    const userId = authData.user.id;

    // 2️⃣ Insertar en tabla usuarios con el mismo ID
    const { error: dbError } = await supabase
      .from("usuarios")
      .insert([{ id: userId, nombre, rol }]);

    if (dbError) return res.status(500).json({ error: dbError.message });

    res.json({
      message: "Usuario creado correctamente",
      user: { id: userId, email, nombre, rol }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --------------------- LOGIN ---------------------
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const { data: authData, error: authError } =
      await supabase.auth.signInWithPassword({ email, password });

    if (authError) return res.status(400).json({ error: authError.message });

    const { data: usuarioData, error: usuarioError } = await supabase
      .from("usuarios")
      .select("nombre, rol")
      .eq("id", authData.user.id)
      .maybeSingle(); // evita error si no existe

    if (usuarioError)
      return res.status(400).json({ error: usuarioError.message });

    if (!usuarioData)
      return res
        .status(404)
        .json({ error: "Usuario no encontrado en la tabla usuarios" });

    res.json({
      access_token: authData.session.access_token,
      user: {
        id: authData.user.id,
        email: authData.user.email,
        nombre: usuarioData.nombre,
        rol: usuarioData.rol
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(3000, () => console.log("Servidor corriendo en http://localhost:3000"));
