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
  process.env.SUPABASE_SERVICE_KEY
);

app.post("/register", async (req, res) => {
  const { email, password, nombre, rol } = req.body;

  if (!email || !password || password.length < 6) {
    return res.status(400).json({ error: "Email o password inválido (mínimo 6 caracteres)" });
  }

  try {
    // Crear usuario en Supabase Auth
    const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true
    });

    if (error) {
    if (error.code === 'email_exists') {
        return res.status(400).json({ error: 'El email ya está registrado.' });
    }
    return res.status(400).json({ error });
    }


    if (error) return res.status(400).json({ error });

    // Guardar datos extra en tu tabla `usuarios`
    const userId = data.user.id; // <- CORRECTO

    const { error: dbError } = await supabase
    .from("usuarios")
    .insert([{ id: userId, nombre, rol }]);

    if (dbError) return res.status(500).json({ error: dbError });

    res.json({ message: "Usuario creado correctamente", user: { id: userId, email, nombre, rol } });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) return res.status(400).json({ error });

    res.json({
      access_token: data.session.access_token,
      user: data.user
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


app.listen(3000, () => console.log("Servidor corriendo en http://localhost:3000"));
