let stepHistory = [];

// Função para avançar normal (Passo + 1)
// 1. Lógica de Navegação com Verificação
function nextStep() {
    const currentStep = document.querySelector('.step.active');
    const stepNum = parseInt(currentStep.dataset.step);
    
    // 1. Verificação de Opções (Inputs Hidden para botões)
    const hiddenInput = currentStep.querySelector('input[type="hidden"]');
    if (hiddenInput && hiddenInput.value.trim() === "") {
        Swal.fire({
            title: "Você não selecionou uma opção",
            text: "Para continuar, selecione uma opção!",
            icon: "warning",
            confirmButtonText: "OK"
        });
        return;
    }

    // 2. Verificação de Inputs de Texto
    const textInput = currentStep.querySelector('input[type="text"]');
    
    if (textInput && textInput.hasAttribute('required')) {
        const value = textInput.value.trim();

        // Validação Geral: Não pode estar vazio
        if (value === "") {
            Swal.fire({
                title: "Você não selecionou uma opção",
                text: "Para continuar, selecione uma opção!",
                icon: "warning"
            });
            textInput.focus();
            return;
        }

        // --- VALIDAÇÃO ESPECÍFICA DO PASSO 7 (Hospitais) ---
        if (stepNum === 7) {
            // Regex que verifica se o campo contém pelo menos uma letra
            // Se test() retornar false, significa que só existem números ou símbolos
            const regexContemLetras = /[a-zA-Z]/;
            
            if (!regexContemLetras.test(value)) {
                Swal.fire({
                    title: "Você informou apenas números",
                    text: "Coloque o nome do hospital corretamente!",
                    icon: "warning"
                });
                textInput.focus();
                return;
            }
        }
    }

    if (stepNum === 3) {
        const inputOculto = document.getElementById('plano_atual');
        const inputOutroNome = document.getElementById('outro_plano_nome');
        
        if (inputOculto.value === 'OUTRO') {
            if (inputOutroNome.value.trim() === "") {
                Swal.fire({ title: "Ops!", text: "Digite o nome do seu plano.", icon: "warning" });
                inputOutroNome.focus();
                return;
            }
            // ESSA LINHA É ESSENCIAL: Transfere o texto digitado para o campo que vai para a planilha
            inputOculto.value = "OUTRO: " + inputOutroNome.value;
        }
    }

    // Se passou em tudo, salva no histórico e avança
    stepHistory.push(stepNum);
    jumpToStep(stepNum + 1);
}

// Função para voltar usando o histórico real
function prevStep() {
    if (stepHistory.length > 0) {
        const lastStep = stepHistory.pop();
        const currentStep = document.querySelector('.step.active');
        const prevStepEl = document.querySelector(`.step[data-step="${lastStep}"]`);

        currentStep.classList.remove('active');
        prevStepEl.classList.add('active');
    }
}

// Auxiliar para pular telas
function jumpToStep(target) {
    const currentStep = document.querySelector('.step.active');
    const targetStep = document.querySelector(`.step[data-step="${target}"]`);

    if (targetStep) {
        currentStep.classList.remove('active');
        targetStep.classList.add('active');
    }
}

// Seleciona valor e vai para o próximo passo (+1)
function selectAndNext(inputId, value) {
    document.getElementById(inputId).value = value;
    nextStep();
}

// Seleciona valor e pula para um passo específico (Lógica da Pergunta 2)
function selectAndJump(inputId, value, target) {
    document.getElementById(inputId).value = value;
    const currentStep = document.querySelector('.step.active');
    stepHistory.push(parseInt(currentStep.dataset.step));
    jumpToStep(target);
}

function selectPlano(valor) {
    const inputOculto = document.getElementById('plano_atual');
    const campoExtra = document.getElementById('extra-plano');
    const inputOutroNome = document.getElementById('outro_plano_nome');
    const btnNext = document.getElementById('btn-next-plano');

    inputOculto.value = valor;

    if (valor === 'OUTRO') {
        campoExtra.style.display = 'block';
        btnNext.style.display = 'block';
        inputOutroNome.focus();
    }
    else {
        campoExtra.style.display = 'none';
        btnNext.style.display = 'none';
        inputOutroNome.value = '';
        const currentStep = document.querySelector('.step.active');
        stepHistory.push(parseInt(currentStep.dataset.step));
        jumpToStep(4);
    }
}

document.getElementById("form").addEventListener("submit", function(e) {
    e.preventDefault();

    const phoneInput = document.getElementById('phonenumber');
    const phoneValue = phoneInput.value.replace(/\D/g, "");
    const phoneRegex = /^[1-9]{2}9?[0-9]{8}$/;

    if (!phoneRegex.test(phoneValue)) {
        e.preventDefault();
        Swal.fire({
            title: "Número Inválido",
            text: "Por favor, insira um número de telefone válido com DDD (ex: 11 99999-9999)",
            icon: "warning",
            confirmButtonText: "Corrigir"
        });
        phoneInput.focus();
        return;
    }

    const btn = this.querySelector('button[type="submit"]');
    const originalText = btn.innerText;
    
    btn.innerText = "Enviando...";
    btn.disabled = true;

    const formData = new FormData(this);
    const data = Object.fromEntries(formData.entries());

    fetch("https://script.google.com/macros/s/AKfycbznVxamzwc1PkwoDPayXQuAbvFArVDNJ5jXPKsEZeYTFM8fzSfFA58aWmOa5pExXbhK1g/exec", {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    })
    .then(() => {
        fetch("https://api.web3forms.com/submit", {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify({
                access_key: "8cfc61ff-fb2b-4a53-9c0b-4b72b77694a9",
                subject: "Nova Cotação: " + (data.name || "Lead Site"),
                from_name: "Simulador de Planos",
                ...data
            })
        });
        Swal.fire({
            title: "Resposta enviada!",
            text: "Deseja atendimento exclusivo via whatsapp ?",
            icon: "success",
            allowOutsideClick: false,
            allowEscapeKey: false,
            confirmButtonText: "Ir para o Whatsapp",
            confirmButtonColor: '#25D366'
        }).then((result) => {
            if(result.isConfirmed){
                // Link corrigido com 55 e encode
                window.location.href = 'https://wa.me/5511937269362?text=' + encodeURIComponent('Preenchi minhas informações e gostaria de uma cotação personalizada do meu plano de saúde.');
            }
        });
    })
    .catch((error) => {
        console.error("Erro no envio:", error);
        Swal.fire({
            title: "Cadastro não realizado!",
            text: "Por gentileza, entre em contato com o suporte",
            icon: "error",
            allowOutsideClick: false,
            allowEscapeKey: false,
            confirmButtonText: "Falar com o suporte",
            confirmButtonColor: '#25D366'
        }).then((result) => {
            if(result.isConfirmed){
                window.location.href = 'https://wa.me/5511937269362?text=' + encodeURIComponent('Não consegui concluir o cadastro no site.');
            }
        });
        
        btn.innerText = originalText;
        btn.disabled = false;
    });
});

document.getElementById('phonenumber').addEventListener('input', (e) => {
    let v = e.target.value.replace(/\D/g, "");
    if (v.length > 0) v = "(" + v;
    if (v.length > 3) v = v.slice(0, 3) + ") " + v.slice(3);
    if (v.length > 10) v = v.slice(0, 10) + "-" + v.slice(10);
    e.target.value = v.slice(0, 15);
});