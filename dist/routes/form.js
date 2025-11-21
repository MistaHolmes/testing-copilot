"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const formController_1 = require("../controllers/formController");
const router = (0, express_1.Router)();
// POST /forms -> create a new form entry
router.post('/', formController_1.createForm);
exports.default = router;
