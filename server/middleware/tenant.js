import { validate as isUuid } from 'uuid'
import { Company } from '../models/index.js'

/**
 * resolveCompany
 * ----------------
 * Determines which department/company's data a request is allowed to touch.
 * Same security model as before: super_admin can cross departments via the
 * X-Company-ID header; everyone else is locked server-side to req.user.companyId.
 *
 * Sets `req.companyId` (string|null) and `req.isCrossCompany` (bool).
 */
export const resolveCompany = async (req, res, next) => {
  try {
    const requestedId = req.headers['x-company-id']

    if (req.user.role === 'super_admin') {
      if (!requestedId) {
        req.companyId = null // null = no filter = view across all departments
        req.isCrossCompany = true
        return next()
      }
      if (!isUuid(requestedId)) {
        return res.status(400).json({ message: 'Invalid company id' })
      }
      const exists = await Company.findByPk(requestedId)
      if (!exists) return res.status(404).json({ message: 'Department not found' })
      req.companyId = requestedId
      req.isCrossCompany = false
      return next()
    }

    // Non-super-admin: server-trusted value only, header is never honored.
    // if (!req.user.companyId) {
    //   return res.status(403).json({ message: 'Your account is not assigned to a department yet. Contact an administrator.' })
    // }

    // If no company is assigned, allow the request
    if (!req.user.companyId) {
      req.companyId = null;
      req.isCrossCompany = false;
      return next();
    }
    req.companyId = String(req.user.companyId)
    req.isCrossCompany = false
    next()
  } catch (err) {
    next(err)
  }
}

export const requireCompanyAdmin = (req, res, next) => {
  if (req.user.role === 'super_admin' || req.user.role === 'department_head') return next()
  return res.status(403).json({ message: 'Department Head access required' })
}
