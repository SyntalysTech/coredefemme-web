import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET - Obtener perfil del usuario autenticado
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const authToken = cookieStore.get("sb-access-token")?.value;

    if (!authToken) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(authToken);

    if (authError || !user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    // Obtener perfil
    const { data: profile } = await supabaseAdmin
      .from("customer_profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    // Obtener reservaciones
    const { data: reservations } = await supabaseAdmin
      .from("reservations")
      .select(`
        *,
        session:sessions (
          id,
          session_date,
          start_time,
          end_time,
          service:services (id, name, slug)
        )
      `)
      .or(`user_id.eq.${user.id},customer_email.eq.${user.email}`)
      .order("created_at", { ascending: false });

    // Obtener packs
    const { data: packs } = await supabaseAdmin
      .from("customer_packs")
      .select(`
        *,
        service:services (id, name, slug)
      `)
      .or(`user_id.eq.${user.id},customer_email.eq.${user.email}`)
      .order("created_at", { ascending: false });

    // Obtener notificaciones
    const { data: notifications } = await supabaseAdmin
      .from("user_notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20);

    // Obtener historial de pagos
    const { data: payments } = await supabaseAdmin
      .from("payment_history")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20);

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        ...profile,
      },
      reservations: reservations || [],
      packs: packs || [],
      notifications: notifications || [],
      payments: payments || [],
    });
  } catch (error) {
    console.error("Error fetching account:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// PUT - Actualizar perfil
export async function PUT(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const authToken = cookieStore.get("sb-access-token")?.value;

    if (!authToken) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(authToken);

    if (authError || !user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const body = await request.json();
    const { full_name, phone, address } = body;

    // Actualizar perfil en customer_profiles
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("customer_profiles")
      .update({
        full_name,
        phone,
        address,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id)
      .select()
      .single();

    if (profileError) {
      console.error("Error updating profile:", profileError);
      return NextResponse.json({ error: "Erreur lors de la mise à jour" }, { status: 500 });
    }

    // También actualizar metadatos de auth
    await supabaseAdmin.auth.admin.updateUserById(user.id, {
      user_metadata: {
        full_name,
        phone,
      },
    });

    return NextResponse.json({
      success: true,
      profile,
    });
  } catch (error) {
    console.error("Error updating account:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
