"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const zod_1 = require("zod");
const config_1 = __importDefault(require("../config"));
const handleValidationError_1 = __importDefault(require("../errors/handleValidationError"));
const handleCastError_1 = __importDefault(require("../errors/handleCastError"));
const handleDuplicateError_1 = __importDefault(require("../errors/handleDuplicateError"));
const appError_1 = __importDefault(require("../errors/appError"));
const handleZodValidationError_1 = __importDefault(require("../errors/handleZodValidationError"));
// eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
const globalErrorHandler = (err, req, res, next) => {
    let statusCode = 500;
    let message = 'Something went wrong!';
    let errorSources = [
        {
            path: '',
            message: 'Something went wrong',
        },
    ];
    // Zod Error Handling
    if (err instanceof zod_1.ZodError) {
        const extractedError = (0, handleZodValidationError_1.default)(err);
        statusCode = extractedError === null || extractedError === void 0 ? void 0 : extractedError.statusCode;
        message = extractedError === null || extractedError === void 0 ? void 0 : extractedError.message;
        errorSources = extractedError === null || extractedError === void 0 ? void 0 : extractedError.errorSources;
    }
    // Mongoose Validation Error Handling
    else if ((err === null || err === void 0 ? void 0 : err.name) === 'ValidationError') {
        const extractedError = (0, handleValidationError_1.default)(err);
        statusCode = extractedError === null || extractedError === void 0 ? void 0 : extractedError.statusCode;
        message = extractedError === null || extractedError === void 0 ? void 0 : extractedError.message;
        errorSources = extractedError === null || extractedError === void 0 ? void 0 : extractedError.errorSources;
    }
    // non existing id validation
    else if ((err === null || err === void 0 ? void 0 : err.name) === 'CastError') {
        const extractedError = (0, handleCastError_1.default)(err);
        statusCode = extractedError === null || extractedError === void 0 ? void 0 : extractedError.statusCode;
        message = extractedError === null || extractedError === void 0 ? void 0 : extractedError.message;
        errorSources = extractedError === null || extractedError === void 0 ? void 0 : extractedError.errorSources;
    }
    // duplicate data creation validation
    else if ((err === null || err === void 0 ? void 0 : err.code) === 11000) {
        const extractedError = (0, handleDuplicateError_1.default)(err);
        statusCode = extractedError === null || extractedError === void 0 ? void 0 : extractedError.statusCode;
        message = extractedError === null || extractedError === void 0 ? void 0 : extractedError.message;
        errorSources = extractedError === null || extractedError === void 0 ? void 0 : extractedError.errorSources;
    }
    // throw new AppError validation
    else if (err instanceof appError_1.default) {
        statusCode = err === null || err === void 0 ? void 0 : err.statusCode;
        message = err === null || err === void 0 ? void 0 : err.message;
        errorSources = [
            {
                path: '',
                message: err === null || err === void 0 ? void 0 : err.message,
            },
        ];
    }
    return res.status(statusCode).json({
        success: false,
        message,
        errorSources,
        stack: config_1.default.NODE_ENV === 'development' ? err.stack : null,
    });
};
exports.default = globalErrorHandler;
