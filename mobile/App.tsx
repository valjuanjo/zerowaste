import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Capture, locate, takePhoto } from './src/capture';
import { ObjectType, Report, STATUS_ORDER, TYPES, formatWhen, loadReports, saveReports } from './src/data';
import { Lang, STRINGS, loadLang, saveLang } from './src/i18n';

type Screen = 'home' | 'confirm' | 'sent' | 'list';
const GREEN = '#1f7a4d';

export default function App() {
  const [screen, setScreen] = useState<Screen>('home');
  const [reports, setReports] = useState<Report[]>([]);
  const [draft, setDraft] = useState<Capture | null>(null);
  const [type, setType] = useState<ObjectType | null>(null);
  const [busy, setBusy] = useState(false);
  const [lang, setLang] = useState<Lang>('en');
  const t = STRINGS[lang];

  useEffect(() => { loadReports().then(setReports); loadLang().then(setLang); }, []);

  function toggleLang() {
    const next: Lang = lang === 'en' ? 'es' : 'en';
    setLang(next); saveLang(next);
  }

  const persist = (next: Report[]) => { setReports(next); saveReports(next); };

  async function onCamera() {
    if (busy) return;
    setBusy(true);
    try {
      const photo = await takePhoto();
      if (!photo) return; // user backed out of the camera
      const where = await locate();
      setDraft({ ...photo, ...where, timestamp: new Date().toISOString() });
      setType(null);
      setScreen('confirm');
    } finally {
      setBusy(false);
    }
  }

  function onSend() {
    if (!draft || !type) return;
    const id = Math.max(100, ...reports.map((r) => r.id)) + 1;
    persist([...reports, { id, context: 'street', object_type: type, status: 'received', ...draft }]);
    setDraft(null);
    setScreen('sent');
  }

  // Facilitator-only: stands in for the municipality until there is a backend (Phase 1).
  function advance(id: number) {
    persist(reports.map((r) => r.id !== id ? r
      : { ...r, status: STATUS_ORDER[(STATUS_ORDER.indexOf(r.status) + 1) % STATUS_ORDER.length] }));
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <SafeAreaView style={s.root} edges={['top', 'bottom']}>
        <View style={s.header}>
          <View>
            <Text style={s.title}>Escanea Perú</Text>
            <Text style={s.subtitle}>{t.subtitle}</Text>
          </View>
          <Pressable testID="lang-toggle" accessibilityLabel="Change language / Cambiar idioma" onPress={toggleLang} style={s.lang}>
            <Text style={s.langText}>🌐 {t.switchTo}</Text>
          </Pressable>
        </View>

        <ScrollView style={{ flex: 1 }} contentContainerStyle={s.body}>
          {screen === 'home' && (
            <View style={s.center}>
              <Text style={s.h2}>{t.homeTitle}</Text>
              <Text style={[s.muted, s.centerText]}>{t.homeBody}</Text>
              <Pressable testID="btn-cam" accessibilityLabel={t.takePhoto} onPress={onCamera}
                style={({ pressed }) => [s.cam, pressed && { opacity: 0.8 }]}>
                {busy ? <ActivityIndicator color="#fff" size="large" /> : <Text style={s.camIcon}>📷</Text>}
                <Text style={s.camText}>{busy ? t.wait : t.takePhoto}</Text>
              </Pressable>
              <Text style={[s.muted, s.centerText]}>{t.noName}</Text>
            </View>
          )}

          {screen === 'confirm' && draft && (
            <View>
              <Text style={s.h2}>{t.confirmTitle}</Text>
              {draft.photoUri
                ? <Image source={{ uri: draft.photoUri }} style={s.photo} />
                : <View style={[s.photo, s.noPhoto]}><Text style={s.muted}>{t.noPhoto}</Text></View>}
              <Text style={[s.muted, { marginTop: 8 }]}>{t.protoNote}</Text>
              <View style={s.chips}>
                {(Object.keys(TYPES) as ObjectType[]).map((k) => (
                  <Pressable key={k} testID={`chip-${k}`} onPress={() => setType(k)}
                    style={[s.chip, type === k && s.chipSel]}>
                    <Text style={[s.chipText, type === k && { fontWeight: '700' }]}>{TYPES[k].icon} {t.types[k]}</Text>
                  </Pressable>
                ))}
              </View>
              <View style={s.note}>
                <Text testID="place">📍 {draft.place ?? t.noLocation}</Text>
                <Text>🕒 {formatWhen(draft.timestamp)}</Text>
              </View>
              <Pressable testID="btn-send" disabled={!type} onPress={onSend}
                style={[s.btn, s.btnPrimary, !type && { opacity: 0.4 }]}>
                <Text style={s.btnPrimaryText}>{type ? t.send : t.pickFirst}</Text>
              </Pressable>
              <Pressable onPress={() => setScreen('home')} style={[s.btn, s.btnGhost]}>
                <Text style={s.btnGhostText}>{t.cancel}</Text>
              </Pressable>
            </View>
          )}

          {screen === 'sent' && (
            <View style={s.center}>
              <Text style={{ fontSize: 64 }}>✅</Text>
              <Text style={s.h2}>{t.sentTitle}</Text>
              <Text style={[s.muted, s.centerText]}>{t.sentBody}</Text>
              <Pressable testID="btn-see" onPress={() => setScreen('list')} style={[s.btn, s.btnPrimary, s.wide]}>
                <Text style={s.btnPrimaryText}>{t.seeReports}</Text>
              </Pressable>
              <Pressable onPress={() => setScreen('home')} style={[s.btn, s.btnGhost, s.wide]}>
                <Text style={s.btnGhostText}>{t.another}</Text>
              </Pressable>
            </View>
          )}

          {screen === 'list' && (
            <View>
              <Text style={s.h2}>{t.listTitle}</Text>
              {reports.length === 0 && <Text style={s.muted}>{t.empty}</Text>}
              {[...reports].reverse().map((r) => {
                const at = STATUS_ORDER.indexOf(r.status);
                return (
                  <Pressable key={r.id} testID={`card-${r.id}`} onLongPress={() => advance(r.id)} style={s.card}>
                    <View style={s.row}>
                      {r.photoUri && <Image source={{ uri: r.photoUri }} style={s.thumb} />}
                      <View style={{ flex: 1 }}>
                        <Text style={s.cardTitle}>{TYPES[r.object_type].icon} {t.types[r.object_type]}  #{r.id}</Text>
                        <Text style={s.muted}>📍 {r.place ?? t.noLocation}</Text>
                        <Text style={s.muted}>🕒 {formatWhen(r.timestamp)}</Text>
                      </View>
                    </View>
                    <View style={s.steps}>
                      {STATUS_ORDER.map((st, i) => (
                        <View key={st} testID={i <= at ? `done-${r.id}` : undefined} style={[s.step, i <= at && s.stepDone]}>
                          <Text style={[s.stepText, i <= at && s.stepTextDone]}>{t.status[st]}</Text>
                        </View>
                      ))}
                    </View>
                  </Pressable>
                );
              })}
              {reports.length > 0 && (
                <Text style={[s.muted, { fontSize: 12 }]}>{t.facilitator}</Text>
              )}
            </View>
          )}
        </ScrollView>

        <View style={s.nav}>
          <Pressable testID="nav-home" style={s.navBtn} onPress={() => setScreen('home')}>
            <Text style={s.navIcon}>📷</Text>
            <Text style={[s.navText, screen !== 'list' && s.navOn]}>{t.navReport}</Text>
          </Pressable>
          <Pressable testID="nav-list" style={s.navBtn} onPress={() => setScreen('list')}>
            <Text style={s.navIcon}>📋</Text>
            <Text style={[s.navText, screen === 'list' && s.navOn]}>{t.navList}</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: GREEN },
  header: { backgroundColor: GREEN, paddingHorizontal: 16, paddingVertical: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { color: '#fff', fontSize: 19, fontWeight: '700' },
  subtitle: { color: '#d7eadf', fontSize: 12 },
  lang: { backgroundColor: '#fff', borderRadius: 18, paddingHorizontal: 12, paddingVertical: 8 },
  langText: { color: GREEN, fontWeight: '700', fontSize: 14 },
  centerText: { textAlign: 'center' },
  body: { flexGrow: 1, padding: 16, backgroundColor: '#f3f5f1' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14 },
  h2: { fontSize: 22, fontWeight: '700', color: '#1c2420', marginBottom: 8 },
  muted: { color: '#64706a', fontSize: 14, lineHeight: 20, textAlign: 'left' },
  cam: { width: 190, height: 190, borderRadius: 95, backgroundColor: GREEN, alignItems: 'center', justifyContent: 'center', marginVertical: 18, elevation: 6 },
  camIcon: { fontSize: 68 },
  camText: { color: '#fff', fontSize: 17, fontWeight: '700', marginTop: 4 },
  photo: { width: '100%', height: 200, borderRadius: 14, backgroundColor: '#cfd6cb' },
  noPhoto: { alignItems: 'center', justifyContent: 'center' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginVertical: 12 },
  chip: { width: '48%', padding: 13, borderRadius: 12, borderWidth: 2, borderColor: '#dde3dc', backgroundColor: '#fff' },
  chipSel: { borderColor: GREEN, backgroundColor: '#e6f3ec' },
  chipText: { fontSize: 15, color: '#1c2420' },
  note: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#dde3dc', borderRadius: 12, padding: 12, gap: 4 },
  btn: { padding: 15, borderRadius: 12, alignItems: 'center', marginTop: 10 },
  wide: { alignSelf: 'stretch' },
  btnPrimary: { backgroundColor: GREEN },
  btnPrimaryText: { color: '#fff', fontSize: 17, fontWeight: '700' },
  btnGhost: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#dde3dc' },
  btnGhostText: { color: '#1c2420', fontSize: 17, fontWeight: '600' },
  card: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#dde3dc', borderRadius: 14, padding: 12, marginBottom: 10 },
  row: { flexDirection: 'row', gap: 10 },
  thumb: { width: 56, height: 56, borderRadius: 8, backgroundColor: '#cfd6cb' },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#1c2420' },
  steps: { flexDirection: 'row', gap: 4, marginTop: 10 },
  step: { flex: 1, paddingVertical: 6, borderRadius: 8, backgroundColor: '#eef1ec', alignItems: 'center' },
  stepDone: { backgroundColor: GREEN },
  stepText: { fontSize: 12, color: '#64706a' },
  stepTextDone: { color: '#fff', fontWeight: '700' },
  nav: { flexDirection: 'row', backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#dde3dc' },
  navBtn: { flex: 1, alignItems: 'center', paddingVertical: 8 },
  navIcon: { fontSize: 20 },
  navText: { fontSize: 13, color: '#64706a' },
  navOn: { color: GREEN, fontWeight: '700' },
});
