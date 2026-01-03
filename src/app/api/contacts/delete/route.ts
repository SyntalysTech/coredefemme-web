import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Crear cliente Supabase con service role para operaciones admin
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { contact_ids } = body;

    if (!contact_ids || !Array.isArray(contact_ids) || contact_ids.length === 0) {
      return NextResponse.json(
        { error: "IDs de contacts requis" },
        { status: 400 }
      );
    }

    // Eliminar permanentemente los contactos
    const { error } = await supabaseAdmin
      .from("contacts")
      .delete()
      .in("id", contact_ids);

    if (error) {
      console.error("Error deleting contacts:", error);
      return NextResponse.json(
        { error: "Erreur lors de la suppression" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `${contact_ids.length} message(s) supprimé(s) définitivement`,
      deleted_count: contact_ids.length,
    });

  } catch (error) {
    console.error("Error in delete endpoint:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
