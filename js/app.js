// loader 3s + ghost 5 warna random (hijau biru tua pink kuning merah)
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
      setTimeout(()=> loader.remove(), 700);
    }, wait);
  }
  if(document.readyState === 'complete') done();
  else window.addEventListener('load', done);
})();
const GAS_URL = "https://script.google.com/macros/s/AKfycbwTNe5gMxd6XgXLpVpCmupC9CfnqwjTao5vhPgpUS47HS7j_d4j9gyOwbRX2xQbzXNt/exec";
const menuFallback = [
  {"id":"brw250","nama":"Brownies 250ml","harga":20000,"desc":"Cup 250ml — 1 cup","foto":"asset/brownies/5.webp","fotos":["asset/brownies/5.webp","asset/brownies/6.webp"]},
  {"id":"brw500","nama":"Brownies 500ml","harga":35000,"desc":"Cup 500ml — 1 cup","foto":"asset/brownies/7.webp","fotos":["asset/brownies/7.webp","asset/brownies/8.webp"]},
  {"id":"bolu7x22","nama":"Bolu 7×22 cm","harga":50000,"desc":"Loyang 7×22 cm","foto":"asset/bolu/2.webp","fotos":["asset/bolu/2.webp","asset/bolu/3.webp","asset/bolu/4.webp","asset/bolu/9.webp"]}
];
let menuMap = new Map();
let cart = new Map(); // key composite -> qty
let variantMeta = new Map(); // key -> {baseId, rasa, topping, catatan}
let variantSelectedId = null;
let variantSelectedRasa = "";
let variantSelectedToppings = [];
let variantMix = false;
let selfieData = ""; // base64 opsional

const elGrid = document.getElementById("menuGrid");
const elCartBar = document.getElementById("cartBar");
const elCartCount = document.getElementById("cartCount");
const elCartTotal = document.getElementById("cartTotal");
const elDrawer = document.getElementById("cartDrawer");
const elOverlay = document.getElementById("drawerOverlay");
const elDrawerList = document.getElementById("drawerList");
const elDrawerTotal = document.getElementById("drawerTotal");
const elCheckoutModal = document.getElementById("checkoutModal");
const elSuccessModal = document.getElementById("successModal");
const elContactModal = document.getElementById("contactModal");
const elRequestModal = document.getElementById("requestModal");
const elCheckoutForm = document.getElementById("checkoutForm");
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


// selfie handling — input absolute opacity-0 cover label, no JS trigger needed
const selfieInput = document.getElementById("selfieInput");
const selfiePreview = document.getElementById("selfiePreview");
const selfieImg = document.getElementById("selfieImg");
const selfieLabel = document.getElementById("selfieLabel");
if(selfieInput){
  selfieInput.addEventListener("change", ()=>{
    const f = selfieInput.files[0];
    if(!f) return;
    // some Android gallery returns empty type, skip strict check if size ok
    if(f.type && !f.type.startsWith('image/')){ alert("File harus gambar"); selfieInput.value=""; return; }
    if(f.size > 5*1024*1024){ alert("Foto max 5MB — coba foto lain"); selfieInput.value=""; return; }
    const r = new FileReader();
    r.onerror = ()=> alert("Gagal baca foto");
    r.onload = ()=>{
      selfieData = r.result;
      selfieImg.src = selfieData;
      selfiePreview.classList.remove("hidden");
      selfieLabel.textContent = f.name.length>24 ? f.name.slice(0,24)+"…" : f.name;
    };
    r.readAsDataURL(f);
  });
}
window.clearSelfie = ()=>{
  selfieData = "";
  if(selfieInput) selfieInput.value = "";
  if(selfiePreview) selfiePreview.classList.add("hidden");
  if(selfieLabel) selfieLabel.textContent = "Klik untuk foto selfie";
};

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
    html += `<div class="neo-card p-3 flex flex-col menu-card-in" style="animation-delay:${i*60}ms">
      <div class="aspect-[4/3] bg-gray-100 border-[3px] border-gray-950 overflow-hidden mb-3 ${wrapClass}" data-carousel="${m.id}">
        ${imgs}
      </div>
      <h3 class="font-mono font-bold text-sm leading-tight">${m.nama}</h3>
      <p class="font-mono text-xs text-gray-500 mb-2">${m.desc}</p>
      <p class="font-mono font-bold text-sm mb-3">${rupiah(m.harga)}</p>
      <button onclick="openVariant('${m.id}')" class="neo-btn bg-neo-yellow font-mono text-xs font-bold py-2.5 mt-auto">MAU INI!!</button>
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

function renderVariantChoices(){
  if(!elVariantRasa || !elVariantTopping) return;
  const rasaOpts = getRasaOptions(variantSelectedId);
  elVariantRasa.innerHTML = rasaOpts.map(r=>{
    const sel = r===variantSelectedRasa ? "bg-neo-yellow border-gray-950 shadow-[2px_2px_0px_#111]" : "bg-white";
    return `<button onclick="selectRasa('${r}')" class="neo-btn font-mono text-xs font-bold px-3 py-2 ${sel}">${r}</button>`;
  }).join("");
  elVariantToppingWrap.classList.remove("hidden");
  const topOpts = getToppingOptions(variantSelectedId);
  let html = topOpts.map(t=>{
    const sel = variantSelectedToppings.includes(t) ? "bg-neo-green text-white border-gray-950 shadow-[2px_2px_0px_#111]" : "bg-white";
    return `<button onclick="selectTopping('${t}')" class="neo-btn font-mono text-xs font-bold px-3 py-2 ${sel}">${t}</button>`;
  }).join("");
  // MIX button khusus brownies — males ngetik, campur sesuai stok
  if(variantSelectedId && variantSelectedId.startsWith("brw")){
    const selMix = variantMix ? "bg-neo-pink text-white border-gray-950 shadow-[2px_2px_0px_#111]" : "bg-white";
    html += `<button onclick="toggleMix()" class="neo-btn font-mono text-xs font-bold px-3 py-2 ${selMix}">MIX</button>`;
  }
  elVariantTopping.innerHTML = html;
}
function clearVariantError(){
  const el=document.getElementById('variantError');
  const box=document.getElementById('variantBox');
  if(el) el.classList.remove('show');
  if(box) box.classList.remove('shake');
}
function showVariantError(msg){
  const el=document.getElementById('variantError');
  const box=document.getElementById('variantBox');
  if(el){ el.textContent=msg; el.classList.add('show'); }
  if(box){ box.classList.remove('shake'); void box.offsetWidth; box.classList.add('shake'); setTimeout(()=>box.classList.remove('shake'),400); }
  if(navigator.vibrate) navigator.vibrate([80,40,80]);
}
window.selectRasa = (r)=>{ variantSelectedRasa=r; clearVariantError(); renderVariantChoices(); };
window.selectTopping = (t)=>{
  if(variantSelectedToppings.includes(t)) variantSelectedToppings = variantSelectedToppings.filter(x=>x!==t);
  else variantSelectedToppings.push(t);
  clearVariantError(); renderVariantChoices();
};
window.toggleMix = ()=>{ variantMix = !variantMix; clearVariantError(); renderVariantChoices(); };

window.openVariant = (id)=>{
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
window.closeVariant = ()=>{
  if(elVariantModal){ elVariantModal.classList.add("hidden"); elVariantModal.classList.remove("visible"); }
  clearVariantError();
  variantSelectedId=null; variantSelectedRasa=""; variantSelectedToppings=[]; variantMix=false;
};
window.confirmVariant = ()=>{
  if(!variantSelectedId || !variantSelectedRasa){
    showVariantError("Pilih rasa dulu — coklat / strawberry / matcha / pandan / vanila");
    return;
  }
  const catatanRaw = elVariantCatatan ? elVariantCatatan.value.trim() : "";
  const toppingBase = variantSelectedToppings.slice().sort().join(", ");
  const toppingStr = variantMix ? (toppingBase ? `${toppingBase} + MIX` : "MIX") : toppingBase;
  const catatan = variantMix ? (catatanRaw ? `MIX - ${catatanRaw}` : "MIX - campur sesuai stok topping") : catatanRaw;
  const key = variantKey(variantSelectedId, variantSelectedRasa, variantSelectedToppings, variantMix);
  const cur = cart.get(key) || 0;
  cart.set(key, cur+1);
  variantMeta.set(key, {baseId: variantSelectedId, rasa: variantSelectedRasa, topping: toppingStr, catatan});
  if(catatan) variantMeta.get(key).catatan = catatan;
  closeVariant();
  updateCartUI(true);
};

if(elVariantModal){
  elVariantModal.addEventListener("click", (e)=>{ if(e.target===elVariantModal) window.closeVariant(); });
  document.addEventListener("keydown", (e)=>{ if(e.key==="Escape") window.closeVariant(); });
}

function changeQty(key, delta){
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
  elDrawer.classList.remove("closed"); elDrawer.classList.add("open");
  elOverlay.classList.remove("hidden"); elOverlay.classList.add("visible");
};
window.closeDrawer = ()=>{
  elDrawer.classList.add("closed"); elDrawer.classList.remove("open");
  elOverlay.classList.add("hidden"); elOverlay.classList.remove("visible");
};
window.openCheckout = ()=>{
  if(cart.size===0) return;
  closeDrawer();
  elCheckoutModal.classList.remove("hidden"); elCheckoutModal.classList.add("visible");
};
window.closeCheckout = ()=>{ elCheckoutModal.classList.add("hidden"); elCheckoutModal.classList.remove("visible"); };
window.closeSuccess = ()=>{ elSuccessModal.classList.add("hidden"); elSuccessModal.classList.remove("visible"); };
window.openContact = ()=>{
  if(btnHam) btnHam.setAttribute("aria-expanded","false");
  if(navMenu) navMenu.classList.add("hidden");
  if(elContactModal){ elContactModal.classList.remove("hidden"); elContactModal.classList.add("visible"); }
};
window.closeContact = ()=>{
  if(elContactModal){ elContactModal.classList.add("hidden"); elContactModal.classList.remove("visible"); }
};
window.openRequest = ()=>{
  if(btnHam) btnHam.setAttribute("aria-expanded","false");
  if(navMenu) navMenu.classList.add("hidden");
  if(elRequestModal){ elRequestModal.classList.remove("hidden"); elRequestModal.classList.add("visible"); }
};
window.closeRequest = ()=>{
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
  elCheckoutForm.addEventListener("submit", async (e)=>{
    e.preventDefault();
    const fd = new FormData(elCheckoutForm);
    const nama = fd.get("nama").trim();
    const wa = fd.get("wa").trim();
    const catatan = fd.get("catatan").trim();
    const metode = fd.get("metode");
    const items = getCartItems();
    if(items.length===0) return;
    const total = cartTotal(items);
    const payload = { nama, wa, catatan, metode, items: items.map(i=> `${i.label} x${i.qty}`), total, waktu: new Date().toISOString(), hasSelfie: !!selfieData };
    const btn = elCheckoutForm.querySelector('button[type="submit"]');
    const prev = btn.textContent; btn.textContent = "MENGIRIM..."; btn.disabled = true;
    try{
      if(GAS_URL){
        await fetch(GAS_URL, { method:"POST", mode:"no-cors", body: JSON.stringify(payload) });
      }
      const savedSelfie = selfieData;
      const allOrders = JSON.parse(localStorage.getItem("web-jualan-orders")||"[]");
      allOrders.push({...payload, selfie: savedSelfie ? savedSelfie.slice(0,120)+"...truncated" : ""});
      localStorage.setItem("web-jualan-orders", JSON.stringify(allOrders));
      if(savedSelfie) localStorage.setItem("web-jualan-last-selfie", savedSelfie);
      cart.clear(); variantMeta.clear(); updateCartUI(); closeCheckout(); elCheckoutForm.reset(); clearSelfie();
      document.getElementById("successText").textContent = `Pesanan ${payload.items.join(", ")} - ${rupiah(total)} atas nama ${nama} terkirim.`;
      const sw = document.getElementById("successSelfieWrap");
      const si = document.getElementById("successSelfie");
      if(savedSelfie){ si.src = savedSelfie; sw.classList.remove("hidden"); } else sw.classList.add("hidden");
      elSuccessModal.classList.remove("hidden"); elSuccessModal.classList.add("visible");
    }catch(err){ alert("Gagal kirim: " + err.message); }
    finally{ btn.textContent = prev; btn.disabled = false; }
  });
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
