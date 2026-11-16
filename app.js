const App = {
  page: 'home',

  init() {
    document.getElementById('menuBtn').onclick = () =>
      document.getElementById('sidebar').classList.toggle('open');

    document.querySelectorAll('.nav').forEach(b => {
      b.onclick = () => {
        document.querySelectorAll('.nav').forEach(x => x.classList.remove('active'));
        b.classList.add('active');
        document.getElementById('sidebar').classList.remove('open');
        this.go(b.dataset.page);
      };
    });

    this.refresh();
    this.go('home');
  },

  toast(msg, type = '') {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.className = 'toast show ' + type;
    setTimeout(() => t.classList.remove('show'), 2800);
  },

  refresh() {
    const ch = DB.active();
    const name = document.getElementById('charName');
    const job = document.getElementById('charJob');
    const cash = document.getElementById('cash');
    const bank = document.getElementById('bank');

    if (ch && ch.id && ch.id.accepted) {
      name.textContent = ch.id.first + ' ' + ch.id.last;
      const j = JOBS.find(x => x.id === (ch.id.job || 'citizen'));
      job.textContent = j ? j.name : ch.id.job;
      cash.textContent = '$' + (ch.cash || 0).toLocaleString();
      bank.textContent = '$' + (ch.bank || 0).toLocaleString();
    } else {
      name.textContent = 'لا توجد شخصية';
      job.textContent = '';
      cash.textContent = '$0';
      bank.textContent = '$0';
    }
  },

  need() {
    const ch = DB.active();
    if (!ch || !ch.id || !ch.id.accepted) {
      this.toast('يجب إنشاء شخصية وتسجيل الدخول أولاً', 'error');
      return null;
    }
    return ch;
  },

  go(page) {
    this.page = page;
    const el = document.getElementById('content');
    const map = {
      home: () => this.pHome(),
      character: () => this.pChar(),
      inventory: () => this.pInv(),
      bank: () => this.pBank(),
      jobs: () => this.pJobs(),
      police: () => this.pPolice(),
      prison: () => this.pPrison(),
      store: () => this.pStore(),
      weapons: () => this.pWeapons(),
      thefts: () => this.pThefts(),
      phone: () => this.pPhone(),
      cars: () => this.pCars(),
      rules: () => this.pRules()
    };
    el.innerHTML = (map[page] || map.home)();
    // re-trigger animation
    el.style.animation = 'none';
    el.offsetHeight;
    el.style.animation = '';
    this.refresh();
    this.bind();
  },

  pHome() {
    const d = DB.get();
    const n = d.characters.filter(c => c.id && c.id.accepted).length;
    const ch = DB.active();
    return `
      <h1 class="page-title">GCRP System</h1>
      <p class="page-desc">كل ما تحتاجه لشخصيتك في مكان واحد</p>
      <div class="stat-grid">
        <div class="stat"><div class="num">${n}</div><div class="lbl">شخصيات</div></div>
        <div class="stat"><div class="num">${d.active !== null ? d.active + 1 : '-'}</div><div class="lbl">النشطة</div></div>
        <div class="stat"><div class="num">$${(ch?.cash||0).toLocaleString()}</div><div class="lbl">كاش</div></div>
        <div class="stat"><div class="num">$${(ch?.bank||0).toLocaleString()}</div><div class="lbl">بنك</div></div>
        <div class="stat"><div class="num">${ch?.inv?.length||0}</div><div class="lbl">أغراض</div></div>
        <div class="stat"><div class="num">${ch?.cars?.length||0}</div><div class="lbl">مركبات</div></div>
      </div>
      <div class="panel">
        <h3>الأنظمة</h3>
        <p style="color:var(--muted);line-height:2;font-size:0.9rem">
          الشخصية والهوية · الحقيبة · البنك · الوظائف · الشرطة · السجن · المتجر · الأسلحة · السرقات · الهاتف · المركبات · القوانين
        </p>
      </div>`;
  },

  pChar() {
    const d = DB.get();
    const slots = d.characters.map((ch, i) => {
      const has = ch.id && ch.id.first;
      const acc = has && ch.id.accepted;
      let badge = 'badge-empty', txt = 'فارغة', nm = 'لا توجد';
      if (acc) { badge = 'badge-active'; txt = 'مقبولة'; nm = ch.id.first + ' ' + ch.id.last; }
      else if (has) { badge = 'badge-pending'; txt = 'قيد المراجعة'; nm = ch.id.first + ' ' + ch.id.last; }
      return `<div class="slot ${d.active===i?'selected':''}" data-slot="${i}">
        <div><strong>${['الأولى','الثانية','الثالثة'][i]} ${d.active===i?'(نشطة)':''}</strong><span>${nm}</span></div>
        <span class="badge ${badge}">${txt}</span>
      </div>`;
    }).join('');

    return `
      <h1 class="page-title">الشخصية والهوية</h1>
      <p class="page-desc">إنشاء · دخول · خروج · عرض الهوية</p>
      <div class="panel"><h3>الخانات</h3><div class="slot-list" id="slots">${slots}</div></div>
      <div class="panel"><h3>الإجراءات</h3>
        <div class="btn-grid">
          <button class="btn btn-primary" id="bCreate">إنشاء شخصية</button>
          <button class="btn" id="bLogin">تسجيل دخول</button>
          <button class="btn" id="bLogout">تسجيل خروج</button>
          <button class="btn" id="bShowId">عرض الهوية</button>
        </div>
      </div>
      <div class="panel hidden" id="formBox">
        <h3>بيانات الهوية</h3>
        <form id="cForm">
          <div class="form-group"><label>First Name</label><div class="hint">إنجليزي فقط</div><input name="first" required pattern="[A-Za-z\\s]+"></div>
          <div class="form-group"><label>Last Name</label><input name="last" required pattern="[A-Za-z\\s]+"></div>
          <div class="form-group"><label>Birthday</label><input name="date" required placeholder="DD/MM/YYYY"></div>
          <div class="form-group"><label>Birth Place</label>
            <select name="place" required>
              <option value="">اختر</option>
              <option>Saudi Arabia</option><option>UAE</option><option>Kuwait</option>
              <option>Qatar</option><option>Bahrain</option><option>Oman</option><option>Egypt</option><option>Other</option>
            </select>
          </div>
          <div class="form-group"><label>Gender</label>
            <select name="gender" required><option value="">اختر</option><option>Male</option><option>Female</option></select>
          </div>
          <button type="submit" class="btn btn-primary btn-block">تقديم الطلب</button>
        </form>
      </div>
      <div class="panel hidden" id="idBox"></div>`;
  },

  pInv() {
    const ch = DB.active();
    if (!ch || !ch.id?.accepted) return this.needHtml();
    const items = ch.inv || [];
    if (!items.length) {
      return `<h1 class="page-title">الحقيبة</h1><p class="page-desc">أغراضك</p>
        <div class="panel"><div class="empty">الحقيبة فارغة — اذهب للمتجر أو الأسلحة</div></div>`;
    }
    const grid = items.map((it, i) => {
      const cat = ITEMS_CATALOG[it.id] || { name: it.name || it.id };
      return `<div class="inv-item" data-drop="${i}">
        <span class="qty">x${it.qty || 1}</span>
        <div class="iname">${cat.name}</div>
        <div class="iaction">رمي</div>
      </div>`;
    }).join('');
    return `
      <h1 class="page-title">الحقيبة</h1>
      <p class="page-desc">${items.length} غرض</p>
      <div class="panel"><div class="inv-grid">${grid}</div></div>`;
  },

  pBank() {
    const ch = DB.active();
    if (!ch || !ch.id?.accepted) return this.needHtml();
    return `
      <h1 class="page-title">البنك</h1>
      <p class="page-desc">إدارة الأموال</p>
      <div class="stat-grid">
        <div class="stat"><div class="num">$${(ch.cash||0).toLocaleString()}</div><div class="lbl">كاش</div></div>
        <div class="stat"><div class="num">$${(ch.bank||0).toLocaleString()}</div><div class="lbl">بنك</div></div>
      </div>
      <div class="panel">
        <h3>إيداع / سحب</h3>
        <div class="form-group"><label>المبلغ</label><input type="number" id="amt" min="1"></div>
        <div class="btn-grid">
          <button class="btn btn-success" id="bDep">إيداع</button>
          <button class="btn" id="bWdr">سحب</button>
        </div>
      </div>`;
  },

  pJobs() {
    const ch = DB.active();
    if (!ch || !ch.id?.accepted) return this.needHtml();
    const cur = ch.id.job || 'citizen';
    const list = JOBS.map(j => `
      <div class="slot ${j.id===cur?'selected':''}" data-job="${j.id}">
        <div><strong>${j.name}</strong><span>راتب $${j.salary.toLocaleString()}</span></div>
        ${j.id===cur?'<span class="badge badge-active">الحالية</span>':'<span class="badge badge-empty">اختيار</span>'}
      </div>`).join('');
    return `
      <h1 class="page-title">الوظائف</h1>
      <p class="page-desc">اختر وظيفتك واستلم الراتب</p>
      <div class="panel"><div class="slot-list" id="jobs">${list}</div></div>
      <div class="panel"><button class="btn btn-success btn-block" id="bSal">استلام الراتب</button></div>`;
  },

  pPolice() {
    const ch = DB.active();
    if (!ch || !ch.id?.accepted) return this.needHtml();
    const pd = ch.id.police_data || {};
    return `
      <h1 class="page-title">الشرطة</h1>
      <p class="page-desc">الدوام والنقاط</p>
      <div class="panel">
        <div class="id-row"><span class="label">الكود</span><span>${pd.code||'-'}</span></div>
        <div class="id-row"><span class="label">القطاع</span><span>${pd.sector||'-'}</span></div>
        <div class="id-row"><span class="label">الرتبة</span><span>${pd.rank||'-'}</span></div>
      </div>
      <div class="panel">
        <div class="btn-grid">
          <button class="btn" id="bPLogin">تسجيل دوام</button>
          <button class="btn btn-danger" id="bJail">سجن (محاكاة)</button>
        </div>
      </div>
      <div class="panel"><h3>النقاط</h3>
        <table class="table"><tbody>
          ${(ch.police_points||[]).map(p=>`<tr><td>${p.name}</td><td>${p.value}</td></tr>`).join('')}
        </tbody></table>
      </div>`;
  },

  pPrison() {
    const ch = DB.active();
    if (!ch || !ch.id?.accepted) return this.needHtml();
    const p = ch.prison || {};
    return `
      <h1 class="page-title">السجن</h1>
      <p class="page-desc">الحالة والمخالفات</p>
      <div class="panel">
        <div class="id-row"><span class="label">الحالة</span><span style="color:${p.status?'var(--danger)':'var(--success)'}">${p.status?'مسجون':'حر'}</span></div>
        <div class="id-row"><span class="label">السبب</span><span>${p.reason||'-'}</span></div>
        <div class="id-row"><span class="label">بواسطة</span><span>${p.by||'-'}</span></div>
        <div class="id-row"><span class="label">مرات السجن</span><span>${ch.jailCount||0}</span></div>
      </div>
      ${p.status?`<div class="panel"><button class="btn btn-primary btn-block" id="bRelease">خروج من السجن</button></div>`:''}
      <div class="panel"><h3>المخالفات</h3>
        ${(ch.violations||[]).length===0?'<div class="empty">لا توجد</div>':
        `<table class="table"><thead><tr><th>السبب</th><th>المبلغ</th></tr></thead>
        <tbody>${ch.violations.map(v=>`<tr><td>${v.reason}</td><td>$${v.amount}</td></tr>`).join('')}</tbody></table>`}
      </div>`;
  },

  pStore() {
    const list = SHOP_LIST.map(id => {
      const it = ITEMS_CATALOG[id];
      return `<div class="slot" data-buy="${id}" data-price="${it.price}">
        <div><strong>${it.name}</strong><span>$${it.price.toLocaleString()}</span></div>
        <button class="btn" style="padding:6px 12px;font-size:0.8rem">شراء</button>
      </div>`;
    }).join('');
    return `<h1 class="page-title">المتجر</h1><p class="page-desc">أغراض عامة ومواد</p>
      <div class="panel"><div class="slot-list" id="shop">${list}</div></div>`;
  },

  pWeapons() {
    const list = WEAPON_LIST.map(id => {
      const it = ITEMS_CATALOG[id];
      return `<div class="slot" data-buy="${id}" data-price="${it.price}">
        <div><strong>${it.name}</strong><span>$${it.price.toLocaleString()}</span></div>
        <button class="btn" style="padding:6px 12px;font-size:0.8rem">شراء</button>
      </div>`;
    }).join('');
    return `<h1 class="page-title">متجر الأسلحة</h1><p class="page-desc">نفس أسلحة البوت</p>
      <div class="panel"><div class="slot-list" id="weps">${list}</div></div>`;
  },

  pThefts() {
    const list = THEFTS.map(t => `
      <div class="slot" data-theft="${t.id}">
        <div><strong>${t.name}</strong><span>$${t.min.toLocaleString()}-$${t.max.toLocaleString()} · خطر ${t.risk}%</span></div>
        <button class="btn btn-danger" style="padding:6px 12px;font-size:0.8rem">تنفيذ</button>
      </div>`).join('');
    return `<h1 class="page-title">السرقات</h1><p class="page-desc">مخاطرة — قد تُسجن</p>
      <div class="panel"><div class="slot-list" id="thefts">${list}</div></div>`;
  },

  pPhone() {
    const ch = DB.active();
    if (!ch || !ch.id?.accepted) return this.needHtml();
    const cs = ch.contacts || [];
    return `
      <h1 class="page-title">الهاتف</h1>
      <p class="page-desc">جهات الاتصال</p>
      <div class="panel">
        ${cs.length===0?'<div class="empty">لا توجد جهات</div>':
        cs.map(c=>`<div class="slot"><strong>${c.name}</strong><span>${c.number||''}</span></div>`).join('')}
      </div>
      <div class="panel">
        <div class="form-group"><label>الاسم</label><input id="cName"></div>
        <div class="form-group"><label>الرقم</label><input id="cNum"></div>
        <button class="btn btn-primary btn-block" id="bAddC">إضافة</button>
      </div>`;
  },

  pCars() {
    const ch = DB.active();
    if (!ch || !ch.id?.accepted) return this.needHtml();
    const cars = ch.cars || [];
    return `
      <h1 class="page-title">المركبات</h1>
      <p class="page-desc">سياراتك</p>
      <div class="panel">
        ${cars.length===0?'<div class="empty">لا توجد مركبات</div>':
        `<table class="table"><thead><tr><th>المركبة</th><th>اللوحة</th></tr></thead>
        <tbody>${cars.map(c=>`<tr><td>${c.name}</td><td>${c.plate}</td></tr>`).join('')}</tbody></table>`}
      </div>
      <div class="panel"><button class="btn btn-primary btn-block" id="bBuyCar">شراء سيارة ($15000)</button></div>`;
  },

  pRules() {
    return `
      <h1 class="page-title">القوانين</h1>
      <p class="page-desc">قوانين الهوية والعامة</p>
      <div class="panel"><h3>قوانين الهوية</h3>
        <p style="color:var(--muted);line-height:2.1;font-size:0.9rem">
          1. الاسم إنجليزي فقط<br>2. ممنوع أسماء مشاهير أو مسيئة<br>
          3. العمر منطقي (18+)<br>4. حد أقصى 3 شخصيات<br>
          5. بعد القبول لا تغيير بدون طلب<br>6. شخصية نشطة واحدة فقط
        </p>
      </div>
      <div class="panel"><h3>قوانين عامة</h3>
        <p style="color:var(--muted);line-height:2.1;font-size:0.9rem">
          1. احترام اللاعبين والإدارة<br>2. منع RDM / VDM<br>
          3. الالتزام بالرول بلاي<br>4. عدم استغلال الثغرات
        </p>
      </div>`;
  },

  needHtml() {
    return `<h1 class="page-title">مطلوب شخصية</h1>
      <p class="page-desc">أنشئ شخصية وسجّل دخول أولاً</p>
      <div class="panel"><button class="btn btn-primary" onclick="App.go('character')">الذهاب للشخصيات</button></div>`;
  },

  // buy helper
  buy(id, price) {
    const ch = DB.active();
    if (!ch || !ch.id?.accepted) return this.toast('سجل دخول أولاً', 'error');
    if ((ch.cash + ch.bank) < price) return this.toast('رصيدك غير كافٍ', 'error');
    const cat = ITEMS_CATALOG[id];
    DB.update(c => {
      if (c.cash >= price) c.cash -= price;
      else { const r = price - c.cash; c.cash = 0; c.bank -= r; }
      if (!c.inv) c.inv = [];
      const ex = c.inv.find(x => x.id === id);
      if (ex) ex.qty = (ex.qty || 1) + 1;
      else c.inv.push({ id, name: cat.name, qty: 1 });
    });
    this.toast('تم شراء ' + cat.name, 'success');
    this.refresh();
  },

  bind() {
    const p = this.page;
    let sel = null;

    if (p === 'character') {
      document.querySelectorAll('#slots .slot').forEach(el => {
        el.onclick = () => {
          document.querySelectorAll('#slots .slot').forEach(s => s.classList.remove('selected'));
          el.classList.add('selected');
          sel = +el.dataset.slot;
        };
      });

      document.getElementById('bCreate').onclick = () => {
        if (sel === null) return this.toast('اختر خانة', 'error');
        const ch = DB.get().characters[sel];
        if (ch.id && ch.id.accepted) return this.toast('مقبولة مسبقاً', 'error');
        window._slot = sel;
        document.getElementById('formBox').classList.remove('hidden');
      };

      document.getElementById('bLogin').onclick = () => {
        if (sel === null) return this.toast('اختر خانة', 'error');
        const ch = DB.get().characters[sel];
        if (!ch.id || !ch.id.accepted) return this.toast('غير مقبولة', 'error');
        DB.setActive(sel);
        this.toast('دخول: ' + ch.id.first + ' ' + ch.id.last, 'success');
        this.go('character');
      };

      document.getElementById('bLogout').onclick = () => {
        DB.setActive(null);
        this.toast('تم الخروج', 'success');
        this.go('character');
      };

      document.getElementById('bShowId').onclick = () => {
        const ch = DB.active();
        if (!ch || !ch.id?.accepted) return this.toast('سجل دخول', 'error');
        const id = ch.id;
        document.getElementById('idBox').classList.remove('hidden');
        document.getElementById('idBox').innerHTML = `
          <div class="id-card">
            <div class="id-header"><strong>GCRP IDENTITY</strong><span>GC-${id.number}</span></div>
            <div class="id-body">
              <div class="id-row"><span class="label">First</span><span>${id.first}</span></div>
              <div class="id-row"><span class="label">Last</span><span>${id.last}</span></div>
              <div class="id-row"><span class="label">Birthday</span><span>${id.date}</span></div>
              <div class="id-row"><span class="label">Place</span><span>${id.place}</span></div>
              <div class="id-row"><span class="label">Gender</span><span>${id.gender}</span></div>
              <div class="id-row"><span class="label">Job</span><span>${id.job}</span></div>
              <div class="id-row"><span class="label">Status</span><span style="color:var(--success)">Active</span></div>
            </div>
          </div>`;
      };

      const f = document.getElementById('cForm');
      if (f) f.onsubmit = e => {
        e.preventDefault();
        const fd = new FormData(f);
        const i = window._slot;
        DB.updateSlot(i, ch => {
          ch.id = {
            first: fd.get('first').trim(), last: fd.get('last').trim(),
            date: fd.get('date').trim(), place: fd.get('place'), gender: fd.get('gender'),
            number: 10000 + Math.floor(Math.random()*90000),
            job: 'citizen', accepted: true,
            police_data: { code: 0, sector: '', rank: '' },
            paramedic_data: { code: 0, sector: '', rank: '' }
          };
          ch.cash = 0; ch.bank = 5000; ch.inv = []; ch.cars = []; ch.contacts = [];
          ch.prison = { status: false, reason: '', by: '', time: 0 };
          ch.violations = [];
          ch.police_points = [{name:'login',value:0},{name:'claim_report',value:0},{name:'status',value:0},{name:'prison',value:0}];
        });
        this.toast('تم إنشاء وقبول الشخصية', 'success');
        this.go('character');
      };
    }

    if (p === 'inventory') {
      document.querySelectorAll('[data-drop]').forEach(el => {
        el.onclick = () => {
          const i = +el.dataset.drop;
          DB.update(c => c.inv.splice(i, 1));
          this.toast('تم الرمي', 'success');
          this.go('inventory');
        };
      });
    }

    if (p === 'bank') {
      document.getElementById('bDep')?.addEventListener('click', () => {
        const a = parseInt(document.getElementById('amt').value);
        if (!a || a < 1) return this.toast('مبلغ غير صالح', 'error');
        DB.update(c => {
          if (c.cash < a) return this.toast('الكاش غير كافٍ', 'error');
          c.cash -= a; c.bank += a;
          this.toast('تم الإيداع', 'success');
        });
        this.go('bank');
      });
      document.getElementById('bWdr')?.addEventListener('click', () => {
        const a = parseInt(document.getElementById('amt').value);
        if (!a || a < 1) return this.toast('مبلغ غير صالح', 'error');
        DB.update(c => {
          if (c.bank < a) return this.toast('البنك غير كافٍ', 'error');
          c.bank -= a; c.cash += a;
          this.toast('تم السحب', 'success');
        });
        this.go('bank');
      });
    }

    if (p === 'jobs') {
      document.querySelectorAll('[data-job]').forEach(el => {
        el.onclick = () => {
          DB.update(c => { c.id.job = el.dataset.job; });
          this.toast('تم تغيير الوظيفة', 'success');
          this.go('jobs');
        };
      });
      document.getElementById('bSal')?.addEventListener('click', () => {
        const ch = DB.active();
        const j = JOBS.find(x => x.id === (ch?.id?.job || 'citizen'));
        if (!j || !j.salary) return this.toast('لا راتب', 'error');
        DB.update(c => { c.bank += j.salary; });
        this.toast('راتب $' + j.salary.toLocaleString(), 'success');
        this.go('jobs');
      });
    }

    if (p === 'store' || p === 'weapons') {
      document.querySelectorAll('[data-buy]').forEach(el => {
        el.onclick = () => this.buy(el.dataset.buy, +el.dataset.price);
      });
    }

    if (p === 'thefts') {
      document.querySelectorAll('[data-theft]').forEach(el => {
        el.onclick = () => {
          const t = THEFTS.find(x => x.id === el.dataset.theft);
          if (!this.need()) return;
          if (Math.random() * 100 < t.risk) {
            DB.update(c => {
              c.prison = { status: true, reason: t.name, by: 'النظام', time: 10 };
              c.jailCount = (c.jailCount || 0) + 1;
            });
            this.toast('فشلت! تم سجنك', 'error');
          } else {
            const g = Math.floor(t.min + Math.random() * (t.max - t.min));
            DB.update(c => { c.cash += g; });
            this.toast('نجحت! +$' + g.toLocaleString(), 'success');
          }
          this.refresh();
        };
      });
    }

    if (p === 'prison') {
      document.getElementById('bRelease')?.addEventListener('click', () => {
        DB.update(c => { c.prison = { status: false, reason: '', by: '', time: 0 }; });
        this.toast('تم الخروج من السجن', 'success');
        this.go('prison');
      });
    }

    if (p === 'police') {
      document.getElementById('bPLogin')?.addEventListener('click', () => {
        DB.update(c => {
          const p = c.police_points?.find(x => x.name === 'login');
          if (p) p.value++;
        });
        this.toast('تم تسجيل الدوام', 'success');
      });
      document.getElementById('bJail')?.addEventListener('click', () => {
        DB.update(c => {
          c.prison = { status: true, reason: 'أمر شرطة', by: 'أنت', time: 5 };
          c.jailCount = (c.jailCount || 0) + 1;
        });
        this.toast('تم السجن', 'success');
      });
    }

    if (p === 'phone') {
      document.getElementById('bAddC')?.addEventListener('click', () => {
        const n = document.getElementById('cName').value.trim();
        const num = document.getElementById('cNum').value.trim();
        if (!n) return this.toast('أدخل الاسم', 'error');
        DB.update(c => { if (!c.contacts) c.contacts = []; c.contacts.push({ name: n, number: num }); });
        this.toast('تمت الإضافة', 'success');
        this.go('phone');
      });
    }

    if (p === 'cars') {
      document.getElementById('bBuyCar')?.addEventListener('click', () => {
        if (!this.need()) return;
        const ch = DB.active();
        if ((ch.cash + ch.bank) < 15000) return this.toast('تحتاج $15000', 'error');
        DB.update(c => {
          if (c.cash >= 15000) c.cash -= 15000;
          else { const r = 15000 - c.cash; c.cash = 0; c.bank -= r; }
          if (!c.cars) c.cars = [];
          c.cars.push({ name: 'سيارة عادية', plate: 'GC' + Math.floor(1000 + Math.random() * 9000) });
        });
        this.toast('تم الشراء', 'success');
        this.go('cars');
      });
    }
  }
};

document.addEventListener('DOMContentLoaded', () => App.init());
