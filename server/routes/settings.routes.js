import express from 'express'
import bcrypt from 'bcryptjs'
import { Company, User, UserCompany } from '../models/index.js'
import { protect, authorize } from '../middleware/auth.js'

const router = express.Router()
console.log("SETTINGS ROUTE LOADED");
// ── Company / Department settings ────────────────────────
router.get('/companies', protect, async (req, res, next) => {
  try {
    const companies = await Company.findAll({ order: [['name', 'ASC']] })
    res.json(companies)
  } catch (err) { next(err) }
})

import { sequelize } from '../config/db.js';

router.post(
  '/companies',
  protect,
  authorize('super_admin'),
  async (req, res, next) => {
    try {
      const company = await Company.create(req.body);

      const relation = await UserCompany.create({
        userId: req.user.id,
        companyId: company.id,
      });

      console.log("RELATION CREATED:");
      console.log(relation.toJSON());

      res.status(201).json(company);
    } catch (err) {
      console.error(err);
      next(err);
    }
  }
);

router.patch('/companies/:id', protect, authorize('super_admin'), async (req, res, next) => {
  try {
    const company = await Company.findByPk(req.params.id)
    if (!company) return res.status(404).json({ message: 'Department not found' })
    await company.update(req.body)
    res.json(company)
  } catch (err) { next(err) }
})

// ── Users ─────────────────────────────────────────────────

router.get(
  '/users',
  protect,
  authorize('super_admin', 'admin'),
  async (req, res, next) => {
    try {
      const users = await User.findAll({
        include: [
          {
            model: Company,
            as: "company",
            attributes: ["id", "name"],
          },
          {
            model: Company,
            as: "companies",
            attributes: ["id", "name"],
          },
        ],
        order: [['name', 'ASC']],
      })

      res.json({
        users,
        total: users.length,
      })
    } catch (err) {
      next(err)
    }
  }
)
router.get(
  '/users/:id',
  protect,
  authorize('super_admin', 'admin'),
  async (req, res, next) => {
    try {
      const user = await User.findByPk(req.params.id, {
        include: [
          {
            model: Company,
            as: "company",
            attributes: ["id", "name"],
          },
          {
            model: Company,
            as: "companies",
            attributes: ["id", "name"],
          },
        ],
      })

      if (!user) {
        return res.status(404).json({
          message: 'User not found',
        })
      }

      res.json(user)
    } catch (err) {
      next(err)
    }
  }
)
router.post('/users', protect, authorize('super_admin', 'admin'), async (req, res, next) => {
  try {
    const {
      companies = [],
      primaryCompany,
      ...userData
    } = req.body;
    const exists = await User.findOne({
      where: {
        email: userData.email
      }
    })

    if (exists) {
      return res.status(400).json({
        message: 'Email already exists'
      })
    }

    // Store primary company in users table
    userData.companyId = primaryCompany;

    const user = await User.create(userData)

    if (companies.length) {
      await UserCompany.bulkCreate(
        companies.map(companyId => ({
          userId: user.id,
          companyId,
        }))
      );
    }
    res.status(201).json(user)
  } catch (err) { next(err) }
})
router.patch('/users/:id', protect, authorize('super_admin', 'admin'), async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id)

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    const {
      companies,
      primaryCompany,
      ...rest
    } = req.body;

    rest.companyId = primaryCompany;

    await user.update(rest)

    if (companies) {
      await UserCompany.destroy({ where: { userId: user.id } })

      await UserCompany.bulkCreate(
        companies.map(companyId => ({
          userId: user.id,
          companyId,
        }))
      )
    }

    res.json(user)
  } catch (err) {
    next(err)
  }
})

router.patch(
  '/users/:id/status',
  protect,
  authorize('super_admin', 'admin'),
  async (req, res, next) => {
    try {
      const user = await User.findByPk(req.params.id)

      if (!user) {
        return res.status(404).json({
          message: 'User not found',
        })
      }

      await user.update({
        status: req.body.status,
      })

      res.json(user)
    } catch (err) {
      next(err)
    }
  }
)

router.patch('/users/:id/password', protect, async (req, res, next) => {
  try {
    if (req.user.id !== req.params.id && req.user.role !== 'super_admin') {
      return res.status(403).json({ message: 'Not authorized' })
    }
    const user = await User.findByPk(req.params.id)
    if (!user) return res.status(404).json({ message: 'User not found' })
    user.password = req.body.password // hashed automatically by the beforeSave hook
    await user.save()
    res.json({ message: 'Password updated' })
  } catch (err) { next(err) }
})
router.delete(
  '/companies/:id',
  protect,
  authorize('super_admin'),
  async (req, res, next) => {
    try {
      const company = await Company.findByPk(req.params.id)

      if (!company) {
        return res.status(404).json({
          message: 'Company not found',
        })
      }

      await UserCompany.destroy({
        where: { companyId: company.id },
      })

      await company.destroy()

      res.json({
        message: 'Company deleted successfully',
      })
    } catch (err) {
      next(err)
    }
  }
)

router.delete('/users/:id', protect, authorize('super_admin'), async (req, res, next) => {
  try {
    await User.destroy({ where: { id: req.params.id } })

    res.json({
      message: 'User deleted',
    })
  } catch (err) {
    next(err)
  }
})

export default router
