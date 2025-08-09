// api/deploy.js
const axios = require('axios');

// Função para injetar script condicional no HTML
function injectTikTokScript(htmlContent, customScript) {
    const conditionalScript = `
    <script>
    // Detecta visitantes do TikTok e injeta script personalizado
    (function() {
        function checkTikTokParameter() {
            const urlParams = new URLSearchParams(window.location.search);
            
            // Parâmetros que identificam TikTok (case insensitive)
            const tiktokParams = ['source', 'ref', 'utm_source', 'from'];
            const hasTikTok = tiktokParams.some(param => {
                const value = urlParams.get(param);
                return value && value.toLowerCase().includes('tiktok');
            });

            if (hasTikTok) {
                console.log('🎵 Visitante do TikTok detectado!');
                injectTikTokScript();
                
                // Adiciona classe CSS para identificação
                document.body.classList.add('tiktok-visitor');
                
                // Salva fonte no sessionStorage
                sessionStorage.setItem('traffic_source', 'tiktok');
                sessionStorage.setItem('visit_timestamp', new Date().toISOString());
            }
        }

        function injectTikTokScript() {
            try {
                ${customScript}
            } catch (error) {
                console.error('Erro no script TikTok:', error);
            }
        }

        // Executa quando DOM estiver pronto
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', checkTikTokParameter);
        } else {
            checkTikTokParameter();
        }
    })();
    </script>`;

    // Insere o script antes do fechamento do body, ou no final do HTML se não houver body
    if (htmlContent.includes('</body>')) {
        return htmlContent.replace('</body>', `${conditionalScript}\n</body>`);
    } else {
        return htmlContent + conditionalScript;
    }
}

// Templates de scripts prontos
const scriptTemplates = {
    analytics: `
        // Google Analytics para visitantes do TikTok
        if (typeof gtag !== 'undefined') {
            gtag('event', 'tiktok_visit', {
                'event_category': 'traffic_source',
                'event_label': 'tiktok',
                'custom_parameter_1': 'tiktok_campaign'
            });
            
            gtag('config', 'GA_MEASUREMENT_ID', {
                'custom_map': {'custom_parameter_1': 'traffic_source'}
            });
        }
        
        // Fallback: criar evento personalizado
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
            'event': 'tiktok_visitor',
            'traffic_source': 'tiktok',
            'timestamp': new Date().toISOString()
        });
    `,
    facebook: `
        // Facebook Pixel para visitantes do TikTok
        if (typeof fbq !== 'undefined') {
            fbq('track', 'ViewContent', {
                content_type: 'landing_page',
                source: 'tiktok'
            });
            
            fbq('trackCustom', 'TikTokTraffic', {
                source: 'tiktok',
                timestamp: Date.now()
            });
        }
        
        // Pixel alternativo se fbq não estiver disponível
        if (typeof fbq === 'undefined') {
            console.log('Facebook Pixel não encontrado, salvando dados localmente');
            localStorage.setItem('fb_tiktok_event', JSON.stringify({
                event: 'ViewContent',
                source: 'tiktok',
                timestamp: Date.now()
            }));
        }
    `,
    popup: `
        // Popup especial para visitantes do TikTok
        setTimeout(function() {
            const modal = document.createElement('div');
            modal.style.cssText = \`
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.8);
                z-index: 99999;
                display: flex;
                justify-content: center;
                align-items: center;
                animation: fadeIn 0.3s ease;
            \`;
            
            modal.innerHTML = \`
                <div style="
                    background: linear-gradient(135deg, #ff0050, #ff4081);
                    color: white;
                    padding: 30px;
                    border-radius: 20px;
                    text-align: center;
                    max-width: 400px;
                    animation: slideIn 0.5s ease;
                    box-shadow: 0 20px 40px rgba(0,0,0,0.3);
                ">
                    <h2 style="margin: 0 0 15px 0; font-size: 24px;">🎵 Oferta TikTok!</h2>
                    <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.4;">
                        Você veio do TikTok e tem <strong>25% OFF</strong>!<br>
                        Oferta exclusiva válida por 24h.
                    </p>
                    <button onclick="this.closest('div').remove()" style="
                        background: white;
                        color: #ff0050;
                        border: none;
                        padding: 15px 30px;
                        border-radius: 25px;
                        cursor: pointer;
                        font-weight: bold;
                        font-size: 16px;
                        transition: transform 0.2s;
                    " onmouseover="this.style.transform='scale(1.05)'" 
                       onmouseout="this.style.transform='scale(1)'">
                        Aproveitar Oferta!
                    </button>
                </div>
            \`;
            
            // Adiciona animações CSS
            const style = document.createElement('style');
            style.textContent = \`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes slideIn {
                    from { transform: scale(0.8); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
            \`;
            document.head.appendChild(style);
            
            document.body.appendChild(modal);
            
            // Remove popup ao clicar fora
            modal.addEventListener('click', function(e) {
                if (e.target === modal) {
                    modal.remove();
                }
            });
            
            // Remove automaticamente após 10 segundos
            setTimeout(() => {
                if (modal.parentNode) {
                    modal.remove();
                }
            }, 10000);
            
        }, 2000); // Mostra após 2 segundos
        
        // Adiciona estilos especiais para visitantes do TikTok
        const tiktokStyles = document.createElement('style');
        tiktokStyles.textContent = \`
            .tiktok-visitor button,
            .tiktok-visitor .btn,
            .tiktok-visitor input[type="submit"] {
                animation: tiktokPulse 2s infinite;
            }
            @keyframes tiktokPulse {
                0% { box-shadow: 0 0 0 0 rgba(255, 0, 80, 0.7); }
                70% { box-shadow: 0 0 0 10px rgba(255, 0, 80, 0); }
                100% { box-shadow: 0 0 0 0 rgba(255, 0, 80, 0); }
            }
        \`;
        document.head.appendChild(tiktokStyles);
    `
};

// Templates de sites prontos
const siteTemplates = {
    landing: {
        'index.html': `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Oferta Especial - Landing Page</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: 'Arial', sans-serif; 
            line-height: 1.6; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            color: #333;
        }
        .container { 
            max-width: 800px; 
            margin: 0 auto; 
            padding: 20px; 
            text-align: center; 
        }
        .hero {
            background: white;
            border-radius: 20px;
            padding: 40px;
            margin: 20px 0;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
        }
        h1 { 
            font-size: 2.5rem; 
            margin-bottom: 20px; 
            color: #333;
        }
        .subtitle { 
            font-size: 1.2rem; 
            margin-bottom: 30px; 
            color: #666; 
        }
        .cta-button {
            background: linear-gradient(135deg, #ff6b6b, #ee5a24);
            color: white;
            padding: 20px 40px;
            font-size: 1.2rem;
            border: none;
            border-radius: 50px;
            cursor: pointer;
            transition: all 0.3s ease;
            text-decoration: none;
            display: inline-block;
            margin: 20px 0;
        }
        .cta-button:hover {
            transform: translateY(-3px);
            box-shadow: 0 10px 25px rgba(0,0,0,0.2);
        }
        .features {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin: 40px 0;
        }
        .feature {
            background: rgba(255,255,255,0.9);
            padding: 20px;
            border-radius: 15px;
            backdrop-filter: blur(10px);
        }
        .feature h3 { color: #667eea; margin-bottom: 10px; }
        @media (max-width: 768px) {
            .hero { padding: 20px; }
            h1 { font-size: 2rem; }
            .cta-button { padding: 15px 30px; font-size: 1rem; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="hero">
            <h1>🚀 Oferta Imperdível!</h1>
            <p class="subtitle">Descubra o produto que vai transformar sua vida</p>
            
            <div class="features">
                <div class="feature">
                    <h3>✨ Qualidade Premium</h3>
                    <p>O melhor que você pode encontrar</p>
                </div>
                <div class="feature">
                    <h3>⚡ Resultados Rápidos</h3>
                    <p>Veja mudanças em poucos dias</p>
                </div>
                <div class="feature">
                    <h3>💰 Preço Especial</h3>
                    <p>Desconto exclusivo por tempo limitado</p>
                </div>
            </div>
            
            <a href="#comprar" class="cta-button">
                Aproveitar Oferta Agora!
            </a>
            
            <p style="margin-top: 20px; color: #999; font-size: 0.9rem;">
                ⏰ Oferta válida por tempo limitado
            </p>
        </div>
    </div>
</body>
</html>`
    },
    
    ecommerce: {
        'index.html': `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Loja Online - Produtos Exclusivos</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: 'Arial', sans-serif; 
            line-height: 1.6; 
            background: #f8f9fa;
            color: #333;
        }
        .header {
            background: white;
            padding: 1rem 0;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            position: sticky;
            top: 0;
            z-index: 100;
        }
        .nav {
            max-width: 1200px;
            margin: 0 auto;
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0 20px;
        }
        .logo { font-size: 1.5rem; font-weight: bold; color: #667eea; }
        .hero {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-align: center;
            padding: 80px 20px;
        }
        .hero h1 { font-size: 3rem; margin-bottom: 1rem; }
        .hero p { font-size: 1.2rem; margin-bottom: 2rem; }
        .products {
            max-width: 1200px;
            margin: 60px auto;
            padding: 0 20px;
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 30px;
        }
        .product {
            background: white;
            border-radius: 15px;
            overflow: hidden;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            transition: transform 0.3s ease;
        }
        .product:hover { transform: translateY(-10px); }
        .product-image {
            height: 200px;
            background: linear-gradient(45deg, #ff6b6b, #feca57);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 3rem;
        }
        .product-info {
            padding: 20px;
        }
        .product-title {
            font-size: 1.3rem;
            margin-bottom: 10px;
            color: #333;
        }
        .product-price {
            font-size: 1.5rem;
            color: #667eea;
            font-weight: bold;
            margin-bottom: 15px;
        }
        .old-price {
            text-decoration: line-through;
            color: #999;
            font-size: 1rem;
            margin-right: 10px;
        }
        .buy-button {
            width: 100%;
            background: #28a745;
            color: white;
            padding: 15px;
            border: none;
            border-radius: 8px;
            font-size: 1.1rem;
            cursor: pointer;
            transition: background 0.3s ease;
        }
        .buy-button:hover { background: #218838; }
        @media (max-width: 768px) {
            .hero h1 { font-size: 2rem; }
            .products { grid-template-columns: 1fr; }
        }
    </style>
</head>
<body>
    <header class="header">
        <nav class="nav">
            <div class="logo">🛒 Minha Loja</div>
            <div>Contato: (11) 99999-9999</div>
        </nav>
    </header>

    <section class="hero">
        <h1>Produtos Exclusivos</h1>
        <p>Encontre os melhores produtos com preços especiais</p>
    </section>

    <section class="products">
        <div class="product">
            <div class="product-image">📱</div>
            <div class="product-info">
                <h3 class="product-title">Smartphone Premium</h3>
                <div class="product-price">
                    <span class="old-price">R$ 1.999</span>
                    R$ 1.299
                </div>
                <button class="buy-button">Comprar Agora</button>
            </div>
        </div>

        <div class="product">
            <div class="product-image">💻</div>
            <div class="product-info">
                <h3 class="product-title">Notebook Gamer</h3>
                <div class="product-price">
                    <span class="old-price">R$ 3.999</span>
                    R$ 2.799
                </div>
                <button class="buy-button">Comprar Agora</button>
            </div>
        </div>

        <div class="product">
            <div class="product-image">⌚</div>
            <div class="product-info">
                <h3 class="product-title">Smartwatch Pro</h3>
                <div class="product-price">
                    <span class="old-price">R$ 899</span>
                    R$ 599
                </div>
                <button class="buy-button">Comprar Agora</button>
            </div>
        </div>
    </section>
</body>
</html>`
    }
};

module.exports = async (req, res) => {
    // Headers CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { 
            vercelToken, 
            projectName, 
            files = [], 
            teamId, 
            scriptTemplate = 'analytics',
            customScript = '',
            siteTemplate = null
        } = req.body;

        if (!vercelToken) {
            return res.status(400).json({ error: 'vercelToken é obrigatório' });
        }

        if (!projectName) {
            return res.status(400).json({ error: 'projectName é obrigatório' });
        }

        // Determina os arquivos a serem deployados
        let deployFiles = [];

        if (siteTemplate && siteTemplates[siteTemplate]) {
            // Usa template predefinido
            const template = siteTemplates[siteTemplate];
            deployFiles = Object.entries(template).map(([filename, content]) => ({
                file: filename,
                data: content
            }));
        } else if (files && files.length > 0) {
            // Usa arquivos enviados pelo usuário
            deployFiles = files.map(file => ({
                file: file.name,
                data: file.content
            }));
        } else {
            // Usa template padrão se nenhum arquivo foi enviado
            const template = siteTemplates.landing;
            deployFiles = Object.entries(template).map(([filename, content]) => ({
                file: filename,
                data: content
            }));
        }

        // Prepara o script a ser injetado
        let scriptToInject = '';
        if (scriptTemplate === 'custom' && customScript) {
            scriptToInject = customScript;
        } else if (scriptTemplates[scriptTemplate]) {
            scriptToInject = scriptTemplates[scriptTemplate];
        } else {
            scriptToInject = scriptTemplates.analytics; // fallback
        }

        // Injeta o script condicional no HTML
        deployFiles = deployFiles.map(file => {
            if (file.file.endsWith('.html')) {
                return {
                    ...file,
                    data: injectTikTokScript(file.data, scriptToInject)
                };
            }
            return file;
        });

        // Prepara dados para deploy na Vercel
        const deployData = {
            name: projectName,
            files: deployFiles,
            projectSettings: {
                framework: null,
                devCommand: null,
                buildCommand: null,
                outputDirectory: null
            }
        };

        if (teamId) {
            deployData.teamId = teamId;
        }

        console.log('Enviando deploy para Vercel:', { projectName, filesCount: deployFiles.length });

        // Faz o deploy na Vercel
        const response = await axios.post(
            'https://api.vercel.com/v13/deployments',
            deployData,
            {
                headers: {
                    'Authorization': `Bearer ${vercelToken}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        const result = {
            success: true,
            url: `https://${response.data.url}`,
            deploymentId: response.data.id,
            projectName: projectName,
            createdAt: new Date().toISOString(),
            scriptTemplate: scriptTemplate,
            testUrls: {
                normal: `https://${response.data.url}`,
                tiktok: `https://${response.data.url}?source=tiktok`,
                tiktokRef: `https://${response.data.url}?ref=tiktok`,
                tiktokUtm: `https://${response.data.url}?utm_source=tiktok`
            }
        };

        console.log('Deploy realizado com sucesso:', result);

        res.status(200).json(result);

    } catch (error) {
        console.error('Erro no deploy:', error.response?.data || error.message);
        
        const errorMessage = error.response?.data?.error?.message || error.message;
        const errorCode = error.response?.data?.error?.code || 'DEPLOY_ERROR';

        res.status(500).json({
            success: false,
            error: errorMessage,
            code: errorCode,
            details: error.response?.data || null
        });
    }
};
