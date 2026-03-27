import React, { useEffect, useState } from "react";
import ClientLayout from "../components/ClientLayout.jsx";
import { getAiJson, postAiJson } from "../utils/aiApi.js";
import { authHeaders } from "../utils/authHeaders.js";

export default function Collaboration() {
  const [workspaces, setWorkspaces] = useState([]);
  const [selectedWorkspace, setSelectedWorkspace] = useState(null);
  const [members, setMembers] = useState([]);
  const [docs, setDocs] = useState([]);
  const [activity, setActivity] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [myDocs, setMyDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");

  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("client");

  const [shareDocumentId, setShareDocumentId] = useState("");
  const [sharePermission, setSharePermission] = useState("view");

  const [question, setQuestion] = useState("");
  const [qaResult, setQaResult] = useState(null);

  const [versionDocumentId, setVersionDocumentId] = useState("");
  const [versionContent, setVersionContent] = useState("");
  const [versionNote, setVersionNote] = useState("");
  const [versions, setVersions] = useState([]);

  const [commentDocumentId, setCommentDocumentId] = useState("");
  const [commentBody, setCommentBody] = useState("");
  const [comments, setComments] = useState([]);

  const [presenceDocumentId, setPresenceDocumentId] = useState("");
  const [presence, setPresence] = useState([]);

  async function loadBase() {
    setLoading(true);
    setError("");
    try {
      const [wsRes, notifRes, docRes] = await Promise.all([
        getAiJson("/api/ai/workspaces/"),
        getAiJson("/api/ai/workspaces/notifications/"),
        getAiJson("/api/ai/documents/"),
      ]);
      const wsList = wsRes.results || [];
      setWorkspaces(wsList);
      setNotifications(notifRes.results || []);
      setMyDocs(docRes.results || []);
      if (!selectedWorkspace && wsList.length > 0) {
        setSelectedWorkspace(wsList[0]);
      }
    } catch (err) {
      setError(err.message || "Failed loading collaboration data.");
    } finally {
      setLoading(false);
    }
  }

  async function loadWorkspaceDetail(workspaceId) {
    try {
      const [membersRes, docsRes, activityRes] = await Promise.all([
        getAiJson(`/api/ai/workspaces/${workspaceId}/members/`),
        getAiJson(`/api/ai/workspaces/${workspaceId}/documents/`),
        getAiJson(`/api/ai/workspaces/${workspaceId}/activity/`),
      ]);
      setMembers(membersRes.results || []);
      setDocs(docsRes.results || []);
      setActivity(activityRes.results || []);
    } catch (err) {
      setError(err.message || "Failed loading workspace details.");
    }
  }

  useEffect(() => {
    loadBase();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedWorkspace?.id) {
      loadWorkspaceDetail(selectedWorkspace.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedWorkspace?.id]);

  async function createWorkspace(e) {
    e.preventDefault();
    if (!newName.trim()) return;
    try {
      await postAiJson("/api/ai/workspaces/", {
        name: newName.trim(),
        description: newDescription.trim(),
      });
      setNewName("");
      setNewDescription("");
      await loadBase();
    } catch (err) {
      setError(err.message || "Failed to create workspace.");
    }
  }

  async function inviteMember(e) {
    e.preventDefault();
    if (!selectedWorkspace?.id || !inviteEmail.trim()) return;
    try {
      await postAiJson(`/api/ai/workspaces/${selectedWorkspace.id}/invites/`, {
        email: inviteEmail.trim(),
        role: inviteRole,
      });
      setInviteEmail("");
      setInviteRole("client");
      await loadWorkspaceDetail(selectedWorkspace.id);
      await loadBase();
    } catch (err) {
      setError(err.message || "Failed to invite member.");
    }
  }

  async function shareDocument(e) {
    e.preventDefault();
    if (!selectedWorkspace?.id || !shareDocumentId) return;
    try {
      await postAiJson(`/api/ai/workspaces/${selectedWorkspace.id}/share-document/`, {
        document_id: Number(shareDocumentId),
        permission: sharePermission,
        scope: "workspace",
      });
      await loadWorkspaceDetail(selectedWorkspace.id);
    } catch (err) {
      setError(err.message || "Failed to share document.");
    }
  }

  async function askWorkspaceQuestion(e) {
    e.preventDefault();
    if (!selectedWorkspace?.id || !question.trim()) return;
    try {
      const out = await postAiJson(`/api/ai/workspaces/${selectedWorkspace.id}/qa/`, {
        query: question.trim(),
      });
      setQaResult(out);
    } catch (err) {
      setError(err.message || "Workspace Q&A failed.");
    }
  }

  async function createVersion(e) {
    e.preventDefault();
    if (!selectedWorkspace?.id || !versionDocumentId || !versionContent.trim()) return;
    try {
      await postAiJson(
        `/api/ai/workspaces/${selectedWorkspace.id}/documents/${Number(versionDocumentId)}/versions/`,
        { content: versionContent, change_note: versionNote }
      );
      setVersionContent("");
      setVersionNote("");
      await loadVersions(Number(versionDocumentId));
      await loadWorkspaceDetail(selectedWorkspace.id);
    } catch (err) {
      setError(err.message || "Failed to create version.");
    }
  }

  async function loadVersions(docId) {
    if (!selectedWorkspace?.id || !docId) return;
    try {
      const out = await getAiJson(
        `/api/ai/workspaces/${selectedWorkspace.id}/documents/${docId}/versions/`
      );
      setVersions(out.results || []);
    } catch (err) {
      setError(err.message || "Failed to load versions.");
    }
  }

  async function addComment(e) {
    e.preventDefault();
    if (!selectedWorkspace?.id || !commentDocumentId || !commentBody.trim()) return;
    try {
      await postAiJson(`/api/ai/workspaces/${selectedWorkspace.id}/comments/`, {
        document_id: Number(commentDocumentId),
        body: commentBody.trim(),
      });
      setCommentBody("");
      await loadComments(Number(commentDocumentId));
      await loadWorkspaceDetail(selectedWorkspace.id);
    } catch (err) {
      setError(err.message || "Failed to add comment.");
    }
  }

  async function loadComments(docId) {
    if (!selectedWorkspace?.id || !docId) return;
    try {
      const out = await getAiJson(`/api/ai/workspaces/${selectedWorkspace.id}/comments/?document_id=${docId}`);
      setComments(out.results || []);
    } catch (err) {
      setError(err.message || "Failed to load comments.");
    }
  }

  async function resolveComment(commentId, isResolved) {
    if (!selectedWorkspace?.id) return;
    try {
      const res = await fetch(`/api/ai/workspaces/${selectedWorkspace.id}/comments/${commentId}/`, {
        method: "PATCH",
        headers: authHeaders(),
        body: JSON.stringify({ is_resolved: isResolved }),
      });
      if (!res.ok) throw new Error("Failed to update comment.");
      await loadComments(Number(commentDocumentId));
    } catch (err) {
      setError(err.message || "Failed to update comment.");
    }
  }

  async function heartbeatAndLoadPresence() {
    if (!selectedWorkspace?.id || !presenceDocumentId) return;
    try {
      await postAiJson(`/api/ai/workspaces/${selectedWorkspace.id}/presence/`, {
        document_id: Number(presenceDocumentId),
        cursor: { ts: Date.now() },
      });
      const out = await getAiJson(
        `/api/ai/workspaces/${selectedWorkspace.id}/presence/?document_id=${Number(presenceDocumentId)}`
      );
      setPresence(out.results || []);
    } catch (err) {
      setError(err.message || "Presence heartbeat failed.");
    }
  }

  async function markNotificationsRead() {
    const unread = notifications.filter((n) => !n.is_read).map((n) => n.id);
    if (!unread.length) return;
    try {
      await fetch("/api/ai/workspaces/notifications/", {
        method: "PATCH",
        headers: authHeaders(),
        body: JSON.stringify({ ids: unread }),
      });
      await loadBase();
    } catch (err) {
      setError(err.message || "Failed to mark notifications read.");
    }
  }

  function onWorkspaceSelect(e) {
    const id = Number(e.target.value);
    const ws = workspaces.find((w) => w.id === id);
    if (ws) setSelectedWorkspace(ws);
  }

  return (
    <ClientLayout title="Collaboration">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Collaboration + Client Portal</h1>
          <p className="text-sm text-slate-500 mt-1">
            Shared workspaces, invitations, document permissions, collaborative comments, versioning, workspace Q&A, and activity feed.
          </p>
        </div>

        {error ? <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded p-3">{error}</div> : null}

        {loading ? (
          <div className="text-slate-500 text-sm">Loading collaboration workspace…</div>
        ) : (
          <>
            <div className="sticky top-0 z-20 flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white/95 backdrop-blur px-4 py-3 shadow-sm">
              <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                <span className="text-slate-500">Workspace</span>
                <select
                  className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-800 min-w-[220px]"
                  value={selectedWorkspace?.id ?? ""}
                  onChange={onWorkspaceSelect}
                  disabled={workspaces.length === 0}
                >
                  {workspaces.length === 0 ? (
                    <option value="">No workspaces — create one below</option>
                  ) : (
                    workspaces.map((ws) => (
                      <option key={ws.id} value={ws.id}>
                        {ws.name} ({ws.my_role})
                      </option>
                    ))
                  )}
                </select>
              </label>
              {selectedWorkspace ? (
                <span className="text-xs text-slate-500">
                  {members.length} member{members.length === 1 ? "" : "s"} · {docs.length} shared document
                  {docs.length === 1 ? "" : "s"}
                </span>
              ) : null}
            </div>

            <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="bg-white border border-slate-200 rounded-lg p-4">
                <h2 className="font-semibold text-slate-700 mb-3">Create Workspace</h2>
                <form onSubmit={createWorkspace} className="space-y-2">
                  <input className="w-full border border-slate-300 rounded p-2 text-sm" placeholder="Workspace name" value={newName} onChange={(e) => setNewName(e.target.value)} />
                  <textarea className="w-full border border-slate-300 rounded p-2 text-sm" rows={2} placeholder="Description" value={newDescription} onChange={(e) => setNewDescription(e.target.value)} />
                  <button className="px-3 py-2 rounded bg-indigo-600 text-white text-sm">Create</button>
                </form>
              </div>

              <div className="bg-white border border-slate-200 rounded-lg p-4">
                <h2 className="font-semibold text-slate-700 mb-3">All workspaces</h2>
                <p className="text-xs text-slate-500 mb-2">Use the switcher above or pick a row below.</p>
                <div className="space-y-2 max-h-56 overflow-y-auto">
                  {workspaces.length === 0 ? (
                    <p className="text-sm text-slate-500">No workspaces yet.</p>
                  ) : (
                    workspaces.map((ws) => (
                      <button
                        key={ws.id}
                        type="button"
                        onClick={() => setSelectedWorkspace(ws)}
                        className={`w-full text-left border rounded p-2 text-sm ${selectedWorkspace?.id === ws.id ? "border-indigo-400 bg-indigo-50" : "border-slate-200 hover:bg-slate-50"}`}
                      >
                        <div className="font-medium text-slate-700">{ws.name}</div>
                        <div className="text-xs text-slate-500">Role: {ws.my_role}</div>
                      </button>
                    ))
                  )}
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-semibold text-slate-700">Notifications</h2>
                  <button onClick={markNotificationsRead} className="text-xs text-indigo-600 hover:underline">Mark all read</button>
                </div>
                <div className="space-y-2 max-h-56 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <p className="text-sm text-slate-500">No notifications.</p>
                  ) : (
                    notifications.map((n) => (
                      <div key={n.id} className={`border rounded p-2 text-xs ${n.is_read ? "border-slate-200" : "border-indigo-300 bg-indigo-50"}`}>
                        <div className="font-medium text-slate-700">{n.workspace_name}</div>
                        <div className="text-slate-600">{n.message}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </section>

            {selectedWorkspace ? (
              <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-4">
                  <h2 className="font-semibold text-slate-700">Client invite</h2>
                  <p className="text-xs text-slate-500">Send an email invite to a client or colleague for this workspace.</p>
                  <form onSubmit={inviteMember} className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <input className="border border-slate-300 rounded p-2 text-sm md:col-span-2" placeholder="client@firm.com" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} />
                    <select className="border border-slate-300 rounded p-2 text-sm" value={inviteRole} onChange={(e) => setInviteRole(e.target.value)}>
                      <option value="client">Client</option>
                      <option value="member">Member</option>
                      <option value="admin">Admin</option>
                    </select>
                    <button className="px-3 py-2 rounded bg-indigo-600 text-white text-sm md:col-span-3">Invite Member</button>
                  </form>
                  <div className="space-y-2 max-h-56 overflow-y-auto">
                    {members.map((m) => (
                      <div key={m.id} className="border border-slate-200 rounded p-2 text-sm">
                        <span className="font-medium text-slate-700">{m.username || m.email}</span>{" "}
                        <span className="text-xs text-slate-500">({m.role})</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-4">
                  <h2 className="font-semibold text-slate-700">Shared Document Access</h2>
                  <form onSubmit={shareDocument} className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <select className="border border-slate-300 rounded p-2 text-sm md:col-span-2" value={shareDocumentId} onChange={(e) => setShareDocumentId(e.target.value)}>
                      <option value="">Select my document…</option>
                      {myDocs.map((d) => (
                        <option key={d.id} value={d.id}>{d.title}</option>
                      ))}
                    </select>
                    <select className="border border-slate-300 rounded p-2 text-sm" value={sharePermission} onChange={(e) => setSharePermission(e.target.value)}>
                      <option value="view">View</option>
                      <option value="comment">Comment</option>
                      <option value="edit">Edit</option>
                      <option value="admin">Admin</option>
                    </select>
                    <button className="px-3 py-2 rounded bg-emerald-600 text-white text-sm md:col-span-3">Share to Workspace</button>
                  </form>
                  <div className="overflow-x-auto rounded-lg border border-slate-200">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="bg-slate-50 text-left text-xs uppercase text-slate-500">
                          <th className="px-3 py-2 font-semibold">Document</th>
                          <th className="px-3 py-2 font-semibold">Permission</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {docs.length === 0 ? (
                          <tr>
                            <td colSpan={2} className="px-3 py-4 text-slate-500 text-center">
                              No shared documents yet. Share one from your library above.
                            </td>
                          </tr>
                        ) : (
                          docs.map((d) => (
                            <tr key={d.id} className="hover:bg-slate-50/80">
                              <td className="px-3 py-2 font-medium text-slate-800">{d.title}</td>
                              <td className="px-3 py-2 text-slate-600 capitalize">{d.permission}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-3">
                  <h2 className="font-semibold text-slate-700">Workspace Q&A (Shared Dataset)</h2>
                  <form onSubmit={askWorkspaceQuestion} className="space-y-2">
                    <textarea className="w-full border border-slate-300 rounded p-2 text-sm" rows={3} placeholder="Ask a legal question across all shared documents…" value={question} onChange={(e) => setQuestion(e.target.value)} />
                    <button className="px-3 py-2 rounded bg-indigo-600 text-white text-sm">Ask</button>
                  </form>
                  {qaResult ? (
                    <div className="border border-slate-200 rounded p-3 bg-slate-50">
                      <p className="text-sm text-slate-700 whitespace-pre-wrap">{qaResult.answer}</p>
                      <p className="mt-2 text-xs text-slate-500">Sources: {(qaResult.sources || []).length}</p>
                    </div>
                  ) : null}
                </div>

                <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-3">
                  <h2 className="font-semibold text-slate-700">Version Control + Comments + Presence</h2>

                  <div className="border border-slate-200 rounded p-3 space-y-2">
                    <h3 className="font-medium text-sm text-slate-700">Create Document Version</h3>
                    <form onSubmit={createVersion} className="space-y-2">
                      <select className="w-full border border-slate-300 rounded p-2 text-sm" value={versionDocumentId} onChange={(e) => { setVersionDocumentId(e.target.value); loadVersions(Number(e.target.value)); }}>
                        <option value="">Select shared document…</option>
                        {docs.map((d) => (
                          <option key={d.id} value={d.id}>{d.title}</option>
                        ))}
                      </select>
                      <input className="w-full border border-slate-300 rounded p-2 text-sm" placeholder="Change note" value={versionNote} onChange={(e) => setVersionNote(e.target.value)} />
                      <textarea className="w-full border border-slate-300 rounded p-2 text-sm" rows={3} placeholder="Updated content snapshot…" value={versionContent} onChange={(e) => setVersionContent(e.target.value)} />
                      <button className="px-3 py-2 rounded bg-emerald-600 text-white text-sm">Save Version</button>
                    </form>
                    <div className="space-y-1 max-h-24 overflow-y-auto">
                      {versions.map((v) => (
                        <div key={v.id} className="text-xs text-slate-600 border border-slate-100 rounded p-1.5">v{v.version_number} - {v.change_note || "No note"}</div>
                      ))}
                    </div>
                  </div>

                  <div className="border border-slate-200 rounded p-3 space-y-2">
                    <h3 className="font-medium text-sm text-slate-700">Comments</h3>
                    <form onSubmit={addComment} className="space-y-2">
                      <select className="w-full border border-slate-300 rounded p-2 text-sm" value={commentDocumentId} onChange={(e) => { setCommentDocumentId(e.target.value); loadComments(Number(e.target.value)); }}>
                        <option value="">Select shared document…</option>
                        {docs.map((d) => (
                          <option key={d.id} value={d.id}>{d.title}</option>
                        ))}
                      </select>
                      <textarea className="w-full border border-slate-300 rounded p-2 text-sm" rows={2} placeholder="Add collaboration comment…" value={commentBody} onChange={(e) => setCommentBody(e.target.value)} />
                      <button className="px-3 py-2 rounded bg-indigo-600 text-white text-sm">Add Comment</button>
                    </form>
                    <div className="space-y-1 max-h-28 overflow-y-auto">
                      {comments.map((c) => (
                        <div key={c.id} className="text-xs border border-slate-100 rounded p-1.5">
                          <div className="font-medium text-slate-700">{c.author}</div>
                          <div className="text-slate-600">{c.body}</div>
                          <button
                            type="button"
                            className="mt-1 text-indigo-600 hover:underline"
                            onClick={() => resolveComment(c.id, !c.is_resolved)}
                          >
                            Mark as {c.is_resolved ? "open" : "resolved"}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="border border-slate-200 rounded p-3 space-y-2">
                    <h3 className="font-medium text-sm text-slate-700">Real-time Presence (Heartbeat)</h3>
                    <div className="flex gap-2">
                      <select className="flex-1 border border-slate-300 rounded p-2 text-sm" value={presenceDocumentId} onChange={(e) => setPresenceDocumentId(e.target.value)}>
                        <option value="">Select shared document…</option>
                        {docs.map((d) => (
                          <option key={d.id} value={d.id}>{d.title}</option>
                        ))}
                      </select>
                      <button type="button" onClick={heartbeatAndLoadPresence} className="px-3 py-2 rounded bg-teal-600 text-white text-sm">Ping</button>
                    </div>
                    <div className="space-y-1 max-h-20 overflow-y-auto">
                      {presence.map((p) => (
                        <div key={`${p.user_id}-${p.last_seen_at}`} className="text-xs text-slate-600 border border-slate-100 rounded p-1.5">
                          {p.username} active
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </section>
            ) : null}

            {selectedWorkspace ? (
              <section className="bg-white border border-slate-200 rounded-lg p-4">
                <h2 className="font-semibold text-slate-700 mb-2">Activity Feed</h2>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {activity.length === 0 ? (
                    <p className="text-sm text-slate-500">No activity yet.</p>
                  ) : (
                    activity.map((ev) => (
                      <div key={ev.id} className="border border-slate-100 rounded p-2">
                        <div className="text-sm text-slate-700">{ev.message}</div>
                        <div className="text-xs text-slate-500">{ev.activity_type}</div>
                      </div>
                    ))
                  )}
                </div>
              </section>
            ) : null}
          </>
        )}
      </div>
    </ClientLayout>
  );
}
