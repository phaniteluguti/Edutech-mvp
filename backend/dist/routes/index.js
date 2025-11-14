"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const health_1 = __importDefault(require("./health"));
const previousYearQuestions_1 = __importDefault(require("./previousYearQuestions"));
const router = (0, express_1.Router)();
// Health check
router.use('/health', health_1.default);
// API v1 routes
router.use('/api/v1/previous-year-questions', previousYearQuestions_1.default);
exports.default = router;
//# sourceMappingURL=index.js.map