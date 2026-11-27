import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { apiRequest, useApi } from '../hooks/use-api';
import { useColorScheme } from '../hooks/use-color-scheme';

type Topic = {
  id: number;
  title: string;
  category: string;
  summary: string;
  body: string[];
  sources: string[];
};

type Theme = {
  bg: string;
  cardBg: string;
  inputBg: string;
  border: string;
  text: string;
  subText: string;
  badgeBg: string;
  link: string;
  danger: string;
};

type Comment = {
  id: number;
  topic_id: number;
  author: string;
  body: string;
  created_at: string;
};

// Comments on one topic: list, add, edit, delete
function CommentsSection({ topicId, theme }: { topicId: number; theme: Theme }) {
  const { data: comments, loading, error, reload } = useApi<Comment[]>(
    `/api/topics/${topicId}/comments`,
  );
  const [author, setAuthor] = useState('');
  const [body, setBody] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editBody, setEditBody] = useState('');
  const [confirmId, setConfirmId] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const inputStyle = [
    styles.commentInput,
    { backgroundColor: theme.cardBg, borderColor: theme.border, color: theme.text },
  ];

  async function run(action: () => Promise<void>) {
    setBusy(true);
    setFormError(null);
    try {
      await action();
      reload();
    } catch (e) {
      setFormError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setBusy(false);
    }
  }

  function add() {
    if (!body.trim()) {
      setFormError('Please write a comment first.');
      return;
    }
    run(async () => {
      await apiRequest('POST', `/api/topics/${topicId}/comments`, {
        author: author.trim(),
        body: body.trim(),
      });
      setBody('');
    });
  }

  function saveEdit(id: number) {
    if (!editBody.trim()) {
      setFormError('A comment cannot be empty.');
      return;
    }
    run(async () => {
      await apiRequest('PUT', `/api/comments/${id}`, { body: editBody.trim() });
      setEditingId(null);
    });
  }

  function remove(id: number) {
    run(async () => {
      await apiRequest('DELETE', `/api/comments/${id}`);
      setConfirmId(null);
    });
  }

  return (
    <View style={[styles.commentsBox, { backgroundColor: theme.inputBg, borderColor: theme.border }]}>
      {loading && !comments && <ActivityIndicator color={theme.link} />}
      {error && (
        <Text style={[styles.commentMeta, { color: theme.danger }]}>
          Couldn't load comments. ({error})
        </Text>
      )}

      {comments && comments.length === 0 && (
        <Text style={[styles.commentMeta, { color: theme.subText }]}>
          No comments yet. Be the first to share something.
        </Text>
      )}

      {comments?.map((c) => (
        <View key={c.id} style={[styles.commentItem, { borderColor: theme.border }]}>
          <Text style={[styles.commentAuthor, { color: theme.text }]}>
            {c.author}{' '}
            <Text style={[styles.commentMeta, { color: theme.subText }]}>
              {c.created_at.slice(0, 10)}
            </Text>
          </Text>

          {editingId === c.id ? (
            <>
              <TextInput
                value={editBody}
                onChangeText={setEditBody}
                multiline
                style={[inputStyle, styles.commentMultiline]}
              />
              <View style={styles.commentActions}>
                <Pressable onPress={() => saveEdit(c.id)} disabled={busy}>
                  <Text style={[styles.commentLink, { color: theme.link }]}>Save</Text>
                </Pressable>
                <Pressable onPress={() => setEditingId(null)}>
                  <Text style={[styles.commentLink, { color: theme.subText }]}>Cancel</Text>
                </Pressable>
              </View>
            </>
          ) : (
            <>
              <Text style={[styles.commentBody, { color: theme.text }]}>{c.body}</Text>
              {confirmId === c.id ? (
                <View style={styles.commentActions}>
                  <Text style={[styles.commentMeta, { color: theme.text }]}>Delete this comment?</Text>
                  <Pressable onPress={() => remove(c.id)} disabled={busy}>
                    <Text style={[styles.commentLink, { color: theme.danger }]}>Yes, delete</Text>
                  </Pressable>
                  <Pressable onPress={() => setConfirmId(null)}>
                    <Text style={[styles.commentLink, { color: theme.subText }]}>Cancel</Text>
                  </Pressable>
                </View>
              ) : (
                <View style={styles.commentActions}>
                  <Pressable
                    onPress={() => {
                      setEditingId(c.id);
                      setEditBody(c.body);
                      setConfirmId(null);
                    }}
                  >
                    <Text style={[styles.commentLink, { color: theme.link }]}>Edit</Text>
                  </Pressable>
                  <Pressable onPress={() => setConfirmId(c.id)}>
                    <Text style={[styles.commentLink, { color: theme.danger }]}>Delete</Text>
                  </Pressable>
                </View>
              )}
            </>
          )}
        </View>
      ))}

      <Text style={[styles.commentAuthor, { color: theme.text }]}>Add a comment</Text>
      <TextInput
        value={author}
        onChangeText={setAuthor}
        placeholder="Your name (optional)"
        placeholderTextColor={theme.subText}
        style={inputStyle}
      />
      <TextInput
        value={body}
        onChangeText={setBody}
        placeholder="Share your experience or thoughts"
        placeholderTextColor={theme.subText}
        multiline
        style={[inputStyle, styles.commentMultiline]}
      />
      {formError && <Text style={[styles.commentMeta, { color: theme.danger }]}>{formError}</Text>}
      <Pressable
        onPress={add}
        disabled={busy}
        style={[styles.commentButton, { backgroundColor: theme.link, opacity: busy ? 0.6 : 1 }]}
      >
        <Text style={styles.commentButtonText}>{busy ? 'Posting...' : 'Post comment'}</Text>
      </Pressable>
    </View>
  );
}

type TopicValues = {
  title: string;
  category: string;
  summary: string;
  body: string[];
  sources: string[];
};

// Add / edit form for a topic
function TopicForm({
  initial,
  theme,
  onSave,
  onCancel,
}: {
  initial?: Topic;
  theme: Theme;
  onSave: (values: TopicValues) => Promise<void>;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [category, setCategory] = useState(initial?.category ?? '');
  const [summary, setSummary] = useState(initial?.summary ?? '');
  const [body, setBody] = useState((initial?.body ?? []).join('\n\n'));
  const [sources, setSources] = useState((initial?.sources ?? []).join('\n'));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    if (!title.trim() || !category.trim() || !summary.trim()) {
      setError('Please fill in the title, category, and summary.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await onSave({
        title: title.trim(),
        category: category.trim(),
        summary: summary.trim(),
        // a blank line starts a new paragraph
        body: body.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean),
        // one source per line
        sources: sources.split('\n').map((x) => x.trim()).filter(Boolean),
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
      setSaving(false);
    }
  }

  const inputStyle = [
    styles.formInput,
    { backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.text },
  ];

  return (
    <View style={[styles.formBox, { backgroundColor: theme.cardBg }]}>
      <Text style={[styles.formTitle, { color: theme.text }]}>
        {initial ? 'Edit topic' : 'Add a topic'}
      </Text>

      <Text style={[styles.formLabel, { color: theme.subText }]}>Title</Text>
      <TextInput value={title} onChangeText={setTitle} placeholder="Topic title" placeholderTextColor={theme.subText} style={inputStyle} />

      <Text style={[styles.formLabel, { color: theme.subText }]}>Category</Text>
      <TextInput value={category} onChangeText={setCategory} placeholder="Basics, Sensory, Daily life..." placeholderTextColor={theme.subText} style={inputStyle} />

      <Text style={[styles.formLabel, { color: theme.subText }]}>Summary</Text>
      <TextInput value={summary} onChangeText={setSummary} placeholder="One or two sentences" placeholderTextColor={theme.subText} multiline style={[inputStyle, styles.formMultiline]} />

      <Text style={[styles.formLabel, { color: theme.subText }]}>Full text (leave a blank line between paragraphs)</Text>
      <TextInput value={body} onChangeText={setBody} placeholder="Write the full topic here" placeholderTextColor={theme.subText} multiline style={[inputStyle, styles.formTall]} />

      <Text style={[styles.formLabel, { color: theme.subText }]}>Sources (one per line)</Text>
      <TextInput value={sources} onChangeText={setSources} placeholder="CDC: Signs and Symptoms of Autism" placeholderTextColor={theme.subText} multiline autoCapitalize="none" style={[inputStyle, styles.formMultiline]} />

      {error && <Text style={[styles.formError, { color: theme.danger }]}>{error}</Text>}

      <View style={styles.topicActions}>
        <Pressable onPress={submit} disabled={saving} style={[styles.formButton, { backgroundColor: theme.link, opacity: saving ? 0.6 : 1 }]}>
          <Text style={styles.formButtonText}>{saving ? 'Saving...' : 'Save'}</Text>
        </Pressable>
        <Pressable onPress={onCancel} disabled={saving}>
          <Text style={[styles.actionLink, { color: theme.subText }]}>Cancel</Text>
        </Pressable>
      </View>
    </View>
  );
}

function TopicDropdownCard({
  topic,
  theme,
  confirming,
  onEdit,
  onAskDelete,
  onCancelDelete,
  onConfirmDelete,
}: {
  topic: Topic;
  theme: Theme;
  confirming: boolean;
  onEdit: () => void;
  onAskDelete: () => void;
  onCancelDelete: () => void;
  onConfirmDelete: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [showComments, setShowComments] = useState(false);

  return (
    <View style={[styles.section, { backgroundColor: theme.cardBg }]}>
      <View style={[styles.badge, { backgroundColor: theme.badgeBg }]}>
        <Text style={[styles.badgeText, { color: theme.link }]}>
          {topic.category}
        </Text>
      </View>

      <Text style={[styles.topicTitle, { color: theme.text }]}>
        {topic.title}
      </Text>
      <Text style={[styles.topicSummary, { color: theme.subText }]}>
        {topic.summary}
      </Text>

      <Pressable
        style={[
          styles.dropdownHeader,
          { backgroundColor: theme.inputBg, borderColor: theme.border },
        ]}
        onPress={() => setExpanded((prev) => !prev)}
      >
        <Text style={[styles.dropdownHeaderText, { color: theme.text }]}>
          {expanded ? 'Hide Details' : 'Read Full Topic'}
        </Text>
        <Text style={[styles.dropdownArrow, { color: theme.subText }]}>
          {expanded ? '▲' : '▼'}
        </Text>
      </Pressable>

      {expanded && (
        <View
          style={[
            styles.dropdownBody,
            { backgroundColor: theme.inputBg, borderColor: theme.border },
          ]}
        >
          {topic.body.map((paragraph, index) => (
            <Text
              key={`${topic.id}-p-${index}`}
              style={[styles.paragraphText, { color: theme.text }]}
            >
              {paragraph}
            </Text>
          ))}
        </View>
      )}

      <Pressable
        style={[
          styles.dropdownHeader,
          { backgroundColor: theme.inputBg, borderColor: theme.border },
        ]}
        onPress={() => setShowComments((prev) => !prev)}
      >
        <Text style={[styles.dropdownHeaderText, { color: theme.text }]}>
          {showComments ? 'Hide Comments' : 'Comments'}
        </Text>
        <Text style={[styles.dropdownArrow, { color: theme.subText }]}>
          {showComments ? '▲' : '▼'}
        </Text>
      </Pressable>

      {showComments && <CommentsSection topicId={topic.id} theme={theme} />}

      {confirming ? (
        <View style={styles.topicActions}>
          <Text style={[styles.confirmText, { color: theme.text }]}>Delete this topic and its comments?</Text>
          <Pressable onPress={onConfirmDelete}>
            <Text style={[styles.actionLink, { color: theme.danger }]}>Yes, delete</Text>
          </Pressable>
          <Pressable onPress={onCancelDelete}>
            <Text style={[styles.actionLink, { color: theme.subText }]}>Cancel</Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.topicActions}>
          <Pressable onPress={onEdit}>
            <Text style={[styles.actionLink, { color: theme.link }]}>Edit topic</Text>
          </Pressable>
          <Pressable onPress={onAskDelete}>
            <Text style={[styles.actionLink, { color: theme.danger }]}>Delete topic</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

export default function Glossary() {
  const isDark = (useColorScheme() ?? 'light') === 'dark';

  const theme: Theme = {
    bg: isDark ? '#000000' : '#FFFFFF',
    cardBg: isDark ? '#121212' : '#F4F4F5',
    inputBg: isDark ? '#1E1E22' : '#FFFFFF',
    border: isDark ? '#2E2E34' : '#D4D4D8',
    text: isDark ? '#FFFFFF' : '#000000',
    subText: isDark ? '#A1A1AA' : '#52525B',
    badgeBg: isDark ? '#1E293B' : '#DBEAFE',
    link: isDark ? '#60A5FA' : '#2563EB',
    danger: isDark ? '#F87171' : '#DC2626',
  };

  const { data: topics, loading, error, reload } = useApi<Topic[]>('/api/topics');

  // 'new' = add form open, a number = that topic is being edited
  const [editing, setEditing] = useState<number | 'new' | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  async function save(id: number | 'new', values: TopicValues) {
    if (id === 'new') {
      await apiRequest('POST', '/api/topics', values);
    } else {
      await apiRequest('PUT', `/api/topics/${id}`, values);
    }
    setEditing(null);
    reload();
  }

  async function remove(id: number) {
    setActionError(null);
    try {
      await apiRequest('DELETE', `/api/topics/${id}`);
      setConfirmDeleteId(null);
      reload();
    } catch (e) {
      setActionError(e instanceof Error ? e.message : 'Could not delete that topic');
    }
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.bg }}
      contentContainerStyle={styles.scrollContainer}
    >
      <View style={styles.mainWrapper}>
        <Text style={[styles.pageTitle, { color: theme.text }]}>
          Topics & Experiences
        </Text>

        {loading && !topics && <ActivityIndicator color={theme.link} />}

        {error && (
          <View style={[styles.statusBox, { backgroundColor: theme.cardBg }]}>
            <Text style={[styles.statusText, { color: theme.text }]}>
              Couldn't load topics. Make sure the API is running. ({error})
            </Text>
            <Pressable onPress={reload}>
              <Text style={[styles.retryText, { color: theme.link }]}>Try again</Text>
            </Pressable>
          </View>
        )}

        {actionError && (
          <Text style={[styles.formError, { color: theme.danger }]}>{actionError}</Text>
        )}

        {topics && editing === 'new' && (
          <TopicForm theme={theme} onSave={(values) => save('new', values)} onCancel={() => setEditing(null)} />
        )}
        {topics && editing !== 'new' && (
          <Pressable
            onPress={() => {
              setEditing('new');
              setConfirmDeleteId(null);
            }}
            style={[styles.formButton, styles.addButton, { backgroundColor: theme.link }]}
          >
            <Text style={styles.formButtonText}>+ Add topic</Text>
          </Pressable>
        )}

        {topics?.map((topic) =>
          editing === topic.id ? (
            <TopicForm
              key={topic.id}
              initial={topic}
              theme={theme}
              onSave={(values) => save(topic.id, values)}
              onCancel={() => setEditing(null)}
            />
          ) : (
            <TopicDropdownCard
              key={topic.id}
              topic={topic}
              theme={theme}
              confirming={confirmDeleteId === topic.id}
              onEdit={() => {
                setEditing(topic.id);
                setConfirmDeleteId(null);
              }}
              onAskDelete={() => setConfirmDeleteId(topic.id)}
              onCancelDelete={() => setConfirmDeleteId(null)}
              onConfirmDelete={() => remove(topic.id)}
            />
          ),
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  statusBox: {
    width: '100%',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    gap: 10,
  },
  statusText: {
    fontSize: 15,
    textAlign: 'center',
  },
  retryText: {
    fontSize: 15,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  scrollContainer: {
    alignItems: 'center', // centers mainWrapper horizontally
    paddingTop: 20,
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  mainWrapper: {
    width: '100%',
    maxWidth: 720,
    gap: 20,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  section: {
    width: '100%',
    padding: 22,
    borderRadius: 12,
    alignItems: 'center',
    gap: 10,
  },
  badge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 999,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  topicTitle: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
  },
  topicSummary: {
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 4,
  },
  dropdownHeader: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  dropdownHeaderText: {
    fontSize: 15,
    fontWeight: '600',
  },
  dropdownArrow: {
    fontSize: 12,
  },
  dropdownBody: {
    width: '100%',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    gap: 12,
  },
  paragraphText: {
    fontSize: 15,
    lineHeight: 23,
    textAlign: 'left',
  },
  // ----- comments -----
  commentsBox: {
    width: '100%',
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    gap: 10,
  },
  commentItem: {
    borderBottomWidth: 1,
    paddingBottom: 10,
    gap: 4,
  },
  commentAuthor: {
    fontSize: 14,
    fontWeight: '700',
  },
  commentMeta: {
    fontSize: 12,
    fontWeight: '400',
  },
  commentBody: {
    fontSize: 14,
    lineHeight: 21,
  },
  commentActions: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 14,
    marginTop: 2,
  },
  commentLink: {
    fontSize: 13,
    fontWeight: '600',
  },
  commentInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
    fontSize: 14,
  },
  commentMultiline: {
    minHeight: 70,
    textAlignVertical: 'top',
  },
  commentButton: {
    alignSelf: 'flex-start',
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  commentButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  // ----- topic forms -----
  formBox: {
    width: '100%',
    padding: 20,
    borderRadius: 12,
    gap: 4,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  formLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 8,
    marginBottom: 4,
  },
  formInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    fontSize: 15,
  },
  formMultiline: {
    minHeight: 70,
    textAlignVertical: 'top',
  },
  formTall: {
    minHeight: 180,
    textAlignVertical: 'top',
  },
  formError: {
    fontSize: 14,
    marginTop: 8,
  },
  formButton: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
    alignItems: 'center',
  },
  formButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  addButton: {
    alignSelf: 'flex-start',
  },
  topicActions: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 16,
    marginTop: 6,
  },
  actionLink: {
    fontSize: 15,
    fontWeight: '600',
  },
  confirmText: {
    fontSize: 15,
  },
});