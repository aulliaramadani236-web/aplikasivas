const ACCOUNTS_KEY = 'vas-accounts-v1';
const SESSION_KEY = 'vas-auth-session-v1';
const ITERATIONS = 600000;
const SESSION_MS = 12 * 60 * 60 * 1000;

const encode = bytes => btoa(String.fromCharCode(...bytes));
const decode = value => Uint8Array.from(atob(value), char => char.charCodeAt(0));
const normalizedEmail = value => String(value).trim().toLowerCase();

function accounts() {
  const value = JSON.parse(localStorage.getItem(ACCOUNTS_KEY) || '[]');
  if (!Array.isArray(value)) throw new Error('Data akun tidak dapat dibaca. Jangan hapus data browser; simpan cadangan terlebih dahulu.');
  return value;
}

function publicUser(account) {
  return {id: account.id, name: account.name, email: account.email, businessName: account.businessName};
}

async function passwordHash(password, salt, iterations = ITERATIONS) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({name: 'PBKDF2', hash: 'SHA-256', salt: decode(salt), iterations}, key, 256);
  return encode(new Uint8Array(bits));
}

function startSession(account) {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify({userId: account.id, expiresAt: Date.now() + SESSION_MS}));
  sessionStorage.removeItem('vas-guest');
  return publicUser(account);
}

export function currentUser() {
  try {
    const session = JSON.parse(sessionStorage.getItem(SESSION_KEY) || 'null');
    if (!session || session.expiresAt <= Date.now()) {
      sessionStorage.removeItem(SESSION_KEY);
      return null;
    }
    const account = accounts().find(account => account.id === session.userId);
    return account ? publicUser(account) : null;
  } catch { return null; }
}

export async function register({name, email, businessName, password, confirmation}) {
  email = normalizedEmail(email);
  name = String(name).trim();
  businessName = String(businessName).trim();
  if (!name || name.length > 80) throw new Error('Isi nama Anda, maksimal 80 karakter.');
  if (!businessName || businessName.length > 100) throw new Error('Isi nama usaha, maksimal 100 karakter.');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) throw new Error('Masukkan alamat email yang valid.');
  if (password.length < 10 || password.length > 128) throw new Error('Gunakan kata sandi sepanjang 10–128 karakter.');
  if (password !== confirmation) throw new Error('Konfirmasi kata sandi belum sama.');
  if (accounts().some(account => account.email === email)) throw new Error('Email ini sudah terdaftar di browser ini. Silakan masuk.');

  const salt = encode(crypto.getRandomValues(new Uint8Array(16)));
  const hash = await passwordHash(password, salt);
  const list = accounts();
  if (list.some(account => account.email === email)) throw new Error('Email ini sudah terdaftar. Silakan masuk.');
  const account = {id: crypto.randomUUID(), name, email, businessName, salt, hash, iterations: ITERATIONS, createdAt: new Date().toISOString()};
  // Save the account before opening its session. No plaintext password is stored.
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify([...list, account]));
  return startSession(account);
}

export async function login({email, password}) {
  const account = accounts().find(account => account.email === normalizedEmail(email));
  // Derive a dummy hash too, so the UI does not immediately distinguish unknown emails.
  const hash = await passwordHash(password, account?.salt || encode(new Uint8Array(16)), account?.iterations || ITERATIONS);
  if (!account || hash !== account.hash) throw new Error('Email atau kata sandi tidak sesuai. Periksa kembali akun pada browser ini.');
  return startSession(account);
}

export function logout() {
  sessionStorage.removeItem(SESSION_KEY);
  sessionStorage.removeItem('vas-guest');
}

// Legacy records are offered only to the first local account, with explicit consent.
export function legacyBusinessFor(userId) {
  try {
    if (accounts()[0]?.id !== userId || localStorage.getItem('vas-legacy-owner')) return null;
    const data = JSON.parse(localStorage.getItem('vas-v1-live') || 'null');
    if (!data?.business || !['products', 'customers', 'sales', 'orders', 'expenses', 'movements', 'capital', 'audit'].every(key => Array.isArray(data[key]))) return null;
    return data;
  } catch { return null; }
}

const safe = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[char]));

export function showAuth({tab = 'login', onSuccess, onDemo, message = ''}) {
  const root = document.querySelector('#authRoot');
  document.body.classList.add('auth-screen');
  root.hidden = false;
  const registering = tab === 'register';
  root.innerHTML = `
    <div class="auth-shell">
      <section class="auth-story" aria-label="Tentang VAS">
        <a class="brand auth-brand" href="#masuk" aria-label="VAS"><span class="logo-crop"><img src="assets/logo-vas.jpg" alt="Logo VAS" width="878" height="559"></span><span>vas<small>Virtual Administration Service</small></span></a>
        <div class="auth-story-content">
          <span class="auth-pill"><span></span> TEMAN TUMBUH USAHA ANDA</span>
          <h1>Urus usaha lebih rapi.<br><em>Wujudkan langkah<br> yang lebih besar.</em></h1>
          <p>Dari penjualan pertama hingga rencana berikutnya,<br class="desktop-break"> kelola semua kebutuhan usaha dalam satu tempat.</p>
          <div class="auth-preview" aria-hidden="true">
            <div class="auth-preview-top"><span>▦ Ringkasan usaha</span><span class="auth-preview-badge">CONTOH TAMPILAN</span></div>
            <div class="auth-preview-main"><div><small>Penjualan hari ini</small><strong>Usaha terus tumbuh ↗</strong></div><span class="auth-preview-icon">↗</span></div>
            <div class="auth-mini-chart">${[32,46,38,67,54,81,73,96].map((height, i) => `<i style="height:${height}%;opacity:${i % 2 ? '.95' : '.5'}"></i>`).join('')}</div>
            <div class="auth-preview-bottom"><span>◉ Penjualan tercatat</span><span>▧ Stok terpantau</span><span>✧ Wawasan tersedia</span></div>
          </div>
          <div class="auth-benefits"><span>✓ Pencatatan lebih praktis</span><span>✓ Semua urusan dalam satu aplikasi</span></div>
        </div>
        <div class="auth-story-footer">VAS — Asisten Digital untuk Usaha yang Lebih Praktis.</div>
      </section>
      <section class="auth-form-side" aria-label="${registering ? 'Daftar akun' : 'Masuk akun'}">
        <div class="auth-form-wrap">
          <div class="auth-local-label">VERSI MVP · AKUN LOKAL</div>
          <div class="auth-tabs" role="tablist" aria-label="Akses akun"><button role="tab" aria-selected="${!registering}" id="loginTab">Masuk</button><button role="tab" aria-selected="${registering}" id="registerTab">Daftar akun</button></div>
          <div class="auth-welcome"><h2>${registering ? 'Mulai langkah usaha Anda.' : 'Selamat datang kembali.'}</h2><p>${registering ? 'Buat akun untuk ruang usaha Anda sendiri.' : 'Masuk dan lanjutkan mengelola usaha Anda.'}</p></div>
          <form id="authForm">
            ${registering ? '<label for="authName">Nama lengkap<input id="authName" name="name" autocomplete="name" placeholder="Nama Anda" required maxlength="80"></label><label for="authBusiness">Nama usaha<input id="authBusiness" name="businessName" autocomplete="organization" placeholder="Contoh: Toko Sembako Berkah" required maxlength="100"></label>' : ''}
            <label for="authEmail">Alamat email<input id="authEmail" name="email" type="email" autocomplete="username" placeholder="nama@email.com" required maxlength="254"></label>
            <div class="auth-field"><label for="authPassword">Kata sandi</label><div class="auth-password"><input id="authPassword" name="password" type="password" autocomplete="${registering ? 'new-password' : 'current-password'}" placeholder="${registering ? 'Minimal 10 karakter' : 'Masukkan kata sandi'}" ${registering ? 'minlength="10"' : ''} maxlength="128" required><button type="button" class="password-toggle" aria-label="Tampilkan kata sandi" aria-pressed="false" data-password="authPassword">Lihat</button></div></div>
            ${registering ? '<div class="auth-field"><label for="authConfirmation">Konfirmasi kata sandi</label><div class="auth-password"><input id="authConfirmation" name="confirmation" type="password" autocomplete="new-password" placeholder="Ulangi kata sandi Anda" required maxlength="128"><button type="button" class="password-toggle" aria-label="Tampilkan konfirmasi kata sandi" aria-pressed="false" data-password="authConfirmation">Lihat</button></div></div>' : '<button type="button" class="auth-forgot" id="forgotPassword">Lupa kata sandi?</button>'}
            <p id="authError" class="auth-error" role="alert" ${message ? '' : 'hidden'}>${safe(message)}</p>
            <button class="primary auth-submit" type="submit">${registering ? 'Buat akun & mulai' : 'Masuk ke ruang usaha'} <span>→</span></button>
          </form>
          <div class="auth-divider"><span>atau kenali VAS dulu</span></div>
          <button id="tryDemo" class="auth-demo">▦ Jelajahi data demo <span>↗</span></button>
          <div class="auth-storage-note"><span>ⓘ</span><p><b>Akun hanya berlaku di browser ini.</b> Data usaha belum tersinkron ke perangkat lain. Akun lokal bukan pengamanan server; gunakan perangkat pribadi dan unduh cadangan secara berkala.</p></div>
          <p class="auth-bottom">${registering ? 'Sudah punya akun?' : 'Baru menggunakan VAS?'} <button id="switchAuth">${registering ? 'Masuk di sini' : 'Buat akun sekarang'}</button></p>
        </div>
        <div class="auth-form-footer">Dibuat untuk membantu UMKM bertumbuh.</div>
      </section>
    </div>`;

  const switchTab = next => showAuth({tab: next, onSuccess, onDemo});
  root.querySelector('#loginTab').onclick = () => switchTab('login');
  root.querySelector('#registerTab').onclick = () => switchTab('register');
  root.querySelector('#switchAuth').onclick = () => switchTab(registering ? 'login' : 'register');
  root.querySelector('#tryDemo').onclick = onDemo;
  root.querySelectorAll('[data-password]').forEach(button => {
    button.onclick = () => {
      const input = root.querySelector('#' + button.dataset.password);
      const visible = input.type === 'password';
      input.type = visible ? 'text' : 'password';
      button.textContent = visible ? 'Sembunyi' : 'Lihat';
      button.setAttribute('aria-pressed', String(visible));
      button.setAttribute('aria-label', visible ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi');
    };
  });
  const error = root.querySelector('#authError');
  root.querySelector('#forgotPassword')?.addEventListener('click', () => {
    error.textContent = 'Pemulihan lewat email belum tersedia untuk akun lokal. Coba masuk pada browser tempat Anda mendaftar. Jangan hapus data browser karena catatan usaha tersimpan di perangkat ini.';
    error.hidden = false;
  });
  root.querySelector('#authForm').onsubmit = async event => {
    event.preventDefault();
    const form = event.currentTarget;
    const values = Object.fromEntries(new FormData(form));
    const button = form.querySelector('[type=submit]');
    if (registering && values.password !== values.confirmation) {
      error.textContent = 'Konfirmasi kata sandi belum sama.';
      error.hidden = false;
      form.elements.confirmation.setAttribute('aria-invalid', 'true');
      form.elements.confirmation.focus();
      return;
    }
    form.elements.confirmation?.removeAttribute('aria-invalid');
    error.hidden = true;
    button.disabled = true;
    button.textContent = registering ? 'Membuat akun…' : 'Memeriksa akun…';
    form.setAttribute('aria-busy', 'true');
    try {
      const user = await (registering ? register(values) : login(values));
      form.reset();
      await onSuccess(user);
    } catch (problem) {
      error.textContent = problem.name === 'QuotaExceededError' ? 'Penyimpanan browser penuh. Kosongkan ruang atau simpan cadangan terlebih dahulu.' : problem.message;
      error.hidden = false;
      form.elements.password.value = '';
      if (form.elements.confirmation) form.elements.confirmation.value = '';
      form.elements.password.focus();
    } finally {
      button.disabled = false;
      button.innerHTML = `${registering ? 'Buat akun & mulai' : 'Masuk ke ruang usaha'} <span>→</span>`;
      form.removeAttribute('aria-busy');
    }
  };
}
