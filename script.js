

// ===== Este arquivo é um ES Module =====
// No HTML, carregue com: <script type="module" src="./script.js"></script>

// ===== (Opcional) AOS =====
if (window.AOS) AOS.init();

// ===== MENU MOBILE TOGGLE (mantive seu comportamento) =====
const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');
menuToggle?.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    const icon = menuToggle.querySelector('i');
    if (!icon) return;
    if (navLinks.classList.contains('active')) {
        icon.classList.remove('bx-menu');
        icon.classList.add('bx-x');
    } else {
        icon.classList.remove('bx-x');
        icon.classList.add('bx-menu');
    }
});

// ===== SMOOTH SCROLL (mantido) =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        navLinks?.classList.remove('active');
        const icon = menuToggle?.querySelector('i');
        if (icon) { icon.classList.remove('bx-x'); icon.classList.add('bx-menu'); }
        const targetId = this.getAttribute('href');
        const targetSection = document.querySelector(targetId);
        if (targetSection) {
            const headerOffset = 80;
            const elementPosition = targetSection.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
            window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
        }
    });
});

// ===== ANIMAÇÃO ON SCROLL (mantido) =====
const observerOptions = { threshold: 0.1, rootMargin: "0px 0px -100px 0px" };
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = "0";
            entry.target.style.transform = "translateY(30px)";
            setTimeout(() => {
                entry.target.style.transition = "all 0.6s ease";
                entry.target.style.opacity = "1";
                entry.target.style.transform = "translateY(0)";
            }, 100);
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);
document.querySelectorAll('.service-card, .testimonial-card, .whatsapp-button').forEach(el => observer.observe(el));

// ===== HEADER SCROLL EFFECT (mantido) =====
let lastScroll = 0;
const header = document.querySelector('header');
window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    if (header) {
        header.style.boxShadow = currentScroll > 50 ? '0 2px 20px rgba(0,0,0,0.1)' : '0 2px 10px rgba(0,0,0,0.1)';
        header.style.transform = (currentScroll > lastScroll && currentScroll > 100) ? 'translateY(-100%)' : 'translateY(0)';
    }
    lastScroll = currentScroll;
});

// ===== PULSO WHATSAPP FLOAT (mantido) =====
setInterval(() => {
    const whatsappFloat = document.querySelector('.whatsapp-float');
    if (!whatsappFloat) return;
    whatsappFloat.style.animation = 'pulse 1s';
    setTimeout(() => { whatsappFloat.style.animation = ''; }, 1000);
}, 4000);

// ===== CSS extra p/ pulse + horários reservados =====
const style = document.createElement('style');
style.innerHTML = `
  @keyframes pulse {
    0% { transform: scale(1); box-shadow: 0 5px 20px rgba(0,0,0,0.2); }
    50% { transform: scale(1.1); box-shadow: 0 8px 30px rgba(37,211,102,0.4); }
    100% { transform: scale(1); box-shadow: 0 5px 20px rgba(0,0,0,0.2); }
  }
  option[disabled].reservado { background:#eee; color:#888; }
  #confirmarBtn[disabled] { opacity:.7; cursor:not-allowed; }
`;
document.head.appendChild(style);

// ===== MODAL / ELEMENTOS =====
const modal = document.getElementById("modal");
const openBtn = document.getElementById("openModalBtn");
const closeBtn = document.querySelector(".close");
const confirmarBtn = document.getElementById("confirmarBtn");
const dataInput = document.getElementById("data");
const horaSelect = document.getElementById("hora");

// ===== ABRIR/FECHAR MODAL =====
openBtn?.addEventListener('click', () => {
    if (!modal) return;
    modal.style.display = "flex";
    // Data mínima = hoje
    const hoje = new Date();
    const y = hoje.getFullYear();
    const m = String(hoje.getMonth() + 1).padStart(2, "0");
    const d = String(hoje.getDate()).padStart(2, "0");
    if (dataInput) dataInput.min = `${y}-${m}-${d}`;
    if (dataInput?.value) carregarIndisponiveis();
});
closeBtn?.addEventListener('click', () => { if (modal) modal.style.display = "none"; });
window.addEventListener('click', (e) => { if (e.target === modal) modal.style.display = "none"; });

// ===== FIREBASE (CDN modular) =====
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
    getFirestore, doc, getDoc, setDoc, serverTimestamp,
    collection, query, where, getDocs
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// SUA config (a mesma do console do Firebase)
const firebaseConfig = {
    apiKey: "AIzaSyDgaoVZK-5TF5xDFulLISridU9IXbmEYgg",
    authDomain: "barbearia-agenda-fe2a7.firebaseapp.com",
    projectId: "barbearia-agenda-fe2a7",
    storageBucket: "barbearia-agenda-fe2a7.firebasestorage.app",
    messagingSenderId: "876658896099",
    appId: "1:876658896099:web:6a361416ed84fd636f29d6",
    measurementId: "G-NJ4ETW1TNZ"
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ===== HELPERS / FIRESTORE =====
const toKey = (ymd, hhmm) => `${ymd}_${hhmm}`;
const normalizeHora = (h) => h.padStart(5, "0");

function resetSelectVisual() {
    if (!horaSelect) return;
    for (const opt of horaSelect.options) {
        if (!opt.value) continue;
        opt.disabled = false;
        opt.classList.remove("reservado");
    }
}

function marcarIndisponiveis(horasOcupadas) {
    if (!horaSelect) return;
    for (const opt of horaSelect.options) {
        if (!opt.value) continue;
        const ocupado = horasOcupadas.has(opt.value);
        opt.disabled = ocupado;
        opt.classList.toggle("reservado", ocupado);
    }
    // Se a opção selecionada ficou desabilitada, limpa
    if (horaSelect.value && horaSelect.selectedOptions[0]?.disabled) {
        horaSelect.value = "";
    }
}

async function getReservasByDate(ymd) {
    const q = query(collection(db, "reservas"), where("data", "==", ymd));
    const snap = await getDocs(q);
    const horas = new Set();
    snap.forEach(d => { const row = d.data(); if (row?.hora) horas.add(row.hora); });
    return horas;
}

async function carregarIndisponiveis() {
    if (!dataInput?.value) return;
    resetSelectVisual();
    try {
        const horas = await getReservasByDate(dataInput.value);
        marcarIndisponiveis(horas);
    } catch (e) {
        console.error("Erro ao carregar horários:", e);
    }
}

dataInput?.addEventListener("change", carregarIndisponiveis);

// ===== CONFIRMAR: salva no Firestore e abre WhatsApp =====
confirmarBtn?.addEventListener('click', async () => {
    const data = dataInput?.value;
    const hora = horaSelect?.value;

    if (!data || !hora) {
        alert("Por favor, selecione a data e a hora.");
        return;
    }

    confirmarBtn.disabled = true;
    const originalText = confirmarBtn.textContent;
    confirmarBtn.textContent = "Reservando...";

    const hhmm = normalizeHora(hora);
    const ref = doc(db, "reservas", toKey(data, hhmm));

    try {
        const snap = await getDoc(ref);
        if (snap.exists()) {
            await carregarIndisponiveis();
            alert("Este horário já foi reservado. Escolha outro, por favor.");
            return;
        }

        await setDoc(ref, { data, hora: hhmm, createdAt: serverTimestamp() });

        await carregarIndisponiveis();

        const dataBR = new Date(`${data}T00:00:00`).toLocaleDateString('pt-BR');
        const mensagem = `Olá, gostaria de agendar um horário na barbearia para o dia ${dataBR} às ${hhmm}.`;
        const numeroWhatsApp = "5581996221060";
        const url = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensagem)}`;
        window.open(url, "_blank");

    } catch (err) {
        console.error(err);
        alert("Não foi possível concluir a reserva. Tente novamente.");
    } finally {
        confirmarBtn.disabled = false;
        confirmarBtn.textContent = originalText || "Agendar via WhatsApp";
    }
});


