import React, { useState, useMemo, useEffect, useRef } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

const Kanban = ({
  ideas,
  setIdeas,
  boardConfig,
  getIdeaStatus,
  deriveTags,
  getPriorityLevel,
  getStatusClass,
  handleUpvote
  , apiBase, apiToken
}) => {
  const [selected, setSelected] = useState(null);
  const [comments, setComments] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [newAttachmentUrl, setNewAttachmentUrl] = useState('');
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingCommentText, setEditingCommentText] = useState('');
  const columns = useMemo(() => boardConfig.map(col => ({
    ...col,
    ideas: ideas.filter(i => (i.status || getIdeaStatus(i)) === col.status)
  })), [boardConfig, ideas, getIdeaStatus]);

  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId) return;

    const ideaId = Number(draggableId);
    const targetCol = boardConfig.find(c => c.id === destination.droppableId);
    if (!targetCol) return;

    // update locally
    setIdeas(prev => prev.map(item => item.id === ideaId ? { ...item, status: targetCol.status, tags: item.tags?.length ? item.tags : deriveTags(item) } : item));

    // persist to API if available
    if (typeof apiBase === 'string' && apiBase.length && apiToken) {
      try {
        await fetch(`${apiBase}/tasks/${ideaId}/move`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiToken}` },
          body: JSON.stringify({ board_id: prevBoardIdForIdea(ideaId) || null, status: targetCol.status })
        });
      } catch (err) {
        console.error('Failed to persist move', err);
      }
    }
  };

  const moveIdeaToColumn = async (ideaId, targetCol) => {
    if (!targetCol) return;
    setIdeas(prev => prev.map(item => item.id === ideaId ? { ...item, status: targetCol.status } : item));
    if (apiBase && apiToken) {
      try {
        await fetch(`${apiBase}/tasks/${ideaId}/move`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiToken}` },
          body: JSON.stringify({ board_id: prevBoardIdForIdea(ideaId) || null, status: targetCol.status })
        });
      } catch (err) { console.error('move persist failed', err); }
    }
  };

  // helper to find board_id from current ideas
  const prevBoardIdForIdea = (id) => {
    const found = ideas.find(i => i.id === id);
    return found ? found.board_id : null;
  };

  const moveLeft = (idea) => {
    const idx = boardConfig.findIndex(c => c.status === (idea.status || getIdeaStatus(idea)));
    if (idx > 0) moveIdeaToColumn(idea.id, boardConfig[idx - 1]);
  };

  const moveRight = (idea) => {
    const idx = boardConfig.findIndex(c => c.status === (idea.status || getIdeaStatus(idea)));
    if (idx < boardConfig.length - 1) moveIdeaToColumn(idea.id, boardConfig[idx + 1]);
  };

  const modalRef = useRef(null);

  const loadDetails = async (ideaId) => {
    if (!apiBase) return;
    try {
      const [cRes, aRes] = await Promise.all([
        fetch(`${apiBase}/tasks/${ideaId}/comments`),
        fetch(`${apiBase}/tasks/${ideaId}/attachments`)
      ]);
      if (cRes.ok) setComments(await cRes.json());
      if (aRes.ok) setAttachments(await aRes.json());
    } catch (err) {
      console.error('Failed to load details', err);
    }
  };

  const openEditor = (idea) => {
    setSelected(idea);
    loadDetails(idea.id);
  };
  const closeEditor = () => setSelected(null);

  const saveEditor = (updated) => {
    setIdeas(prev => prev.map(i => i.id === updated.id ? { ...i, ...updated } : i));
    // persist update
    if (typeof apiBase === 'string' && apiBase.length && apiToken) {
      fetch(`${apiBase}/tasks/${updated.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiToken}` },
        body: JSON.stringify(updated)
      }).catch(err => console.error('Save task failed', err));
    }
    closeEditor();
  };

  const postComment = async (taskId, body) => {
    if (!apiBase || !apiToken) return;
    try {
      const res = await fetch(`${apiBase}/tasks/${taskId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiToken}` },
        body: JSON.stringify({ body })
      });
      if (res.ok) {
        const comment = await res.json();
        setComments(prev => [...prev, comment]);
        setNewComment('');
      }
    } catch (err) { console.error(err); }
  };

  // post reply to a comment
  const postReply = async (taskId, parentId, body) => {
    if (!apiBase || !apiToken) return;
    try {
      const res = await fetch(`${apiBase}/tasks/${taskId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiToken}` },
        body: JSON.stringify({ body, parent_id: parentId })
      });
      if (res.ok) {
        const comment = await res.json();
        setComments(prev => [...prev, comment]);
      }
    } catch (err) { console.error(err); }
  };

  const startEditComment = (c) => {
    setEditingCommentId(c.id);
    setEditingCommentText(c.body);
  };

  const cancelEditComment = () => {
    setEditingCommentId(null);
    setEditingCommentText('');
  };

  const saveEditedComment = async (id) => {
    if (!apiBase || !apiToken) return;
    try {
      const res = await fetch(`${apiBase}/comments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiToken}` },
        body: JSON.stringify({ body: editingCommentText })
      });
      if (res.ok) {
        const updated = await res.json();
        setComments(prev => prev.map(c => c.id === id ? updated : c));
        cancelEditComment();
      } else {
        const err = await res.json();
        console.error('Edit failed', err);
      }
    } catch (err) { console.error('Edit request failed', err); }
  };

  const deleteComment = async (id) => {
    // Deletion disabled by policy: keep history and only allow adding/moving.
    console.warn('Delete comment is disabled; operation skipped for safety.');
    return;
  };

  const deleteAttachment = async (id) => {
    // Deletion disabled: keep attachments intact. No-op.
    console.warn('Delete attachment is disabled; operation skipped for safety.');
    return;
  };

  const postAttachment = async (taskId, url) => {
    if (!apiBase || !apiToken) return;
    try {
      const res = await fetch(`${apiBase}/tasks/${taskId}/attachments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiToken}` },
        body: JSON.stringify({ url })
      });
      if (res.ok) {
        const att = await res.json();
        setAttachments(prev => [...prev, att]);
        setNewAttachmentUrl('');
      }
    } catch (err) { console.error(err); }
  };

  // Focus trap for modal
  useEffect(() => {
    if (!selected) return;
    const el = modalRef.current;
    if (!el) return;
    const focusable = el.querySelectorAll('a, button, input, textarea, [tabindex]:not([tabindex="-1"])');
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    function keyHandler(e) {
      if (e.key === 'Escape') { setSelected(null); }
      if (e.key === 'Tab') {
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault(); last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault(); first.focus();
        }
      }
    }
    first && first.focus();
    document.addEventListener('keydown', keyHandler);
    return () => document.removeEventListener('keydown', keyHandler);
  }, [selected]);

  return (
    <section className="board-section">
      <div className="board-shell container">
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="board-layout">
            <div className="board-columns">
              {columns.map((column, colIndex) => (
                <Droppable key={column.id} droppableId={column.id}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`board-column ${column.accent}`}
                    >
                      <div className="column-header">
                        <div>
                          <h3>{column.title}</h3>
                          <small>{column.subtitle}</small>
                        </div>
                        <span className="column-count">{column.ideas.length}</span>
                      </div>

                      <div className="ideas-feed">
                        {column.ideas.length === 0 ? (
                          <div className="empty-column"><p>No ideas here yet.</p></div>
                        ) : (
                          column.ideas.map((idea, index) => {
                            const status = getIdeaStatus(idea);
                            return (
                              <Draggable key={idea.id} draggableId={String(idea.id)} index={index}>
                                {(draggableProvided, snapshot) => (
                                  <article
                                    ref={draggableProvided.innerRef}
                                    {...draggableProvided.draggableProps}
                                    {...draggableProvided.dragHandleProps}
                                    className={`idea-card status-${getStatusClass(status)} ${snapshot.isDragging ? 'dragging' : ''}`}
                                    onClick={() => openEditor(idea)}
                                    tabIndex={0}
                                    role="button"
                                    aria-label={`Open ${idea.title} details`}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') openEditor(idea);
                                      if (e.key === 'ArrowLeft') { e.stopPropagation(); moveLeft(idea); }
                                      if (e.key === 'ArrowRight') { e.stopPropagation(); moveRight(idea); }
                                    }}
                                  >
                                    <div className="idea-topline">
                                      <span className="category">{idea.category}</span>
                                      <span className="status-pill">{status}</span>
                                    </div>

                                    <div className="idea-meta-row">
                                      <span className={`priority-badge priority-${getPriorityLevel(idea).toLowerCase()}`}>
                                        {getPriorityLevel(idea)} priority
                                      </span>
                                    </div>

                                    <div className="tag-row">
                                      {(idea.tags || deriveTags(idea)).map(tag => (
                                        <span key={tag} className="tag-chip">{tag}</span>
                                      ))}
                                    </div>

                                    <h4>{idea.title}</h4>
                                    <p>{idea.description}</p>
                                    <div className="idea-footer">
                                      <div className="card-controls" onClick={(e) => e.stopPropagation()}>
                                        <button type="button" onClick={(e) => { e.stopPropagation(); moveLeft(idea); }} title="Move left">◀</button>
                                        <button type="button" onClick={(e) => { e.stopPropagation(); moveRight(idea); }} title="Move right">▶</button>
                                        <button type="button" className="btn-upvote" onClick={(e) => { e.stopPropagation(); handleUpvote(idea.id); }} title="Upvote">
                                          ▲ <span className="vote-count">{idea.votes}</span>
                                        </button>
                                        <button type="button" className="btn-reset" onClick={(e) => { e.stopPropagation(); if (confirm('Reset votes for this idea?')) handleResetVotes(idea.id); }} title="Reset votes">Reset</button>
                                      </div>
                                      <span className="timestamp" title={new Date(idea.created_at).toLocaleString()}>{new Date(idea.created_at).toLocaleString()}</span>
                                    </div>
                                  </article>
                                )}
                              </Draggable>
                            );
                          })
                        )}
                        {provided.placeholder}
                      </div>
                    </div>
                  )}
                </Droppable>
              ))}
            </div>
          </div>
        </DragDropContext>
      </div>

      {selected && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-panel" ref={modalRef}>
            <h3>Edit task</h3>
            <label>Title</label>
            <input value={selected.title} onChange={(e) => setSelected({ ...selected, title: e.target.value })} />

            <label>Description</label>
            <textarea value={selected.description} onChange={(e) => setSelected({ ...selected, description: e.target.value })} rows={4} />

            <label>Labels (comma separated)</label>
            <input
              value={selected.labels ? (typeof selected.labels === 'string' ? JSON.parse(selected.labels).join(', ') : selected.labels.join(', ')) : (selected.tags ? selected.tags.join(', ') : '')}
              onChange={(e) => {
                const raw = e.target.value;
                const arr = raw.split(',').map(s => s.trim()).filter(Boolean);
                setSelected({ ...selected, labels: arr });
              }}
            />

            <label>Due date</label>
            <input type="date" value={selected.due_date || ''} onChange={(e) => setSelected({ ...selected, due_date: e.target.value })} />

            <div className="attachments-section">
              <h4>Attachments</h4>
              <ul>
                {attachments.map(a => (
                  <li key={a.id} style={{display:'flex', alignItems:'center', justifyContent:'space-between'}}>
                    <a href={a.url} target="_blank" rel="noreferrer">{a.filename || a.url}</a>
                    <div style={{display:'flex', gap:8}}>
                      <span style={{opacity:0.8}}>—</span>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="attachment-add">
                <input placeholder="Attachment URL" value={newAttachmentUrl} onChange={(e) => setNewAttachmentUrl(e.target.value)} />
                <button onClick={() => postAttachment(selected.id, newAttachmentUrl)}>Add</button>
              </div>
              <div style={{marginTop:8}}>
                <label style={{display:'block', marginBottom:6}}>Upload file</label>
                <input type="file" onChange={async (e) => {
                  const f = e.target.files && e.target.files[0];
                  if (!f || !apiBase || !apiToken) return;
                  const fd = new FormData(); fd.append('file', f);
                  try {
                    const res = await fetch(`${apiBase}/tasks/${selected.id}/attachments/upload`, { method: 'POST', body: fd, headers: { 'Authorization': `Bearer ${apiToken}` } });
                    if (res.ok) { const att = await res.json(); setAttachments(prev => [...prev, att]); }
                  } catch (err) { console.error('upload failed', err); }
                }} />
              </div>
            </div>

            <div className="comments-section">
              <h4>Comments</h4>
              <div className="comments-list">
                      {comments.filter(c => !c.parent_id).map(c => (
                        <div key={c.id} className="comment-item">
                          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                            <div><strong>{c.username || 'User'}</strong></div>
                            <div style={{display:'flex', gap:8}}>
                              <button onClick={(e) => { e.stopPropagation(); startEditComment(c); }}>Edit</button>
                            </div>
                          </div>
                          {editingCommentId === c.id ? (
                            <div>
                              <textarea value={editingCommentText} onChange={(e) => setEditingCommentText(e.target.value)} />
                              <div style={{display:'flex', gap:8}}>
                                <button onClick={() => saveEditedComment(c.id)}>Save</button>
                                <button onClick={cancelEditComment}>Cancel</button>
                              </div>
                            </div>
                          ) : (
                            <div>{c.body}</div>
                          )}
                          <small>{new Date(c.created_at).toLocaleString()}</small>
                          <div className="replies">
                            {comments.filter(r => r.parent_id === c.id).map(r => (
                              <div key={r.id} className="comment-reply">
                                <div style={{display:'flex', justifyContent:'space-between'}}>
                                  <strong>{r.username || 'User'}</strong>
                                  <div style={{display:'flex', gap:8}}>
                                    <button onClick={(e) => { e.stopPropagation(); startEditComment(r); }}>Edit</button>
                                  </div>
                                </div>
                                {editingCommentId === r.id ? (
                                  <div>
                                    <textarea value={editingCommentText} onChange={(e) => setEditingCommentText(e.target.value)} />
                                    <div style={{display:'flex', gap:8}}>
                                      <button onClick={() => saveEditedComment(r.id)}>Save</button>
                                      <button onClick={cancelEditComment}>Cancel</button>
                                    </div>
                                  </div>
                                ) : (
                                  <div>{r.body}</div>
                                )}
                                <small>{new Date(r.created_at).toLocaleString()}</small>
                              </div>
                            ))}
                            <div className="reply-input">
                              <input placeholder="Reply..." onKeyDown={(e) => {
                                if (e.key === 'Enter') { postReply(selected.id, c.id, e.target.value); e.target.value = ''; }
                              }} />
                            </div>
                          </div>
                        </div>
                      ))}
              </div>
              <textarea placeholder="Add a comment" value={newComment} onChange={(e) => setNewComment(e.target.value)} />
              <button onClick={() => postComment(selected.id, newComment)}>Post comment</button>
            </div>

            <div className="modal-actions">
              <button onClick={() => {
                // prepare labels array for save
                const labelsArr = Array.isArray(selected.labels) ? selected.labels : (selected.labels ? (typeof selected.labels === 'string' ? JSON.parse(selected.labels) : selected.labels) : (selected.tags || []));
                saveEditor({ ...selected, labels: labelsArr, due_date: selected.due_date });
              }}>Save</button>
              <button onClick={closeEditor}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Kanban;
