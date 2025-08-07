AOS.init();


const modal = document.getElementById("modal");
const openBtn = document.getElementById("openModalBtn");
const closeBtn = document.querySelector(".close");
const confirmarBtn = document.getElementById("confirmarBtn");

openBtn.onclick = () => {
    modal.style.display = "flex";
};

closeBtn.onclick = () => {
    modal.style.display = "none";
};

window.onclick = (e) => {
    if (e.target === modal) {
        modal.style.display = "none";
    }
};

confirmarBtn.onclick = () => {
    const data = document.getElementById("data").value;
    const hora = document.getElementById("hora").value;

    if (!data || !hora) {
        alert("Por favor, selecione a data e a hora.");
        return;
    }

    const dataFormatada = new Date(data).toLocaleDateString('pt-BR');
    const mensagem = `Olá, gostaria de agendar um horário na barbearia para o dia ${dataFormatada} às ${hora}.`;

    const numeroWhatsApp = "5581996221060"; // número da barbearia
    const url = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensagem)}`;

    window.open(url, '_blank');
};

