// sound 8 wav — retrogame hamburger, mau ini, batal, error rasa, pilih, terkirim, keranjang, tambahKurang
const sounds = {
  retrogame: new Audio('asset/sound/retrogame.wav'),
  mauIni: new Audio('asset/sound/mau ini.wav'),
  batal: new Audio('asset/sound/batal.wav'),
  error: new Audio('asset/sound/error_belum_isi_rasa.wav'),
  pilih: new Audio('asset/sound/pilih_pilih_rasaatautoping.wav'),
  terkirim: new Audio('asset/sound/pesanan terkirim.wav'),
  keranjang: new Audio('asset/sound/tombol keranjang.wav'),
  tambahKurang: new Audio('asset/sound/tambah kurang barang di keranjang.wav')
};
Object.values(sounds).forEach(a=>{ a.preload='auto'; a.volume=0.6; });
function playSound(k){ const a=sounds[k]; if(!a) return; a.currentTime=0; a.play().catch(()=>{}); }
// BGM 50% + mute toggle di hamburger
const bgm = document.getElementById('bgm');
let bgmOn = localStorage.getItem('marco-bgm') !== 'off';
function updateBgmBtn(){
  const btn = document.getElementById('bgmToggle');
  if(!btn) return;
  btn.textContent = bgmOn ? 'BGM ON' : 'BGM OFF';
  btn.className = bgmOn ? 'neo-btn bg-neo-green text-white px-4 py-2.5 text-center' : 'neo-btn bg-neo-pink text-white px-4 py-2.5 text-center';
}
function toggleBgm(){
  bgmOn = !bgmOn;
  localStorage.setItem('marco-bgm', bgmOn ? 'on' : 'off');
  updateBgmBtn();
  if(!bgm) return;
  if(bgmOn){ bgm.volume=0.5; bgm.play().catch(()=>{}); }
  else bgm.pause();
}
window.toggleBgm = toggleBgm;
if(bgm){
  bgm.volume = 0.5;
  bgm.loop = true;
  updateBgmBtn();
  if(!bgmOn) bgm.pause();
  else {
    // autoplay after loader (3s) + first click fallback
    const tryPlay = ()=> { if(bgmOn) bgm.play().catch(()=>{}); };
    // will be called from loader done
    bgm._tryPlay = tryPlay;
    const once = ()=>{ if(bgmOn && bgm.paused) bgm.play().catch(()=>{}); document.removeEventListener('click', once); };
    document.addEventListener('click', once, {once:true});
  }
}
// loader 3s + ghost 5 warna random
(function(){
  const loader = document.getElementById('loader');
  const ghost = document.getElementById('ghost');
  const palette = ['#22C55E','#0038FF','#FF4D8D','#FACC15','#EF4444'];
  if(ghost){
    let last = -1;
    setInterval(()=>{
      let i; do{ i=Math.floor(Math.random()*palette.length); }while(i===last);
      last=i; ghost.style.setProperty('--ghost', palette[i]);
    }, 600);
  }
  if(!loader) return;
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){ loader.classList.add('hide'); document.body.classList.add('loaded'); return; }
  const min = 3000;
  const start = Date.now();
  function done(){
    const elapsed = Date.now() - start;
    const wait = Math.max(0, min - elapsed);
    setTimeout(()=>{
      loader.classList.add('hide');
      document.body.classList.add('loaded');
      // pindah ghost ke landing + auto BGM abis loading
      setTimeout(()=>{
        const bgmEl = document.getElementById('bgm');
        if(bgmEl && localStorage.getItem('marco-bgm') !== 'off'){ bgmEl.volume=0.5; bgmEl.play().catch(()=>{}); }
        const ghostEl = document.getElementById('ghost');
        const home = document.getElementById('home');
        if(ghostEl && home){
          ghostEl.classList.add('landing-ghost');
          ghostEl.style.left = '10%';
          ghostEl.style.top = '20%';
          home.appendChild(ghostEl);
          // wandering random 1.2-3.2s + nengok arah kanan/kiri
          if(!window.matchMedia('(prefers-reduced-motion: reduce)').matches){
            let lastX = parseFloat(ghostEl.style.left) || 0;
            let lastTime = 0;
            function wander(){
              const now = Date.now();
              const delay = 1200 + Math.random()*1800; // 1.2-3.0s random tiap pindah
              const dur = (0.9 + Math.random()*0.9).toFixed(2); // 0.9-1.8s durasi gerak random
              ghostEl.style.transition = `left ${dur}s ease, top ${dur}s ease, transform 0.25s ease`;
              const rect = home.getBoundingClientRect();
              const gw = ghostEl.offsetWidth || 140;
              const gh = ghostEl.offsetHeight || 140;
              const maxX = Math.max(0, rect.width - gw - 20);
              const maxY = Math.max(0, rect.height - gh - 20);
              const x = Math.random()*maxX;
              const y = Math.random()*maxY;
              // nengok kanan kalau gerak ke kanan, kiri kalau ke kiri
              if(x > lastX) ghostEl.classList.add('facing-right');
              else ghostEl.classList.remove('facing-right');
              lastX = x;
              ghostEl.style.left = x+'px';
              ghostEl.style.top = y+'px';
              setTimeout(wander, delay);
            }
            setTimeout(wander, 900);
          }
        }
        loader.remove();
      }, 700);
    }, wait);
  }
  if(document.readyState === 'complete') done();
  else window.addEventListener('load', done);
})();
// QR idle C — desktop only (hidden di mobile), random 2-4s
(function initQrIdle(){
  function start(){
    const isDesktop = window.matchMedia('(min-width: 768px)').matches;
    const qrCards = document.querySelectorAll('.qr-card');
    console.log('qr idle init', qrCards.length, 'desktop', isDesktop, 'reduce', window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    if(!qrCards.length || !isDesktop || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const anims = ['qr-pop','qr-tilt','qr-glitch','qr-border'];
    qrCards.forEach((card, idx)=>{
      let lastAnim = '';
      function schedule(){
        const delay = 2000 + Math.random()*2000;
        setTimeout(()=>{
          let a; do{ a = anims[Math.floor(Math.random()*anims.length)]; }while(a===lastAnim);
          lastAnim = a;
          console.log('qr idle', idx, a);
          card.classList.remove('qr-pop','qr-tilt','qr-glitch','qr-border');
          void card.offsetWidth;
          card.classList.add(a);
          setTimeout(()=> card.classList.remove(a), 450);
          schedule();
        }, delay);
      }
      setTimeout(schedule, 800 + idx*700);
    });
  }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
// floating cake/love idle — floating base + glitch/tilt/pop random 5s beda (include mobile cake3)
(function(){
  const els = [document.getElementById('heroShape1'), document.getElementById('heroShape2'), document.getElementById('heroShape3')].filter(Boolean);
  if(!els.length) return;
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const anims = ['flt-glitch','flt-tilt','flt-pop'];
  function idle(el, baseDelay){
    let last='';
    function tick(){
      const delay = 4800 + Math.random()*2200;
      setTimeout(()=>{
        let a; do{ a=anims[Math.floor(Math.random()*anims.length)]; }while(a===last);
        last=a;
        el.classList.remove('flt-glitch','flt-tilt','flt-pop');
        void el.offsetWidth;
        el.classList.add(a);
        setTimeout(()=> el.classList.remove(a), 400);
        tick();
      }, delay);
    }
    setTimeout(tick, baseDelay + Math.random()*1000);
  }
  els.forEach((el,i)=> idle(el, 2200 + i*1200));
})();
const GAS_URL = "https://script.google.com/macros/s/AKfycbwTNe5gMxd6XgXLpVpCmupC9CfnqwjTao5vhPgpUS47HS7j_d4j9gyOwbRX2xQbzXNt/exec";
const menuFallback = [
  {"id":"brw250","nama":"Brownies 250ml","harga":15000,"desc":"Cup 250ml — 1 cup","foto":"asset/brownies/brownies-new1.webp","fotos":["asset/brownies/brownies-new1.webp"]},
  {"id":"brw500","nama":"Brownies 500ml","harga":30000,"desc":"Cup 500ml — 1 cup","foto":"asset/brownies/brownies-new2.webp","fotos":["asset/brownies/brownies-new2.webp"]},
  {"id":"bolu7x22","nama":"Bolu 7×22 cm","harga":45000,"desc":"Loyang 7×22 cm","foto":"asset/bolu/bolu-new1.webp","fotos":["asset/bolu/bolu-new1.webp"]}
];
let menuMap = new Map();
let cart = new Map(); // key composite -> qty
let variantMeta = new Map(); // key -> {baseId, rasa, topping, catatan}
let variantSelectedId = null;
let variantSelectedRasa = "";
let variantSelectedToppings = [];
let variantMix = false;

const elGrid = document.getElementById("menuGrid");
const elCartBar = document.getElementById("cartBar");
const elCartCount = document.getElementById("cartCount");
const elCartTotal = document.getElementById("cartTotal");
const elDrawer = document.getElementById("cartDrawer");
const elOverlay = document.getElementById("drawerOverlay");
const elDrawerList = document.getElementById("drawerList");
const elDrawerTotal = document.getElementById("drawerTotal");
const elCheckoutModal = document.getElementById("checkoutModal");
const elConfirmModal = document.getElementById("confirmModal");
const elSuccessModal = document.getElementById("successModal");
const elContactModal = document.getElementById("contactModal");
const elRequestModal = document.getElementById("requestModal");
const elCheckoutForm = document.getElementById("checkoutForm");
let pendingPayload = null;
let pendingItems = [];
const elHeader = document.getElementById("brutalStickyNav");
const elVariantModal = document.getElementById("variantModal");
const elVariantProduct = document.getElementById("variantProduct");
const elVariantRasa = document.getElementById("variantRasa");
const elVariantToppingWrap = document.getElementById("variantToppingWrap");
const elVariantTopping = document.getElementById("variantTopping");
const elVariantCatatan = document.getElementById("variantCatatan");
const elVariantTitle = document.getElementById("variantTitle");

function rupiah(n){ return "Rp " + n.toLocaleString("id-ID"); }
function cartTotal(items){ let s=0; for(const v of items) s+=v.harga*v.qty; return s; }
function variantKey(baseId, rasa, toppings, mix){
  const top = (Array.isArray(toppings) ? toppings.slice().sort().join(",") : toppings || "");
  let key = top ? `${baseId}|${rasa}|${top}` : `${baseId}|${rasa}`;
  if(mix) key += "|MIX";
  return key;
}

// header scroll effect + hamburger
const btnHam = document.getElementById("brutalHamburger");
const navMenu = document.getElementById("brutalNavMenu");
if(btnHam && navMenu){
  btnHam.addEventListener("click", ()=>{
    playSound('retrogame');
    const exp = btnHam.getAttribute("aria-expanded")==="true";
    btnHam.setAttribute("aria-expanded", String(!exp));
    navMenu.classList.toggle("hidden", exp);
  });
  document.addEventListener("click", (e)=>{
    if(!navMenu.contains(e.target) && !btnHam.contains(e.target)){
      btnHam.setAttribute("aria-expanded","false");
      navMenu.classList.add("hidden");
    }
  });
}
if(elHeader){
  window.addEventListener("scroll", ()=>{
    if(window.scrollY > 16) elHeader.classList.add("scrolled");
    else elHeader.classList.remove("scrolled");
  }, {passive:true});
}
// landing scroll effect - beda mobile vs desktop
const hero = document.getElementById("home");
const heroGrid = document.getElementById("heroGrid");
const heroHeadline = document.getElementById("heroHeadline");
const heroShapes = document.querySelectorAll(".parallax-shape");
if(hero && !window.matchMedia("(prefers-reduced-motion: reduce)").matches){
  let ticking = false;
  window.addEventListener("scroll", ()=>{
    if(ticking) return;
    ticking = true;
    requestAnimationFrame(()=>{
      const y = window.scrollY;
      const isMobile = window.innerWidth < 768;
      const max = isMobile ? 500 : 700;
      if(y < max){
        const f = isMobile ? 0.32 : 0.16;
        const f2 = isMobile ? 0.55 : 0.28;
        if(heroHeadline) heroHeadline.style.transform = `translateY(${y * f}px)`;
        if(heroGrid) heroGrid.style.transform = `translateY(${y * 0.12}px)`;
        heroShapes.forEach((el,i)=>{
          const dir = i % 2 === 0 ? 1 : -1;
          el.style.transform = `translateY(${y * f2 * dir * 0.5}px) rotate(${dir * 6 + y*0.02}deg)`;
        });
        hero.style.opacity = String(1 - y / (max*1.4));
      }
      ticking = false;
    });
  }, {passive:true});
}


async function loadMenu(){
  try{
    const r = await fetch("data/menu.json");
    if(!r.ok) throw new Error("fetch fail");
    return await r.json();
  }catch{ return menuFallback; }
}

function renderMenu(items){
  menuMap.clear();
  for(const m of items) menuMap.set(m.id, m);
  let html="";
  items.forEach((m,i)=>{
    const fotos = m.fotos && m.fotos.length ? m.fotos : [m.foto];
    let imgs = "";
    if(fotos.length === 1){
      imgs = `<img src="${fotos[0]}" alt="${m.nama}" loading="lazy" class="w-full h-full object-cover">`;
    } else {
      imgs = fotos.map((src,idx)=> `<img src="${src}" alt="${m.nama} ${idx+1}" loading="${idx===0?'eager':'lazy'}" class="carousel-img ${idx===0?'active':''}" data-idx="${idx}">`).join("");
    }
    const wrapClass = fotos.length>1 ? "menu-carousel" : "";
    html += `<div class="menu-card-premium neo-card p-4 flex flex-col menu-card-in" style="animation-delay:${i*80}ms">
      <div class="menu-card-accent -mx-4 -mt-4 mb-3"></div>
      <div class="menu-card-img aspect-[4/3] bg-gray-100 overflow-hidden mb-3 ${wrapClass}" data-carousel="${m.id}">
        ${imgs}
      </div>
      <h3 class="font-oswald font-bold text-base leading-tight tracking-tight">${m.nama}</h3>
      <span class="menu-card-desc mt-1">${m.desc}</span>
      <div class="mt-3">
        <span class="menu-card-price">${rupiah(m.harga)}</span>
      </div>
      <button onclick="openVariant('${m.id}')" class="menu-card-btn neo-btn bg-neo-yellow font-mono font-bold py-3 mt-4">MAU INI!!</button>
    </div>`;
  });
  elGrid.innerHTML = html;
  startCarousels();
}
let carouselTimers = [];
function startCarousels(){
  carouselTimers.forEach(t=>clearInterval(t));
  carouselTimers=[];
  if(window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  document.querySelectorAll("[data-carousel]").forEach(wrap=>{
    const imgs = wrap.querySelectorAll(".carousel-img");
    if(imgs.length<=1) return;
    let idx=0;
    const t = setInterval(()=>{
      imgs[idx].classList.remove("active");
      idx = (idx+1)%imgs.length;
      imgs[idx].classList.add("active");
    }, 4000);
    carouselTimers.push(t);
  });
}

// variant modal logic
function getRasaOptions(baseId){
  if(baseId==="bolu7x22") return ["pandan","vanila","coklat"];
  return ["coklat","strawberry","matcha"];
}
function getToppingOptions(baseId){
  if(baseId==="bolu7x22") return ["meses warna","meses coklat","keju"];
  return ["oreo","meses warna","meses coklat","keju"];
}

function rasaColorClass(r, sel){
  if(!sel) return "bg-white text-gray-900";
  const m={coklat:"variant-rasa-coklat", strawberry:"variant-rasa-strawberry", matcha:"variant-rasa-matcha", pandan:"variant-rasa-pandan", vanila:"variant-rasa-vanila"};
  return (m[r]||"bg-neo-yellow text-gray-900")+" border-gray-950 shadow-[3px_3px_0px_#111]";
}
function toppingColorClass(t, sel){
  if(!sel) return "bg-white text-gray-900";
  const m={"oreo":"variant-topping-oreo","meses warna":"variant-topping-meses-warna","meses coklat":"variant-topping-meses-coklat","keju":"variant-topping-keju"};
  return (m[t]||"bg-neo-green text-white")+" border-gray-950 shadow-[3px_3px_0px_#111]";
}
function renderVariantChoices(){
  if(!elVariantRasa || !elVariantTopping) return;
  const rasaOpts = getRasaOptions(variantSelectedId);
  elVariantRasa.innerHTML = rasaOpts.map(r=>{
    const isSel = r===variantSelectedRasa;
    const cls = rasaColorClass(r, isSel);
    return `<button onclick="selectRasa('${r}')" class="variant-card neo-btn font-mono text-xs font-bold px-4 py-3 ${cls}" style="border-radius:14px;">${r}</button>`;
  }).join("");
  elVariantToppingWrap.classList.remove("hidden");
  const topOpts = getToppingOptions(variantSelectedId);
  let html = topOpts.map(t=>{
    const isSel = variantSelectedToppings.includes(t);
    const cls = toppingColorClass(t, isSel);
    return `<button onclick="selectTopping('${t}')" class="variant-card neo-btn font-mono text-xs font-bold px-4 py-3 ${cls}" style="border-radius:14px;">${t}</button>`;
  }).join("");
  const isMixSel = variantMix;
  const mixCls = isMixSel ? "variant-topping-mix border-gray-950 shadow-[3px_3px_0px_#111] text-white" : "bg-white text-gray-900";
  html += `<button onclick="toggleMix()" class="variant-card neo-btn font-mono text-xs font-bold px-4 py-3 ${mixCls}" style="border-radius:14px;">MIX</button>`;
  elVariantTopping.innerHTML = html;
  // preview pilihan — MIX = rasa + MIX doang, gak list semua
  const preview = document.getElementById('variantPreview');
  const previewText = document.getElementById('variantPreviewText');
  if(preview && previewText){
    if(variantSelectedRasa || variantSelectedToppings.length || variantMix){
      const rasa = variantSelectedRasa || '—';
      const top = variantMix ? 'MIX' : (variantSelectedToppings.length ? variantSelectedToppings.join(', ') : '—');
      previewText.textContent = `${rasa} + ${top}`;
      preview.classList.remove('hidden');
    } else preview.classList.add('hidden');
  }
}
function clearVariantError(){
  const el=document.getElementById('variantError');
  const box=document.getElementById('variantBox');
  if(el) el.classList.remove('show');
  if(box) box.classList.remove('shake');
}
function showVariantError(msg){
  playSound('error');
  const el=document.getElementById('variantError');
  const box=document.getElementById('variantBox');
  if(el){ el.textContent=msg; el.classList.add('show'); }
  if(box){ box.classList.remove('shake'); void box.offsetWidth; box.classList.add('shake'); setTimeout(()=>box.classList.remove('shake'),400); }
  if(navigator.vibrate) navigator.vibrate([80,40,80]);
}
window.selectRasa = (r)=>{ playSound('pilih'); variantSelectedRasa=r; clearVariantError(); renderVariantChoices(); };
window.selectTopping = (t)=>{
  playSound('pilih');
  if(variantMix){
    // MIX on → tap topping = keluar MIX, hapus yang di-tap dari semua
    variantMix = false;
    const all = getToppingOptions(variantSelectedId);
    variantSelectedToppings = all.filter(x=>x!==t);
    clearVariantError(); renderVariantChoices();
    return;
  }
  if(variantSelectedToppings.includes(t)) variantSelectedToppings = variantSelectedToppings.filter(x=>x!==t);
  else variantSelectedToppings.push(t);
  // auto MIX kalau semua kepilih manual
  const all = getToppingOptions(variantSelectedId);
  if(variantSelectedToppings.length === all.length && all.length>0){
    variantMix = true;
    variantSelectedToppings = all.slice();
  }
  clearVariantError(); renderVariantChoices();
};
window.toggleMix = ()=>{
  playSound('pilih');
  variantMix = !variantMix;
  if(variantMix){
    // pilih semua topping yang ada
    variantSelectedToppings = getToppingOptions(variantSelectedId).slice();
  } else {
    variantSelectedToppings = [];
  }
  clearVariantError(); renderVariantChoices();
};

window.openVariant = (id)=>{
  playSound('mauIni');
  const m = menuMap.get(id);
  if(!m) return;
  variantSelectedId = id;
  variantSelectedRasa = "";
  variantSelectedToppings = [];
  variantMix = false;
  clearVariantError();
  if(elVariantCatatan) elVariantCatatan.value="";
  if(elVariantProduct) elVariantProduct.textContent = `${m.nama} — ${rupiah(m.harga)}`;
  if(elVariantTitle) elVariantTitle.textContent = "PILIH RASA & TOPPING";
  renderVariantChoices();
  if(btnHam) btnHam.setAttribute("aria-expanded","false");
  if(navMenu) navMenu.classList.add("hidden");
  if(elVariantModal){ elVariantModal.classList.remove("hidden"); elVariantModal.classList.add("visible"); }
};
window.closeVariant = (silent)=>{
  if(!silent) playSound('batal');
  if(elVariantModal){ elVariantModal.classList.add("hidden"); elVariantModal.classList.remove("visible"); }
  clearVariantError();
  variantSelectedId=null; variantSelectedRasa=""; variantSelectedToppings=[]; variantMix=false;
};
window.confirmVariant = ()=>{
  if(!variantSelectedId || !variantSelectedRasa){
    showVariantError("Pilih rasa dulu — coklat / strawberry / matcha / pandan / vanila");
    return;
  }
  playSound('mauIni');
  const catatanRaw = elVariantCatatan ? elVariantCatatan.value.trim() : "";
  const toppingStr = variantMix ? "MIX" : variantSelectedToppings.slice().sort().join(", ");
  const catatan = variantMix ? (catatanRaw ? `MIX - ${catatanRaw}` : "MIX - campur sesuai stok topping") : catatanRaw;
  const key = variantKey(variantSelectedId, variantSelectedRasa, variantMix ? [] : variantSelectedToppings, variantMix);
  const cur = cart.get(key) || 0;
  cart.set(key, cur+1);
  variantMeta.set(key, {baseId: variantSelectedId, rasa: variantSelectedRasa, topping: toppingStr, catatan});
  if(catatan) variantMeta.get(key).catatan = catatan;
  closeVariant(true);
  updateCartUI(true);
};

if(elVariantModal){
  elVariantModal.addEventListener("click", (e)=>{ if(e.target===elVariantModal) window.closeVariant(); });
  document.addEventListener("keydown", (e)=>{ if(e.key==="Escape") window.closeVariant(); });
}

function changeQty(key, delta){
  playSound('tambahKurang');
  const cur = cart.get(key) || 0;
  const next = cur + delta;
  if(next <= 0){ cart.delete(key); variantMeta.delete(key); }
  else cart.set(key, next);
  updateCartUI();
  requestAnimationFrame(()=>{
    const qtyEl = document.querySelector(`[data-qty="${CSS.escape(key)}"]`);
    if(qtyEl){ qtyEl.classList.remove("qty-pop"); void qtyEl.offsetWidth; qtyEl.classList.add("qty-pop"); }
  });
}

function getCartItems(){
  const out=[];
  for(const [key,qty] of cart){
    const meta = variantMeta.get(key);
    const baseId = meta ? meta.baseId : key.split("|")[0];
    const m = menuMap.get(baseId);
    if(!m) continue;
    const rasa = meta ? meta.rasa : "";
    const topping = meta ? meta.topping : "";
    const catatan = meta ? meta.catatan : "";
    const label = `${m.nama}${rasa ? ` — ${rasa}` : ""}${topping ? ` + ${topping}` : ""}${catatan ? ` (${catatan})` : ""}`;
    out.push({...m, qty, key, rasa, topping, catatan, label});
  }
  return out;
}

let firstCartShow = true;
function updateCartUI(bump=false){
  const items = getCartItems();
  const total = cartTotal(items);
  const count = items.reduce((a,b)=>a+b.qty,0);

  if(count===0){
    elCartBar.classList.add("hidden");
    elCartBar.classList.remove("visible-pop");
    elDrawer.classList.add("closed"); elDrawer.classList.remove("open");
    elOverlay.classList.add("hidden"); elOverlay.classList.remove("visible");
    firstCartShow = true;
  } else {
    const wasHidden = elCartBar.classList.contains("hidden");
    elCartBar.classList.remove("hidden");
    if(wasHidden && firstCartShow){
      elCartBar.classList.add("visible-pop");
      firstCartShow = false;
      setTimeout(()=> elCartBar.classList.remove("visible-pop"), 600);
    }
    if(bump){
      elCartBar.classList.remove("cart-bump"); void elCartBar.offsetWidth; elCartBar.classList.add("cart-bump");
      elCartCount.classList.remove("qty-pop"); void elCartCount.offsetWidth; elCartCount.classList.add("qty-pop");
    }
    elCartCount.textContent = count + " item";
    elCartTotal.textContent = rupiah(total);
    elDrawerTotal.textContent = rupiah(total);
  }

  let html="";
  items.forEach((it, idx)=>{
    // escape key for onclick
    const safeKey = it.key.replace(/'/g, "\\'");
    html += `<div class="drawer-item flex gap-3 items-center border-b border-gray-200 py-3" style="animation-delay:${idx*50}ms">
      <img src="${it.foto}" class="w-14 h-14 object-cover border-2 border-gray-950 shrink-0">
      <div class="flex-1 min-w-0">
        <p class="font-mono font-bold text-xs leading-tight">${it.label}</p>
        <p class="font-mono text-xs">${rupiah(it.harga)}${it.qty>1 ? ` × ${it.qty}` : ""}</p>
      </div>
      <div class="flex items-center gap-1">
        <button onclick="changeQty('${safeKey}',-1)" class="neo-btn w-8 h-8 flex items-center justify-center bg-white font-bold">-</button>
        <span data-qty="${it.key}" class="font-mono font-bold text-sm w-7 text-center">${it.qty}</span>
        <button onclick="changeQty('${safeKey}',1)" class="neo-btn w-8 h-8 flex items-center justify-center bg-white font-bold">+</button>
      </div>
    </div>`;
  });
  if(items.length===0) html = `<p class="font-mono text-sm text-gray-500 py-8 text-center">Keranjang kosong</p>`;
  elDrawerList.innerHTML = html;
  localStorage.setItem("web-jualan-cart", JSON.stringify([...cart]));
  localStorage.setItem("web-jualan-variant", JSON.stringify([...variantMeta]));
}

window.changeQty = changeQty;
window.openDrawer = ()=>{
  if(cart.size===0) return;
  playSound('keranjang');
  elDrawer.classList.remove("closed"); elDrawer.classList.add("open");
  elOverlay.classList.remove("hidden"); elOverlay.classList.add("visible");
};
window.closeDrawer = (silent)=>{
  if(!silent) playSound('batal');
  elDrawer.classList.add("closed"); elDrawer.classList.remove("open");
  elOverlay.classList.add("hidden"); elOverlay.classList.remove("visible");
};
window.openCheckout = ()=>{
  if(cart.size===0) return;
  playSound('mauIni');
  closeDrawer(true);
  elCheckoutModal.classList.remove("hidden"); elCheckoutModal.classList.add("visible");
};
window.closeCheckout = ()=>{ playSound('batal'); elCheckoutModal.classList.add("hidden"); elCheckoutModal.classList.remove("visible"); };
window.closeConfirm = ()=>{
  playSound('batal');
  if(elConfirmModal){ elConfirmModal.classList.add("hidden"); elConfirmModal.classList.remove("visible"); }
  // balik ke form checkout biar bisa ubah
  if(elCheckoutModal){ elCheckoutModal.classList.remove("hidden"); elCheckoutModal.classList.add("visible"); }
};
window.closeSuccess = ()=>{ playSound('batal'); elSuccessModal.classList.add("hidden"); elSuccessModal.classList.remove("visible"); };
window.confirmSend = async ()=>{
  if(!pendingPayload || !pendingItems.length) return;
  const btn = elConfirmModal ? elConfirmModal.querySelector('button[onclick="confirmSend()"]') : null;
  const prev = btn ? btn.textContent : "";
  if(btn){ btn.textContent = "MENGIRIM..."; btn.disabled = true; }
  const {nama,wa,kategori,catatan,total} = pendingPayload;
  const items = pendingItems;
  try{
    if(GAS_URL){
      await fetch(GAS_URL, { method:"POST", mode:"no-cors", body: JSON.stringify(pendingPayload) });
    }
    const allOrders = JSON.parse(localStorage.getItem("web-jualan-orders")||"[]");
    allOrders.push(pendingPayload);
    localStorage.setItem("web-jualan-orders", JSON.stringify(allOrders));
    cart.clear(); variantMeta.clear(); updateCartUI();
    if(elConfirmModal){ elConfirmModal.classList.add("hidden"); elConfirmModal.classList.remove("visible"); }
    elCheckoutForm.reset();
    // show loader then morph to detail card (reuse success flow)
    const loaderEl = document.getElementById('orderLoader');
    const detailEl = document.getElementById('orderDetail');
    loaderEl.classList.remove('morph-out'); detailEl.classList.add('hidden'); detailEl.classList.remove('morph-in');
    elSuccessModal.classList.remove("hidden"); elSuccessModal.classList.add("visible");
    loaderEl.style.display = 'flex';
    detailEl.classList.add('hidden');
    document.getElementById('detailNama').textContent = nama;
    document.getElementById('detailWa').textContent = wa;
    document.getElementById('detailKategori').textContent = kategori;
    document.getElementById('detailItems').innerHTML = items.map(i=> `<div class="flex justify-between"><span>${i.label} × ${i.qty}</span><span>${rupiah(i.harga * i.qty)}</span></div>`).join('');
    document.getElementById('detailTotal').textContent = rupiah(total);
    const catWrap = document.getElementById('detailCatatanWrap');
    if(catatan){ document.getElementById('detailCatatan').textContent = catatan; catWrap.classList.remove('hidden'); } else catWrap.classList.add('hidden');
    pendingPayload = null; pendingItems = [];
    setTimeout(()=>{
      loaderEl.classList.add('morph-out');
      setTimeout(()=>{
        loaderEl.style.display = 'none';
        detailEl.classList.remove('hidden');
        detailEl.classList.add('morph-in');
        playSound('terkirim');
      }, 400);
    }, 2200);
  }catch(err){ alert("Gagal kirim: " + err.message); }
  finally{ if(btn){ btn.textContent = prev || "YAKIN KIRIM"; btn.disabled = false; } }
};
window.openContact = ()=>{
  playSound('retrogame');
  if(btnHam) btnHam.setAttribute("aria-expanded","false");
  if(navMenu) navMenu.classList.add("hidden");
  if(elContactModal){ elContactModal.classList.remove("hidden"); elContactModal.classList.add("visible"); }
};
window.closeContact = ()=>{
  playSound('batal');
  if(elContactModal){ elContactModal.classList.add("hidden"); elContactModal.classList.remove("visible"); }
};
window.openRequest = ()=>{
  playSound('retrogame');
  if(btnHam) btnHam.setAttribute("aria-expanded","false");
  if(navMenu) navMenu.classList.add("hidden");
  if(elRequestModal){ elRequestModal.classList.remove("hidden"); elRequestModal.classList.add("visible"); }
};
window.closeRequest = ()=>{
  playSound('batal');
  if(elRequestModal){ elRequestModal.classList.add("hidden"); elRequestModal.classList.remove("visible"); }
};
if(elContactModal){
  elContactModal.addEventListener("click", (e)=>{ if(e.target===elContactModal) window.closeContact(); });
  document.addEventListener("keydown", (e)=>{ if(e.key==="Escape") window.closeContact(); });
}
if(elRequestModal){
  elRequestModal.addEventListener("click", (e)=>{ if(e.target===elRequestModal) window.closeRequest(); });
  document.addEventListener("keydown", (e)=>{ if(e.key==="Escape") window.closeRequest(); });
}

if(elCheckoutForm){
  elCheckoutForm.addEventListener("submit", (e)=>{
    e.preventDefault();
    const fd = new FormData(elCheckoutForm);
    const nama = fd.get("nama").trim();
    const wa = fd.get("wa").trim();
    const kategori = fd.get("kategori");
    const catatan = fd.get("catatan").trim();
    const metode = fd.get("metode");
    const items = getCartItems();
    if(items.length===0) return;
    const total = cartTotal(items);
    const payload = { nama, wa, kategori, catatan, metode, items: items.map(i=> `${i.label} x${i.qty}`), total, waktu: new Date().toISOString() };
    pendingPayload = payload;
    pendingItems = items;
    // populate confirm orange
    document.getElementById('confirmItems').innerHTML = items.map(i=> `<div class="flex justify-between"><span>${i.label} × ${i.qty}</span><span>${rupiah(i.harga * i.qty)}</span></div>`).join('');
    document.getElementById('confirmTotal').textContent = rupiah(total);
    document.getElementById('confirmNama').textContent = nama;
    document.getElementById('confirmWa').textContent = wa;
    document.getElementById('confirmKategori').textContent = kategori;
    const cWrap = document.getElementById('confirmCatatanWrap');
    if(catatan){ document.getElementById('confirmCatatan').textContent = catatan; cWrap.classList.remove('hidden'); } else cWrap.classList.add('hidden');
    playSound('mauIni');
    elCheckoutModal.classList.add("hidden"); elCheckoutModal.classList.remove("visible");
    if(elConfirmModal){ elConfirmModal.classList.remove("hidden"); elConfirmModal.classList.add("visible"); }
  });
}
if(elConfirmModal){
  elConfirmModal.addEventListener("click", (e)=>{ if(e.target===elConfirmModal) window.closeConfirm(); });
  document.addEventListener("keydown", (e)=>{ if(e.key==="Escape" && elConfirmModal.classList.contains("visible")) window.closeConfirm(); });
}
try{
  const saved = JSON.parse(localStorage.getItem("web-jualan-cart")||"[]");
  for(const [k,v] of saved) cart.set(k,v);
  const savedVar = JSON.parse(localStorage.getItem("web-jualan-variant")||"[]");
  for(const [k,v] of savedVar) variantMeta.set(k,v);
}catch{}
loadMenu().then(data=>{ renderMenu(data); updateCartUI(); });
// request khusus terpisah dari pesanan menu
const reqForm = document.getElementById("requestForm");
const reqStatus = document.getElementById("requestStatus");
if(reqForm){
  reqForm.addEventListener("submit", async (e)=>{
    e.preventDefault();
    const fd = new FormData(reqForm);
    const nama = fd.get("nama").trim();
    const wa = fd.get("wa").trim();
    const request = fd.get("request").trim();
    if(!nama || !wa || !request) return;
    const btn = reqForm.querySelector('button[type="submit"]');
    const prev = btn.textContent; btn.textContent = "MENGIRIM..."; btn.disabled = true;
    const payload = { type: "request", nama, wa, request, waktu: new Date().toISOString() };
    try{
      if(GAS_URL) await fetch(GAS_URL, { method:"POST", mode:"no-cors", body: JSON.stringify(payload) });
      const all = JSON.parse(localStorage.getItem("web-jualan-requests")||"[]");
      all.push(payload); localStorage.setItem("web-jualan-requests", JSON.stringify(all));
      reqForm.reset();
      reqStatus.textContent = "Request terkirim — ditunggu kabar via WA besok.";
      reqStatus.className = "font-mono text-xs bg-neo-green text-white border-2 border-gray-950 px-3 py-2";
      reqStatus.classList.remove("hidden");
      setTimeout(()=> reqStatus.classList.add("hidden"), 4000);
    }catch(err){
      reqStatus.textContent = "Gagal: " + err.message;
      reqStatus.className = "font-mono text-xs bg-neo-pink text-white border-2 border-gray-950 px-3 py-2";
      reqStatus.classList.remove("hidden");
    }finally{ btn.textContent = prev; btn.disabled = false; }
  });
}
console.assert(cartTotal([{harga:10000,qty:2},{harga:5000,qty:1}])===25000, "total fail");
