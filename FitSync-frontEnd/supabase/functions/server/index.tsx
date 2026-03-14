import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
import { createClient } from "jsr:@supabase/supabase-js@2";

const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-da3e276b/health", (c) => {
  return c.json({ status: "ok" });
});

// ── Auth: Sign Up ─────────────────────────────────────────────────────────
app.post("/make-server-da3e276b/signup", async (c) => {
  try {
    const body = await c.req.json();
    const { email, password, name, role, whatsapp, professionalId, plan } = body;

    if (!email || !password || !name || !role) {
      return c.json({ error: true, message: "Campos obrigatórios: email, senha, nome e perfil" }, 400);
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    // Create user in Supabase Auth
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name, role, whatsapp, professionalId, plan },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true,
    });

    if (error) {
      console.log("Signup error:", error);
      return c.json({ error: true, message: error.message }, 400);
    }

    const userId = data.user.id;

    // Save extended profile to KV store
    const profile = {
      id: userId,
      name,
      email,
      role,
      whatsapp: whatsapp || null,
      professionalId: professionalId || null,
      plan: plan || null,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=10b981&color=fff`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await kv.set(`profile:${userId}`, profile);
    await kv.set(`profile:email:${email}`, userId);

    console.log(`Usuário criado: ${userId} | Role: ${role} | Email: ${email}`);

    return c.json({ success: true, user: data.user, profile });
  } catch (error: any) {
    console.error("Erro no signup:", error);
    return c.json({ error: true, message: error.message || "Erro ao criar conta" }, 500);
  }
});

// ── Auth: Get Profile ─────────────────────────────────────────────────────
app.get("/make-server-da3e276b/profile/:userId", async (c) => {
  try {
    const userId = c.req.param('userId');
    const accessToken = c.req.header('Authorization')?.split(' ')[1];

    if (!accessToken) {
      return c.json({ error: true, message: "Token de acesso obrigatório" }, 401);
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (authError || !user) {
      return c.json({ error: true, message: "Não autorizado" }, 401);
    }

    const profile = await kv.get(`profile:${userId}`);

    if (!profile) {
      // Create a default profile from auth metadata
      const metadata = user.user_metadata;
      const defaultProfile = {
        id: userId,
        name: metadata.name || user.email?.split('@')[0] || 'Usuário',
        email: user.email || '',
        role: metadata.role || 'student',
        whatsapp: metadata.whatsapp || null,
        professionalId: metadata.professionalId || null,
        plan: metadata.plan || null,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(metadata.name || 'U')}&background=10b981&color=fff`,
        createdAt: user.created_at,
        updatedAt: new Date().toISOString(),
      };
      await kv.set(`profile:${userId}`, defaultProfile);
      return c.json({ success: true, profile: defaultProfile });
    }

    return c.json({ success: true, profile });
  } catch (error: any) {
    console.error("Erro ao buscar perfil:", error);
    return c.json({ error: true, message: error.message || "Erro ao buscar perfil" }, 500);
  }
});

// ── Auth: Update Profile ──────────────────────────────────────────────────
app.put("/make-server-da3e276b/profile/:userId", async (c) => {
  try {
    const userId = c.req.param('userId');
    const accessToken = c.req.header('Authorization')?.split(' ')[1];

    if (!accessToken) {
      return c.json({ error: true, message: "Token de acesso obrigatório" }, 401);
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (authError || !user) {
      return c.json({ error: true, message: "Não autorizado" }, 401);
    }

    const body = await c.req.json();
    const currentProfile = (await kv.get(`profile:${userId}`)) as any || {};

    const updatedProfile = {
      ...currentProfile,
      ...body,
      id: userId,
      updatedAt: new Date().toISOString(),
    };

    await kv.set(`profile:${userId}`, updatedProfile);

    // Also update Supabase auth metadata
    await supabase.auth.admin.updateUserById(userId, {
      user_metadata: {
        name: updatedProfile.name,
        role: updatedProfile.role,
        whatsapp: updatedProfile.whatsapp,
        professionalId: updatedProfile.professionalId,
        plan: updatedProfile.plan,
      }
    });

    return c.json({ success: true, profile: updatedProfile });
  } catch (error: any) {
    console.error("Erro ao atualizar perfil:", error);
    return c.json({ error: true, message: error.message || "Erro ao atualizar perfil" }, 500);
  }
});

// ── Patient/Student Management ────────────────────────────────────────────
app.post("/make-server-da3e276b/add-patient", async (c) => {
  try {
    const body = await c.req.json();
    const {
      name, email, phone, birthDate, gender,
      height, weight, goal, medicalNotes, professionalType, professionalId,
    } = body;

    if (!name || !email || !phone || !birthDate || !gender || !goal) {
      return c.json({ error: true, message: "Campos obrigatórios não preenchidos" }, 400);
    }

    const patientId = crypto.randomUUID();

    const patient = {
      id: patientId,
      name, email, phone, birthDate, gender,
      height: height || null,
      weight: weight || null,
      goal,
      medicalNotes: medicalNotes || null,
      professionalType,
      professionalId: professionalId || null,
      status: "pending",
      createdAt: new Date().toISOString(),
      inviteSentAt: new Date().toISOString(),
    };

    await kv.set(`patient:${patientId}`, patient);
    await kv.set(`patient:email:${email}`, patientId);

    // Index by professional
    if (professionalId) {
      const existingList = (await kv.get(`professional:${professionalId}:patients`)) as string[] || [];
      await kv.set(`professional:${professionalId}:patients`, [...existingList, patientId]);
    }

    console.log(`Convite enviado para ${email} - Tipo: ${professionalType}`);
    console.log(`Paciente criado: ${patientId}`);

    return c.json({ success: true, message: "Convite enviado com sucesso", patient });
  } catch (error: any) {
    console.error("Erro ao adicionar paciente:", error);
    return c.json({ error: true, message: error.message || "Erro ao processar solicitação" }, 500);
  }
});

// ── Get Patients by Professional ──────────────────────────────────────────
app.get("/make-server-da3e276b/patients", async (c) => {
  try {
    const professionalType = c.req.query('professionalType');
    const professionalId = c.req.query('professionalId');

    if (!professionalType) {
      return c.json({ error: true, message: "Tipo de profissional é obrigatório" }, 400);
    }

    const patients = await kv.getByPrefix('patient:');

    const filteredPatients = patients
      .map((item: any) => item.value)
      .filter((patient: any) =>
        patient &&
        patient.id &&
        patient.professionalType === professionalType &&
        (!professionalId || patient.professionalId === professionalId)
      );

    return c.json({ success: true, patients: filteredPatients });
  } catch (error: any) {
    console.error("Erro ao buscar pacientes:", error);
    return c.json({ error: true, message: error.message || "Erro ao buscar pacientes" }, 500);
  }
});

// ── Save User Settings ────────────────────────────────────────────────────
app.post("/make-server-da3e276b/settings/:userId", async (c) => {
  try {
    const userId = c.req.param('userId');
    const accessToken = c.req.header('Authorization')?.split(' ')[1];

    if (!accessToken) {
      return c.json({ error: true, message: "Token de acesso obrigatório" }, 401);
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (authError || !user) {
      return c.json({ error: true, message: "Não autorizado" }, 401);
    }

    const body = await c.req.json();
    const currentSettings = (await kv.get(`settings:${userId}`)) as any || {};

    const updatedSettings = {
      ...currentSettings,
      ...body,
      userId,
      updatedAt: new Date().toISOString(),
    };

    await kv.set(`settings:${userId}`, updatedSettings);

    return c.json({ success: true, settings: updatedSettings });
  } catch (error: any) {
    console.error("Erro ao salvar configurações:", error);
    return c.json({ error: true, message: error.message || "Erro ao salvar configurações" }, 500);
  }
});

// ── Get User Settings ─────────────────────────────────────────────────────
app.get("/make-server-da3e276b/settings/:userId", async (c) => {
  try {
    const userId = c.req.param('userId');
    const settings = await kv.get(`settings:${userId}`);

    return c.json({
      success: true,
      settings: settings || {
        notifications: {
          email: true, push: true, sms: false,
          workoutReminder: true, dietReminder: true, weeklyReport: true,
        },
        privacy: { profilePublic: false, showStats: true },
        appearance: { theme: 'dark', language: 'pt-BR', fontSize: 'medium' },
      }
    });
  } catch (error: any) {
    console.error("Erro ao buscar configurações:", error);
    return c.json({ error: true, message: error.message || "Erro ao buscar configurações" }, 500);
  }
});

Deno.serve(app.fetch);
