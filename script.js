/* ==========================================================
   AMR SENSOR MISSION — script.js
   Semua logika: data materi, soal, skor, navigasi antar halaman,
   localStorage, simulasi peta, dan generator laporan hasil.

   ---------------------------------------------------------
   PANDUAN UNTUK GURU ada di bagian paling bawah file ini
   (lihat komentar "PANDUAN GURU").
   ---------------------------------------------------------
   ========================================================== */

/* ===================== 1. KUNCI LOCALSTORAGE ===================== */
const KEYS = {
  student: 'amrStudent',
  progress: 'amrProgress',
  sensorKnowledge: 'amrSensorKnowledge',
  detectiveScore: 'amrDetectiveScore',
  dataSensorScore: 'amrDataSensorScore',
  mission: 'amrMission',
  design: 'amrDesign',
  conditions: 'amrConditions',
  reflection: 'amrReflection',
  theme: 'amrTheme'
};

/* ===================== 2. DATA SENSOR ===================== */
/* Guru dapat mengedit teks materi di bawah ini tanpa mengubah bagian lain kode. */
const sensors = {
  encoder: {
    name: "Encoder",
    tagline: "Mengetahui putaran roda",
    function: "Mengukur putaran/rotasi roda sehingga pergerakan robot dapat diperkirakan.",
    principle: "Encoder mendeteksi perubahan posisi poros roda saat berputar, biasanya menggunakan piringan bercelah dan sensor optik atau magnetik yang menghasilkan pulsa setiap kali roda berputar sebagian.",
    data: "Jumlah pulsa (contoh: 1250, 1380, 1525...) yang berkaitan dengan jarak tempuh roda.",
    advantages: "Murah, mudah diintegrasikan, memberikan estimasi jarak dan kecepatan roda secara langsung.",
    limitations: "Data dapat menjadi tidak akurat ketika roda mengalami slip (selip) di permukaan licin, karena pulsa tetap tercatat meski roda tidak benar-benar berpindah.",
    applications: "Digunakan dalam odometri untuk memperkirakan posisi dan kecepatan AMR berdasarkan pergerakan roda."
  },
  imu: {
    name: "IMU (Inertial Measurement Unit)",
    tagline: "Mengetahui orientasi & perubahan gerak",
    function: "Mengukur orientasi robot serta perubahan gerak seperti percepatan dan kecepatan sudut.",
    principle: "IMU umumnya terdiri dari accelerometer (mengukur percepatan pada sumbu X, Y, Z) dan gyroscope (mengukur kecepatan sudut/rotasi), sehingga robot dapat mengetahui kemiringan dan arah hadapnya.",
    data: "Data percepatan (contoh: X=0.02g, Y=0.98g, Z=9.75g) dan data kecepatan sudut pada tiap sumbu.",
    advantages: "Memberikan informasi orientasi secara cepat dan dapat mendeteksi perubahan gerak mendadak tanpa bergantung pada roda.",
    limitations: "Rentan mengalami drift (penyimpangan nilai yang menumpuk seiring waktu) sehingga akurasinya menurun jika digunakan sendiri dalam waktu lama.",
    applications: "Digunakan bersama encoder untuk odometri yang lebih akurat, serta membantu menjaga kestabilan dan orientasi AMR saat bergerak."
  },
  lidar: {
    name: "LiDAR",
    tagline: "Memetakan lingkungan dengan laser",
    function: "Mengukur jarak ke objek di sekitar robot menggunakan pantulan cahaya laser untuk memetakan lingkungan dan mendeteksi obstacle.",
    principle: "LiDAR (Light Detection and Ranging) memancarkan pulsa laser ke berbagai arah dan mengukur waktu pantulnya kembali untuk menghitung jarak, membentuk peta titik-titik (point cloud) di sekeliling robot.",
    data: "Kumpulan jarak pada berbagai sudut pemindaian, yang membentuk peta 2D/3D lingkungan sekitar robot.",
    advantages: "Akurasi jarak tinggi, jangkauan luas, sangat baik untuk pemetaan lingkungan dan deteksi obstacle secara detail.",
    limitations: "Harga relatif mahal, performa dapat terganggu oleh permukaan transparan/reflektif tertentu, dan membutuhkan pemrosesan data yang lebih berat.",
    applications: "Digunakan untuk pemetaan lingkungan (mapping), penghindaran obstacle, dan navigasi presisi tinggi pada AMR indoor maupun outdoor."
  },
  ultrasonic: {
    name: "Ultrasonic",
    tagline: "Deteksi jarak dekat & obstacle",
    function: "Mendeteksi jarak ke objek terdekat menggunakan gelombang suara ultrasonik, cocok untuk deteksi obstacle jarak dekat.",
    principle: "Sensor memancarkan gelombang ultrasonik dan mengukur waktu tempuh (Time of Flight) pantulan gelombang tersebut dari objek untuk menghitung jarak.",
    data: "Nilai jarak dalam satuan meter/centimeter (contoh: 0.42 meter).",
    advantages: "Murah, sederhana, cukup andal untuk deteksi obstacle jarak dekat, tidak terpengaruh kondisi pencahayaan.",
    limitations: "Jangkauan dan akurasi terbatas dibanding LiDAR, serta dapat terpengaruh oleh permukaan yang menyerap suara atau sudut pantul yang tidak tepat.",
    applications: "Digunakan sebagai sensor tambahan untuk deteksi obstacle jarak dekat, misalnya saat robot mendekati dinding atau rak di gudang."
  },
  camera: {
    name: "Kamera",
    tagline: "Mengenali objek & tanda visual",
    function: "Menangkap citra visual lingkungan untuk mengenali objek, tanda, atau jalur menggunakan pengolahan citra (computer vision).",
    principle: "Kamera menangkap gambar yang kemudian diproses menggunakan algoritma computer vision untuk mendeteksi dan mengenali objek, warna, bentuk, atau tanda tertentu di lingkungan robot.",
    data: "Citra visual (gambar/video) yang diolah menjadi informasi seperti jenis objek, posisi objek dalam bingkai, atau tanda yang dikenali.",
    advantages: "Memberikan informasi lingkungan yang sangat kaya (bentuk, warna, tanda, teks) yang tidak dapat diberikan sensor jarak biasa.",
    limitations: "Sangat dipengaruhi oleh kondisi pencahayaan, membutuhkan daya komputasi lebih besar untuk pemrosesan citra secara real-time.",
    applications: "Digunakan untuk mengenali tanda seperti 'STATION B', mendeteksi objek di jalur robot, atau membaca marker/QR code pada AMR."
  },
  gps: {
    name: "GPS",
    tagline: "Menentukan posisi geografis",
    function: "Menentukan posisi geografis robot (latitude dan longitude) untuk kebutuhan navigasi pada area outdoor.",
    principle: "GPS menerima sinyal dari satelit untuk menghitung posisi geografis penerima di permukaan bumi berdasarkan selisih waktu tempuh sinyal dari beberapa satelit.",
    data: "Koordinat geografis, contoh: Latitude = -6.XXXX, Longitude = 106.XXXX.",
    advantages: "Memberikan posisi absolut secara global, sangat berguna untuk navigasi area terbuka yang luas.",
    limitations: "Sinyal sulit diterima dengan baik di lingkungan indoor atau area tertutup, sehingga tidak cocok dijadikan satu-satunya sensor posisi di dalam gedung.",
    applications: "Digunakan untuk navigasi outdoor, misalnya AMR yang berpindah dari satu koordinat ke koordinat lain di area terbuka."
  }
};
const sensorOrder = ['encoder','imu','lidar','ultrasonic','camera','gps'];

/* ===================== 3. DATA SKENARIO MISI ===================== */
const missions = [
  { id: 1, title: "AMR Bekerja di Dalam Gudang",
    description: "AMR digunakan untuk membawa barang dari Station A menuju Station B di dalam gudang. Robot harus mengetahui pergerakannya, orientasinya, dan mendeteksi obstacle.",
    recommendedSensors: ["encoder","imu","lidar","ultrasonic"] },
  { id: 2, title: "AMR Bergerak di Area Outdoor",
    description: "AMR harus berpindah dari koordinat A menuju koordinat B pada area terbuka.",
    recommendedSensors: ["gps","encoder","imu"] },
  { id: 3, title: "AMR Bergerak di Lorong Sempit",
    description: "AMR harus bergerak melalui lorong sempit dan menghindari dinding serta obstacle.",
    recommendedSensors: ["encoder","imu","ultrasonic","lidar"] },
  { id: 4, title: "AMR di Area dengan Banyak Obstacle",
    description: "AMR harus bergerak menuju tujuan dengan banyak obstacle pada jalurnya.",
    recommendedSensors: ["lidar","ultrasonic","camera","encoder","imu"] },
  { id: 5, title: "AMR Mengenali Tanda atau Objek",
    description: "AMR harus bergerak menuju Station B dan berhenti ketika mengenali tanda atau objek tertentu.",
    recommendedSensors: ["camera","encoder","imu"] }
];

/* ===================== 4. SOAL SENSOR DETECTIVE (12 soal) ===================== */
/* Untuk menambah soal: tambahkan objek baru pada array ini dengan format yang sama. */
const detectiveQuestions = [
  { scenario: "Robot perlu mengetahui putaran roda.", options: ["Encoder","GPS","Kamera","LiDAR"], answer: "Encoder",
    correctFeedback: "Tepat! Encoder digunakan untuk mengetahui putaran/pergerakan roda robot.",
    wrongFeedback: "Belum tepat. Perhatikan sensor yang berhubungan langsung dengan roda robot." },
  { scenario: "Robot perlu mengetahui orientasi (arah hadap) tubuhnya.", options: ["IMU","Ultrasonic","GPS","Encoder"], answer: "IMU",
    correctFeedback: "Tepat! IMU memberikan informasi orientasi robot melalui data gyroscope.",
    wrongFeedback: "Belum tepat. Orientasi berkaitan dengan sensor yang mengukur rotasi tubuh robot, bukan roda." },
  { scenario: "Robot perlu mengetahui perubahan gerak secara cepat, misalnya saat berbelok tiba-tiba.", options: ["IMU","GPS","Ultrasonic","LiDAR"], answer: "IMU",
    correctFeedback: "Tepat! Accelerometer pada IMU dapat mendeteksi perubahan gerak dengan cepat.",
    wrongFeedback: "Belum tepat. Coba pikirkan sensor yang berisi accelerometer dan gyroscope." },
  { scenario: "Robot perlu mengukur jarak ke objek menggunakan laser untuk memetakan ruangan.", options: ["LiDAR","Ultrasonic","Encoder","GPS"], answer: "LiDAR",
    correctFeedback: "Tepat! LiDAR menggunakan laser untuk mengukur jarak dan memetakan lingkungan.",
    wrongFeedback: "Belum tepat. Sensor ini menggunakan cahaya laser, bukan gelombang suara." },
  { scenario: "Robot perlu memetakan seluruh lingkungan gudang secara detail sebelum bergerak.", options: ["LiDAR","Kamera","GPS","Encoder"], answer: "LiDAR",
    correctFeedback: "Tepat! LiDAR unggul dalam membentuk peta lingkungan yang detail.",
    wrongFeedback: "Belum tepat. Pikirkan sensor dengan jangkauan luas dan akurasi jarak tinggi." },
  { scenario: "Robot perlu mendeteksi obstacle yang sangat dekat, misalnya dinding di lorong sempit.", options: ["Ultrasonic","GPS","Kamera","Encoder"], answer: "Ultrasonic",
    correctFeedback: "Tepat! Ultrasonic cocok untuk deteksi obstacle jarak dekat dengan biaya rendah.",
    wrongFeedback: "Belum tepat. Sensor ini menggunakan gelombang suara dan sederhana untuk jarak dekat." },
  { scenario: "Robot perlu mengenali objek tertentu di jalurnya, misalnya kotak berwarna merah.", options: ["Kamera","Encoder","GPS","IMU"], answer: "Kamera",
    correctFeedback: "Tepat! Kamera dapat mengenali bentuk dan warna objek melalui computer vision.",
    wrongFeedback: "Belum tepat. Sensor ini menangkap citra visual, bukan jarak atau rotasi." },
  { scenario: "Robot perlu mengenali tanda bertuliskan 'STATION B' untuk berhenti di lokasi yang tepat.", options: ["Kamera","Ultrasonic","Encoder","GPS"], answer: "Kamera",
    correctFeedback: "Tepat! Kamera mampu membaca tanda/teks di lingkungan robot.",
    wrongFeedback: "Belum tepat. Dibutuhkan sensor visual yang dapat mengenali tulisan/tanda." },
  { scenario: "Robot perlu mengetahui koordinat geografis (latitude, longitude) saat berada di area terbuka.", options: ["GPS","LiDAR","Encoder","Ultrasonic"], answer: "GPS",
    correctFeedback: "Tepat! GPS memberikan posisi geografis absolut untuk navigasi outdoor.",
    wrongFeedback: "Belum tepat. Sensor ini menerima sinyal satelit untuk menentukan posisi global." },
  { scenario: "Robot melakukan navigasi outdoor dari satu titik menuju titik lain yang jauh.", options: ["GPS","Encoder","Kamera","Ultrasonic"], answer: "GPS",
    correctFeedback: "Tepat! Untuk perpindahan outdoor berskala besar, GPS sangat membantu.",
    wrongFeedback: "Belum tepat. Pikirkan sensor yang bekerja dengan sinyal satelit di area terbuka." },
  { scenario: "Robot perlu mengetahui seberapa jauh ia telah bergerak berdasarkan pergerakan rodanya.", options: ["Encoder","GPS","LiDAR","Kamera"], answer: "Encoder",
    correctFeedback: "Tepat! Encoder menghasilkan data pulsa yang berkaitan langsung dengan jarak tempuh roda.",
    wrongFeedback: "Belum tepat. Sensor ini terpasang langsung pada poros roda robot." },
  { scenario: "Robot berada di area dengan banyak obstacle dan harus menghindarinya secara real-time.", options: ["LiDAR/Ultrasonic","GPS","Encoder","IMU"], answer: "LiDAR/Ultrasonic",
    correctFeedback: "Tepat! LiDAR dan/atau Ultrasonic adalah sensor utama untuk deteksi dan penghindaran obstacle.",
    wrongFeedback: "Belum tepat. Dibutuhkan sensor jarak yang dapat mendeteksi objek di sekitar robot secara langsung." }
];

/* ===================== 5. SOAL DATA SENSOR (6 soal) ===================== */
const dataSensorQuestions = [
  { label: "Data A — Wheel Pulses", block: "1250\n1380\n1525\n1690", question: "Sensor apa yang paling mungkin menghasilkan data tersebut?",
    options: ["Encoder","IMU","GPS","Kamera"], answer: "Encoder",
    correctFeedback: "Tepat! Deretan pulsa yang meningkat berkaitan dengan putaran roda, ciri khas data Encoder.",
    wrongFeedback: "Belum tepat. Perhatikan istilah 'Wheel Pulses' pada data — ini berkaitan dengan roda." },
  { label: "Data B — Accelerometer", block: "X = 0.02 g\nY = 0.98 g\nZ = 9.75 g", question: "Sensor apa yang paling mungkin menghasilkan data tersebut?",
    options: ["IMU","LiDAR","Ultrasonic","GPS"], answer: "IMU",
    correctFeedback: "Tepat! Data percepatan pada sumbu X, Y, Z merupakan keluaran dari accelerometer di dalam IMU.",
    wrongFeedback: "Belum tepat. Data ini berupa percepatan tiga sumbu — bagian dari sensor gerak inersia." },
  { label: "Data C — Distance", block: "0.42 meter", question: "Sensor apa yang paling mungkin menghasilkan data jarak tunggal sesederhana ini?",
    options: ["Ultrasonic","Kamera","GPS","Encoder"], answer: "Ultrasonic",
    correctFeedback: "Tepat! Nilai jarak tunggal seperti ini umum dihasilkan sensor Ultrasonic (juga bisa LiDAR untuk satu titik pemindaian).",
    wrongFeedback: "Belum tepat. Data ini hanya berupa satu nilai jarak sederhana, khas sensor jarak jangkauan dekat." },
  { label: "Data D — LiDAR Scan", block: "[Visualisasi pemindaian 360° di bawah]", question: "Pola pemindaian berputar dengan banyak titik jarak seperti ini paling mungkin berasal dari sensor apa?",
    options: ["LiDAR","GPS","Encoder","Ultrasonic"], answer: "LiDAR",
    correctFeedback: "Tepat! Pemindaian berputar yang menghasilkan banyak titik jarak sekaligus adalah ciri khas LiDAR.",
    wrongFeedback: "Belum tepat. Perhatikan bentuk pemindaian berputar 360° pada visualisasi." },
  { label: "Data E — GPS Fix", block: "Latitude  : -6.2088\nLongitude : 106.8456", question: "Sensor apa yang menghasilkan data koordinat geografis ini?",
    options: ["GPS","IMU","Encoder","Ultrasonic"], answer: "GPS",
    correctFeedback: "Tepat! Latitude dan longitude adalah keluaran khas sensor GPS.",
    wrongFeedback: "Belum tepat. Format 'Latitude/Longitude' merujuk pada posisi geografis global." },
  { label: "Data F — Citra Visual", block: "[Area visual: kotak, rak, dan tanda 'STATION B' terlihat pada bingkai]", question: "Informasi apa yang paling mungkin diperoleh dari sensor yang menghasilkan data ini?",
    options: ["Informasi visual (bentuk, warna, tanda)","Koordinat geografis","Jumlah putaran roda","Kecepatan sudut"], answer: "Informasi visual (bentuk, warna, tanda)",
    correctFeedback: "Tepat! Kamera menghasilkan citra yang dapat diolah menjadi informasi visual seperti bentuk, warna, dan tanda.",
    wrongFeedback: "Belum tepat. Data berupa gambar/citra paling berkaitan dengan informasi visual." }
];

/* ===================== 6. KONDISI UJI (4 kondisi) ===================== */
const conditions = [
  { id: 'c1', alert: "GPS tidak tersedia karena robot berada di dalam gedung.",
    question: "Apakah rancangan Anda perlu diubah?",
    followup: "Sensor apa yang dapat menjadi bagian dari solusi?",
    hint: "Pertimbangkan Encoder dan IMU untuk odometri indoor, serta LiDAR untuk koreksi posisi berbasis peta lingkungan." },
  { id: 'c2', alert: "LiDAR mengalami gangguan.",
    question: "Apakah rancangan Anda perlu diubah?",
    followup: "Bagaimana robot tetap dapat mendeteksi obstacle?",
    hint: "Ultrasonic dapat menjadi sensor cadangan untuk deteksi obstacle jarak dekat, dikombinasikan dengan Kamera untuk mengenali objek." },
  { id: 'c3', alert: "Roda robot mengalami slip sehingga informasi Encoder menjadi kurang akurat.",
    question: "Apakah rancangan Anda perlu diubah?",
    followup: "Sensor apa yang dapat memberikan informasi pendukung?",
    hint: "IMU dapat membantu mendeteksi perubahan gerak nyata, dan LiDAR/Kamera dapat membantu koreksi posisi terhadap lingkungan." },
  { id: 'c4', alert: "Robot harus mengenali tanda 'STATION B' untuk berhenti di lokasi yang tepat.",
    question: "Apakah rancangan Anda perlu diubah?",
    followup: "Sensor apa yang paling sesuai untuk mengenali tanda tersebut?",
    hint: "Kamera adalah sensor paling sesuai karena mampu mengenali bentuk dan tulisan pada tanda secara visual." }
];

/* ===================== 7. PERTANYAAN REFLEKSI (10) ===================== */
const reflectionQuestions = [
  "Sensor yang paling saya pahami adalah...",
  "Sensor yang paling sulit saya pahami adalah...",
  "Awalnya saya memilih...",
  "Setelah melakukan eksplorasi, saya mengubah pilihan menjadi...",
  "Alasan perubahan tersebut adalah...",
  "Sensor yang memiliki keterbatasan paling penting pada misi saya adalah...",
  "Apakah satu sensor cukup untuk navigasi AMR? Jelaskan.",
  "Kombinasi sensor yang saya pilih adalah...",
  "Mengapa kombinasi tersebut sesuai dengan skenario kelompok saya?",
  "Apa yang akan saya lakukan untuk membuat sistem navigasi tersebut lebih andal?"
];

/* ===================== 8. UTIL LOCALSTORAGE ===================== */
function loadJSON(key, fallback){
  try{
    const raw = localStorage.getItem(key);
    if(raw === null) return fallback;
    return JSON.parse(raw);
  }catch(e){ return fallback; }
}
function saveJSON(key, value){
  try{ localStorage.setItem(key, JSON.stringify(value)); }
  catch(e){ console.error('Gagal menyimpan data:', e); }
}

/* ===================== 9. STATE ===================== */
let state = {
  student: loadJSON(KEYS.student, null),
  progress: loadJSON(KEYS.progress, {}),
  sensorKnowledge: loadJSON(KEYS.sensorKnowledge, { opened: [] }),
  detectiveScore: loadJSON(KEYS.detectiveScore, { completed: false, score: 0, answers: [] }),
  dataSensorScore: loadJSON(KEYS.dataSensorScore, { completed: false, score: 0, answers: [] }),
  mission: loadJSON(KEYS.mission, { selectedId: null, selectedSensors: [], reasons: {}, limitations: {}, savedAt: null }),
  design: loadJSON(KEYS.design, { coordAnswer: '', chain: [], path: [] }),
  conditions: loadJSON(KEYS.conditions, {}),
  reflection: loadJSON(KEYS.reflection, {})
};

function persist(part){
  const map = {
    student: KEYS.student, progress: KEYS.progress, sensorKnowledge: KEYS.sensorKnowledge,
    detectiveScore: KEYS.detectiveScore, dataSensorScore: KEYS.dataSensorScore,
    mission: KEYS.mission, design: KEYS.design, conditions: KEYS.conditions, reflection: KEYS.reflection
  };
  saveJSON(map[part], state[part]);
}

/* ===================== 10. TOAST ===================== */
function toast(msg){
  const c = document.getElementById('toast-container');
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = msg;
  c.appendChild(el);
  setTimeout(()=>{ el.remove(); }, 3200);
}

/* ===================== 11. ICON SVG SEDERHANA PER SENSOR ===================== */
function sensorIconSVG(key){
  const c = 'var(--cyan)', a = 'var(--amber)', d = 'var(--text-dim)';
  const icons = {
    encoder: `<svg class="icon-svg" viewBox="0 0 48 48"><circle cx="24" cy="24" r="17" fill="none" stroke="${c}" stroke-width="2.5"/><line x1="24" y1="7" x2="24" y2="13" stroke="${c}" stroke-width="2.5"/><line x1="24" y1="35" x2="24" y2="41" stroke="${c}" stroke-width="2.5"/><line x1="7" y1="24" x2="13" y2="24" stroke="${c}" stroke-width="2.5"/><line x1="35" y1="24" x2="41" y2="24" stroke="${c}" stroke-width="2.5"/><circle cx="24" cy="24" r="4" fill="${a}"/></svg>`,
    imu: `<svg class="icon-svg" viewBox="0 0 48 48"><rect x="10" y="10" width="28" height="28" rx="4" fill="none" stroke="${c}" stroke-width="2.5"/><line x1="24" y1="10" x2="24" y2="38" stroke="${d}" stroke-width="1.5" stroke-dasharray="2 3"/><line x1="10" y1="24" x2="38" y2="24" stroke="${d}" stroke-width="1.5" stroke-dasharray="2 3"/><circle cx="24" cy="24" r="5" fill="${a}"/></svg>`,
    lidar: `<svg class="icon-svg" viewBox="0 0 48 48"><circle cx="24" cy="24" r="4" fill="${a}"/><path d="M24 24 L40 12" stroke="${c}" stroke-width="2"/><path d="M24 24 L44 24" stroke="${c}" stroke-width="2"/><path d="M24 24 L40 36" stroke="${c}" stroke-width="2"/><circle cx="24" cy="24" r="17" fill="none" stroke="${d}" stroke-width="1" stroke-dasharray="3 3"/></svg>`,
    ultrasonic: `<svg class="icon-svg" viewBox="0 0 48 48"><rect x="8" y="20" width="10" height="8" fill="${a}"/><path d="M22 24 Q28 14 34 24" fill="none" stroke="${c}" stroke-width="2"/><path d="M22 24 Q30 8 38 24" fill="none" stroke="${c}" stroke-width="2" opacity="0.6"/><path d="M22 24 Q32 2 42 24" fill="none" stroke="${c}" stroke-width="2" opacity="0.3"/></svg>`,
    camera: `<svg class="icon-svg" viewBox="0 0 48 48"><rect x="7" y="15" width="34" height="22" rx="4" fill="none" stroke="${c}" stroke-width="2.5"/><circle cx="24" cy="26" r="7" fill="none" stroke="${a}" stroke-width="2.5"/><rect x="17" y="10" width="8" height="6" rx="2" fill="${c}"/></svg>`,
    gps: `<svg class="icon-svg" viewBox="0 0 48 48"><path d="M24 6 C15 6 9 13 9 21 C9 33 24 43 24 43 C24 43 39 33 39 21 C39 13 33 6 24 6 Z" fill="none" stroke="${c}" stroke-width="2.5"/><circle cx="24" cy="20" r="5" fill="${a}"/></svg>`
  };
  return icons[key] || '';
}

/* ===================== 12. NAVIGASI HALAMAN ===================== */
function showLanding(){
  document.getElementById('screen-landing').classList.add('active');
  document.getElementById('screen-app').classList.remove('active');
}
function showApp(){
  document.getElementById('screen-landing').classList.remove('active');
  document.getElementById('screen-app').classList.add('active');
}
function goToPage(pageId){
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n=>n.classList.remove('active'));
  const page = document.getElementById('page-' + pageId);
  const nav = document.querySelector(`.nav-item[data-page="${pageId}"]`);
  if(page) page.classList.add('active');
  if(nav) nav.classList.add('active');
  const titles = {
    dashboard: 'Dashboard Misi', kenali: 'Kenali Sensor', detective: 'Sensor Detective',
    misi: 'Misi Kelompok', rancang: 'Rancang Sistem', uji: 'Uji Kondisi',
    refleksi: 'Refleksi Misi', hasil: 'Hasil Proyek'
  };
  document.getElementById('topbar-title').textContent = titles[pageId] || '';
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('sidebar-backdrop').classList.remove('show');
  window.scrollTo(0,0);
  if(pageId === 'dashboard') renderDashboard();
  if(pageId === 'hasil') renderHasil();
  document.querySelector('.page-scroll').scrollTop = 0;
}

/* ===================== 13. IDENTITAS / LANDING ===================== */
document.getElementById('form-identity').addEventListener('submit', function(e){
  e.preventDefault();
  const nama = document.getElementById('input-nama').value.trim();
  const kelas = document.getElementById('input-kelas').value.trim();
  const kelompok = document.getElementById('input-kelompok').value;
  const err = document.getElementById('identity-error');
  if(!nama || !kelas || !kelompok){
    err.hidden = false;
    return;
  }
  err.hidden = true;
  state.student = { nama, kelas, kelompok, startedAt: new Date().toISOString() };
  persist('student');
  bootApp();
});

/* ===================== 14. SIDEBAR / TOPBAR ===================== */
document.getElementById('sidebar-nav').addEventListener('click', function(e){
  const btn = e.target.closest('.nav-item');
  if(!btn) return;
  goToPage(btn.dataset.page);
});
document.getElementById('sidebar-toggle').addEventListener('click', ()=>{
  document.getElementById('sidebar').classList.add('open');
  document.getElementById('sidebar-backdrop').classList.add('show');
});
document.getElementById('sidebar-backdrop').addEventListener('click', ()=>{
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('sidebar-backdrop').classList.remove('show');
});
document.getElementById('btn-theme').addEventListener('click', function(){
  const cur = document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', cur === 'light' ? 'light' : '');
  document.body.setAttribute('data-theme', cur);
  this.textContent = cur === 'light' ? '☀ Mode Gelap' : '☾ Mode Terang';
  saveJSON(KEYS.theme, cur);
});

/* ===================== 15. RESET PROGRESS ===================== */
document.getElementById('btn-reset').addEventListener('click', ()=>{
  document.getElementById('modal-confirm').classList.add('active');
});
document.getElementById('btn-cancel-reset').addEventListener('click', ()=>{
  document.getElementById('modal-confirm').classList.remove('active');
});
document.getElementById('btn-confirm-reset').addEventListener('click', ()=>{
  Object.values(KEYS).forEach(k=>localStorage.removeItem(k));
  location.reload();
});

/* ===================== 16. HALAMAN: KENALI SENSOR ===================== */
function renderKenaliSensor(){
  const grid = document.getElementById('sensor-grid');
  grid.innerHTML = '';
  sensorOrder.forEach(key=>{
    const s = sensors[key];
    const opened = state.sensorKnowledge.opened.includes(key);
    const card = document.createElement('div');
    card.className = 'sensor-card' + (opened ? ' opened' : '');
    card.innerHTML = `
      ${sensorIconSVG(key)}
      <h4>${s.name}</h4>
      <div class="sensor-short">${s.tagline}</div>
      <div class="sensor-card-foot">
        <button class="btn btn-secondary btn-sm" data-sensor="${key}">EKSPLORASI</button>
        ${opened ? '<span class="opened-tag">✓ Dipelajari</span>' : ''}
      </div>`;
    grid.appendChild(card);
  });
  updateKenaliStatus();
}
function updateKenaliStatus(){
  const box = document.getElementById('kenali-status');
  const done = state.sensorKnowledge.opened.length >= 6;
  box.textContent = done ? '✅ Semua sensor telah dipelajari' : `${state.sensorKnowledge.opened.length}/6 sensor dipelajari`;
  box.classList.toggle('done', done);
}
document.getElementById('sensor-grid').addEventListener('click', function(e){
  const btn = e.target.closest('button[data-sensor]');
  if(!btn) return;
  openSensorModal(btn.dataset.sensor);
});
function openSensorModal(key){
  const s = sensors[key];
  document.getElementById('modal-sensor-content').innerHTML = `
    <div class="sensor-detail">
      ${sensorIconSVG(key)}
      <h3>${s.name}</h3>
      <div class="sensor-detail-sub">${s.tagline}</div>
      <dl>
        <dt>Fungsi</dt><dd>${s.function}</dd>
        <dt>Prinsip Kerja</dt><dd>${s.principle}</dd>
        <dt>Data yang Dihasilkan</dt><dd>${s.data}</dd>
        <dt>Kelebihan</dt><dd>${s.advantages}</dd>
        <dt>Keterbatasan</dt><dd>${s.limitations}</dd>
        <dt>Contoh Penggunaan</dt><dd>${s.applications}</dd>
      </dl>
    </div>`;
  document.getElementById('modal-sensor').classList.add('active');
  if(!state.sensorKnowledge.opened.includes(key)){
    state.sensorKnowledge.opened.push(key);
    persist('sensorKnowledge');
    renderKenaliSensor();
    renderDashboard();
    if(state.sensorKnowledge.opened.length === 6){
      toast('🏅 Lencana "Sensor Explorer" diperoleh!');
    }
  }
}
document.getElementById('modal-sensor-close').addEventListener('click', ()=>{
  document.getElementById('modal-sensor').classList.remove('active');
});
document.getElementById('modal-sensor').addEventListener('click', (e)=>{
  if(e.target.id === 'modal-sensor') e.currentTarget.classList.remove('active');
});

/* ===================== 17. MESIN KUIS (dipakai Detective & Data Sensor) ===================== */
function buildQuizEngine(config){
  const { containerId, questions, storageState, storageKey, pointsPerQ, renderScenario, title } = config;
  let idx = 0;
  const container = document.getElementById(containerId);

  function render(){
    if(storageState.completed){
      renderDone();
      return;
    }
    if(idx >= questions.length){
      finish();
      return;
    }
    const q = questions[idx];
    container.innerHTML = `
      <div class="quiz-progress">SOAL ${idx+1} DARI ${questions.length}</div>
      <div class="quiz-card">
        ${renderScenario(q)}
        <div class="quiz-options" id="quiz-opts"></div>
        <div id="quiz-fb"></div>
        <div class="quiz-nav"><button class="btn btn-primary" id="quiz-next" hidden>LANJUT</button></div>
      </div>`;
    const opts = document.getElementById('quiz-opts');
    q.options.forEach(opt=>{
      const b = document.createElement('button');
      b.className = 'quiz-option';
      b.textContent = opt;
      b.addEventListener('click', ()=>answer(q, opt, b, opts));
      opts.appendChild(b);
    });
  }

  function answer(q, chosen, btnEl, optsWrap){
    const correct = chosen === q.answer;
    optsWrap.querySelectorAll('button').forEach(b=>{
      b.disabled = true;
      if(b.textContent === q.answer) b.classList.add('correct');
    });
    if(!correct) btnEl.classList.add('wrong');
    const fb = document.getElementById('quiz-fb');
    fb.innerHTML = `<div class="quiz-feedback ${correct ? 'correct' : 'wrong'}">${correct ? '✅ ' + q.correctFeedback : '❌ ' + q.wrongFeedback}</div>`;
    if(correct) storageState.score += pointsPerQ;
    storageState.answers.push({ question: q.scenario || q.question, chosen, correct });
    document.getElementById('quiz-next').hidden = false;
    document.getElementById('quiz-next').onclick = ()=>{ idx++; render(); };
  }

  function finish(){
    storageState.completed = true;
    saveJSON(storageKey, storageState);
    renderDashboard();
    if(config.onFinish) config.onFinish();
    renderDone();
  }

  function renderDone(){
    const max = questions.length * pointsPerQ;
    container.innerHTML = `
      <div class="quiz-card quiz-done-card">
        <div>${title} selesai!</div>
        <div class="quiz-done-score">${storageState.score} / ${max}</div>
        <p>Skor tersimpan otomatis. Lanjutkan ke halaman berikutnya untuk melanjutkan misi.</p>
        <button class="btn btn-secondary btn-sm" id="quiz-restart">ULANGI KUIS</button>
      </div>`;
    document.getElementById('quiz-restart').addEventListener('click', ()=>{
      storageState.completed = false; storageState.score = 0; storageState.answers = [];
      saveJSON(storageKey, storageState);
      idx = 0;
      renderDashboard();
      render();
    });
  }

  render();
}

function renderDetectiveQuiz(){
  buildQuizEngine({
    containerId: 'detective-container',
    questions: detectiveQuestions,
    storageState: state.detectiveScore,
    storageKey: KEYS.detectiveScore,
    pointsPerQ: 5,
    title: 'Sensor Detective',
    renderScenario: (q)=> `<div class="quiz-scenario">${q.scenario}</div>`
  });
}
function renderDataSensorQuiz(){
  buildQuizEngine({
    containerId: 'datasensor-container',
    questions: dataSensorQuestions,
    storageState: state.dataSensorScore,
    storageKey: KEYS.dataSensorScore,
    pointsPerQ: 5,
    title: 'Data Sensor',
    renderScenario: (q)=>{
      let lidarVisual = '';
      if(q.label.includes('LiDAR')){
        lidarVisual = `<div class="lidar-scan"><div class="lidar-sweep"></div>
          <div class="lidar-dot" style="top:20%;left:70%"></div>
          <div class="lidar-dot" style="top:60%;left:80%"></div>
          <div class="lidar-dot" style="top:80%;left:30%"></div>
          <div class="lidar-dot" style="top:30%;left:20%"></div></div>`;
      }
      return `<div class="quiz-scenario"><strong>${q.label}</strong></div>${lidarVisual}<div class="quiz-data-block">${q.block}</div><p style="color:var(--text);margin-bottom:14px;">${q.question}</p>`;
    }
  });
}

/* ===================== 18. TABS SENSOR DETECTIVE / DATA SENSOR ===================== */
document.querySelectorAll('.tab-btn').forEach(btn=>{
  btn.addEventListener('click', function(){
    document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));
    document.querySelectorAll('.tab-panel').forEach(p=>p.classList.remove('active'));
    this.classList.add('active');
    document.getElementById('tab-' + this.dataset.tab).classList.add('active');
  });
});

/* ===================== 19. HALAMAN: MISI KELOMPOK ===================== */
function renderMisiKelompok(){
  const grid = document.getElementById('mission-grid');
  grid.innerHTML = '';
  const yourGroupId = parseInt(state.student?.kelompok || '0', 10);
  missions.forEach(m=>{
    const isYours = m.id === yourGroupId;
    const card = document.createElement('div');
    card.className = 'mission-card' + (isYours ? ' yours' : '');
    card.innerHTML = `
      ${isYours ? '<span class="yours-badge">KELOMPOKMU</span>' : ''}
      <div class="m-num">KELOMPOK ${m.id}</div>
      <h4>${m.title}</h4>
      <p>${m.description}</p>
      <button class="btn btn-secondary btn-sm" data-mission="${m.id}">${isYours ? 'KERJAKAN MISI INI' : 'LIHAT SKENARIO'}</button>`;
    grid.appendChild(card);
  });
  if(state.mission.selectedId){
    showMissionTask(state.mission.selectedId);
  }
}
document.getElementById('mission-grid').addEventListener('click', function(e){
  const btn = e.target.closest('button[data-mission]');
  if(!btn) return;
  const id = parseInt(btn.dataset.mission, 10);
  state.mission.selectedId = id;
  persist('mission');
  showMissionTask(id);
  renderDashboard();
});
function showMissionTask(missionId){
  const wrap = document.getElementById('mission-task');
  wrap.hidden = false;
  const checkGrid = document.getElementById('sensor-check-grid');
  checkGrid.innerHTML = '';
  sensorOrder.forEach(key=>{
    const checked = state.mission.selectedSensors.includes(key);
    const label = document.createElement('label');
    label.className = 'check-pill' + (checked ? ' checked' : '');
    label.innerHTML = `<input type="checkbox" value="${key}" ${checked ? 'checked' : ''}> ${sensors[key].name}`;
    checkGrid.appendChild(label);
  });
  renderReasoningBlocks();
  checkGrid.querySelectorAll('input').forEach(inp=>{
    inp.addEventListener('change', function(){
      const key = this.value;
      if(this.checked){
        if(!state.mission.selectedSensors.includes(key)) state.mission.selectedSensors.push(key);
      }else{
        state.mission.selectedSensors = state.mission.selectedSensors.filter(k=>k!==key);
      }
      this.closest('.check-pill').classList.toggle('checked', this.checked);
      renderReasoningBlocks();
    });
  });
}
function renderReasoningBlocks(){
  const wrap = document.getElementById('sensor-reasoning-list');
  wrap.innerHTML = '';
  state.mission.selectedSensors.forEach(key=>{
    const block = document.createElement('div');
    block.className = 'reasoning-block';
    block.innerHTML = `
      <h5>${sensors[key].name}</h5>
      <label class="field"><span>Mengapa sensor ini diperlukan?</span>
        <textarea rows="2" data-reason="${key}">${state.mission.reasons[key] || ''}</textarea></label>
      <label class="field"><span>Apa keterbatasan sensor ini pada kondisi misi Anda?</span>
        <textarea rows="2" data-limitation="${key}">${state.mission.limitations[key] || ''}</textarea></label>`;
    wrap.appendChild(block);
  });
}
document.getElementById('btn-save-mission-task').addEventListener('click', ()=>{
  document.querySelectorAll('[data-reason]').forEach(t=>{
    state.mission.reasons[t.dataset.reason] = t.value;
  });
  document.querySelectorAll('[data-limitation]').forEach(t=>{
    state.mission.limitations[t.dataset.limitation] = t.value;
  });
  state.mission.savedAt = new Date().toISOString();
  persist('mission');
  document.getElementById('mission-save-note').textContent = '✓ Jawaban misi tersimpan.';
  renderDashboard();
  setTimeout(()=>{ document.getElementById('mission-save-note').textContent=''; }, 3000);
});

/* ===================== 20. HALAMAN: RANCANG SISTEM ===================== */
function renderRancangSistem(){
  document.getElementById('coord-answer').value = state.design.coordAnswer || '';
  const palette = document.getElementById('builder-palette');
  palette.innerHTML = '';
  sensorOrder.forEach(key=>{
    const b = document.createElement('button');
    b.className = 'palette-item';
    b.dataset.key = key;
    b.textContent = sensors[key].name;
    palette.appendChild(b);
  });
  renderChainList();
  initCanvas();
}
document.getElementById('coord-answer').addEventListener('input', function(){
  state.design.coordAnswer = this.value;
  persist('design');
});

const chainTemplates = {
  encoder: { data: 'Putaran roda', info: 'Perkiraan perpindahan', decision: 'Estimasi posisi diperbarui', action: 'Robot bergerak sesuai estimasi' },
  imu: { data: 'Orientasi & percepatan', info: 'Perubahan arah/gerak terdeteksi', decision: 'Koreksi arah', action: 'Robot menyesuaikan arah' },
  lidar: { data: 'Jarak obstacle 360°', info: 'Obstacle terdeteksi & peta diperbarui', decision: 'Ubah arah / hitung ulang jalur', action: 'Robot menghindar' },
  ultrasonic: { data: 'Jarak objek terdekat', info: 'Obstacle dekat terdeteksi', decision: 'Berhenti / belok', action: 'Robot menghindari tabrakan' },
  camera: { data: 'Citra visual', info: 'Objek/tanda dikenali', decision: 'Robot berhenti di tanda tujuan', action: 'Robot berhenti/berbelok sesuai tanda' },
  gps: { data: 'Koordinat geografis', info: 'Posisi outdoor diketahui', decision: 'Tentukan arah menuju tujuan', action: 'Robot bergerak menuju koordinat tujuan' }
};
let selectedPaletteKey = null;
document.getElementById('builder-palette').addEventListener('click', function(e){
  const btn = e.target.closest('.palette-item');
  if(!btn) return;
  document.querySelectorAll('.palette-item').forEach(p=>p.classList.remove('selected'));
  btn.classList.add('selected');
  selectedPaletteKey = btn.dataset.key;
  const t = chainTemplates[selectedPaletteKey];
  document.querySelector('[data-slot="sensor"]').textContent = sensors[selectedPaletteKey].name;
  document.querySelector('[data-slot="data"]').textContent = t.data;
  document.querySelector('[data-slot="info"]').textContent = t.info;
  document.querySelector('[data-slot="decision"]').textContent = t.decision;
  document.querySelector('[data-slot="action"]').textContent = t.action;
});
document.getElementById('btn-add-chain').addEventListener('click', ()=>{
  if(!selectedPaletteKey){ toast('Pilih sensor terlebih dahulu.'); return; }
  const t = chainTemplates[selectedPaletteKey];
  state.design.chain.push({ sensor: sensors[selectedPaletteKey].name, ...t });
  persist('design');
  renderChainList();
  renderDashboard();
  toast('Ditambahkan ke rancangan sistem.');
});
function renderChainList(){
  const list = document.getElementById('chain-list');
  list.innerHTML = '';
  state.design.chain.forEach((c, i)=>{
    const el = document.createElement('div');
    el.className = 'chain-list-item';
    el.innerHTML = `<span class="flow"><b>${c.sensor}</b> → ${c.data} → ${c.info} → ${c.decision} → ${c.action}</span>
      <button class="remove-chip" data-i="${i}" title="Hapus">✕</button>`;
    list.appendChild(el);
  });
  list.querySelectorAll('.remove-chip').forEach(b=>{
    b.addEventListener('click', function(){
      state.design.chain.splice(parseInt(this.dataset.i,10), 1);
      persist('design');
      renderChainList();
      renderDashboard();
    });
  });
}

/* --- Peta navigasi (canvas) --- */
const mapNodes = {
  start: { x: 60, y: 300, label: 'START' },
  wp1: { x: 220, y: 300, label: 'WAYPOINT 1' },
  wp2: { x: 420, y: 140, label: 'WAYPOINT 2' },
  dest: { x: 570, y: 70, label: 'DESTINATION' }
};
const mapObstacles = [
  { x: 300, y: 175, w: 90, h: 90 },
  { x: 470, y: 230, w: 70, h: 70 }
];
let canvasCtx = null;
function initCanvas(){
  const canvas = document.getElementById('nav-canvas');
  canvasCtx = canvas.getContext('2d');
  canvas.onclick = function(evt){
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width, scaleY = canvas.height / rect.height;
    const x = (evt.clientX - rect.left) * scaleX, y = (evt.clientY - rect.top) * scaleY;
    let closest = null, closestDist = 30;
    Object.entries(mapNodes).forEach(([key,n])=>{
      const dist = Math.hypot(n.x - x, n.y - y);
      if(dist < closestDist){ closest = key; closestDist = dist; }
    });
    if(closest){
      state.design.path.push(closest);
      persist('design');
      drawMap();
    }
  };
  drawMap();
}
function drawMap(robotPos){
  if(!canvasCtx) return;
  const ctx = canvasCtx;
  const w = 640, h = 360;
  ctx.clearRect(0,0,w,h);
  // grid
  ctx.strokeStyle = 'rgba(53,231,210,0.08)';
  ctx.lineWidth = 1;
  for(let gx=0; gx<w; gx+=40){ ctx.beginPath(); ctx.moveTo(gx,0); ctx.lineTo(gx,h); ctx.stroke(); }
  for(let gy=0; gy<h; gy+=40){ ctx.beginPath(); ctx.moveTo(0,gy); ctx.lineTo(w,gy); ctx.stroke(); }
  // obstacles
  ctx.fillStyle = 'rgba(255,107,107,0.25)';
  ctx.strokeStyle = '#ff6b6b';
  mapObstacles.forEach(o=>{
    ctx.fillRect(o.x,o.y,o.w,o.h);
    ctx.strokeRect(o.x,o.y,o.w,o.h);
  });
  ctx.fillStyle = '#ff9d9d';
  ctx.font = '11px Inter, sans-serif';
  mapObstacles.forEach(o=> ctx.fillText('OBSTACLE', o.x+6, o.y+18));
  // path lines
  if(state.design.path.length > 1){
    ctx.strokeStyle = '#35e7d2';
    ctx.lineWidth = 3;
    ctx.beginPath();
    state.design.path.forEach((key,i)=>{
      const n = mapNodes[key];
      if(i===0) ctx.moveTo(n.x,n.y); else ctx.lineTo(n.x,n.y);
    });
    ctx.stroke();
  }
  // nodes
  Object.entries(mapNodes).forEach(([key,n])=>{
    ctx.beginPath();
    ctx.arc(n.x,n.y,10,0,Math.PI*2);
    ctx.fillStyle = key==='start' ? '#57d97a' : key==='dest' ? '#ffb020' : '#35e7d2';
    ctx.fill();
    ctx.fillStyle = '#e9eefb';
    ctx.font = '12px Chakra Petch, sans-serif';
    ctx.fillText(n.label, n.x - 20, n.y - 16);
  });
  // robot
  if(robotPos){
    ctx.beginPath();
    ctx.arc(robotPos.x, robotPos.y, 9, 0, Math.PI*2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.strokeStyle = '#35e7d2';
    ctx.lineWidth = 2;
    ctx.stroke();
  }
}
document.getElementById('btn-clear-path').addEventListener('click', ()=>{
  state.design.path = [];
  persist('design');
  drawMap();
});
document.getElementById('btn-simulate').addEventListener('click', ()=>{
  if(state.design.path.length < 2){
    toast('Klik minimal 2 titik untuk membentuk jalur (START menuju titik lain).');
    return;
  }
  const points = state.design.path.map(k=>mapNodes[k]);
  let collision = false;
  for(let i=0;i<points.length-1;i++){
    if(segmentHitsAnyObstacle(points[i], points[i+1])) collision = true;
  }
  animateRobot(points, ()=>{
    if(collision){
      toast('⚠️ Jalur menabrak obstacle! Coba rancang ulang jalur atau tambahkan sensor deteksi obstacle.');
    }else{
      toast('✅ Simulasi berhasil! Robot sampai ke tujuan tanpa menabrak obstacle.');
    }
  });
});
function segmentHitsAnyObstacle(p1, p2){
  return mapObstacles.some(o=>{
    for(let t=0; t<=1; t+=0.02){
      const x = p1.x + (p2.x - p1.x) * t;
      const y = p1.y + (p2.y - p1.y) * t;
      if(x >= o.x && x <= o.x+o.w && y >= o.y && y <= o.y+o.h) return true;
    }
    return false;
  });
}
function animateRobot(points, done){
  let seg = 0, t = 0;
  function step(){
    if(seg >= points.length - 1){ drawMap(points[points.length-1]); done(); return; }
    const p1 = points[seg], p2 = points[seg+1];
    t += 0.02;
    if(t > 1){ t = 0; seg++; step(); return; }
    const x = p1.x + (p2.x - p1.x) * t;
    const y = p1.y + (p2.y - p1.y) * t;
    drawMap({x,y});
    requestAnimationFrame(step);
  }
  step();
}

/* ===================== 21. HALAMAN: UJI KONDISI ===================== */
function renderUjiKondisi(){
  const list = document.getElementById('condition-list');
  list.innerHTML = '';
  conditions.forEach((c, i)=>{
    const saved = state.conditions[c.id] || {};
    const card = document.createElement('div');
    card.className = 'condition-card';
    card.innerHTML = `
      <div class="condition-num">KONDISI ${i+1}</div>
      <div class="condition-alert">${c.alert}</div>
      <p style="color:var(--text)">${c.question}</p>
      <div class="condition-choice-row">
        <button class="choice-btn ${saved.choice==='Ya' ? 'active':''}" data-choice="Ya">Ya</button>
        <button class="choice-btn ${saved.choice==='Tidak' ? 'active':''}" data-choice="Tidak">Tidak</button>
      </div>
      <div class="followup-wrap" ${saved.choice==='Ya' ? '' : 'hidden'}>
        <label class="field"><span>${c.followup}</span>
          <textarea rows="2" data-followup>${saved.followup || ''}</textarea></label>
      </div>
      <div class="condition-feedback" ${saved.choice ? '' : 'hidden'}>💡 ${c.hint}</div>`;
    card.querySelectorAll('.choice-btn').forEach(b=>{
      b.addEventListener('click', function(){
        card.querySelectorAll('.choice-btn').forEach(x=>x.classList.remove('active'));
        this.classList.add('active');
        const choice = this.dataset.choice;
        card.querySelector('.followup-wrap').hidden = choice !== 'Ya';
        card.querySelector('.condition-feedback').hidden = false;
        if(!state.conditions[c.id]) state.conditions[c.id] = {};
        state.conditions[c.id].choice = choice;
        persist('conditions');
        renderDashboard();
      });
    });
    card.querySelector('[data-followup]').addEventListener('input', function(){
      if(!state.conditions[c.id]) state.conditions[c.id] = {};
      state.conditions[c.id].followup = this.value;
      persist('conditions');
    });
    list.appendChild(card);
  });
}

/* ===================== 22. HALAMAN: REFLEKSI ===================== */
function renderRefleksi(){
  const form = document.getElementById('reflection-form');
  form.innerHTML = '';
  reflectionQuestions.forEach((q, i)=>{
    const field = document.createElement('label');
    field.className = 'field';
    field.innerHTML = `<span>${i+1}. ${q}</span><textarea rows="2" data-q="${i}">${state.reflection['q'+i] || ''}</textarea>`;
    form.appendChild(field);
  });
}
document.getElementById('btn-save-reflection').addEventListener('click', ()=>{
  document.querySelectorAll('#reflection-form [data-q]').forEach(t=>{
    state.reflection['q'+t.dataset.q] = t.value;
  });
  state.reflection.completed = document.querySelectorAll('#reflection-form [data-q]').length > 0 &&
    Array.from(document.querySelectorAll('#reflection-form [data-q]')).every(t=>t.value.trim().length>0);
  persist('reflection');
  document.getElementById('reflection-save-note').textContent = '✓ Refleksi tersimpan.';
  renderDashboard();
  setTimeout(()=>{ document.getElementById('reflection-save-note').textContent=''; }, 3000);
});

/* ===================== 23. PROGRESS & DASHBOARD ===================== */
const milestoneDefs = [
  { key: 'kenali', label: 'Kenali Sensor', test: ()=> state.sensorKnowledge.opened.length, total: 6 },
  { key: 'detective', label: 'Sensor Detective', test: ()=> state.detectiveScore.completed ? 1 : 0, total: 1 },
  { key: 'datasensor', label: 'Data Sensor', test: ()=> state.dataSensorScore.completed ? 1 : 0, total: 1 },
  { key: 'misi', label: 'Misi Kelompok', test: ()=> state.mission.savedAt ? 1 : 0, total: 1 },
  { key: 'rancang', label: 'Rancang Sistem', test: ()=> (state.design.chain.length>0 && state.design.path.length>1) ? 1 : 0, total: 1 },
  { key: 'uji', label: 'Uji Kondisi', test: ()=> Object.keys(state.conditions).filter(k=>state.conditions[k].choice).length, total: conditions.length },
  { key: 'refleksi', label: 'Refleksi', test: ()=> state.reflection.completed ? 1 : 0, total: 1 }
];
function computeProgress(){
  let doneUnits = 0, totalUnits = 0;
  milestoneDefs.forEach(m=>{
    doneUnits += Math.min(m.test(), m.total);
    totalUnits += m.total;
  });
  return Math.round((doneUnits / totalUnits) * 100);
}
function computeScore(){
  const missionTaskPts = state.mission.savedAt ? 10 : 0;
  return state.detectiveScore.score + state.dataSensorScore.score + missionTaskPts;
}
function updateTopbar(){
  const pct = computeProgress();
  document.getElementById('global-progress-fill').style.width = pct + '%';
  document.getElementById('global-progress-text').textContent = pct + '%';
  document.getElementById('chip-name').textContent = state.student?.nama || '—';
  document.getElementById('chip-meta').textContent = state.student ? `${state.student.kelas} · Kel. ${state.student.kelompok}` : '—';
  document.querySelectorAll('.nav-item').forEach(nav=>{
    const key = nav.dataset.page;
    const def = milestoneDefs.find(m=>m.key===key);
    if(def) nav.dataset.done = def.test() >= def.total ? '1' : '0';
  });
}
function renderDashboard(){
  updateTopbar();
  document.getElementById('dash-nama').textContent = state.student?.nama || '—';
  document.getElementById('dash-kelas').textContent = state.student?.kelas || '—';
  document.getElementById('dash-kelompok').textContent = state.student ? 'Kelompok ' + state.student.kelompok : '—';
  document.getElementById('dash-nilai').textContent = computeScore() + ' / 100';

  const grid = document.getElementById('mission-status-grid');
  grid.innerHTML = '';
  milestoneDefs.forEach(m=>{
    const val = m.test();
    const status = val >= m.total ? 'done' : (val > 0 ? 'progress' : '');
    const sub = m.total > 1 ? `${val}/${m.total} selesai` : (val ? 'Selesai' : 'Belum dimulai');
    const el = document.createElement('div');
    el.className = 'mstat-card';
    el.innerHTML = `<div class="mstat-dot ${status}"></div><div><div class="mstat-title">${m.label}</div><div class="mstat-sub">${sub}</div></div>`;
    grid.appendChild(el);
  });

  const badgeRow = document.getElementById('badge-row');
  const allDone = milestoneDefs.every(m=>m.test() >= m.total);
  const badges = [
    { name: 'Sensor Explorer', ico: '🔍', earned: state.sensorKnowledge.opened.length >= 6 },
    { name: 'Sensor Detective', ico: '🕵️', earned: state.detectiveScore.completed },
    { name: 'AMR Engineer', ico: '🤖', earned: allDone }
  ];
  badgeRow.innerHTML = '';
  badges.forEach(b=>{
    const el = document.createElement('div');
    el.className = 'badge' + (b.earned ? ' earned' : '');
    el.innerHTML = `<span class="badge-ico">${b.ico}</span><span class="badge-name">${b.name}</span>`;
    badgeRow.appendChild(el);
  });
}

/* ===================== 24. HALAMAN: HASIL ===================== */
function renderHasil(){
  const c = document.getElementById('hasil-content');
  const m = missions.find(x=>x.id === state.mission.selectedId);
  const missionScore = state.detectiveScore.score + state.dataSensorScore.score + (state.mission.savedAt ? 10 : 0);

  let html = `
    <div class="hasil-grid">
      <div class="hasil-mini"><div class="k">Nama</div><div class="v">${state.student?.nama || '—'}</div></div>
      <div class="hasil-mini"><div class="k">Kelas</div><div class="v">${state.student?.kelas || '—'}</div></div>
      <div class="hasil-mini"><div class="k">Kelompok</div><div class="v">${state.student ? state.student.kelompok : '—'}</div></div>
    </div>

    <div class="hasil-block">
      <h4>Skenario Misi</h4>
      <p>${m ? `<strong style="color:var(--text)">${m.title}</strong><br>${m.description}` : '<span class="empty-hint">Belum memilih misi.</span>'}</p>
    </div>

    <div class="hasil-block">
      <h4>Sensor yang Dipilih</h4>
      ${state.mission.selectedSensors.length ? `<div class="pill-list">${state.mission.selectedSensors.map(k=>`<span class="pill">${sensors[k].name}</span>`).join('')}</div>` : '<p class="empty-hint">Belum memilih sensor.</p>'}
    </div>

    <div class="hasil-block">
      <h4>Alasan Pemilihan & Keterbatasan</h4>
      ${state.mission.selectedSensors.map(k=>`
        <div class="answer-item"><div class="q">${sensors[k].name} — alasan</div>${state.mission.reasons[k] || '<span class="empty-hint">Belum diisi</span>'}</div>
        <div class="answer-item"><div class="q">${sensors[k].name} — keterbatasan</div>${state.mission.limitations[k] || '<span class="empty-hint">Belum diisi</span>'}</div>`).join('') || '<p class="empty-hint">Belum ada data.</p>'}
    </div>

    <div class="hasil-block">
      <h4>Rancangan Navigasi</h4>
      <p>${state.design.coordAnswer ? state.design.coordAnswer : '<span class="empty-hint">Belum diisi.</span>'}</p>
      ${state.design.chain.map(c=>`<div class="answer-item">${c.sensor} → ${c.data} → ${c.info} → ${c.decision} → ${c.action}</div>`).join('') || '<p class="empty-hint">Belum ada alur sistem yang dirancang.</p>'}
      <p style="margin-top:8px;">Jalur peta navigasi: ${state.design.path.length>1 ? state.design.path.map(k=>mapNodes[k].label).join(' → ') : '<span class="empty-hint">Belum disimulasikan.</span>'}</p>
    </div>

    <div class="hasil-block">
      <h4>Hasil Uji Kondisi</h4>
      ${conditions.map((cond,i)=>{
        const ans = state.conditions[cond.id];
        if(!ans || !ans.choice) return `<div class="answer-item"><div class="q">Kondisi ${i+1}</div><span class="empty-hint">Belum dijawab</span></div>`;
        return `<div class="answer-item"><div class="q">Kondisi ${i+1}: ${cond.alert}</div>Jawaban: <strong>${ans.choice}</strong>${ans.followup ? '<br>' + ans.followup : ''}</div>`;
      }).join('')}
    </div>

    <div class="hasil-block">
      <h4>Refleksi</h4>
      ${reflectionQuestions.map((q,i)=>`<div class="answer-item"><div class="q">${i+1}. ${q}</div>${state.reflection['q'+i] || '<span class="empty-hint">Belum diisi</span>'}</div>`).join('')}
      <span class="pending-tag">Status esai/refleksi: Menunggu penilaian guru</span>
    </div>

    <div class="hasil-block">
      <h4>Nilai Otomatis</h4>
      <div class="hasil-grid">
        <div class="hasil-mini"><div class="k">Sensor Detective (60)</div><div class="v">${state.detectiveScore.score}</div></div>
        <div class="hasil-mini"><div class="k">Data Sensor (30)</div><div class="v">${state.dataSensorScore.score}</div></div>
        <div class="hasil-mini"><div class="k">Pemilihan Sensor (10)</div><div class="v">${state.mission.savedAt ? 10 : 0}</div></div>
      </div>
      <p style="margin-top:10px;">Total nilai otomatis: <strong style="color:var(--cyan)">${missionScore} / 100</strong> (di luar penilaian esai/refleksi oleh guru).</p>
    </div>
  `;
  c.innerHTML = html;

  const rubricRows = [
    ['Identifikasi sensor','Semua tepat','Sebagian besar tepat','Beberapa tepat','Banyak salah'],
    ['Pemilihan sensor','Sangat sesuai','Sesuai','Cukup sesuai','Tidak sesuai'],
    ['Alasan teknis','Sangat logis','Logis','Kurang lengkap','Tidak logis'],
    ['Perancangan','Sangat jelas','Jelas','Kurang jelas','Tidak jelas'],
    ['Penyelesaian masalah','Sangat baik','Baik','Cukup','Belum mampu'],
    ['Refleksi','Mendalam','Baik','Sederhana','Belum menunjukkan refleksi']
  ];
  document.getElementById('rubric-body').innerHTML = rubricRows.map(r=>`<tr>${r.map(x=>`<td>${x}</td>`).join('')}</tr>`).join('');
}
document.getElementById('btn-print').addEventListener('click', ()=> window.print());
document.getElementById('btn-save-json').addEventListener('click', ()=>{
  const payload = {
    student: state.student, sensorKnowledge: state.sensorKnowledge, detectiveScore: state.detectiveScore,
    dataSensorScore: state.dataSensorScore, mission: state.mission, design: state.design,
    conditions: state.conditions, reflection: state.reflection, exportedAt: new Date().toISOString()
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `hasil-amr-${(state.student?.nama || 'siswa').replace(/\s+/g,'_')}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  toast('Hasil berhasil diunduh sebagai file JSON.');
});

/* ===================== 25. BOOT ===================== */
function bootApp(){
  showApp();
  document.getElementById('dash-nama').textContent = state.student.nama;
  renderKenaliSensor();
  renderDetectiveQuiz();
  renderDataSensorQuiz();
  renderMisiKelompok();
  renderRancangSistem();
  renderUjiKondisi();
  renderRefleksi();
  renderDashboard();
  goToPage('dashboard');
}
(function init(){
  const savedTheme = loadJSON(KEYS.theme, 'dark');
  if(savedTheme === 'light'){
    document.documentElement.setAttribute('data-theme','light');
    document.body.setAttribute('data-theme','light');
    document.getElementById('btn-theme').textContent = '☀ Mode Gelap';
  }
  if(state.student && state.student.nama && state.student.kelas && state.student.kelompok){
    bootApp();
  }else{
    showLanding();
  }
})();

/* ==========================================================
   PANDUAN GURU
   ----------------------------------------------------------
   1. Menambah/mengubah materi sensor:
      Edit objek "sensors" (bagian 2). Setiap sensor memiliki
      field: name, tagline, function, principle, data,
      advantages, limitations, applications.

   2. Menambah soal Sensor Detective:
      Tambahkan objek baru pada array "detectiveQuestions"
      (bagian 4) dengan format:
      { scenario: "...", options: [...], answer: "...",
        correctFeedback: "...", wrongFeedback: "..." }

   3. Menambah soal Data Sensor:
      Tambahkan objek baru pada array "dataSensorQuestions"
      (bagian 5) dengan format serupa, ditambah field "label"
      dan "block" (teks data yang ditampilkan ke siswa).

   4. Menambah/mengubah skenario Misi Kelompok:
      Edit array "missions" (bagian 3). Field
      "recommendedSensors" hanya dipakai internal untuk
      referensi guru, TIDAK ditampilkan ke siswa.

   5. Menambah kondisi pada Uji Kondisi:
      Tambahkan objek baru pada array "conditions" (bagian 6).

   6. Mengubah pertanyaan refleksi:
      Edit array "reflectionQuestions" (bagian 7).

   7. Sistem penilaian otomatis (bagian 23-24):
      - Sensor Detective: 12 soal x 5 poin = 60 poin
      - Data Sensor: 6 soal x 5 poin = 30 poin
      - Pemilihan sensor (tersimpan): 10 poin
      - Total otomatis: 100 poin
      - Esai/refleksi TIDAK dinilai otomatis (menunggu guru).

   8. Data siswa tersimpan di localStorage browser masing-masing
      siswa (bukan database terpusat). Untuk mengumpulkan hasil
      seluruh siswa, gunakan tombol "SIMPAN HASIL (JSON)" pada
      halaman Hasil, lalu kumpulkan file JSON tersebut.
   ========================================================== */
