const express = require('express');
const router = express.Router();

router.get('/requisicoes', async (req, res) => {
    try {
        // Primeiro verifica se a tabela existe
        const checkTableQuery = `
            SELECT COUNT(*) as exists_flag
            FROM information_schema.tables 
            WHERE table_schema = 'estoque' 
            AND table_name = 'requisicoes'
        `;

        const [tableCheck] = await new Promise((resolve, reject) => {
            req.db.query(checkTableQuery, (err, results) => {
                if (err) return reject(err);
                resolve(results);
            });
        });

        if (tableCheck.exists_flag === 0) {
            return res.status(404).json({
                success: false,
                error: 'Tabela requisicoes não encontrada'
            });
        }

        // Consulta os dados
        const query = `
            SELECT 
                mes,
                COUNT(*) as total_requisicoes
            FROM 
                requisicoes
            GROUP BY 
                mes
            ORDER BY 
                CASE mes
                    WHEN 'Janeiro' THEN 1
                    WHEN 'Fevereiro' THEN 2
                    WHEN 'Março' THEN 3
                    WHEN 'Abril' THEN 4
                    WHEN 'Maio' THEN 5
                    WHEN 'Junho' THEN 6
                    WHEN 'Julho' THEN 7
                    WHEN 'Agosto' THEN 8
                    WHEN 'Setembro' THEN 9
                    WHEN 'Outubro' THEN 10
                    WHEN 'Novembro' THEN 11
                    WHEN 'Dezembro' THEN 12
                END
        `;

        const [results] = await new Promise((resolve, reject) => {
            req.db.query(query, (err, results) => {
                if (err) return reject(err);
                resolve(results);
            });
        });

        if (!results || results.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Nenhum dado encontrado'
            });
        }

        res.json({
            success: true,
            data: results
        });

    } catch (error) {
        console.error('Erro em /api/requisicoes:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno no servidor',
            details: error.message
        });
    }
});

module.exports = router;