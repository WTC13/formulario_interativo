// 1. Lógica de Navegação (Passo a Passo)
function nextStep() {
    const currentStep = document.querySelector('.step.active');
    const input = currentStep.querySelector('input');

    // Validação simples: impede avançar vazio
    if (input && input.hasAttribute('required') && input.value.trim() === "") {
        input.focus();
        // Você pode trocar este alert por um efeito visual se preferir
        alert("Por favor, preencha este campo antes de continuar.");
        return;
    }

    const nextStepNum = parseInt(currentStep.dataset.step) + 1;
    const nextStepEl = document.querySelector(`.step[data-step="${nextStepNum}"]`);

    if (nextStepEl) {
        currentStep.classList.remove('active');
        nextStepEl.classList.add('active');
        
        // Foca no próximo input automaticamente para melhorar a UX
        const nextInput = nextStepEl.querySelector('input');
        if (nextInput) nextInput.focus();
    }
}

// Atalho: Avançar ao apertar "Enter"
document.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        const activeStep = document.querySelector('.step.active');
        const isLastStep = activeStep.dataset.step === "6"; // Ajuste conforme o número total de passos

        if (!isLastStep) {
            e.preventDefault(); // Não deixa o form enviar antes da hora
            nextStep();
        }
    }
});

// 2. Lógica de Envio (Integração com Google Sheets)
document.getElementById("form").addEventListener("submit", function(e) {
    e.preventDefault();

    // Feedback visual de carregamento
    const btn = this.querySelector('button[type="submit"]');
    const originalText = btn.innerHTML;
    btn.innerText = "Enviando...";
    btn.disabled = true;

    const formData = new FormData(this);
    const data = Object.fromEntries(formData.entries());

    // URL do seu Google Apps Script
    const url = "https://script.google.com/macros/s/AKfycbxFjOPU5nNZPhW9QOKCF429X1SHMToP2Sle4UV9SRekPCv8GKTsq6Err5D2Vl1gXT70YA/exec";

    fetch(url, {
        method: "POST",
        mode: "no-cors", 
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    })
    .then(() => {
        // Sucesso
        document.querySelector('.step.active').classList.remove('active');
        // Se você tiver uma div de sucesso, pode mostrar aqui
        alert("Cadastro realizado com sucesso!");
        this.reset();
        window.location.reload(); // Recarrega para voltar ao início
    })
    .catch((error) => {
        console.error("Erro detalhado:", error);
        alert("Erro ao enviar. Tente novamente.");
        btn.innerHTML = originalText;
        btn.disabled = false;
    });
});