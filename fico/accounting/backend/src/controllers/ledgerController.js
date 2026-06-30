// backend/src/controllers/ledgerController.js
const db = require('../models');
const {
  JournalHeader,
  JournalLine,
  PostingKey,
} = db;

// utility to generate simple doc number (you can replace with your generator)
async function generateDocumentNumber(documentType) {
  const count = await JournalHeader.count();
  const seq = (count + 1).toString().padStart(5, '0');
  return `${documentType}-${seq}`;
}

// POST /api/journals
// body: { header: {...}, lines: [{...}] }
exports.createJournal = async (req, res) => {
  const t = await db.sequelize.transaction();
  try {
    const { header, lines, hold } = req.body;

    if (!header || !Array.isArray(lines) || lines.length < 2) {
      return res.status(400).json({ message: 'Header and at least 2 lines required' });
    }

    // basic double-entry check
    let totalDebit = 0;
    let totalCredit = 0;
    for (const l of lines) {
      if (l.debitCredit === 'D') totalDebit += Number(l.amount || 0);
      if (l.debitCredit === 'C') totalCredit += Number(l.amount || 0);
    }
    if (!hold && totalDebit.toFixed(2) !== totalCredit.toFixed(2)) {
      return res.status(400).json({ message: 'Debits and credits must balance' });
    }

    const documentType = header.documentType || 'SA';
    const documentNumber =
      header.documentNumber || (await generateDocumentNumber(documentType));

    const status = hold ? 'HELD' : 'POSTED';

    const headerCreated = await JournalHeader.create(
      {
        documentNumber,
        documentType,
        documentDate: header.documentDate,
        postingDate: header.postingDate,
        companyCode: header.companyCode,
        currency: header.currency || 'INR',
        reference: header.reference,
        headerText: header.headerText,
        crossCCNo: header.crossCCNo,
        status,
      },
      { transaction: t }
    );

    let lineNo = 10;
    for (const l of lines) {
      // optional: validate posting key
      const pk = await PostingKey.findOne({
        where: { code: l.postingKey },
        transaction: t,
      });
      if (!pk) {
        await t.rollback();
        return res.status(400).json({ message: `Invalid posting key ${l.postingKey}` });
      }

      await JournalLine.create(
        {
          headerId: headerCreated.id,
          lineNo: lineNo,
          postingKey: l.postingKey,
          accountType: l.accountType,
          accountId: l.accountId,
          amount: l.amount,
          debitCredit: l.debitCredit,
          text: l.text,
          costCenterId: l.costCenterId || null,
          profitCenterId: l.profitCenterId || null,
          taxCode: l.taxCode || null,
        },
        { transaction: t }
      );
      lineNo += 10;
    }

    await t.commit();
    res.status(201).json({ id: headerCreated.id, documentNumber, status });
  } catch (err) {
    await t.rollback();
    console.error('createJournal error', err);
    res.status(500).json({ message: 'Failed to post journal' });
  }
};

// GET /api/journals
exports.listJournals = async (req, res) => {
  try {
    const headers = await JournalHeader.findAll({
      order: [['postingDate', 'DESC'], ['documentNumber', 'DESC']],
    });
    res.json(headers);
  } catch (err) {
    console.error('listJournals error', err);
    res.status(500).json({ message: 'Failed to load journals' });
  }
};

// GET /api/journals/:id
exports.getJournal = async (req, res) => {
  try {
    const { id } = req.params;
    const header = await JournalHeader.findByPk(id, {
      include: [{ model: JournalLine }],
      order: [[JournalLine, 'lineNo', 'ASC']],
    });
    if (!header) {
      return res.status(404).json({ message: 'Journal not found' });
    }
    res.json(header);
  } catch (err) {
    console.error('getJournal error', err);
    res.status(500).json({ message: 'Failed to load journal' });
  }
};

// PUT /api/journals/:id/hold-toggle
exports.toggleHold = async (req, res) => {
  try {
    const { id } = req.params;
    const header = await JournalHeader.findByPk(id);
    if (!header) {
      return res.status(404).json({ message: 'Journal not found' });
    }
    if (header.status === 'POSTED') {
      header.status = 'HELD';
    } else if (header.status === 'HELD') {
      header.status = 'POSTED';
    }
    await header.save();
    res.json(header);
  } catch (err) {
    console.error('toggleHold error', err);
    res.status(500).json({ message: 'Failed to update status' });
  }
};