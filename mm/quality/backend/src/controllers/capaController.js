// backend/src/controllers/capaController.js
import { CAPA } from "../models/capaModel.js";

export const listCAPA = async (req, res, next) => {
  try {
    const { status } = req.query;
    const rows = await CAPA.list({ status });
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

export const createCAPA = async (req, res, next) => {
  try {
    const id = await CAPA.create(req.body);
    res.status(201).json({ id });
  } catch (err) {
    next(err);
  }
};

export const updateCAPAStatus = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const { status } = req.body;
    await CAPA.updateStatus(id, status);
    res.json({ id, status });
  } catch (err) {
    next(err);
  }
};
