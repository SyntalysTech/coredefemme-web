"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, Search, Filter, Mail, Phone, Check, Archive, MessageSquare, RefreshCw, Send, X, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import styles from "./page.module.css";

interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status: string;
  created_at: string;
  replied_at: string | null;
  notes: string | null;
}

export default function AdminContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [replyMessage, setReplyMessage] = useState("");
  const [isSendingReply, setIsSendingReply] = useState(false);
  const [replySuccess, setReplySuccess] = useState<string | null>(null);
  const [replyError, setReplyError] = useState<string | null>(null);

  const fetchContacts = useCallback(async () => {
    try {
      let query = supabase
        .from("contacts")
        .select("*")
        .order("created_at", { ascending: false });

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      const { data, error } = await query;

      if (error) throw error;

      setContacts(data || []);
    } catch (error) {
      console.error("Error fetching contacts:", error);
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  async function updateContactStatus(id: string, newStatus: string) {
    try {
      const updateData = newStatus === "replied"
        ? { status: newStatus, replied_at: new Date().toISOString() }
        : { status: newStatus };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any)
        .from("contacts")
        .update(updateData)
        .eq("id", id);

      await fetchContacts();
    } catch (error) {
      console.error("Error updating contact:", error);
    }
  }

  function openReplyModal() {
    setReplyMessage("");
    setReplySuccess(null);
    setReplyError(null);
    setShowReplyModal(true);
  }

  function closeReplyModal() {
    setShowReplyModal(false);
    setReplyMessage("");
    setReplySuccess(null);
    setReplyError(null);
  }

  async function sendReply() {
    if (!selectedContact || !replyMessage.trim()) return;

    setIsSendingReply(true);
    setReplyError(null);
    setReplySuccess(null);

    try {
      const response = await fetch("/api/contacts/reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contact_id: selectedContact.id,
          reply_message: replyMessage.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erreur lors de l'envoi");
      }

      setReplySuccess("Réponse envoyée avec succès !");
      await fetchContacts();

      // Actualizar el contacto seleccionado con el nuevo estado
      setSelectedContact(prev => prev ? {
        ...prev,
        status: "replied",
        replied_at: new Date().toISOString(),
        notes: replyMessage.trim()
      } : null);

      // Cerrar el modal después de 2 segundos
      setTimeout(() => {
        closeReplyModal();
      }, 2000);

    } catch (error) {
      console.error("Error sending reply:", error);
      setReplyError(error instanceof Error ? error.message : "Erreur lors de l'envoi");
    } finally {
      setIsSendingReply(false);
    }
  }

  const filteredContacts = contacts.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.message.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "new":
        return { label: "Nouveau", class: styles.new };
      case "read":
        return { label: "Lu", class: styles.read };
      case "replied":
        return { label: "Répondu", class: styles.replied };
      case "archived":
        return { label: "Archivé", class: styles.archived };
      default:
        return { label: status, class: "" };
    }
  };

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
            <h1>Messages</h1>
            <p>{contacts.length} message{contacts.length > 1 ? "s" : ""}</p>
          </div>
        </div>
        <button onClick={fetchContacts} className={styles.refreshBtn}>
          <RefreshCw size={18} />
          Actualiser
        </button>
      </header>

      {/* Filters */}
      <div className={styles.filters}>
        <div className={styles.searchBox}>
          <Search size={18} />
          <input
            type="text"
            placeholder="Rechercher..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className={styles.filterGroup}>
          <Filter size={18} />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">Tous</option>
            <option value="new">Nouveaux</option>
            <option value="read">Lus</option>
            <option value="replied">Répondus</option>
            <option value="archived">Archivés</option>
          </select>
        </div>
      </div>

      {/* Content Grid */}
      <div className={styles.contentGrid}>
        {/* Contacts List */}
        <div className={styles.contactsList}>
          {filteredContacts.length === 0 ? (
            <div className={styles.emptyState}>
              <MessageSquare size={48} />
              <p>Aucun message trouvé</p>
            </div>
          ) : (
            filteredContacts.map((contact) => {
              const statusInfo = getStatusBadge(contact.status);
              return (
                <div
                  key={contact.id}
                  className={`${styles.contactCard} ${selectedContact?.id === contact.id ? styles.selected : ""} ${contact.status === "new" ? styles.unread : ""}`}
                  onClick={() => {
                    setSelectedContact(contact);
                    if (contact.status === "new") {
                      updateContactStatus(contact.id, "read");
                    }
                  }}
                >
                  <div className={styles.cardHeader}>
                    <span className={styles.contactName}>{contact.name}</span>
                    <span className={`${styles.statusBadge} ${statusInfo.class}`}>
                      {statusInfo.label}
                    </span>
                  </div>

                  {contact.subject && (
                    <p className={styles.subject}>{contact.subject}</p>
                  )}

                  <p className={styles.preview}>
                    {contact.message.slice(0, 100)}
                    {contact.message.length > 100 ? "..." : ""}
                  </p>

                  <div className={styles.cardFooter}>
                    <span className={styles.createdAt}>
                      {new Date(contact.created_at).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Detail Panel */}
        {selectedContact ? (
          <div className={styles.detailPanel}>
            <div className={styles.detailHeader}>
              <div>
                <h2>{selectedContact.name}</h2>
                <span className={`${styles.statusBadge} ${getStatusBadge(selectedContact.status).class}`}>
                  {getStatusBadge(selectedContact.status).label}
                </span>
              </div>
            </div>

            <div className={styles.detailContent}>
              <div className={styles.contactInfo}>
                <a href={`mailto:${selectedContact.email}`} className={styles.contactLink}>
                  <Mail size={16} />
                  {selectedContact.email}
                </a>
                {selectedContact.phone && (
                  <a href={`tel:${selectedContact.phone}`} className={styles.contactLink}>
                    <Phone size={16} />
                    {selectedContact.phone}
                  </a>
                )}
              </div>

              {selectedContact.subject && (
                <div className={styles.subjectBox}>
                  <strong>Objet:</strong> {selectedContact.subject}
                </div>
              )}

              <div className={styles.messageBox}>
                <strong>Message:</strong>
                <p>{selectedContact.message}</p>
              </div>

              <div className={styles.meta}>
                <span>Reçu le {new Date(selectedContact.created_at).toLocaleDateString("fr-FR", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}</span>
                {selectedContact.replied_at && (
                  <span>Répondu le {new Date(selectedContact.replied_at).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "long",
                  })}</span>
                )}
              </div>
            </div>

            {/* Respuesta anterior si existe */}
            {selectedContact.notes && selectedContact.status === "replied" && (
              <div className={styles.previousReply}>
                <strong>Votre réponse :</strong>
                <p>{selectedContact.notes}</p>
              </div>
            )}

            <div className={styles.detailActions}>
              <button
                className={`${styles.actionBtn} ${styles.reply}`}
                onClick={openReplyModal}
              >
                <Send size={18} />
                {selectedContact.status === "replied" ? "Répondre à nouveau" : "Répondre"}
              </button>
              {selectedContact.status !== "replied" && (
                <button
                  className={`${styles.actionBtn} ${styles.markReplied}`}
                  onClick={() => updateContactStatus(selectedContact.id, "replied")}
                >
                  <Check size={18} />
                  Marquer répondu
                </button>
              )}
              <button
                className={`${styles.actionBtn} ${styles.archive}`}
                onClick={() => updateContactStatus(selectedContact.id, "archived")}
              >
                <Archive size={18} />
                Archiver
              </button>
            </div>
          </div>
        ) : (
          <div className={styles.noSelection}>
            <MessageSquare size={48} />
            <p>Sélectionnez un message pour voir les détails</p>
          </div>
        )}
      </div>

      {/* Modal de réponse */}
      {showReplyModal && selectedContact && (
        <div className={styles.modalOverlay} onClick={closeReplyModal}>
          <div className={styles.replyModal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>Répondre à {selectedContact.name}</h3>
              <button className={styles.closeBtn} onClick={closeReplyModal}>
                <X size={20} />
              </button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.originalMessage}>
                <strong>Message original :</strong>
                {selectedContact.subject && (
                  <p className={styles.originalSubject}>Objet : {selectedContact.subject}</p>
                )}
                <p className={styles.originalText}>{selectedContact.message}</p>
              </div>

              <div className={styles.replyForm}>
                <label htmlFor="replyMessage">Votre réponse :</label>
                <textarea
                  id="replyMessage"
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  placeholder="Écrivez votre réponse ici..."
                  rows={6}
                  disabled={isSendingReply}
                />
              </div>

              {replyError && (
                <div className={styles.errorMessage}>
                  {replyError}
                </div>
              )}

              {replySuccess && (
                <div className={styles.successMessage}>
                  {replySuccess}
                </div>
              )}
            </div>

            <div className={styles.modalFooter}>
              <button
                className={styles.cancelBtn}
                onClick={closeReplyModal}
                disabled={isSendingReply}
              >
                Annuler
              </button>
              <button
                className={styles.sendBtn}
                onClick={sendReply}
                disabled={isSendingReply || !replyMessage.trim()}
              >
                {isSendingReply ? (
                  <>
                    <Loader2 size={18} className={styles.spinning} />
                    Envoi en cours...
                  </>
                ) : (
                  <>
                    <Send size={18} />
                    Envoyer la réponse
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
