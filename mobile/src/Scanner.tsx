// Live scanner interface (plan step 0.5a, decision D-014). Camera is real; detections are simulated (src/demo.ts).
// Salience: the screen shows only the plastic share and the mix of plastic types. Everything else is one tap away.
import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { BlurView } from 'expo-blur';
import Svg, { Circle } from 'react-native-svg';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CameraView, useCameraPermissions } from 'expo-camera';
import {
  CATEGORY_ICON, Category, Detection, RESIN_CODE, RESIN_COLOR, RESIN_ORDER, Resin, Tally,
  addToTally, emptyTally, nextFrame, rng,
} from './demo';
import { Lang, SCAN } from './i18n';
import { recommend } from './recommend';

const CONSENT_KEY = 'ep_scan_consent_v1';
const TICK_MS = 800;
const SCAN_SECONDS = 30;
const clock = (sec: number) => `0:${String(sec).padStart(2, '0')}`;
const pct = (a: number, b: number) => (b ? Math.round((100 * a) / b) : 0);

export default function Scanner({ lang, onToggleLang, bottomInset = 0 }: { lang: Lang; onToggleLang: () => void; bottomInset?: number }) {
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
  const [phase, setPhase] = useState<'ready' | 'scanning' | 'done'>('ready');
  const [left, setLeft] = useState(SCAN_SECONDS);

  const rand = useRef(rng(1)).current;
  const uid = useRef(0);
  const detsRef = useRef<Detection[]>([]);
  const pausedRef = useRef(paused);
  pausedRef.current = paused;

  // Scan line sweeping the view.
  const sweep = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const a = Animated.loop(Animated.timing(sweep, { toValue: 1, duration: 3200, easing: Easing.inOut(Easing.quad), useNativeDriver: Platform.OS !== 'web' }));
    a.start();
    return () => a.stop();
  }, []);

  useEffect(() => {
    AsyncStorage.getItem(CONSENT_KEY).then((v) => setConsent(v === 'yes')).catch(() => setConsent(false));
  }, []);

  useEffect(() => {
    if (consent && perm && !perm.granted && perm.canAskAgain) requestPerm();
  }, [consent, perm?.granted]);

  // Simulated recognition loop. It keeps showing boxes while paused, but nothing is counted.
  useEffect(() => {
    if (!consent || phase !== 'scanning') return;
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
  }, [consent, phase]);

  // 30-second countdown; it stops while paused. At zero the scan ends and the results open.
  useEffect(() => {
    if (phase !== 'scanning' || paused) return;
    if (left <= 0) {
      setPhase('done'); setSheet(false); setPicked(null);
      detsRef.current = []; setDets([]);
      return;
    }
    const h = setTimeout(() => setLeft((v) => v - 1), 1000);
    return () => clearTimeout(h);
  }, [phase, paused, left]);

  function startScan() {
    setTally(emptyTally()); detsRef.current = []; setDets([]); setPicked(null);
    setPaused(false); setLeft(SCAN_SECONDS); setPhase('scanning');
  }

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
    startScan();
  }

  const scanning = phase === 'scanning';

  const share = pct(tally.plastic, tally.total);
  const resins = RESIN_ORDER.filter((r) => tally.byResin[r] > 0).sort((a, b) => tally.byResin[b] - tally.byResin[a]);

  return (
    <View style={s.root}>
      {perm?.granted
        ? <CameraView style={StyleSheet.absoluteFill} facing="back" />
        : <View style={[StyleSheet.absoluteFill, s.noCam]} />}
      <View pointerEvents="none" style={[StyleSheet.absoluteFill, s.tint]} />

      {/* Scan line */}
      {scanning && !paused && (
        <Animated.View pointerEvents="none" style={[s.sweep, {
          transform: [{ translateY: sweep.interpolate({ inputRange: [0, 1], outputRange: [140, 620] }) }],
          opacity: sweep.interpolate({ inputRange: [0, 0.1, 0.9, 1], outputRange: [0, 1, 1, 0] }),
        }]}>
          <View style={s.sweepGlow} /><View style={s.sweepLine} />
        </Animated.View>
      )}

      {/* Detections: corner brackets, no fill */}
      {scanning && dets.map((d) => {
        const plastic = !!d.item.resin;
        const color = plastic ? RESIN_COLOR[d.item.resin as Resin] : 'rgba(255,255,255,0.55)';
        const sel = picked?.uid === d.uid;
        return (
          <Pressable key={d.uid} testID={`det-${d.uid}`} onPress={() => setPicked(d)}
            style={[s.box, { left: `${d.x * 100}%`, top: `${d.y * 100}%`, width: `${d.w * 100}%`, height: `${d.h * 100}%` },
              sel && { backgroundColor: 'rgba(255,255,255,0.06)' }]}>
            {(['tl', 'tr', 'bl', 'br'] as const).map((c) => (
              <View key={c} style={[s.corner, s[c], { borderColor: color, shadowColor: color }]} />
            ))}
            {plastic && <View style={[s.centerDot, { backgroundColor: color, shadowColor: color }]} />}
            <View style={s.tag}>
              <Text style={[s.tagText, { color }]}>
                {plastic ? `${d.item.resin}·${RESIN_CODE[d.item.resin as Resin].padStart(2, '0')}` : '∅ ' + t.notPlastic.toUpperCase()}
              </Text>
              <Text style={s.tagConf}>{Math.round(d.conf * 100)}</Text>
            </View>
          </Pressable>
        );
      })}

      <SafeAreaView style={s.overlay} edges={['top']} pointerEvents="box-none">
        <View style={s.topRow} pointerEvents="box-none">
          {scanning ? (
            <Pressable testID="pause-toggle" onPress={() => setPaused(!paused)} style={s.chip}
              accessibilityLabel={paused ? t.resume : t.pause}>
              <View style={[s.dot, paused ? s.dotOff : s.dotOn]} />
              <Text style={s.chipText}>{(paused ? t.paused : t.counting).toUpperCase()}</Text>
            </Pressable>
          ) : <View />}
          <View style={{ flexDirection: 'row', gap: 6 }}>
            <Pressable testID="demo-badge" onPress={() => setDemoInfo(!demoInfo)} style={[s.chip, s.chipDemo]}>
              <Text style={[s.chipText, { color: AMBER }]}>{t.demo}</Text>
            </Pressable>
            <Pressable testID="lang-toggle" onPress={onToggleLang} style={s.chip} accessibilityLabel="Change language / Cambiar idioma">
              <Text style={s.chipText}>{lang === 'en' ? 'ES' : 'EN'}</Text>
            </Pressable>
          </View>
        </View>
        {demoInfo && (
          <Pressable onPress={() => setDemoInfo(false)}>
            <Glass style={s.infoBox}><Text style={s.infoText}>{t.demoInfo}</Text></Glass>
          </Pressable>
        )}

        {/* The one big number, inside a ring that fills with the 30 seconds */}
        {scanning && (
          <Pressable testID="scan-percent" onPress={() => setSheet(true)} style={s.hero}>
            <Ring value={1 - left / SCAN_SECONDS} />
            <View style={s.heroInner}>
              <Text style={s.heroNum}>{share}<Text style={s.heroPct}>%</Text></Text>
              <Text style={s.heroLabel}>{t.plastic.toUpperCase()}</Text>
            </View>
            <Text testID="scan-left" style={s.heroSub}>
              <Text style={s.heroClock}>{clock(left)} {t.left}</Text>{'  ·  '}{tally.total ? t.ofItems(tally.total) : t.pointCamera}
            </Text>
          </Pressable>
        )}
        {!perm?.granted && perm && (
          <Glass style={s.infoBox}>
            <Text style={s.infoText}>{t.noCamera}</Text>
            {perm.canAskAgain && <Pressable onPress={requestPerm}><Text style={s.link}>{t.allowCamera.toUpperCase()} →</Text></Pressable>}
          </Glass>
        )}
      </SafeAreaView>

      {/* Bottom: mix of plastic types, or the picked item */}
      {scanning && <View style={[s.bottom, { bottom: bottomInset }]} pointerEvents="box-none">
        {picked ? (
          <Pressable testID="item-card" onPress={() => setPicked(null)}>
            <Glass style={s.card}>
              <View style={[s.cardStripe, { backgroundColor: picked.item.resin ? RESIN_COLOR[picked.item.resin] : 'rgba(255,255,255,0.4)' }]} />
              <View style={{ flex: 1 }}>
                <Text style={s.cardKicker}>{t.categories[picked.item.category].toUpperCase()}</Text>
                <Text style={s.cardTitle}>{t.itemNames[picked.item.key]}</Text>
                <Text style={s.cardSub}>
                  {picked.item.resin ? `${picked.item.resin} · ${RESIN_CODE[picked.item.resin]}` : t.notPlastic}
                  {'   '}{Math.round(picked.conf * 100)}% {t.confidence}
                </Text>
              </View>
              <Text style={s.cardClose}>✕</Text>
            </Glass>
          </Pressable>
        ) : (
          <Pressable testID="scan-sheet-open" onPress={() => setSheet(true)}>
            <Glass style={s.mix}>
              <View style={s.bar}>
                {resins.length === 0 && <View style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.15)' }} />}
                {resins.map((r) => <View key={r} style={[s.barSeg, { flex: tally.byResin[r], backgroundColor: RESIN_COLOR[r], shadowColor: RESIN_COLOR[r] }]} />)}
              </View>
              <View style={s.mixRow}>
                {resins.slice(0, 3).map((r) => (
                  <Text key={r} style={s.mixText}>
                    <Text style={{ color: RESIN_COLOR[r] }}>{r}</Text> {pct(tally.byResin[r], tally.plastic)}%
                  </Text>
                ))}
                <Text style={[s.mixText, { marginLeft: 'auto', color: CYAN }]}>⌃</Text>
              </View>
            </Glass>
          </Pressable>
        )}
      </View>}

      {/* Ready: one big start button */}
      {phase === 'ready' && consent && (
        <View style={s.readyWrap} pointerEvents="box-none">
          <Pressable testID="scan-start" onPress={startScan} style={s.startBtn} accessibilityLabel={t.start}>
            <Ring value={1} size={190} />
            <Text style={s.startNum}>30<Text style={s.heroPct}>s</Text></Text>
            <Text style={s.heroLabel}>{t.start.toUpperCase()}</Text>
          </Pressable>
          <Text style={[s.heroSub, { width: 260 }]}>{t.startSub}</Text>
        </View>
      )}

      {/* Details sheet: frosted glass over the live camera */}
      {sheet && scanning && (
        <View style={s.sheetWrap}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setSheet(false)} />
          <Glass testID="sheet" style={[s.sheet, { marginBottom: bottomInset }]} strong>
            <View style={s.grabber} />
            <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 8, gap: 6 }}>
              <Text style={s.sheetHead}>{share}<Text style={s.sheetHeadPct}>% {t.plastic}</Text></Text>
              <Text style={s.muted}>{t.ofItems(tally.total)}  ·  {clock(left)} {t.left}</Text>
              <Breakdown tally={tally} lang={lang} />
              <Pressable testID="sheet-close" onPress={() => setSheet(false)} style={[s.btn, s.btnPrimary, s.btnSolo]}>
                <Text style={[s.btnText, { color: CYAN }]}>{t.close.toUpperCase()}</Text>
              </Pressable>
              <Text style={[s.fine, { color: AMBER, opacity: 0.8 }]}>{t.demoInfo}</Text>
            </ScrollView>
          </Glass>
        </View>
      )}

      {/* Results after 30 seconds, with recommendations */}
      {phase === 'done' && (
        <Glass testID="results" style={[s.results, { bottom: bottomInset }]} strong>
          <SafeAreaView edges={['top']} style={{ flex: 1 }}>
            <ScrollView contentContainerStyle={{ padding: 22, gap: 6 }}>
              <Text style={s.section}>{t.resultKicker.toUpperCase()}</Text>
              <Text style={s.sheetHead}>{share}<Text style={s.sheetHeadPct}>% {t.plastic}</Text></Text>
              <Text style={s.muted}>{t.ofItems(tally.total)}</Text>

              <Text style={s.section}>{t.recsTitle.toUpperCase()}</Text>
              {recommend(tally, lang).map((r, i) => (
                <View key={r.id} testID={`rec-${r.id}`} style={[s.rec, i === 0 && s.recFirst]}>
                  <Text style={[s.recGlyph, i === 0 && { color: CYAN }]}>{r.glyph}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={s.recTitle}>{r.title}</Text>
                    <Text style={s.recBody}>{r.body}</Text>
                  </View>
                </View>
              ))}

              <Breakdown tally={tally} lang={lang} />

              <Pressable testID="scan-again" onPress={startScan} style={[s.btn, s.btnPrimary, s.btnSolo]}>
                <Text style={[s.btnText, { color: CYAN }]}>{t.scanAgain.toUpperCase()}</Text>
              </Pressable>
              <Text style={s.fine}>{t.recsNote}</Text>
              <Text style={[s.fine, { color: AMBER, opacity: 0.8 }]}>{t.demoInfo}</Text>
            </ScrollView>
          </SafeAreaView>
        </Glass>
      )}

      {/* First open: consent before counting starts (governance rule 1a) */}
      {consent === false && (
        <Glass style={s.consent} strong>
          <View style={{ width: 120, height: 120 }}><Ring value={0.68} size={120} /></View>
          <Text style={s.consentTitle}>{t.consentTitle}</Text>
          <Text style={s.consentBody}>{t.consentBody}</Text>
          <Pressable onPress={() => setMoreConsent(!moreConsent)}>
            <Text style={s.link}>{t.consentMore.toUpperCase()} {moreConsent ? '⌃' : '⌄'}</Text>
          </Pressable>
          {moreConsent && <Text style={[s.consentBody, { fontSize: 13, opacity: 0.75 }]}>{t.consentMoreBody}</Text>}
          <Pressable testID="consent-start" onPress={accept} style={[s.btn, s.btnPrimary, { alignSelf: 'stretch', flexGrow: 0, flexBasis: 'auto', marginTop: 8 }]}>
            <Text style={[s.btnText, { color: CYAN }]}>{t.start.toUpperCase()}</Text>
          </Pressable>
        </Glass>
      )}
    </View>
  );
}

/** Plastic types and objects by category; shared by the live details sheet and the results. */
function Breakdown({ tally, lang }: { tally: Tally; lang: Lang }) {
  const t = SCAN[lang];
  const resins = RESIN_ORDER.filter((r) => tally.byResin[r] > 0).sort((a, b) => tally.byResin[b] - tally.byResin[a]);
  const cats = (Object.keys(CATEGORY_ICON) as Category[]).filter((c) => tally.byCategory[c].n > 0)
    .sort((a, b) => tally.byCategory[b].plastic - tally.byCategory[a].plastic || tally.byCategory[b].n - tally.byCategory[a].n);
  return (
    <>
      <Text style={s.section}>{t.types.toUpperCase()}</Text>
      {resins.map((r) => (
        <View key={r} style={s.line}>
          <Text style={[s.code, { color: RESIN_COLOR[r] }]}>{r}</Text>
          <View style={s.track}><View style={[s.fill, { width: `${pct(tally.byResin[r], tally.plastic)}%`, backgroundColor: RESIN_COLOR[r], shadowColor: RESIN_COLOR[r] }]} /></View>
          <Text style={s.lineVal}>{pct(tally.byResin[r], tally.plastic)}%</Text>
        </View>
      ))}
      <Text style={s.fine}>{t.resinNote}</Text>

      <Text style={s.section}>{t.byCategory.toUpperCase()}</Text>
      {cats.map((c) => {
        const v = tally.byCategory[c];
        return (
          <View key={c} testID={`cat-${c}`} style={[s.line, s.catLine]}>
            <Text style={[s.lineName, v.plastic === 0 && { opacity: 0.5 }]}>{t.categories[c]}</Text>
            <Text style={[s.lineVal, { width: 'auto' }, v.plastic === 0 && s.muted]}>
              {v.plastic ? t.plasticOf(v.plastic, v.n) : `${t.items(v.n)} · ${t.notPlastic.toLowerCase()}`}
            </Text>
          </View>
        );
      })}
    </>
  );
}

/** Frosted, see-through panel with a hairline edge. */
function Glass({ children, style, strong, testID }: { children: React.ReactNode; style?: any; strong?: boolean; testID?: string }) {
  return (
    <View testID={testID} style={[s.glass, style]}>
      <BlurView intensity={strong ? 45 : 25} tint="dark" experimentalBlurMethod="dimezisBlurView" style={StyleSheet.absoluteFill} />
      <View style={[StyleSheet.absoluteFill, { backgroundColor: strong ? 'rgba(6,12,18,0.45)' : 'rgba(6,12,18,0.22)' }]} />
      {children}
    </View>
  );
}

/** Thin progress ring with a faint full track. */
function Ring({ value, size = 150 }: { value: number; size?: number }) {
  const r = size / 2 - 4, c = 2 * Math.PI * r;
  return (
    <Svg width={size} height={size} style={{ position: 'absolute', top: 0 }}>
      <Circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(255,255,255,0.14)" strokeWidth={1} fill="rgba(4,10,14,0.28)" />
      <Circle cx={size / 2} cy={size / 2} r={r - 6} stroke="rgba(94,242,255,0.18)" strokeWidth={1} strokeDasharray="2 6" fill="none" />
      <Circle cx={size / 2} cy={size / 2} r={r} stroke={CYAN} strokeWidth={2.5} fill="none" strokeLinecap="round"
        strokeDasharray={`${c * Math.max(value, 0.001)} ${c}`} transform={`rotate(-90 ${size / 2} ${size / 2})`} />
    </Svg>
  );
}

const CYAN = '#5ef2ff';
const AMBER = '#ffc95c';
const MONO = Platform.select({ ios: 'Menlo', android: 'monospace', default: 'ui-monospace, Menlo, monospace' });
const HAIR = 'rgba(255,255,255,0.18)';
const glow = (radius: number) => ({ shadowOpacity: 0.9, shadowRadius: radius, shadowOffset: { width: 0, height: 0 } });
const halo = { textShadowColor: 'rgba(0,0,0,0.75)', textShadowRadius: 6, textShadowOffset: { width: 0, height: 0 } };
const fill = { position: 'absolute' as const, top: 0, left: 0, right: 0, bottom: 0 };

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#05090c', overflow: 'hidden' },
  noCam: { backgroundColor: '#0b1419' },
  tint: { backgroundColor: 'rgba(0,20,30,0.18)' },
  sweep: { position: 'absolute', left: 0, right: 0, top: 0, height: 40 },
  sweepGlow: { position: 'absolute', left: 0, right: 0, top: 0, height: 39, backgroundColor: 'rgba(94,242,255,0.05)' },
  sweepLine: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 1, backgroundColor: 'rgba(94,242,255,0.7)', shadowColor: CYAN, ...glow(8) },
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, paddingHorizontal: 14 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 8 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 7, borderWidth: 1, borderColor: HAIR, backgroundColor: 'rgba(4,10,14,0.32)', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 7 },
  chipDemo: { borderColor: 'rgba(255,201,92,0.55)' },
  chipText: { color: 'rgba(255,255,255,0.9)', fontSize: 11, fontFamily: MONO, letterSpacing: 1.5 },
  dot: { width: 7, height: 7, borderRadius: 4 },
  dotOn: { backgroundColor: '#ff4d6d', shadowColor: '#ff4d6d', ...glow(6) },
  dotOff: { backgroundColor: 'rgba(255,255,255,0.35)' },
  glass: { overflow: 'hidden', borderWidth: 1, borderColor: HAIR },
  infoBox: { borderRadius: 14, padding: 12, marginTop: 10, gap: 6 },
  infoText: { color: 'rgba(255,255,255,0.85)', fontSize: 12.5, lineHeight: 18 },
  link: { color: CYAN, fontFamily: MONO, fontSize: 12, letterSpacing: 1.5 },
  hero: { alignSelf: 'center', alignItems: 'center', width: 150, marginTop: 14 },
  heroInner: { width: 150, height: 150, alignItems: 'center', justifyContent: 'center' },
  heroNum: { color: '#fff', fontSize: 54, fontWeight: '200', letterSpacing: -2, textShadowColor: 'rgba(94,242,255,0.8)', textShadowRadius: 14 },
  heroPct: { fontSize: 22, fontWeight: '300', color: CYAN },
  heroLabel: { ...halo, color: CYAN, fontSize: 10, fontFamily: MONO, letterSpacing: 4, marginTop: -2 },
  heroSub: { ...halo, color: 'rgba(255,255,255,0.85)', fontSize: 11, marginTop: 6, textAlign: 'center', width: 240 },
  box: { position: 'absolute' },
  corner: { position: 'absolute', width: 16, height: 16, ...glow(6) },
  tl: { top: 0, left: 0, borderTopWidth: 2, borderLeftWidth: 2, borderTopLeftRadius: 6 },
  tr: { top: 0, right: 0, borderTopWidth: 2, borderRightWidth: 2, borderTopRightRadius: 6 },
  bl: { bottom: 0, left: 0, borderBottomWidth: 2, borderLeftWidth: 2, borderBottomLeftRadius: 6 },
  br: { bottom: 0, right: 0, borderBottomWidth: 2, borderRightWidth: 2, borderBottomRightRadius: 6 },
  centerDot: { position: 'absolute', left: '50%', top: '50%', width: 5, height: 5, borderRadius: 3, marginLeft: -2.5, marginTop: -2.5, ...glow(6) },
  tag: { position: 'absolute', top: -20, left: 0, flexDirection: 'row', gap: 6, alignItems: 'baseline' },
  tagText: { ...halo, fontFamily: MONO, fontSize: 11, fontWeight: '700', letterSpacing: 1 },
  tagConf: { ...halo, fontFamily: MONO, fontSize: 9, color: 'rgba(255,255,255,0.75)' },
  bottom: { position: 'absolute', left: 0, right: 0, padding: 14 },
  mix: { borderRadius: 18, padding: 14, gap: 10 },
  bar: { flexDirection: 'row', height: 3, gap: 3 },
  barSeg: { borderRadius: 2, ...glow(5) },
  mixRow: { flexDirection: 'row', gap: 14, alignItems: 'center' },
  mixText: { color: 'rgba(255,255,255,0.8)', fontSize: 12, fontFamily: MONO, letterSpacing: 1 },
  card: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 18, padding: 14 },
  cardStripe: { width: 3, alignSelf: 'stretch', borderRadius: 2 },
  cardKicker: { color: 'rgba(255,255,255,0.5)', fontSize: 10, fontFamily: MONO, letterSpacing: 2 },
  cardTitle: { fontSize: 18, fontWeight: '300', color: '#fff', marginTop: 2 },
  cardSub: { fontSize: 12, color: CYAN, marginTop: 3, fontFamily: MONO },
  cardClose: { color: 'rgba(255,255,255,0.5)', fontSize: 14, padding: 4 },
  sheetWrap: { ...fill, backgroundColor: 'rgba(0,0,0,0.15)', justifyContent: 'flex-end', padding: 10 },
  sheet: { borderRadius: 26, maxHeight: '76%' },
  grabber: { alignSelf: 'center', width: 36, height: 3, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.3)', marginTop: 10 },
  sheetHead: { fontSize: 44, fontWeight: '200', color: '#fff', letterSpacing: -1 },
  sheetHeadPct: { fontSize: 18, fontWeight: '300', color: CYAN, letterSpacing: 0 },
  section: { fontSize: 10, color: 'rgba(255,255,255,0.5)', fontFamily: MONO, letterSpacing: 2.5, marginTop: 18, marginBottom: 2 },
  line: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 6 },
  catLine: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: 'rgba(255,255,255,0.1)' },
  code: { fontFamily: MONO, fontSize: 13, width: 52, letterSpacing: 1 },
  lineName: { fontSize: 15, color: '#fff', flex: 1, fontWeight: '300' },
  track: { flex: 1, height: 2, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 1 },
  fill: { height: '100%', borderRadius: 1, ...glow(5) },
  lineVal: { fontSize: 13, color: '#fff', fontFamily: MONO, width: 44, textAlign: 'right' },
  muted: { color: 'rgba(255,255,255,0.5)', fontSize: 12.5 },
  fine: { color: 'rgba(255,255,255,0.4)', fontSize: 11, lineHeight: 15, marginTop: 6 },
  btn: { flex: 1, paddingVertical: 14, borderRadius: 14, alignItems: 'center', borderWidth: 1 },
  btnPrimary: { borderColor: 'rgba(94,242,255,0.6)', backgroundColor: 'rgba(94,242,255,0.08)' },
  btnGhost: { borderColor: HAIR, backgroundColor: 'rgba(255,255,255,0.03)' },
  btnText: { color: 'rgba(255,255,255,0.85)', fontSize: 12, fontFamily: MONO, letterSpacing: 2 },
  heroClock: { color: CYAN, fontFamily: MONO, letterSpacing: 1 },
  readyWrap: { ...fill, alignItems: 'center', justifyContent: 'center', gap: 18 },
  startBtn: { width: 190, height: 190, alignItems: 'center', justifyContent: 'center' },
  startNum: { color: '#fff', fontSize: 64, fontWeight: '200', letterSpacing: -2, textShadowColor: 'rgba(94,242,255,0.8)', textShadowRadius: 14 },
  btnSolo: { flexGrow: 0, flexBasis: 'auto', marginTop: 18 },
  results: { position: 'absolute', top: 0, left: 0, right: 0, borderWidth: 0 },
  rec: { flexDirection: 'row', gap: 14, alignItems: 'flex-start', padding: 14, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)', backgroundColor: 'rgba(255,255,255,0.03)', marginTop: 6 },
  recFirst: { borderColor: 'rgba(94,242,255,0.5)', backgroundColor: 'rgba(94,242,255,0.07)' },
  recGlyph: { color: 'rgba(255,255,255,0.7)', fontSize: 22, width: 26, textAlign: 'center' },
  recTitle: { color: '#fff', fontSize: 16, fontWeight: '400' },
  recBody: { color: 'rgba(255,255,255,0.65)', fontSize: 13, lineHeight: 18, marginTop: 2 },
  consent: { ...fill, borderWidth: 0, alignItems: 'center', justifyContent: 'center', padding: 30, gap: 14 },
  consentTitle: { fontSize: 24, fontWeight: '200', color: '#fff', textAlign: 'center', marginTop: 6 },
  consentBody: { fontSize: 14.5, color: 'rgba(255,255,255,0.75)', textAlign: 'center', lineHeight: 21 },
});
