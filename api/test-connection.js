// api/test-connection.js
const axios = require('axios');

module.exports = async (req, res) => {
    // Configurar CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método não permitido. Use POST.' });
    }

    try {
        const { vercelToken, teamId } = req.body;

        if (!vercelToken) {
            return res.status(400).json({ 
                success: false, 
                error: 'Token da Vercel é obrigatório' 
            });
        }

        // Testa conexão com a API da Vercel
        console.log('Testando conexão com Vercel API...');
        
        const response = await axios.get('https://api.vercel.com/v2/user', {
            headers: {
                'Authorization': `Bearer ${vercelToken}`
            },
            timeout: 10000 // 10 segundos timeout
        });

        const userData = response.data.user;

        // Se chegou aqui, a conexão foi bem-sucedida
        const result = {
            success: true,
            message: 'Conexão bem-sucedida!',
            user: {
                id: userData.id,
                name: userData.name,
                username: userData.username,
                email: userData.email,
                avatar: userData.avatar,
                createdAt: userData.createdAt
            },
            timestamp: new Date().toISOString()
        };

        // Se tem teamId, testa também
        if (teamId) {
            try {
                const teamResponse = await axios.get(`https://api.vercel.com/v2/teams/${teamId}`, {
                    headers: {
                        'Authorization': `Bearer ${vercelToken}`
                    },
                    timeout: 5000
                });

                result.team = {
                    id: teamResponse.data.id,
                    name: teamResponse.data.name,
                    slug: teamResponse.data.slug
                };
            } catch (teamError) {
                result.teamWarning = 'Team ID fornecido, mas não foi possível acessá-lo. Verifique se está correto.';
            }
        }

        console.log('Conexão testada com sucesso:', userData.username);
        
        res.status(200).json(result);

    } catch (error) {
        console.error('Erro ao testar conexão:', error.message);

        let errorMessage = 'Erro desconhecido';
        let errorDetails = null;

        if (error.response) {
            // Erro da API da Vercel
            const status = error.response.status;
            const data = error.response.data;

            switch (status) {
                case 401:
                    errorMessage = 'Token inválido ou expirado. Verifique seu token da Vercel.';
                    break;
                case 403:
                    errorMessage = 'Acesso negado. Verifique as permissões do seu token.';
                    break;
                case 429:
                    errorMessage = 'Muitas solicitações. Aguarde alguns minutos e tente novamente.';
                    break;
                case 500:
                    errorMessage = 'Erro interno da Vercel. Tente novamente mais tarde.';
                    break;
                default:
                    errorMessage = data?.error?.message || `Erro HTTP ${status}`;
            }

            errorDetails = {
                status: status,
                code: data?.error?.code,
                message: data?.error?.message
            };

        } else if (error.request) {
            // Erro de rede
            errorMessage = 'Erro de conexão. Verifique sua internet e tente novamente.';
        } else {
            // Erro na configuração da request
            errorMessage = error.message;
        }

        res.status(400).json({
            success: false,
            error: errorMessage,
            details: errorDetails,
            timestamp: new Date().toISOString()
        });
    }
};
