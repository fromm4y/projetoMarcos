
// ----------------- Chatbot -----------------
const botaoChat = document.getElementById("btnAbrirChatbot");
const dfMessenger = document.querySelector("df-messenger");


botaoChat.addEventListener("click", () => {
    dfMessenger.classList.toggle("aberto");
    dfMessenger.setAttribute("opened", dfMessenger.classList.contains("aberto"));
});

// ----------------- Variáveis globais -----------------
let stream = null;
let modelosCarregados = false;

// Elementos DOM
document.addEventListener("DOMContentLoaded", () => {
const abrirIA = document.getElementById('abrirIA');
const cameraModal = document.getElementById('cameraModal');
const fecharModal = document.getElementById('fecharModal');
const video = document.getElementById('video');
const tirarFoto = document.getElementById('tirarFoto');
const fotoCanvas = document.getElementById('fotoCanvas');
const modalStatus = document.getElementById('modalStatus');

// ----------------- Carregar modelos -----------------
async function carregarModelos() {
  if (modelosCarregados) return;
  modalStatus.innerText = 'Carregando modelos...';
  try {
    await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
    await faceapi.nets.faceExpressionNet.loadFromUri('/models');
    modelosCarregados = true;
    modalStatus.innerText = 'Modelos carregados.';
  } catch (err) {
    console.error('Erro carregando modelos:', err);
    modalStatus.innerText = 'Erro ao carregar modelos. Veja console.';
  }
}
// ----------------- Abrir modal e ativar câmera -----------------
  abrirIA.addEventListener('click', async () => {
    cameraModal.classList.add('open');
    cameraModal.setAttribute('aria-hidden', 'false');
    modalStatus.innerText = 'Carregando...';
    await carregarModelos();

    try {
      stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640 } });
      video.srcObject = stream;
      await video.play();
      modalStatus.innerText = 'Câmera ativa. Posicione seu rosto e clique em 📸';
    } catch (err) {
      console.error('Erro ao acessar a câmera:', err);
      modalStatus.innerText = 'Não foi possível acessar a câmera.';
    }
  });

  // ----------------- Fechar modal e parar câmera -----------------
  fecharModal.addEventListener('click', () => {
    pararCamera();
    cameraModal.classList.remove('open');
    cameraModal.setAttribute('aria-hidden', 'true');
    modalStatus.innerText = 'Aguardando...';
  });

});


// ----------------- Parar câmera -----------------
function pararCamera() {
  if (stream) {
    stream.getTracks().forEach(t => t.stop());
    stream = null;
  }
  video.srcObject = null;
}

// ----------------- Tirar foto, enviar para backend e detectar emoção -----------------
tirarFoto.addEventListener('click', async () => {
  if (!video || video.readyState < 2) {
    modalStatus.innerText = 'Vídeo não pronto. Tente novamente.';
    return;
  }

  // Desenha no canvas
  fotoCanvas.width = video.videoWidth || 640;
  fotoCanvas.height = video.videoHeight || 480;
  const ctx = fotoCanvas.getContext('2d');
  ctx.drawImage(video, 0, 0, fotoCanvas.width, fotoCanvas.height);

  modalStatus.innerText = 'Enviando foto para processamento...';

  // Para a câmera e fecha modal
  pararCamera();
  cameraModal.style.display = 'none';
  cameraModal.setAttribute('aria-hidden', 'true');

  // Converte canvas em blob para envio
  fotoCanvas.toBlob(async (blob) => {
    if (!blob) {
      modalStatus.innerText = 'Erro ao capturar a foto.';
      return;
    }

    const formData = new FormData();
    formData.append('foto', blob, 'foto.png');

    try {
      const response = await fetch(`${window.location.origin}/processar-foto`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.facesEncontradas === 0) {
        modalStatus.innerText = 'Nenhuma face detectada na foto.';
        return;
      }

      // Salva imagem no sessionStorage para página de resultado
      const dataUrl = fotoCanvas.toDataURL('image/png');
      sessionStorage.setItem('ultimaFoto', dataUrl);

      // Redireciona para a página resultado com emoção e confiança
      const emocao = data.emocao || 'neutral';
      const confianca = data.confianca || 0;
      window.location.href = `resultado.html?emocao=${encodeURIComponent(emocao)}&conf=${encodeURIComponent(confianca)}`;

    } catch (err) {
      modalStatus.innerText = 'Erro ao enviar foto para o servidor.';
      console.error('Erro fetch:', err);
    }
  }, 'image/png');
});

/* =========================
   SCRIPT (corrigido e estável)
   ========================= */

document.addEventListener('DOMContentLoaded', function () {
  // --- Animação de entrada do main ---
  const main = document.getElementById('mainContent');
  if (main) {
    setTimeout(() => main.classList.add('visible'), 100);
  }

  // --- Preencher ano atual no rodapé ---
  const anoEl = document.getElementById('anoAtual');
  if (anoEl) anoEl.textContent = new Date().getFullYear();

  // --- Modo claro/escuro (com persistência local) ---
  const modeToggle = document.getElementById('modeToggle');
  const preferred =
    localStorage.getItem('site-mode') ||
    (window.matchMedia &&
    window.matchMedia('(prefers-color-scheme: light)').matches
      ? 'light'
      : 'dark');

  if (preferred === 'light') document.body.classList.add('light');
  if (modeToggle) modeToggle.checked = document.body.classList.contains('light');

  if (modeToggle) {
    modeToggle.addEventListener('change', function () {
      document.body.classList.toggle('light');
      localStorage.setItem(
        'site-mode',
        document.body.classList.contains('light') ? 'light' : 'dark'
      );
    });
  }

  // --- Scroll suave para âncoras ---
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', function (e) {
      e.preventDefault();
      const id = this.getAttribute('href').slice(1);
      const target = document.getElementById(id);
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
});

// --- Mostrar foco visível ao usar Tab ---
(function () {
  function handleFirstTab(e) {
    if (e.key === 'Tab') {
      document.body.classList.add('user-is-tabbing');
      window.removeEventListener('keydown', handleFirstTab);
    }
  }
  window.addEventListener('keydown', handleFirstTab);
})();
