"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const formController_1 = require("../controllers/formController");
const router = (0, express_1.Router)();
// GET /forms -> list form entries (including coordinates)
router.get('/', formController_1.getForms);
// GET /forms/getLocation -> list only entries that have coordinates
router.get('/getLocation', formController_1.getLocation);
// POST /forms -> create a new form entry
router.post('/', formController_1.createForm);
exports.default = router;
