"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const morgan_1 = __importDefault(require("morgan"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use((0, morgan_1.default)('common'));
// Will have to figure out how we will work with env variables in deployment.
const PORT = process.env.PORT || 3000;
app.get('/api/server/testmsg', (req, res) => {
    res.json({ data: `Hello! This information came from the back-end! Don't believe me? Search the source folder and I guarantee you won't be able to find this message in there!!!!!` });
});
app.get('*', (req, res) => {
    console.log('we hit an error!');
    res.sendStatus(404);
});
app.listen(PORT, () => { console.log('[server compiled]: Running on port ', PORT, ` at http://localhost:${PORT}/`); });
