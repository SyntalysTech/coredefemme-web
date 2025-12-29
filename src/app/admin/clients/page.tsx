"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, Search, Users, Mail, Phone, Calendar, Package, RefreshCw } from "lucide-react";
import { supabase } from "@/lib/supabase";
import styles from "./page.module.css";

interface Client {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  total_sessions_attended: number;
  total_amount_spent: number;
  created_at: string;
  last_login_at: string | null;
  reservations_count?: number;
  packs_count?: number;
}

export default function AdminClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  const fetchClients = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("customer_profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Get additional stats for each client
      const clientsWithStats = await Promise.all(
        (data || []).map(async (client: { id: string; email: string; full_name: string; phone: string | null; total_sessions_attended: number; total_amount_spent: number; created_at: string; last_login_at: string | null }) => {
          const [reservationsRes, packsRes] = await Promise.all([
            supabase
              .from("reservations")
              .select("id", { count: "exact" })
              .or(`user_id.eq.${client.id},customer_email.eq.${client.email}`),
            supabase
              .from("customer_packs")
              .select("id", { count: "exact" })
              .or(`user_id.eq.${client.id},customer_email.eq.${client.email}`)
              .eq("status", "active"),
          ]);

          return {
            ...client,
            reservations_count: reservationsRes.count || 0,
            packs_count: packsRes.count || 0,
          };
        })
      );

      setClients(clientsWithStats);
    } catch (error) {
      console.error("Error fetching clients:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const filteredClients = clients.filter((client) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      client.full_name?.toLowerCase().includes(searchLower) ||
      client.email?.toLowerCase().includes(searchLower) ||
      client.phone?.toLowerCase().includes(searchLower)
    );
  });

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <Link href="/admin" className={styles.backLink}>
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1>Clients</h1>
            <p>{clients.length} client{clients.length > 1 ? "s" : ""} inscrit{clients.length > 1 ? "s" : ""}</p>
          </div>
        </div>
        <button onClick={fetchClients} className={styles.refreshBtn}>
          <RefreshCw size={18} />
          Actualiser
        </button>
      </header>

      {/* Search */}
      <div className={styles.filters}>
        <div className={styles.searchBox}>
          <Search size={18} />
          <input
            type="text"
            placeholder="Rechercher par nom, email ou téléphone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Clients Grid */}
      <div className={styles.clientsGrid}>
        {filteredClients.length === 0 ? (
          <div className={styles.emptyState}>
            <Users size={48} />
            <p>Aucun client trouvé</p>
          </div>
        ) : (
          filteredClients.map((client) => (
            <div
              key={client.id}
              className={`${styles.clientCard} ${selectedClient?.id === client.id ? styles.selected : ""}`}
              onClick={() => setSelectedClient(client)}
            >
              <div className={styles.clientAvatar}>
                {client.full_name?.charAt(0).toUpperCase() || "?"}
              </div>
              <div className={styles.clientInfo}>
                <h3>{client.full_name || "Sans nom"}</h3>
                <p className={styles.clientEmail}>{client.email}</p>
                {client.phone && (
                  <p className={styles.clientPhone}>
                    <Phone size={12} />
                    {client.phone}
                  </p>
                )}
              </div>
              <div className={styles.clientStats}>
                <div className={styles.stat}>
                  <Calendar size={14} />
                  <span>{client.reservations_count || 0}</span>
                </div>
                <div className={styles.stat}>
                  <Package size={14} />
                  <span>{client.packs_count || 0}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Detail Panel */}
      {selectedClient && (
        <div className={styles.detailPanel}>
          <div className={styles.detailHeader}>
            <h2>Détails du client</h2>
            <button
              className={styles.closeBtn}
              onClick={() => setSelectedClient(null)}
            >
              ×
            </button>
          </div>

          <div className={styles.detailContent}>
            <div className={styles.detailAvatar}>
              {selectedClient.full_name?.charAt(0).toUpperCase() || "?"}
            </div>

            <div className={styles.detailSection}>
              <h3>Informations</h3>
              <div className={styles.detailRow}>
                <Users size={16} />
                <span>{selectedClient.full_name || "Sans nom"}</span>
              </div>
              <div className={styles.detailRow}>
                <Mail size={16} />
                <a href={`mailto:${selectedClient.email}`}>{selectedClient.email}</a>
              </div>
              {selectedClient.phone && (
                <div className={styles.detailRow}>
                  <Phone size={16} />
                  <a href={`tel:${selectedClient.phone}`}>{selectedClient.phone}</a>
                </div>
              )}
            </div>

            <div className={styles.detailSection}>
              <h3>Statistiques</h3>
              <div className={styles.statsGrid}>
                <div className={styles.statBox}>
                  <span className={styles.statValue}>{selectedClient.reservations_count || 0}</span>
                  <span className={styles.statLabel}>Réservations</span>
                </div>
                <div className={styles.statBox}>
                  <span className={styles.statValue}>{selectedClient.packs_count || 0}</span>
                  <span className={styles.statLabel}>Packs actifs</span>
                </div>
                <div className={styles.statBox}>
                  <span className={styles.statValue}>{selectedClient.total_sessions_attended || 0}</span>
                  <span className={styles.statLabel}>Séances</span>
                </div>
                <div className={styles.statBox}>
                  <span className={styles.statValue}>CHF {selectedClient.total_amount_spent || 0}</span>
                  <span className={styles.statLabel}>Total dépensé</span>
                </div>
              </div>
            </div>

            <div className={styles.detailSection}>
              <h3>Activité</h3>
              <div className={styles.detailRow}>
                <Calendar size={16} />
                <span>
                  Inscrit le {new Date(selectedClient.created_at).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>
              {selectedClient.last_login_at && (
                <div className={styles.detailRow}>
                  <Calendar size={16} />
                  <span>
                    Dernière connexion: {new Date(selectedClient.last_login_at).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
