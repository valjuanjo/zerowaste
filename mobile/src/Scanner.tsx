// Live scanner interface (plan step 0.5a, decision D-014). Camera is real; detections are simulated (src/demo.ts).
// Salience: the screen shows only the plastic share and the mix of plastic types. Everything else is one tap away.
import { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CameraView, useCameraPermissions } from 'expo-camera';
import {
  CATEGORY_ICON, Category, Detection, RESIN_CODE, RESIN_COLOR, RESIN_ORDER, Resin, Tally,
  addToTally, emptyTally, nextFrame, rng,
} from './demo';
import { Lang, SCAN } from './i18n';

const CONSENT_KEY = 'ep_scan_consent_v1';
const TICK_MS = 800;
const pct = (a: number, b: number) => (b ? Math.round((100 * a) / b) : 0);

export default function Scanner({ lang, onToggleLang }: { lang: Lang; onToggleLang: () => void }) {
  const t = SCAN[lang];
  const [consent, setConsent] = useState<boolean | null>(null);
  const [moreConsent, setMoreConsent] = useState(false);
  const [perm, requestPerm] = useCameraPermissions();
  const [dets, setDets] = useState<Detection[]>([]);
  const [tally, setTally] = useState<Tally>(emptyTally);
  const [paused, setPaused] = useState(false);
  const [sheet, setSheet] = useState(false);
  const [demoInfo, setDemoInfo] = useState(false);
  const [picked, setPicked] = useState<Detection | null>(null);

  const rand = useRef(rng(1)).current;
  const uid = useRef(0);
  const detsRef = useRef<Detection[]>([]);
  const pausedRef = useRef(paused);
  pausedRef.current = paused;

  useEffect(() => {
    AsyncStorage.getItem(CONSENT_KEY).then((v) => setConsent(v === 'yes')).catch(() => setConsent(false));
  }, []);

  useEffect(() => {
    if (consent && perm && !perm.granted && perm.canAskAgain) requestPerm();
  }, [consent, perm?.granted]);

  // Simulated recognition loop. It keeps showing boxes while paused, but nothing is counted.
  useEffect(() => {
    if (!consent) return;
    const h = setInterval(() => {
      const { dets: next, added } = nextFrame(detsRef.current, rand, () => ++uid.current);
      if (added.length && !pausedRef.current) {
        added.forEach((d) => { d.counted = true; });
        setTally((tl) => added.reduce((acc, d) => addToTally(acc, d.item), tl));
      }
      detsRef.current = next;
      setDets(next);
    }, TICK_MS);
    return () => clearInterval(h);
  }, [consent]);

  // A picked item's card closes by itself once the item leaves the view.
  useEffect(() => {
    if (picked && !dets.some((d) => d.uid === picked.uid)) {
      const h = setTimeout(() => setPicked(null), 1500);
      return () => clearTimeout(h);
    }
  }, [dets, picked]);

  function accept() {
    setConsent(true);
    AsyncStorage.setItem(CONSENT_KEY, 'yes').catch(() => {});
  }

  const share = pct(tally.plastic, tally.total);
  const resins = RESIN_ORDER.filter((r) => tally.byResin[r] > 0).sort((a, b) => tally.byResin[b] - tally.byResin[a]);
  const cats = (Object.keys(CATEGORY_ICON) as Category[]).filter((c) => tally.byCategory[c].n > 0)
    .sort((a, b) => tally.byCategory[b].plastic - tally.byCategory[a].plastic || tally.byCategory[b].n - tally.byCategory[a].n);

  return (
    <View style={s.root}>
      {perm?.granted
        ? <CameraView style={StyleSheet.absoluteFill} facing="back" />
        : <View style={[StyleSheet.absoluteFill, s.noCam]} />}

      {/* Detection boxes */}
      {consent && dets.map((d) => {
        const plastic = !!d.item.resin;
        const color = plastic ? RESIN_COLOR[d.item.resin as Resin] : '#ffffff';
        return (
          <Pressable key={d.uid} testID={`det-${d.uid}`} onPress={() => setPicked(d)}
            style={[s.box, { left: `${d.x * 100}%`, top: `${d.y * 100}%`, width: `${d.w * 100}%`, height: `${d.h * 100}%`,
              borderColor: color, borderStyle: plastic ? 'solid' : 'dashed' }]}>
            <View style={[s.tag, { backgroundColor: plastic ? color : 'rgba(255,255,255,0.85)' }]}>
              <Text style={[s.tagText, !plastic && { color: '#333' }]}>{plastic ? d.item.resin : '—'}</Text>
            </View>
          </Pressable>
        );
      })}

      <SafeAreaView style={s.overlay} edges={['top']} pointerEvents="box-none">
        {/* Top row: small controls */}
        <View style={s.topRow} pointerEvents="box-none">
          <Pressable testID="pause-toggle" onPress={() => setPaused(!paused)} style={s.pill}
            accessibilityLabel={paused ? t.resume : t.pause}>
            <View style={[s.dot, { backgroundColor: paused ? '#b0b8b4' : '#ff4d4d' }]} />
            <Text style={s.pillText}>{paused ? t.paused : t.counting}</Text>
            <Text style={s.pillIcon}>{paused ? '▶' : '❚❚'}</Text>
          </Pressable>
          <View style={{ flexDirection: 'row', gap: 6 }}>
            <Pressable testID="demo-badge" onPress={() => setDemoInfo(!demoInfo)} style={[s.pill, s.demo]}>
              <Text style={[s.pillText, { color: '#1c2420' }]}>{t.demo} ⓘ</Text>
            </Pressable>
            <Pressable testID="lang-toggle" onPress={onToggleLang} style={s.pill} accessibilityLabel="Change language / Cambiar idioma">
              <Text style={s.pillText}>{lang === 'en' ? 'ES' : 'EN'}</Text>
            </Pressable>
          </View>
        </View>
        {demoInfo && <Pressable onPress={() => setDemoInfo(false)} style={s.infoBox}><Text style={s.infoText}>{t.demoInfo}</Text></Pressable>}

        {/* The one big number */}
        <Pressable testID="scan-percent" onPress={() => setSheet(true)} style={s.hero}>
          <Text style={s.heroNum}>{share}<Text style={s.heroPct}>%</Text></Text>
          <Text style={s.heroLabel}>{t.plastic}</Text>
          <Text style={s.heroSub}>{tally.total ? t.ofItems(tally.total) : t.pointCamera}</Text>
        </Pressable>
        {!perm?.granted && perm && (
          <View style={s.camMsg}>
            <Text style={s.infoText}>{t.noCamera}</Text>
            {perm.canAskAgain && <Pressable onPress={requestPerm}><Text style={s.link}>{t.allowCamera}</Text></Pressable>}
          </View>
        )}
      </SafeAreaView>

      {/* Bottom: mix of plastic types, one tap for details */}
      <View style={s.bottom} pointerEvents="box-none">
        {picked ? (
          <Pressable testID="item-card" onPress={() => setPicked(null)} style={s.card}>
            <Text style={s.cardIcon}>{CATEGORY_ICON[picked.item.category]}</Text>
            <View style={{ flex: 1 }}>
              <Text style={s.cardTitle}>{t.itemNames[picked.item.key]}</Text>
              <Text style={s.cardSub}>
                {picked.item.resin ? `${t.plastic} · ${picked.item.resin} (${RESIN_CODE[picked.item.resin]})` : t.notPlastic}
                {'  ·  '}{Math.round(picked.conf * 100)}% {t.confidence}
              </Text>
            </View>
            <Text style={s.cardClose}>✕</Text>
          </Pressable>
        ) : (
          <Pressable testID="scan-sheet-open" onPress={() => setSheet(true)} style={s.mix}>
            <View style={s.bar}>
              {resins.length === 0 && <View style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.25)' }} />}
              {resins.map((r) => <View key={r} style={{ flex: tally.byResin[r], backgroundColor: RESIN_COLOR[r] }} />)}
            </View>
            <View style={s.mixRow}>
              {resins.slice(0, 3).map((r) => (
                <Text key={r} style={s.mixText}>
                  <Text style={{ color: RESIN_COLOR[r] }}>● </Text>{r} {pct(tally.byResin[r], tally.plastic)}%
                </Text>
              ))}
              <Text style={[s.mixText, { marginLeft: 'auto', opacity: 0.8 }]}>⌃</Text>
            </View>
          </Pressable>
        )}
      </View>

      {/* Details sheet */}
      {sheet && (
        <View style={s.sheetWrap}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setSheet(false)} />
          <View testID="sheet" style={s.sheet}>
            <ScrollView contentContainerStyle={{ padding: 18, gap: 6 }}>
              <Text style={s.sheetHead}>{share}% {t.plastic}</Text>
              <Text style={s.muted}>{t.ofItems(tally.total)}</Text>

              <Text style={s.section}>{t.types}</Text>
              {resins.map((r) => (
                <View key={r} style={s.line}>
                  <Text style={s.lineName}>{r} <Text style={s.muted}>({RESIN_CODE[r]})</Text></Text>
                  <View style={s.track}><View style={{ width: `${pct(tally.byResin[r], tally.plastic)}%`, height: '100%', backgroundColor: RESIN_COLOR[r], borderRadius: 4 }} /></View>
                  <Text style={s.lineVal}>{pct(tally.byResin[r], tally.plastic)}%</Text>
                </View>
              ))}
              <Text style={s.fine}>{t.resinNote}</Text>

              <Text style={s.section}>{t.byCategory}</Text>
              {cats.map((c) => {
                const v = tally.byCategory[c];
                return (
                  <View key={c} testID={`cat-${c}`} style={s.line}>
                    <Text style={s.lineName}>{CATEGORY_ICON[c]} {t.categories[c]}</Text>
                    <Text style={[s.lineVal, { width: 'auto' }, v.plastic === 0 && s.muted]}>
                      {v.plastic ? t.plasticOf(v.plastic, v.n) : `${t.items(v.n)} · ${t.notPlastic.toLowerCase()}`}
                    </Text>
                  </View>
                );
              })}

              <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
                <Pressable testID="new-room" onPress={() => { setTally(emptyTally()); setSheet(false); }} style={[s.btn, s.btnGhost]}>
                  <Text style={s.btnGhostText}>{t.newRoom}</Text>
                </Pressable>
                <Pressable testID="sheet-close" onPress={() => setSheet(false)} style={[s.btn, s.btnPrimary]}>
                  <Text style={s.btnPrimaryText}>{t.close}</Text>
                </Pressable>
              </View>
              <Text style={s.fine}>{t.demoInfo}</Text>
            </ScrollView>
          </View>
        </View>
      )}

      {/* First open: consent before the camera starts (governance rule 1a) */}
      {consent === false && (
        <View style={s.consent}>
          <Text style={{ fontSize: 44 }}>♻️</Text>
          <Text style={s.consentTitle}>{t.consentTitle}</Text>
          <Text style={s.consentBody}>{t.consentBody}</Text>
          <Pressable onPress={() => setMoreConsent(!moreConsent)}>
            <Text style={s.link}>{t.consentMore} {moreConsent ? '⌃' : '⌄'}</Text>
          </Pressable>
          {moreConsent && <Text style={[s.consentBody, { fontSize: 13 }]}>{t.consentMoreBody}</Text>}
          <Pressable testID="consent-start" onPress={accept} style={[s.btn, s.btnPrimary, { alignSelf: 'stretch', flex: 0 }]}>
            <Text style={s.btnPrimaryText}>{t.start}</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const GREEN = '#1f7a4d';
const glass = 'rgba(12,18,15,0.55)';
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0c120f', overflow: 'hidden' },
  noCam: { backgroundColor: '#26302b' },
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, paddingHorizontal: 14 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 8 },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: glass, borderRadius: 16, paddingHorizontal: 11, paddingVertical: 7 },
  pillText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  pillIcon: { color: '#fff', fontSize: 10, opacity: 0.8 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  demo: { backgroundColor: '#ffd35c' },
  infoBox: { backgroundColor: 'rgba(255,255,255,0.92)', borderRadius: 12, padding: 10, marginTop: 8 },
  infoText: { color: '#1c2420', fontSize: 13, lineHeight: 18 },
  hero: { alignSelf: 'center', alignItems: 'center', backgroundColor: glass, borderRadius: 22, paddingHorizontal: 22, paddingVertical: 8, marginTop: 10 },
  heroNum: { color: '#fff', fontSize: 52, fontWeight: '800', lineHeight: 58 },
  heroPct: { fontSize: 26, fontWeight: '700' },
  heroLabel: { color: '#fff', fontSize: 15, fontWeight: '700', marginTop: -4 },
  heroSub: { color: '#d7eadf', fontSize: 11, marginTop: 2 },
  camMsg: { backgroundColor: 'rgba(255,255,255,0.92)', borderRadius: 12, padding: 10, marginTop: 10, gap: 4 },
  link: { color: GREEN, fontWeight: '700', fontSize: 14 },
  box: { position: 'absolute', borderWidth: 2.5, borderRadius: 10 },
  tag: { position: 'absolute', top: -11, left: 8, borderRadius: 8, paddingHorizontal: 7, paddingVertical: 2 },
  tagText: { color: '#fff', fontSize: 11, fontWeight: '800' },
  bottom: { position: 'absolute', left: 0, right: 0, bottom: 0, padding: 14 },
  mix: { backgroundColor: glass, borderRadius: 16, padding: 12, gap: 8 },
  bar: { flexDirection: 'row', height: 8, borderRadius: 4, overflow: 'hidden', gap: 2 },
  mixRow: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  mixText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  card: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#fff', borderRadius: 16, padding: 12 },
  cardIcon: { fontSize: 30 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#1c2420' },
  cardSub: { fontSize: 13, color: '#64706a', marginTop: 2 },
  cardClose: { color: '#9aa39e', fontSize: 16, padding: 4 },
  sheetWrap: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#fff', borderTopLeftRadius: 22, borderTopRightRadius: 22, maxHeight: '78%' },
  sheetHead: { fontSize: 26, fontWeight: '800', color: '#1c2420' },
  section: { fontSize: 13, fontWeight: '700', color: '#64706a', textTransform: 'uppercase', marginTop: 16, letterSpacing: 0.5 },
  line: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 5 },
  lineName: { fontSize: 15, color: '#1c2420', flex: 1 },
  track: { flex: 1.3, height: 8, backgroundColor: '#eef1ec', borderRadius: 4 },
  lineVal: { fontSize: 14, color: '#1c2420', fontWeight: '700', width: 42, textAlign: 'right' },
  muted: { color: '#64706a', fontSize: 13, fontWeight: '400' },
  fine: { color: '#8a948f', fontSize: 11, lineHeight: 15, marginTop: 4 },
  btn: { flex: 1, padding: 14, borderRadius: 12, alignItems: 'center' },
  btnPrimary: { backgroundColor: GREEN },
  btnPrimaryText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  btnGhost: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#dde3dc' },
  btnGhostText: { color: '#1c2420', fontSize: 16, fontWeight: '600' },
  consent: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#f3f5f1', alignItems: 'center', justifyContent: 'center', padding: 28, gap: 14 },
  consentTitle: { fontSize: 22, fontWeight: '800', color: '#1c2420', textAlign: 'center' },
  consentBody: { fontSize: 15, color: '#3c4842', textAlign: 'center', lineHeight: 21 },
});
