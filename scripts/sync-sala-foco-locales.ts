import fs from "fs";
import path from "path";

const translations: Record<string, any> = {
  "pt-PT": {
    titulo: "Sala de Foco em Grupo",
    subtitulo: "Temporizador Pomodoro sincronizado, metas de estudo e chat colaborativo",
    foco_ativo: "Sessão de Foco em Curso",
    pausa_curta: "Pausa Curta",
    pausa_longa: "Pausa Longa",
    definir_meta: "Definir Meta de Estudo",
    meta_placeholder: "Ex: Terminar 5 exercícios de Cálculo...",
    colegas_focando: "Colegas a Focar Agora ({{count}})",
    chat_ao_vivo: "Chat da Sala de Foco",
    enviar_mensagem: "Enviar mensagem de incentivo ou dúvida...",
    voce: "Tu",
    conectando: "A ligar à sala de foco...",
    sala_vazia: "Nenhum colega a estudar nesta sala agora. Sê o primeiro a focar!"
  },
  "en-GB": {
    titulo: "Group Focus Room",
    subtitulo: "Synchronised Pomodoro timer, study goals, and collaborative chat",
    foco_ativo: "Focus Session in Progress",
    pausa_curta: "Short Break",
    pausa_longa: "Long Break",
    definir_meta: "Set Study Goal",
    meta_placeholder: "E.g.: Complete 5 Calculus exercises...",
    colegas_focando: "Classmates Focussing Now ({{count}})",
    chat_ao_vivo: "Focus Room Chat",
    enviar_mensagem: "Send an encouraging message or question...",
    voce: "You",
    conectando: "Connecting to focus room...",
    sala_vazia: "No classmates studying in this room right now. Be the first to focus!"
  },
  fr: {
    titulo: "Salle de Concentration en Groupe",
    subtitulo: "Minuteur Pomodoro synchronisé, objectifs d'étude et chat collaboratif",
    foco_ativo: "Session de Concentration en Cours",
    pausa_curta: "Courte Pause",
    pausa_longa: "Longue Pause",
    definir_meta: "Définir l'Objectif d'Étude",
    meta_placeholder: "Ex: Terminer 5 exercices de Calcul...",
    colegas_focando: "Camarades Concentrés Maintenant ({{count}})",
    chat_ao_vivo: "Chat de la Salle de Concentration",
    enviar_mensagem: "Envoyer un message d'encouragement ou une question...",
    voce: "Vous",
    conectando: "Connexion à la salle de concentration...",
    sala_vazia: "Aucun camarade n'étudie dans cette salle pour le moment. Soyez le premier à vous concentrer!"
  },
  de: {
    titulo: "Gruppen-Fokusraum",
    subtitulo: "Synchronisierter Pomodoro-Timer, Lernziele und kollaborativer Chat",
    foco_ativo: "Fokus-Sitzung läuft",
    pausa_curta: "Kurze Pause",
    pausa_longa: "Lange Pause",
    definir_meta: "Lernziel festlegen",
    meta_placeholder: "Z.B.: 5 Mathe-Übungen abschließen...",
    colegas_focando: "Mitschüler jetzt fokussiert ({{count}})",
    chat_ao_vivo: "Fokusraum-Chat",
    enviar_mensagem: "Ermutigende Nachricht oder Frage senden...",
    voce: "Du",
    conectando: "Verbindung zum Fokusraum wird hergestellt...",
    sala_vazia: "Niemand lernt gerade in diesem Raum. Sei der Erste!"
  },
  it: {
    titulo: "Stanza di Studio e Concentrazione",
    subtitulo: "Timer Pomodoro sincronizzato, obiettivi di studio e chat collaborativa",
    foco_ativo: "Sessione di Concentrazione in Corso",
    pausa_curta: "Pausa Breve",
    pausa_longa: "Pausa Lunga",
    definir_meta: "Imposta Obiettivo di Studio",
    meta_placeholder: "Es: Completare 5 esercizi di Analisi...",
    colegas_focando: "Compagni Concentrati Ora ({{count}})",
    chat_ao_vivo: "Chat della Stanza di Studio",
    enviar_mensagem: "Invia un messaggio o una domanda...",
    voce: "Tu",
    conectando: "Connessione alla stanza in corso...",
    sala_vazia: "Nessun compagno sta studiando in questa stanza adesso. Sii il primo!"
  },
  ar: {
    titulo: "غرفة التركيز الجماعي",
    subtitulo: "مؤقت بومودورو متزامن، أهداف دراسية ومحادثة تعاونية",
    foco_ativo: "جلسة التركيز جارية",
    pausa_curta: "استراحة قصيرة",
    pausa_longa: "استراحة طويلة",
    definir_meta: "تحديد هدف الدراسة",
    meta_placeholder: "مثال: إكمال 5 تمارين في الرياضيات...",
    colegas_focando: "الزملاء الذين يركزون الآن ({{count}})",
    chat_ao_vivo: "محادثة غرفة التركيز",
    enviar_mensagem: "إرسال رسالة تشجيع أو سؤال...",
    voce: "أنت",
    conectando: "جارٍ الاتصال بغرفة التركيز...",
    sala_vazia: "لا يوجد زملاء يدرسون في هذه الغرفة الآن. كن أول من يركز!"
  },
  he: {
    titulo: "חדר מיקוד קבוצתי",
    subtitulo: "טיימר פומודורו מסונכרן, יעדי לימוד וצ'אט שיתופי",
    foco_ativo: "מפגש מיקוד בעיצומו",
    pausa_curta: "הפסקה קצרה",
    pausa_longa: "הפסקה ארוכה",
    definir_meta: "הגדר יעד לימוד",
    meta_placeholder: "לדוגמה: לסיים 5 תרגילים במתמטיקה...",
    colegas_focando: "חברים ממוקדים עכשיו ({{count}})",
    chat_ao_vivo: "צ'אט חדר המיקוד",
    enviar_mensagem: "שלח הודעת עידוד או שאלה...",
    voce: "אתה",
    conectando: "מתחבר לחדר המיקוד...",
    sala_vazia: "אף חבר אינו לומד בחדר זה כרגע. היה הראשון להתמקד!"
  },
  fa: {
    titulo: "اتاق تمرکز گروهی",
    subtitulo: "تایمر پومودورو همگام، اهداف مطالعه و چت مشارکتی",
    foco_ativo: "جلسه تمرکز در حال انجام است",
    pausa_curta: "استراحت کوتاه",
    pausa_longa: "استراحت طولانی",
    definir_meta: "تعیین هدف مطالعه",
    meta_placeholder: "مثال: تکمیل ۵ تمرین ریاضی...",
    colegas_focando: "همکلاسی‌های متمرکز ({{count}})",
    chat_ao_vivo: "چت اتاق تمرکز",
    enviar_mensagem: "ارسال پیام تشویقی یا سوال...",
    voce: "شما",
    conectando: "در حال اتصال به اتاق تمرکز...",
    sala_vazia: "در حال حاضر هیچ همکاری در این اتاق مطالعه نمی‌کند. اولین نفر باشید!"
  },
  ur: {
    titulo: "گروپ فوکس روم",
    subtitulo: "ہم آہنگ پومودورو ٹائمر، مطالعہ کے اہداف اور چیٹ",
    foco_ativo: "فوکس سیشن جاری ہے",
    pausa_curta: "مختصر وقفہ",
    pausa_longa: "طویل وقفہ",
    definir_meta: "مطالعہ کا ہدف مقرر کریں",
    meta_placeholder: "مثال: ریاضی کے 5 مشقیں مکمل کریں...",
    colegas_focando: "ابھی مطالعہ کرنے والے ساتھی ({{count}})",
    chat_ao_vivo: "فوکس روم چیٹ",
    enviar_mensagem: "حوصلہ افزائی کا پیغام یا سوال بھیجیں...",
    voce: "آپ",
    conectando: "فوکس روم سے منسلک ہو رہا ہے...",
    sala_vazia: "ابھی اس کمرے میں کوئی ساتھی نہیں ہے۔ سب سے پہلے فوکس کریں!"
  },
  ja: {
    titulo: "グループ集中ルーム",
    subtitulo: "同期ポモドーロタイマー、学習目標、協力チャット",
    foco_ativo: "集中セッション中",
    pausa_curta: "短い休憩",
    pausa_longa: "長い休憩",
    definir_meta: "学習目標を設定",
    meta_placeholder: "例：計算問題を5問解く...",
    colegas_focando: "集中中の仲間 ({{count}})",
    chat_ao_vivo: "集中ルームチャット",
    enviar_mensagem: "励ましや質問のメッセージを送信...",
    voce: "あなた",
    conectando: "集中ルームに接続中...",
    sala_vazia: "現在このルームで勉強している仲間はいません。最初に集中を始めましょう！"
  },
  zh: {
    titulo: "小组专注自习室",
    subtitulo: "同步番茄钟、学习目标与协作聊天",
    foco_ativo: "专注学习中",
    pausa_curta: "短休息",
    pausa_longa: "长休息",
    definir_meta: "设定学习目标",
    meta_placeholder: "例：完成5道微积分习题...",
    colegas_focando: "正在专注的同学 ({{count}})",
    chat_ao_vivo: "自习室聊天",
    enviar_mensagem: "发送鼓励或疑问...",
    voce: "你",
    conectando: "正在连接专注自习室...",
    sala_vazia: "目前没有同学在此自习室学习。成为第一个开始专注的人吧！"
  },
  ko: {
    titulo: "그룹 집중 스터디룸",
    subtitulo: "동기화된 뽀모도로 타이머, 학습 목표 및 협업 채팅",
    foco_ativo: "집중 세션 진행 중",
    pausa_curta: "짧은 휴식",
    pausa_longa: "긴 휴식",
    definir_meta: "학습 목표 설정",
    meta_placeholder: "예: 미적분 문제 5개 완료...",
    colegas_focando: "현재 집중 중인 동료 ({{count}})",
    chat_ao_vivo: "스터디룸 채팅",
    enviar_mensagem: "응원 또는 질문 메시지 보내기...",
    voce: "나",
    conectando: "집중 스터디룸 연결 중...",
    sala_vazia: "현재 이 방에서 공부 중인 동료가 없습니다. 가장 먼저 집중을 시작해보세요!"
  },
  ru: {
    titulo: "Групповая комната фокуса",
    subtitulo: "Синхронизированный таймер Помодоро, учебные цели и совместный чат",
    foco_ativo: "Сессия фокуса активна",
    pausa_curta: "Короткий перерыв",
    pausa_longa: "Длинный перерыв",
    definir_meta: "Установить цель занятия",
    meta_placeholder: "Пример: решить 5 задач по математике...",
    colegas_focando: "Однокурсники в фокусе ({{count}})",
    chat_ao_vivo: "Чат комнаты фокуса",
    enviar_mensagem: "Отправить сообщение поддержки или вопрос...",
    voce: "Вы",
    conectando: "Подключение к комнате фокуса...",
    sala_vazia: "Сейчас в этой комнате никто не учится. Начните первым!"
  },
  hi: {
    titulo: "समूह फोकस कक्ष",
    subtitulo: "सिंक्रनाइज़ पोमोडोरो टाइमर, अध्ययन लक्ष्य और सहयोगी चैट",
    foco_ativo: "फोकस सत्र जारी है",
    pausa_curta: "छोटा ब्रेक",
    pausa_longa: "लंबा ब्रेक",
    definir_meta: "अध्ययन का लक्ष्य निर्धारित करें",
    meta_placeholder: "उदा.: 5 गणित के प्रश्न हल करें...",
    colegas_focando: "अभी फोकस कर रहे सहपाठी ({{count}})",
    chat_ao_vivo: "फोकस रूम चैट",
    enviar_mensagem: "प्रोत्साहन संदेश या प्रश्न भेजें...",
    voce: "आप",
    conectando: "फोकस रूम से जुड़ रहे हैं...",
    sala_vazia: "इस कमरे में अभी कोई साथी अध्ययन नहीं कर रहा है। पहले फोकस करने वाले बनें!"
  },
  nl: {
    titulo: "Groepsfocusruimte",
    subtitulo: "Gesynchroniseerde Pomodoro-timer, studiedoelen en chat",
    foco_ativo: "Focussessie bezig",
    pausa_curta: "Korte pauze",
    pausa_longa: "Lange pauze",
    definir_meta: "Studiedoel instellen",
    meta_placeholder: "Bijv.: 5 wiskunde-oefeningen voltooien...",
    colegas_focando: "Studenten die nu focussen ({{count}})",
    chat_ao_vivo: "Focusruimte-chat",
    enviar_mensagem: "Stuur een bemoedigend bericht of vraag...",
    voce: "Jij",
    conectando: "Verbinden met focusruimte...",
    sala_vazia: "Er studeert momenteel niemand in deze ruimte. Wees de eerste!"
  },
  tr: {
    titulo: "Grup Odaklanma Odası",
    subtitulo: "Senkronize Pomodoro zamanlayıcı, çalışma hedefleri ve sohbet",
    foco_ativo: "Odaklanma Seansı Devam Ediyor",
    pausa_curta: "Kısa Mola",
    pausa_longa: "Uzun Mola",
    definir_meta: "Çalışma Hedefi Belirle",
    meta_placeholder: "Örn: 5 Matematik sorusu çöz...",
    colegas_focando: "Şu Anda Odaklananlar ({{count}})",
    chat_ao_vivo: "Odaklanma Odası Sohbeti",
    enviar_mensagem: "Teşvik mesajı veya soru gönder...",
    voce: "Sen",
    conectando: "Odaklanma odasına bağlanılıyor...",
    sala_vazia: "Şu anda bu odada kimse çalışmıyor. İlk odaklanan sen ol!"
  },
  pl: {
    titulo: "Grupowy Pokój Skupienia",
    subtitulo: "Zsynchronizowany timer Pomodoro, cele naukowe i wspólny czat",
    foco_ativo: "Sesja skupienia w toku",
    pausa_curta: "Krótka przerwa",
    pausa_longa: "Długa przerwa",
    definir_meta: "Ustaw cel nauki",
    meta_placeholder: "Np.: Rozwiąż 5 zadań z matematyki...",
    colegas_focando: "Uczący się teraz ({{count}})",
    chat_ao_vivo: "Czat pokoju skupienia",
    enviar_mensagem: "Wyślij wiadomość wsparcia lub pytanie...",
    voce: "Ty",
    conectando: "Łączenie z pokojem skupienia...",
    sala_vazia: "Nikt w tym pokoju teraz się nie uczy. Bądź pierwszy!"
  },
  sv: {
    titulo: "Gruppfokusrum",
    subtitulo: "Synkroniserad Pomodoro-timer, studiemål och samarbetschat",
    foco_ativo: "Fokussession pågår",
    pausa_curta: "Kort paus",
    pausa_longa: "Lång paus",
    definir_meta: "Sätt studiemål",
    meta_placeholder: "T.ex.: Slutför 5 matematikövningar...",
    colegas_focando: "Klasskamrater som fokuserar nu ({{count}})",
    chat_ao_vivo: "Fokusrumschat",
    enviar_mensagem: "Skicka ett uppmuntrande meddelande eller fråga...",
    voce: "Du",
    conectando: "Ansluter till fokusrummet...",
    sala_vazia: "Ingen studerar i detta rum just nu. Bli den första att fokusera!"
  },
  id: {
    titulo: "Ruang Fokus Belajar Kelompok",
    subtitulo: "Timer Pomodoro tersinkronisasi, target belajar dan obrolan kelompok",
    foco_ativo: "Sesi Fokus Sedang Berlangsung",
    pausa_curta: "Istirahat Singkat",
    pausa_longa: "Istirahat Panjang",
    definir_meta: "Tentukan Target Belajar",
    meta_placeholder: "Contoh: Selesaikan 5 soal kalkulus...",
    colegas_focando: "Teman yang Sedang Fokus ({{count}})",
    chat_ao_vivo: "Obrolan Ruang Fokus",
    enviar_mensagem: "Kirim pesan penyemangat atau pertanyaan...",
    voce: "Anda",
    conectando: "Menghubungkan ke ruang fokus...",
    sala_vazia: "Belum ada teman yang belajar di ruang ini. Jadilah yang pertama!"
  },
  th: {
    titulo: "ห้องอ่านหนังสือรวมแบบโฟกัส",
    subtitulo: "ตัวจับเวลาโพโมโดโรที่ซิงค์กัน เป้าหมายการเรียน และแชทกลุ่ม",
    foco_ativo: "กำลังอยู่ในช่วงโฟกัส",
    pausa_curta: "พักสั้น",
    pausa_longa: "พักยาว",
    definir_meta: "ตั้งเป้าหมายการเรียน",
    meta_placeholder: "เช่น: ทำโจทย์แคลคูลัส 5 ข้อ...",
    colegas_focando: "เพื่อนที่กำลังโฟกัสอยู่ ({{count}})",
    chat_ao_vivo: "แชทห้องโฟกัส",
    enviar_mensagem: "ส่งข้อความให้กำลังใจหรือคำถาม...",
    voce: "คุณ",
    conectando: "กำลังเชื่อมต่อไปยังห้องโฟกัส...",
    sala_vazia: "ยังไม่มีเพื่อนเรียนในห้องนี้ในตอนนี้ มาเริ่มคนแรกกันเลย!"
  },
  vi: {
    titulo: "Phòng Tập Trung Nhóm",
    subtitulo: "Đồng hồ Pomodoro đồng bộ, mục tiêu học tập và trò chuyện nhóm",
    foco_ativo: "Phiên Tập Trung Đang Diễn Ra",
    pausa_curta: "Nghỉ Ngắn",
    pausa_longa: "Nghỉ Dài",
    definir_meta: "Đặt Mục Tiêu Học Tập",
    meta_placeholder: "Ví dụ: Làm xong 5 bài tập Toán...",
    colegas_focando: "Bạn Bè Đang Tập Trung ({{count}})",
    chat_ao_vivo: "Trò Chuyện Phòng Tập Trung",
    enviar_mensagem: "Gửi lời động viên hoặc câu hỏi...",
    voce: "Bạn",
    conectando: "Đang kết nối vào phòng tập trung...",
    sala_vazia: "Hiện chưa có ai học trong phòng này. Hãy là người đầu tiên tập trung!"
  },
  uk: {
    titulo: "Групова кімната фокусу",
    subtitulo: "Синхронізований таймер Помодоро, навчальні цілі та спільний чат",
    foco_ativo: "Сесія фокусу триває",
    pausa_curta: "Коротка перерва",
    pausa_longa: "Довга перерва",
    definir_meta: "Встановити мету навчання",
    meta_placeholder: "Напр.: виконати 5 вправ з математики...",
    colegas_focando: "Однокурсники у фокусі ({{count}})",
    chat_ao_vivo: "Чат кімнати фокусу",
    enviar_mensagem: "Надіслати повідомлення підтримки або запитання...",
    voce: "Ви",
    conectando: "Підключення до кімнати фокусу...",
    sala_vazia: "Зараз у цій кімнаті ніхто не навчається. Будьте першим!"
  }
};

const localesDir = path.resolve(process.cwd(), "src/locales");
const files = fs.readdirSync(localesDir).filter(f => f.endsWith(".json"));

for (const file of files) {
  const code = file.replace(".json", "");
  const filePath = path.join(localesDir, file);
  const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));

  // Check if we have specific translations for this code
  if (translations[code]) {
    data.sala_estudo = translations[code];
  }

  // Remove obsolete call keys in chat_direto if any
  if (data.chat_direto) {
    delete data.chat_direto.iniciar_chamada_voz;
    delete data.chat_direto.iniciar_chamada_video;
  }

  // Remove obsolete call keys in sala_estudo if any
  if (data.sala_estudo) {
    delete data.sala_estudo.ligar_video;
    delete data.sala_estudo.desligar_video;
    delete data.sala_estudo.ligar_mic;
    delete data.sala_estudo.desligar_mic;
    delete data.sala_estudo.compartilhar_tela;
    delete data.sala_estudo.parar_compartilhamento;
    delete data.sala_estudo.sair_sala;
    delete data.sala_estudo.somente_voz;
    delete data.sala_estudo.participantes;
  }

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + "\n", "utf-8");
  console.log(`Synced ${file}`);
}

console.log("All locale files successfully synced!");
