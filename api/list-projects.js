// api/list-projects.js
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
        const { vercelToken, teamId, limit = 20 } = req.body;

        if (!vercelToken) {
            return res.status(400).json({ 
                success: false, 
                error: 'Token da Vercel é obrigatório' 
            });
        }

        // Monta URL da API
        let apiUrl = `https://api.vercel.com/v9/projects?limit=${limit}`;
        if (teamId) {
            apiUrl += `&teamId=${teamId}`;
        }

        console.log('Listando projetos da Vercel...');

        // Busca projetos na Vercel
        const response = await axios.get(apiUrl, {
            headers: {
                'Authorization': `Bearer ${vercelToken}`
            },
            timeout: 15000 // 15 segundos timeout
        });

        const projectsData = response.data.projects || [];

        // Processa e formata os dados dos projetos
        const projects = projectsData.map(project => {
            const latestDeployment = project.latestDeployments?.[0];
            
            return {
                id: project.id,
                name: project.name,
                createdAt: project.createdAt,
                updatedAt: project.updatedAt,
                framework: project.framework,
                
                // URLs do projeto
                urls: {
                    production: `https://${project.name}.vercel.app`,
                    tiktokTest: `https://${project.name}.vercel.app?source=tiktok`
                },
                
                // Informações do último deploy
                latestDeployment: latestDeployment ? {
                    uid: latestDeployment.uid,
                    url: `https://${latestDeployment.url}`,
                    state: latestDeployment.state,
                    createdAt: latestDeployment.createdAt,
                    ready: latestDeployment.ready
                } : null,
                
                // Configurações do projeto
                settings: {
                    buildCommand: project.buildCommand,
                    devCommand: project.devCommand,
                    framework: project.framework,
                    nodeVersion: project.nodeVersion
                },
                
                // Estatísticas
                stats: {
                    totalDeployments: project.latestDeployments?.length || 0,
                    isPublic: project.publicSource || false
                }
            };
        });

        // Ordena por data de atualização (mais recentes primeiro)
        projects.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

        const result = {
            success: true,
            projects: projects,
            pagination: {
                total: projects.length,
                limit: limit,
                hasMore: projectsData.length === limit
            },
            timestamp: new Date().toISOString()
        };

        console.log(`Listados ${projects.length} projetos com sucesso`);

        res.status(200).json(result);

    } catch (error) {
        console.error('Erro ao listar projetos:', error.message);

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
                    errorMessage = 'Acesso negado. Verifique as permissões do seu token ou Team ID.';
                    break;
                case 404:
                    errorMessage = 'Team não encontrado. Verifique o Team ID.';
                    break;
                case 429:
                    errorMessage = 'Muitas solicitações. Aguarde alguns minutos e tente novamente.';
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
            projects: [], // Array vazio em caso de erro
            timestamp: new Date().toISOString()
        });
    }
};
