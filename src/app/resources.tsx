import { useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { apiRequest, useApi } from '../hooks/use-api';
import { useColorScheme } from '../hooks/use-color-scheme';

type Resource = {
  id: number;
  name: string;
  description: string;
  url: string;
};

type ResourceValues = Omit<Resource, 'id'>;

type Theme = {
  bg: string;
  cardBg: string;
  inputBg: string;
  border: string;
  text: string;
  subText: string;
  link: string;
  danger: string;
};

function openExternalUrl(url: string) {
  if (Platform.OS === 'web') {
    window.open(url, '_blank', 'noopener,noreferrer');
  } else {
    Linking.openURL(url);
  }
}

// Add / edit form
function ResourceForm({
  initial,
  theme,
  onSave,
  onCancel,
}: {
  initial?: Resource;
  theme: Theme;
  onSave: (values: ResourceValues) => Promise<void>;
  onCancel: () => void;
}) {
  const [name, setName] = useState(initial?.name ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [url, setUrl] = useState(initial?.url ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    if (!name.trim() || !description.trim() || !url.trim()) {
      setError('Please fill in the name, description, and website.');
      return;
    }
    const cleanUrl = /^https?:\/\//i.test(url.trim()) ? url.trim() : `https://${url.trim()}`;
    setSaving(true);
    setError(null);
    try {
      await onSave({ name: name.trim(), description: description.trim(), url: cleanUrl });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
      setSaving(false);
    }
  }

  const inputStyle = [
    styles.input,
    { backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.text },
  ];

  return (
    <View
      style={[styles.resourceBox, { backgroundColor: theme.inputBg, borderColor: theme.border }]}
    >
      <Text style={[styles.formTitle, { color: theme.text }]}>
        {initial ? 'Edit resource' : 'Add a resource'}
      </Text>

      <Text style={[styles.label, { color: theme.subText }]}>Name</Text>
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="Organization name"
        placeholderTextColor={theme.subText}
        style={inputStyle}
      />

      <Text style={[styles.label, { color: theme.subText }]}>Description</Text>
      <TextInput
        value={description}
        onChangeText={setDescription}
        placeholder="What this resource offers"
        placeholderTextColor={theme.subText}
        multiline
        style={[inputStyle, styles.multiline]}
      />

      <Text style={[styles.label, { color: theme.subText }]}>Website</Text>
      <TextInput
        value={url}
        onChangeText={setUrl}
        placeholder="https://example.org"
        placeholderTextColor={theme.subText}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="url"
        style={inputStyle}
      />

      {error && <Text style={[styles.errorText, { color: theme.danger }]}>{error}</Text>}

      <View style={styles.actionRow}>
        <Pressable onPress={submit} disabled={saving} style={[styles.primaryButton, { backgroundColor: theme.link, opacity: saving ? 0.6 : 1 }]}>
          <Text style={styles.primaryButtonText}>{saving ? 'Saving...' : 'Save'}</Text>
        </Pressable>
        <Pressable onPress={onCancel} disabled={saving}>
          <Text style={[styles.actionLink, { color: theme.subText }]}>Cancel</Text>
        </Pressable>
      </View>
    </View>
  );
}

function ResourceDropdownCard({
  resource,
  theme,
  confirming,
  onEdit,
  onAskDelete,
  onCancelDelete,
  onConfirmDelete,
}: {
  resource: Resource;
  theme: Theme;
  confirming: boolean;
  onEdit: () => void;
  onAskDelete: () => void;
  onCancelDelete: () => void;
  onConfirmDelete: () => void;
}) {
  const [expanded, setExpanded] = useState(true);

  return (
    <View
      style={[styles.resourceBox, { backgroundColor: theme.inputBg, borderColor: theme.border }]}
    >
      <Pressable style={styles.resourceHeader} onPress={() => setExpanded((prev) => !prev)}>
        <Text style={[styles.resourceTitle, { color: theme.text }]}>{resource.name}</Text>
        <Text style={[styles.dropdownArrow, { color: theme.subText }]}>
          {expanded ? '▲' : '▼'}
        </Text>
      </Pressable>

      {expanded && (
        <View style={styles.resourceContent}>
          <Text style={[styles.descriptionText, { color: theme.subText }]}>
            {resource.description}
          </Text>
          <Pressable
            onPress={() => openExternalUrl(resource.url)}
            style={({ pressed }) => [styles.linkButton, { opacity: pressed ? 0.6 : 1 }]}
          >
            <Text style={[styles.linkText, { color: theme.link }]}>Visit Website →</Text>
          </Pressable>

          {confirming ? (
            <View style={styles.actionRow}>
              <Text style={[styles.confirmText, { color: theme.text }]}>Delete this resource?</Text>
              <Pressable onPress={onConfirmDelete}>
                <Text style={[styles.actionLink, { color: theme.danger }]}>Yes, delete</Text>
              </Pressable>
              <Pressable onPress={onCancelDelete}>
                <Text style={[styles.actionLink, { color: theme.subText }]}>Cancel</Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.actionRow}>
              <Pressable onPress={onEdit}>
                <Text style={[styles.actionLink, { color: theme.link }]}>Edit</Text>
              </Pressable>
              <Pressable onPress={onAskDelete}>
                <Text style={[styles.actionLink, { color: theme.danger }]}>Delete</Text>
              </Pressable>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

export default function ResourcesScreen() {
  const isDark = (useColorScheme() ?? 'light') === 'dark';

  const theme: Theme = {
    bg: isDark ? '#000000' : '#FFFFFF',
    cardBg: isDark ? '#121212' : '#F4F4F5',
    inputBg: isDark ? '#1E1E22' : '#FFFFFF',
    border: isDark ? '#2E2E34' : '#D4D4D8',
    text: isDark ? '#FFFFFF' : '#000000',
    subText: isDark ? '#A1A1AA' : '#52525B',
    link: isDark ? '#60A5FA' : '#2563EB',
    danger: isDark ? '#F87171' : '#DC2626',
  };

  const { data, loading, error, reload } = useApi<{
    resources: Resource[];
    disclaimer: string;
  }>('/api/resources');

  // 'new' = add form open, a number = that resource is being edited
  const [editing, setEditing] = useState<number | 'new' | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  async function save(id: number | 'new', values: ResourceValues) {
    if (id === 'new') {
      await apiRequest('POST', '/api/resources', values);
    } else {
      await apiRequest('PUT', `/api/resources/${id}`, values);
    }
    setEditing(null);
    reload();
  }

  async function remove(id: number) {
    setActionError(null);
    try {
      await apiRequest('DELETE', `/api/resources/${id}`);
      setConfirmDeleteId(null);
      reload();
    } catch (e) {
      setActionError(e instanceof Error ? e.message : 'Could not delete that resource');
    }
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.bg }}
      contentContainerStyle={styles.scrollContainer}
    >
      <View style={styles.mainWrapper}>
        <Text style={[styles.pageTitle, { color: theme.text }]}>
          Helpful Resources & Where I got the Icons
        </Text>
        <Text style={[styles.pageSubtitle, { color: theme.subText }]}>
          Trusted advocacy groups and research organizations for further reading.
        </Text>

        {loading && !data && <ActivityIndicator color={theme.link} />}

        {error && (
          <View style={[styles.statusBox, { backgroundColor: theme.cardBg }]}>
            <Text style={[styles.statusText, { color: theme.text }]}>
              Couldn't load resources. Make sure the API is running. ({error})
            </Text>
            <Pressable onPress={reload}>
              <Text style={[styles.retryText, { color: theme.link }]}>Try again</Text>
            </Pressable>
          </View>
        )}

        {actionError && (
          <Text style={[styles.errorText, { color: theme.danger }]}>{actionError}</Text>
        )}

        {data && (
          <View style={[styles.section, { backgroundColor: theme.cardBg }]}>
            {editing === 'new' ? (
              <ResourceForm
                theme={theme}
                onSave={(values) => save('new', values)}
                onCancel={() => setEditing(null)}
              />
            ) : (
              <Pressable
                onPress={() => {
                  setEditing('new');
                  setConfirmDeleteId(null);
                }}
                style={[styles.primaryButton, styles.addButton, { backgroundColor: theme.link }]}
              >
                <Text style={styles.primaryButtonText}>+ Add resource</Text>
              </Pressable>
            )}

            {data.resources.map((resource) =>
              editing === resource.id ? (
                <ResourceForm
                  key={resource.id}
                  initial={resource}
                  theme={theme}
                  onSave={(values) => save(resource.id, values)}
                  onCancel={() => setEditing(null)}
                />
              ) : (
                <ResourceDropdownCard
                  key={resource.id}
                  resource={resource}
                  theme={theme}
                  confirming={confirmDeleteId === resource.id}
                  onEdit={() => {
                    setEditing(resource.id);
                    setConfirmDeleteId(null);
                  }}
                  onAskDelete={() => setConfirmDeleteId(resource.id)}
                  onCancelDelete={() => setConfirmDeleteId(null)}
                  onConfirmDelete={() => remove(resource.id)}
                />
              ),
            )}
          </View>
        )}

        {data?.disclaimer ? (
          <View
            style={[
              styles.disclaimerBox,
              { backgroundColor: theme.cardBg, borderColor: theme.border },
            ]}
          >
            <Text style={[styles.disclaimerText, { color: theme.subText }]}>
              {data.disclaimer}
            </Text>
          </View>
        ) : null}
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
    flexGrow: 1,
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  mainWrapper: {
    width: '100%',
    maxWidth: 720,
    gap: 16,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  pageSubtitle: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 8,
  },
  section: {
    width: '100%',
    padding: 20,
    borderRadius: 12,
    gap: 12,
  },
  resourceBox: {
    width: '100%',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  resourceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resourceTitle: {
    fontSize: 17,
    fontWeight: '700',
    flex: 1,
    paddingRight: 10,
  },
  dropdownArrow: {
    fontSize: 12,
  },
  resourceContent: {
    marginTop: 10,
    gap: 10,
  },
  descriptionText: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'left',
  },
  linkButton: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
  },
  linkText: {
    fontSize: 15,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  disclaimerBox: {
    width: '100%',
    padding: 16,
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 8,
  },
  disclaimerText: {
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
  },
  // ----- CRUD additions -----
  formTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 8,
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    fontSize: 15,
  },
  multiline: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  errorText: {
    fontSize: 14,
    marginTop: 8,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 16,
    marginTop: 8,
  },
  actionLink: {
    fontSize: 15,
    fontWeight: '600',
  },
  confirmText: {
    fontSize: 15,
  },
  primaryButton: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
    alignItems: 'center',
  },
  addButton: {
    alignSelf: 'flex-start',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
