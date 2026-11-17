import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ObjectType, Status } from './data';

export type Lang = 'en' | 'es';
const KEY = 'ep_lang_v1';

type Strings = {
  subtitle: string;
  homeTitle: string; homeBody: string; takePhoto: string; wait: string; noName: string;
  confirmTitle: string; noPhoto: string; protoNote: string; send: string; pickFirst: string; cancel: string;
  noLocation: string;
  sentTitle: string; sentBody: string; seeReports: string; another: string;
  listTitle: string; empty: string; facilitator: string;
  navReport: string; navList: string;
  switchTo: string;
  types: Record<ObjectType, string>;
  status: Record<Status, string>;
};

export const STRINGS: Record<Lang, Strings> = {
  en: {
    subtitle: 'Test prototype · Municipality of [district]',
    homeTitle: 'See litter on the street?',
    homeBody: 'Take a photo. The municipality receives it with the location and tells you when it is cleaned.',
    takePhoto: 'Take photo', wait: 'One moment…',
    noName: 'We never ask for your name or number.',
    confirmTitle: 'What is it?',
    noPhoto: 'No photo (camera not allowed)',
    protoNote: 'In the final app, the phone will suggest the type and blur faces and license plates. In this prototype you choose, and the photo never leaves your phone.',
    send: 'Send report', pickFirst: 'Choose the type to send', cancel: 'Cancel',
    noLocation: 'Location not available',
    sentTitle: 'Report sent',
    sentBody: 'The municipality received it. You can see when it is scheduled and when it is cleaned.',
    seeReports: 'See my reports', another: 'Report another',
    listTitle: 'My reports', empty: 'You have not sent any reports yet.',
    facilitator: 'For the person running the test: long-press a report to simulate progress by the municipality.',
    navReport: 'Report', navList: 'My reports',
    switchTo: 'ES',
    types: { bottle: 'Bottle', bag: 'Bag', cup: 'Cup', tecnopor: 'Styrofoam', cigarette_butt: 'Cigarette butt', mixed_pile: 'Mixed pile' },
    status: { received: 'Received', scheduled: 'Scheduled', cleaned: 'Cleaned' },
  },
  es: {
    subtitle: 'Prototipo de prueba · Municipalidad de [distrito]',
    homeTitle: '¿Ves basura en la calle?',
    homeBody: 'Toma una foto. La municipalidad la recibe con la ubicación y te avisa cuando esté limpio.',
    takePhoto: 'Tomar foto', wait: 'Un momento…',
    noName: 'No pedimos tu nombre ni tu número.',
    confirmTitle: '¿Qué es?',
    noPhoto: 'Sin foto (cámara no permitida)',
    protoNote: 'En la app final, el teléfono sugerirá el tipo y difuminará rostros y placas. En este prototipo eliges tú, y la foto no sale de tu teléfono.',
    send: 'Enviar reporte', pickFirst: 'Elige el tipo para enviar', cancel: 'Cancelar',
    noLocation: 'Ubicación no disponible',
    sentTitle: 'Reporte enviado',
    sentBody: 'La municipalidad lo recibió. Puedes ver cuándo lo programan y cuándo lo limpian.',
    seeReports: 'Ver mis reportes', another: 'Reportar otro',
    listTitle: 'Mis reportes', empty: 'Todavía no has enviado reportes.',
    facilitator: 'Para quien conduce la prueba: mantén presionado un reporte para simular el avance de la municipalidad.',
    navReport: 'Reportar', navList: 'Mis reportes',
    switchTo: 'EN',
    types: { bottle: 'Botella', bag: 'Bolsa', cup: 'Vaso', tecnopor: 'Tecnopor', cigarette_butt: 'Colilla', mixed_pile: 'Montículo mixto' },
    status: { received: 'Recibido', scheduled: 'Programado', cleaned: 'Limpiado' },
  },
};

export async function loadLang(): Promise<Lang> {
  try {
    const v = await AsyncStorage.getItem(KEY);
    return v === 'es' ? 'es' : 'en';
  } catch {
    return 'en';
  }
}

export function saveLang(lang: Lang): void {
  AsyncStorage.setItem(KEY, lang).catch(() => {});
}

import type { Category } from './demo';

type ScanStrings = {
  plastic: string; ofItems: (n: number) => string; demo: string; demoInfo: string;
  counting: string; paused: string; pause: string; resume: string;
  pointCamera: string; types: string; byCategory: string; items: (n: number) => string; plasticOf: (p: number, n: number) => string;
  notPlastic: string; resinNote: string; confidence: string; newRoom: string; close: string;
  noCamera: string; allowCamera: string;
  consentTitle: string; consentBody: string; consentMore: string; consentMoreBody: string; start: string;
  navScan: string;
  categories: Record<Category, string>; itemNames: Record<string, string>;
};

export const SCAN: Record<Lang, ScanStrings> = {
  en: {
    plastic: 'plastic', ofItems: (n) => `of ${n} items in this room`, demo: 'DEMO',
    demoInfo: 'Demo: the items and numbers are invented to test the screen. The plastic model is not trained yet.',
    counting: 'Counting', paused: 'Paused', pause: 'Pause', resume: 'Resume',
    pointCamera: 'Point the camera around the room',
    types: 'Types of plastic', byCategory: 'Objects by category', items: (n) => `${n} item${n === 1 ? '' : 's'}`,
    plasticOf: (p, n) => `${p} of ${n} plastic`,
    notPlastic: 'Not plastic', resinNote: 'Type of plastic is the usual one for this object, not measured.',
    confidence: 'sure', newRoom: 'New room', close: 'Close',
    noCamera: 'Camera not available — the demo continues without the picture.', allowCamera: 'Allow camera',
    consentTitle: 'Escanea counts the plastic it sees',
    consentBody: 'The picture never leaves your phone. Only counts by district are sent. You can pause any time.',
    consentMore: 'More detail',
    consentMoreBody: 'Sent: item type, plastic yes/no, time, district. Not sent: images, exact location, your name or number. In this test nothing is sent at all.',
    start: 'Start scanning', navScan: 'Scan',
    categories: { bottles: 'Bottles', bags: 'Bags & film', packaging: 'Wrappers & trays', cups_containers: 'Cups & containers', caps: 'Caps & lids', tecnopor: 'Styrofoam', metal: 'Metal', glass: 'Glass', paper: 'Paper & carton' },
    itemNames: { water_bottle: 'Water bottle', soda_bottle: 'Soda bottle', shampoo_bottle: 'Shampoo bottle', carrier_bag: 'Carrier bag', bread_bag: 'Bread bag', snack_wrapper: 'Snack wrapper', food_tray: 'Food tray', yogurt_cup: 'Yogurt cup', takeaway_box: 'Takeaway box', bottle_cap: 'Bottle cap', foam_cup: 'Foam cup', foam_box: 'Foam food box', can: 'Can', glass_jar: 'Glass jar', carton: 'Milk carton', newspaper: 'Newspaper' },
  },
  es: {
    plastic: 'plástico', ofItems: (n) => `de ${n} objetos en este ambiente`, demo: 'DEMO',
    demoInfo: 'Demo: los objetos y números son inventados para probar la pantalla. El modelo de plástico aún no está entrenado.',
    counting: 'Contando', paused: 'En pausa', pause: 'Pausar', resume: 'Seguir',
    pointCamera: 'Apunta la cámara por el ambiente',
    types: 'Tipos de plástico', byCategory: 'Objetos por categoría', items: (n) => `${n} objeto${n === 1 ? '' : 's'}`,
    plasticOf: (p, n) => `${p} de ${n} de plástico`,
    notPlastic: 'No es plástico', resinNote: 'El tipo de plástico es el habitual para este objeto, no se mide.',
    confidence: 'seguro', newRoom: 'Nuevo ambiente', close: 'Cerrar',
    noCamera: 'Cámara no disponible — la demo sigue sin imagen.', allowCamera: 'Permitir cámara',
    consentTitle: 'Escanea cuenta el plástico que ve',
    consentBody: 'La imagen nunca sale de tu teléfono. Solo se envían conteos por distrito. Puedes pausar cuando quieras.',
    consentMore: 'Más detalle',
    consentMoreBody: 'Se envía: tipo de objeto, plástico sí/no, hora, distrito. No se envía: imágenes, ubicación exacta, tu nombre ni número. En esta prueba no se envía nada.',
    start: 'Empezar a escanear', navScan: 'Escanear',
    categories: { bottles: 'Botellas', bags: 'Bolsas y film', packaging: 'Envolturas y bandejas', cups_containers: 'Vasos y envases', caps: 'Tapas', tecnopor: 'Tecnopor', metal: 'Metal', glass: 'Vidrio', paper: 'Papel y cartón' },
    itemNames: { water_bottle: 'Botella de agua', soda_bottle: 'Botella de gaseosa', shampoo_bottle: 'Frasco de champú', carrier_bag: 'Bolsa de compras', bread_bag: 'Bolsa de pan', snack_wrapper: 'Envoltura de snack', food_tray: 'Bandeja', yogurt_cup: 'Vaso de yogur', takeaway_box: 'Táper', bottle_cap: 'Tapa', foam_cup: 'Vaso de tecnopor', foam_box: 'Caja de tecnopor', can: 'Lata', glass_jar: 'Frasco de vidrio', carton: 'Caja de leche', newspaper: 'Periódico' },
  },
};
