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
