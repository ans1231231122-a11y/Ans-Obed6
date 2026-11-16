const DB = {
  KEY: 'gcrp_v2',

  defaultChar() {
    return {
      cash: 0, bank: 5000,
      id: {
        first: '', last: '', date: '', place: '', gender: '',
        number: 0, job: 'citizen', accepted: false,
        police_data: { code: 0, sector: '', rank: '' },
        paramedic_data: { code: 0, sector: '', rank: '' }
      },
      inv: [], cars: [], contacts: [],
      prison: { status: false, reason: '', by: '', time: 0 },
      jailCount: 0, violations: [],
      police_points: [
        { name: 'login', value: 0 }, { name: 'claim_report', value: 0 },
        { name: 'status', value: 0 }, { name: 'prison', value: 0 }
      ]
    };
  },

  load() {
    try {
      const r = localStorage.getItem(this.KEY);
      if (r) return JSON.parse(r);
    } catch {}
    return { characters: [this.defaultChar(), this.defaultChar(), this.defaultChar()], active: null };
  },

  save(d) { localStorage.setItem(this.KEY, JSON.stringify(d)); },
  get() { return this.load(); },

  active() {
    const d = this.load();
    return d.active !== null ? d.characters[d.active] : null;
  },

  setActive(i) {
    const d = this.load();
    d.active = i;
    this.save(d);
  },

  update(fn) {
    const d = this.load();
    if (d.active === null) return false;
    fn(d.characters[d.active]);
    this.save(d);
    return true;
  },

  updateSlot(i, fn) {
    const d = this.load();
    if (!d.characters[i]) d.characters[i] = this.defaultChar();
    fn(d.characters[i]);
    this.save(d);
  }
};

// Items from bot (mamnoat + shop + weapons + materials)
const ITEMS_CATALOG = {
  // General
  phone: { name: 'جوال', price: 500, type: 'item' },
  radio: { name: 'لاسلكي', price: 800, type: 'item' },
  medkit: { name: 'حقيبة إسعاف', price: 350, type: 'item' },
  lockpick: { name: 'فتاحة أقفال', price: 1200, type: 'item' },
  repair_kit: { name: 'عدة تصليح', price: 600, type: 'item' },
  food: { name: 'طعام', price: 50, type: 'item' },
  water: { name: 'ماء', price: 30, type: 'item' },
  // Materials
  aluminium: { name: 'ألمنيوم', price: 80, type: 'material' },
  iron: { name: 'حديد', price: 100, type: 'material' },
  gunpowder: { name: 'بارود', price: 150, type: 'material' },
  plastic: { name: 'بلاستيك', price: 60, type: 'material' },
  // Mamnoat (from bot)
  weed: { name: 'الحشيش', price: 150, type: 'illegal' },
  cocaine: { name: 'الكوكايين', price: 400, type: 'illegal' },
  opium: { name: 'الأفيون', price: 250, type: 'illegal' },
  mushrooms: { name: 'الفطر السحري', price: 200, type: 'illegal' },
  meth: { name: 'الميث', price: 500, type: 'illegal' },
  ecstasy: { name: 'الإكستاسي', price: 350, type: 'illegal' },
  // Weapons (from weapons.json)
  vintage_pistol: { name: 'Vintage Pistol', price: 60000, type: 'weapon' },
  sns_pistol: { name: 'SNS Pistol', price: 78000, type: 'weapon' },
  pistol: { name: 'Pistol', price: 115000, type: 'weapon' },
  combat_pistol: { name: 'Combat Pistol', price: 140000, type: 'weapon' },
  heavy_pistol: { name: 'Heavy Pistol', price: 180000, type: 'weapon' },
  pistol_mk2: { name: 'Pistol MK2', price: 190000, type: 'weapon' },
  pistol_50: { name: 'Pistol .50', price: 210000, type: 'weapon' },
  ammo_pistol: { name: 'ذخيرة مسدس', price: 500, type: 'ammo' },
  ammo_rifle: { name: 'ذخيرة بندقية', price: 800, type: 'ammo' }
};

const SHOP_LIST = ['phone','radio','medkit','lockpick','repair_kit','food','water','aluminium','iron','gunpowder','plastic'];
const WEAPON_LIST = ['vintage_pistol','sns_pistol','pistol','combat_pistol','heavy_pistol','pistol_mk2','pistol_50','ammo_pistol','ammo_rifle'];

const JOBS = [
  { id: 'citizen', name: 'مواطن', salary: 0 },
  { id: 'police', name: 'شرطة', salary: 3500 },
  { id: 'paramedic', name: 'إسعاف', salary: 3200 },
  { id: 'justice', name: 'عدل', salary: 4000 },
  { id: 'mechanic', name: 'ميكانيكي', salary: 2500 },
  { id: 'taxi', name: 'تاكسي', salary: 1800 },
  { id: 'trucker', name: 'سائق شاحنة', salary: 2200 },
  { id: 'miner', name: 'تعدين', salary: 2000 }
];

const THEFTS = [
  { id: 'store', name: 'سرقة بقالة', min: 500, max: 2000, risk: 30 },
  { id: 'house', name: 'سرقة منزل', min: 1500, max: 5000, risk: 50 },
  { id: 'car', name: 'سرقة سيارة', min: 3000, max: 10000, risk: 60 },
  { id: 'bank', name: 'سرقة بنك', min: 20000, max: 80000, risk: 90 }
];
