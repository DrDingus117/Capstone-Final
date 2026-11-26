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

import CentersMap from '../components/centers-map';
import { Center } from '../components/map-html';
import { apiRequest, useApi } from '../hooks/use-api';
import { useColorScheme } from '../hooks/use-color-scheme';

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

type CenterValues = {
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  lat: number;
  lng: number;
  phone: string;
  website: string;
  notes: string;
  services: string[];
};

// Add / edit form
function CenterForm({
  initial,
  theme,
  onSave,
  onCancel,
}: {
  initial?: Center;
  theme: Theme;
  onSave: (values: CenterValues) => Promise<void>;
  onCancel: () => void;
}) {
  const [name, setName] = useState(initial?.name ?? '');
  const [address, setAddress] = useState(initial?.address ?? '');
  const [city, setCity] = useState(initial?.city ?? '');
  const [state, setState] = useState(initial?.state ?? 'WA');
  const [zip, setZip] = useState(initial?.zip ?? '');
  const [lat, setLat] = useState(initial ? String(initial.lat) : '');
  const [lng, setLng] = useState(initial ? String(initial.lng) : '');
  const [phone, setPhone] = useState(initial?.phone ?? '');
  const [website, setWebsite] = useState(initial?.website ?? '');
  const [services, setServices] = useState((initial?.services ?? []).join(', '));
  const [notes, setNotes] = useState(initial?.notes ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    if (!name.trim() || !address.trim() || !city.trim() || !state.trim()) {
      setError('Please fill in the name, address, city, and state.');
      return;
    }
    const latN = Number(lat);
    const lngN = Number(lng);
    if (
      lat.trim() === '' ||
      lng.trim() === '' ||
      !Number.isFinite(latN) ||
      !Number.isFinite(lngN) ||
      Math.abs(latN) > 90 ||
      Math.abs(lngN) > 180
    ) {
      setError('Latitude and longitude must be numbers, like 47.2529 and -122.4443.');
      return;
    }
    const site = website.trim();
    setSaving(true);
    setError(null);
    try {
      await onSave({
        name: name.trim(),
        address: address.trim(),
        city: city.trim(),
        state: state.trim(),
        zip: zip.trim(),
        lat: latN,
        lng: lngN,
        phone: phone.trim(),
        website: site && !/^https?:\/\//i.test(site) ? `https://${site}` : site,
        notes: notes.trim(),
        services: services
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
      setSaving(false);
    }
  }

  const inputStyle = [
    styles.input,
    { backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.text },
  ];
  const numberKeyboard = Platform.OS === 'ios' ? 'numbers-and-punctuation' : 'numeric';

  const field = (
    label: string,
    value: string,
    set: (v: string) => void,
    placeholder: string,
    extra: object = {},
  ) => (
    <>
      <Text style={[styles.label, { color: theme.subText }]}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={set}
        placeholder={placeholder}
        placeholderTextColor={theme.subText}
        style={inputStyle}
        {...extra}
      />
    </>
  );

  return (
    <View style={[styles.card, { backgroundColor: theme.inputBg, borderColor: theme.border }]}>
      <Text style={[styles.formTitle, { color: theme.text }]}>
        {initial ? 'Edit center' : 'Add a center'}
      </Text>

      {field('Name', name, setName, 'Center name')}
      {field('Address', address, setAddress, '123 Main St')}
      {field('City', city, setCity, 'Tacoma')}
      {field('State', state, setState, 'WA', { autoCapitalize: 'characters', maxLength: 2 })}
      {field('Zip', zip, setZip, '98402', { keyboardType: 'numeric' })}
      {field('Latitude', lat, setLat, '47.2529', { keyboardType: numberKeyboard, autoCorrect: false })}
      {field('Longitude', lng, setLng, '-122.4443', { keyboardType: numberKeyboard, autoCorrect: false })}
      <Text style={[styles.hint, { color: theme.subText }]}>
        Tip: in Google Maps, right-click the spot and click the numbers at the top of the menu to
        copy them. The first number is latitude and the second is longitude.
      </Text>
      {field('Phone', phone, setPhone, '253-555-0100', { keyboardType: 'phone-pad' })}
      {field('Website', website, setWebsite, 'https://example.org', {
        autoCapitalize: 'none',
        autoCorrect: false,
        keyboardType: 'url',
      })}
      {field('Services (separate with commas)', services, setServices, 'Diagnostic evaluation, ABA therapy')}

      <Text style={[styles.label, { color: theme.subText }]}>Notes</Text>
      <TextInput
        value={notes}
        onChangeText={setNotes}
        placeholder="Anything else people should know"
        placeholderTextColor={theme.subText}
        multiline
        style={[inputStyle, styles.multiline]}
      />

      {error && <Text style={[styles.errorText, { color: theme.danger }]}>{error}</Text>}

      <View style={styles.actionRow}>
        <Pressable
          onPress={submit}
          disabled={saving}
          style={[styles.primaryButton, { backgroundColor: theme.link, opacity: saving ? 0.6 : 1 }]}
        >
          <Text style={styles.primaryButtonText}>{saving ? 'Saving...' : 'Save'}</Text>
        </Pressable>
        <Pressable onPress={onCancel} disabled={saving}>
          <Text style={[styles.actionLink, { color: theme.subText }]}>Cancel</Text>
        </Pressable>
      </View>
    </View>
  );
}

function CenterCard({
  center,
  theme,
  confirming,
  onEdit,
  onAskDelete,
  onCancelDelete,
  onConfirmDelete,
}: {
  center: Center;
  theme: Theme;
  confirming: boolean;
  onEdit: () => void;
  onAskDelete: () => void;
  onCancelDelete: () => void;
  onConfirmDelete: () => void;
}) {
  return (
    <View style={[styles.card, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
      <Text style={[styles.cardTitle, { color: theme.text }]}>{center.name}</Text>
      <Text style={[styles.cardLine, { color: theme.subText }]}>
        {center.address}, {center.city}, {center.state} {center.zip}
      </Text>
      {center.services && center.services.length > 0 && (
        <Text style={[styles.cardLine, { color: theme.subText }]}>
          Services: {center.services.join(', ')}
        </Text>
      )}
      {center.notes ? (
        <Text style={[styles.cardLine, { color: theme.subText }]}>{center.notes}</Text>
      ) : null}

      <View style={styles.actionRow}>
        {center.phone ? (
          <Pressable onPress={() => Linking.openURL(`tel:${center.phone}`)}>
            <Text style={[styles.actionLink, { color: theme.link }]}>Call {center.phone}</Text>
          </Pressable>
        ) : null}
        {center.website ? (
          <Pressable onPress={() => Linking.openURL(center.website as string)}>
            <Text style={[styles.actionLink, { color: theme.link }]}>Website →</Text>
          </Pressable>
        ) : null}
      </View>

      {confirming ? (
        <View style={styles.actionRow}>
          <Text style={[styles.confirmText, { color: theme.text }]}>Delete this center?</Text>
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
  );
}

export default function LocationsScreen() {
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

  const { data: centers, loading, error, reload } = useApi<Center[]>('/api/centers');

  // 'new' = add form open, a number = that center is being edited
  const [editing, setEditing] = useState<number | 'new' | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  async function save(id: number | 'new', values: CenterValues) {
    if (id === 'new') {
      await apiRequest('POST', '/api/centers', values);
    } else {
      await apiRequest('PUT', `/api/centers/${id}`, values);
    }
    setEditing(null);
    reload();
  }

  async function remove(id: number) {
    setActionError(null);
    try {
      await apiRequest('DELETE', `/api/centers/${id}`);
      setConfirmDeleteId(null);
      reload();
    } catch (e) {
      setActionError(e instanceof Error ? e.message : 'Could not delete that center');
    }
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.bg }}
      contentContainerStyle={styles.scrollContainer}
    >
      <View style={styles.mainWrapper}>
        <Text style={[styles.pageTitle, { color: theme.text }]}>Autism Centers Near You</Text>
        <Text style={[styles.pageSubtitle, { color: theme.subText }]}>
          Tap a pin to see a center's address, phone number, and services.
        </Text>

        {loading && !centers && <ActivityIndicator color={theme.link} />}

        {error && (
          <View style={[styles.statusBox, { backgroundColor: theme.cardBg }]}>
            <Text style={[styles.statusText, { color: theme.text }]}>
              Couldn't load centers. Make sure the API is running. ({error})
            </Text>
            <Pressable onPress={reload}>
              <Text style={[styles.retryText, { color: theme.link }]}>Try again</Text>
            </Pressable>
          </View>
        )}

        {actionError && (
          <Text style={[styles.errorText, { color: theme.danger }]}>{actionError}</Text>
        )}

        {centers && centers.length > 0 && <CentersMap centers={centers} />}

        {centers && (
          <>
            {editing === 'new' ? (
              <CenterForm
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
                <Text style={styles.primaryButtonText}>+ Add center</Text>
              </Pressable>
            )}

            {centers.map((c) =>
              editing === c.id ? (
                <CenterForm
                  key={c.id}
                  initial={c}
                  theme={theme}
                  onSave={(values) => save(c.id, values)}
                  onCancel={() => setEditing(null)}
                />
              ) : (
                <CenterCard
                  key={c.id}
                  center={c}
                  theme={theme}
                  confirming={confirmDeleteId === c.id}
                  onEdit={() => {
                    setEditing(c.id);
                    setConfirmDeleteId(null);
                  }}
                  onAskDelete={() => setConfirmDeleteId(c.id)}
                  onCancelDelete={() => setConfirmDeleteId(null)}
                  onConfirmDelete={() => remove(c.id)}
                />
              ),
            )}
          </>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  mainWrapper: { width: '100%', maxWidth: 720, gap: 16 },
  pageTitle: { fontSize: 28, fontWeight: 'bold', textAlign: 'center' },
  pageSubtitle: { fontSize: 15, textAlign: 'center', lineHeight: 22, marginBottom: 8 },
  statusBox: { width: '100%', padding: 16, borderRadius: 10, alignItems: 'center', gap: 10 },
  statusText: { fontSize: 15, textAlign: 'center' },
  retryText: { fontSize: 15, fontWeight: '600', textDecorationLine: 'underline' },
  card: { width: '100%', padding: 16, borderRadius: 10, borderWidth: 1, gap: 6 },
  cardTitle: { fontSize: 17, fontWeight: '700' },
  cardLine: { fontSize: 14, lineHeight: 21 },
  // ----- CRUD -----
  formTitle: { fontSize: 18, fontWeight: '700', marginBottom: 8 },
  label: { fontSize: 13, fontWeight: '600', marginTop: 8, marginBottom: 4 },
  hint: { fontSize: 12, lineHeight: 18, marginTop: 6 },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    fontSize: 15,
  },
  multiline: { minHeight: 80, textAlignVertical: 'top' },
  errorText: { fontSize: 14, marginTop: 8 },
  actionRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 16, marginTop: 8 },
  actionLink: { fontSize: 15, fontWeight: '600' },
  confirmText: { fontSize: 15 },
  primaryButton: { paddingVertical: 10, paddingHorizontal: 18, borderRadius: 8, alignItems: 'center' },
  addButton: { alignSelf: 'flex-start' },
  primaryButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
});