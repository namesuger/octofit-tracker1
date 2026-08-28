import express from 'express';
const app = express();
const port = 8000;
app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', service: 'octofit-backend' });
});
app.listen(port, () => {
    console.log(`OctoFit backend listening on http://localhost:${port}`);
});
