"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Search,
  Mail,
  Phone,
  Check,
  Archive,
  MessageSquare,
  RefreshCw,
  Send,
  X,
  Loader2,
  Inbox,
  CheckCircle2,
  Trash2,
  FolderOpen,
  RotateCcw,
  AlertTriangle,
} from "lucide-react";
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

type Folder = "inbox" | "replied" | "archived" | "trash";

const FOLDERS: { key: Folder; label: string; icon: React.ReactNode; statuses: string[] }[] = [
  { key: "inbox", label: "Boîte de réception", icon: <Inbox size={18} />, statuses: ["new", "read"] },
  { key: "replied", label: "Répondus", icon: <CheckCircle2 size={18} />, statuses: ["replied"] },
  { key: "archived", label: "Archivés", icon: <Archive size={18} />, statuses: ["archived"] },
  { key: "trash", label: "Corbeille", icon: <Trash2 size={18} />, statuses: ["deleted"] },
];

export default function AdminContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentFolder, setCurrentFolder] = useState<Folder>("inbox");
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [replyMessage, setReplyMessage] = useState("");
  const [isSendingReply, setIsSendingReply] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [replySuccess, setReplySuccess] = useState<string | null>(null);
  const [replyError, setReplyError] = useState<string | null>(null);

  const fetchContacts = useCallback(async () => {
    try {
      const folder = FOLDERS.find(f => f.key === currentFolder);
      if (!folder) return;

      const { data, error } = await supabase
        .from("contacts")
        .select("*")
        .in("status", folder.statuses)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setContacts(data || []);
      setSelectedIds(new Set());
      setSelectedContact(null);
    } catch (error) {
      console.error("Error fetching contacts:", error);
    } finally {
      setIsLoading(false);
    }
  }, [currentFolder]);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  // Count messages per folder
  const [folderCounts, setFolderCounts] = useState<Record<Folder, number>>({
    inbox: 0,
    replied: 0,
    archived: 0,
    trash: 0,
  });

  useEffect(() => {
    async function fetchCounts() {
      try {
        const counts: Record<Folder, number> = { inbox: 0, replied: 0, archived: 0, trash: 0 };

        for (const folder of FOLDERS) {
          const { count } = await supabase
            .from("contacts")
            .select("*", { count: "exact", head: true })
            .in("status", folder.statuses);
          counts[folder.key] = count || 0;
        }

        setFolderCounts(counts);
      } catch (error) {
        console.error("Error fetching counts:", error);
      }
    }
    fetchCounts();
  }, [contacts]);

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

  async function updateMultipleStatus(ids: string[], newStatus: string) {
    if (ids.length === 0) return;
    setIsProcessing(true);

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any)
        .from("contacts")
        .update({ status: newStatus })
        .in("id", ids);

      await fetchContacts();
    } catch (error) {
      console.error("Error updating contacts:", error);
    } finally {
      setIsProcessing(false);
    }
  }

  async function permanentlyDelete(ids: string[]) {
    if (ids.length === 0) return;
    setIsProcessing(true);

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any)
        .from("contacts")
        .delete()
        .in("id", ids);

      await fetchContacts();
      setShowDeleteModal(false);
    } catch (error) {
      console.error("Error deleting contacts:", error);
    } finally {
      setIsProcessing(false);
    }
  }

  function toggleSelectAll() {
    if (selectedIds.size === filteredContacts.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredContacts.map(c => c.id)));
    }
  }

  function toggleSelect(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
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

      setSelectedContact(prev => prev ? {
        ...prev,
        status: "replied",
        replied_at: new Date().toISOString(),
        notes: replyMessage.trim()
      } : null);

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
      case "deleted":
        return { label: "Supprimé", class: styles.deleted };
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
            <p>{filteredContacts.length} message{filteredContacts.length > 1 ? "s" : ""}</p>
          </div>
        </div>
        <button onClick={fetchContacts} className={styles.refreshBtn}>
          <RefreshCw size={18} />
          Actualiser
        </button>
      </header>

      <div className={styles.mainLayout}>
        {/* Sidebar with folders */}
        <aside className={styles.sidebar}>
          <nav className={styles.folderNav}>
            {FOLDERS.map((folder) => (
              <button
                key={folder.key}
                className={`${styles.folderBtn} ${currentFolder === folder.key ? styles.active : ""}`}
                onClick={() => setCurrentFolder(folder.key)}
              >
                {folder.icon}
                <span className={styles.folderLabel}>{folder.label}</span>
                {folderCounts[folder.key] > 0 && (
                  <span className={styles.folderCount}>{folderCounts[folder.key]}</span>
                )}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main content */}
        <div className={styles.mainContent}>
          {/* Toolbar */}
          <div className={styles.toolbar}>
            <div className={styles.toolbarLeft}>
              <label className={styles.selectAllLabel}>
                <input
                  type="checkbox"
                  checked={selectedIds.size === filteredContacts.length && filteredContacts.length > 0}
                  onChange={toggleSelectAll}
                  className={styles.checkbox}
                />
                <span>Tout</span>
              </label>

              {selectedIds.size > 0 && (
                <div className={styles.bulkActions}>
                  <span className={styles.selectedCount}>{selectedIds.size} sélectionné{selectedIds.size > 1 ? "s" : ""}</span>

                  {currentFolder !== "archived" && currentFolder !== "trash" && (
                    <button
                      className={styles.bulkBtn}
                      onClick={() => updateMultipleStatus(Array.from(selectedIds), "archived")}
                      disabled={isProcessing}
                      title="Archiver"
                    >
                      <Archive size={16} />
                    </button>
                  )}

                  {currentFolder !== "trash" && (
                    <button
                      className={styles.bulkBtn}
                      onClick={() => updateMultipleStatus(Array.from(selectedIds), "deleted")}
                      disabled={isProcessing}
                      title="Supprimer"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}

                  {currentFolder === "trash" && (
                    <>
                      <button
                        className={styles.bulkBtn}
                        onClick={() => updateMultipleStatus(Array.from(selectedIds), "new")}
                        disabled={isProcessing}
                        title="Restaurer"
                      >
                        <RotateCcw size={16} />
                      </button>
                      <button
                        className={`${styles.bulkBtn} ${styles.danger}`}
                        onClick={() => setShowDeleteModal(true)}
                        disabled={isProcessing}
                        title="Supprimer définitivement"
                      >
                        <Trash2 size={16} />
                      </button>
                    </>
                  )}

                  {currentFolder === "archived" && (
                    <button
                      className={styles.bulkBtn}
                      onClick={() => updateMultipleStatus(Array.from(selectedIds), "new")}
                      disabled={isProcessing}
                      title="Restaurer"
                    >
                      <RotateCcw size={16} />
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className={styles.searchBox}>
              <Search size={18} />
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Content Grid */}
          <div className={styles.contentGrid}>
            {/* Contacts List */}
            <div className={styles.contactsList}>
              {filteredContacts.length === 0 ? (
                <div className={styles.emptyState}>
                  <FolderOpen size={48} />
                  <p>
                    {currentFolder === "trash"
                      ? "La corbeille est vide"
                      : currentFolder === "archived"
                      ? "Aucun message archivé"
                      : "Aucun message"}
                  </p>
                </div>
              ) : (
                filteredContacts.map((contact) => {
                  const statusInfo = getStatusBadge(contact.status);
                  const isSelected = selectedIds.has(contact.id);
                  return (
                    <div
                      key={contact.id}
                      className={`${styles.contactCard} ${selectedContact?.id === contact.id ? styles.active : ""} ${contact.status === "new" ? styles.unread : ""} ${isSelected ? styles.checked : ""}`}
                      onClick={() => {
                        setSelectedContact(contact);
                        if (contact.status === "new") {
                          updateContactStatus(contact.id, "read");
                        }
                      }}
                    >
                      <div className={styles.cardCheckbox} onClick={(e) => toggleSelect(contact.id, e)}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}}
                          className={styles.checkbox}
                        />
                      </div>

                      <div className={styles.cardContent}>
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
                  <button
                    className={styles.closeDetailBtn}
                    onClick={() => setSelectedContact(null)}
                  >
                    <X size={20} />
                  </button>
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
                  {currentFolder !== "trash" && (
                    <>
                      <button
                        className={`${styles.actionBtn} ${styles.reply}`}
                        onClick={openReplyModal}
                      >
                        <Send size={18} />
                        {selectedContact.status === "replied" ? "Répondre à nouveau" : "Répondre"}
                      </button>

                      {selectedContact.status !== "replied" && selectedContact.status !== "archived" && (
                        <button
                          className={`${styles.actionBtn} ${styles.markReplied}`}
                          onClick={() => updateContactStatus(selectedContact.id, "replied")}
                        >
                          <Check size={18} />
                          Marquer répondu
                        </button>
                      )}

                      {currentFolder !== "archived" && (
                        <button
                          className={`${styles.actionBtn} ${styles.archive}`}
                          onClick={() => updateContactStatus(selectedContact.id, "archived")}
                        >
                          <Archive size={18} />
                          Archiver
                        </button>
                      )}

                      <button
                        className={`${styles.actionBtn} ${styles.delete}`}
                        onClick={() => updateContactStatus(selectedContact.id, "deleted")}
                      >
                        <Trash2 size={18} />
                        Supprimer
                      </button>
                    </>
                  )}

                  {currentFolder === "trash" && (
                    <>
                      <button
                        className={`${styles.actionBtn} ${styles.restore}`}
                        onClick={() => updateContactStatus(selectedContact.id, "new")}
                      >
                        <RotateCcw size={18} />
                        Restaurer
                      </button>
                      <button
                        className={`${styles.actionBtn} ${styles.deletePermanent}`}
                        onClick={() => {
                          setSelectedIds(new Set([selectedContact.id]));
                          setShowDeleteModal(true);
                        }}
                      >
                        <Trash2 size={18} />
                        Supprimer définitivement
                      </button>
                    </>
                  )}

                  {currentFolder === "archived" && (
                    <button
                      className={`${styles.actionBtn} ${styles.restore}`}
                      onClick={() => updateContactStatus(selectedContact.id, "new")}
                    >
                      <RotateCcw size={18} />
                      Restaurer dans la boîte
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className={styles.noSelection}>
                <MessageSquare size={48} />
                <p>Sélectionnez un message pour voir les détails</p>
              </div>
            )}
          </div>
        </div>
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

      {/* Modal de confirmation de suppression */}
      {showDeleteModal && (
        <div className={styles.modalOverlay} onClick={() => setShowDeleteModal(false)}>
          <div className={styles.deleteModal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.deleteModalIcon}>
              <AlertTriangle size={48} />
            </div>
            <h3>Supprimer définitivement ?</h3>
            <p>
              {selectedIds.size === 1
                ? "Ce message sera supprimé définitivement. Cette action est irréversible."
                : `Ces ${selectedIds.size} messages seront supprimés définitivement. Cette action est irréversible.`
              }
            </p>
            <div className={styles.deleteModalActions}>
              <button
                className={styles.cancelBtn}
                onClick={() => setShowDeleteModal(false)}
                disabled={isProcessing}
              >
                Annuler
              </button>
              <button
                className={styles.deleteConfirmBtn}
                onClick={() => permanentlyDelete(Array.from(selectedIds))}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Loader2 size={18} className={styles.spinning} />
                    Suppression...
                  </>
                ) : (
                  <>
                    <Trash2 size={18} />
                    Supprimer
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
