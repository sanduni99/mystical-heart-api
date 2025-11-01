import express from 'express';

const router = express.Router();


router.get('/', async (req, res) => {
    try {
        const { base64 = 'no', out = 'json' } = req.query;

        const apiUrl = `http://marcconrad.com/uob/heart/api.php?out=${out}&base64=${base64}`;
        
        const response = await fetch(apiUrl);
        
        if (out === 'csv') {
            const csvData = await response.text();
            const [question, solution] = csvData.split(',');
            res.json({
                question: question.trim(),
                solution: parseInt(solution.trim()),
                type: 'heart',
                format: 'csv'
            });
        } else {

            const data = await response.json();
            
            res.json({
                question: data.question,
                solution: data.solution,
                type: 'heart',
                format: 'json',
                isBase64: base64 === 'yes'
            });
        }

    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: 'Error fetching heart puzzle',
            error: error.message 
        });
    }
});

export default router;
