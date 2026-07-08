import dotenv from 'dotenv'
import { sequelize } from './config/db.js'
import { User, Company, UserCompany } from './models/index.js'

dotenv.config()

await sequelize.authenticate()
console.log('Connected to MySQL')
await sequelize.sync()

// Mongoose: Company.findOneAndUpdate(filter, data, { upsert: true, new: true })
// Sequelize equivalent: findOrCreate, then update if it already existed.
let [company, created] = await Company.findOrCreate({
  where: { name: 'OS Group' },
  defaults: {
    name: 'OS Group',
    type: 'Parent Company',
    industry: 'Technology',
    email: 'contact@osgroup.com',
    phone: '+977-9804230932',
    address: 'Kathmandu, Nepal',
    currency: 'NPR',
    timezone: 'Asia/Kathmandu',
  },
})
if (!created) {
  await company.update({
    type: 'Parent Company',
    industry: 'Technology',
    email: 'contact@osgroup.com',
    phone: '+977-9804230932',
    address: 'Kathmandu, Nepal',
    currency: 'NPR',
    timezone: 'Asia/Kathmandu',
  })
}

// Create super admin
const existing = await User.findOne({ where: { email: 'admin@osgroup.com' } })
if (!existing) {
  const admin = await User.create({
    name: 'Super Admin',
    email: 'admin@osgroup.com',
    password: 'Admin@1234', // hashed automatically by the User model's beforeSave hook
    role: 'super_admin',
    companyId: company.id,
    isActive: true,
    isVerified: true,
  })
  await UserCompany.create({ userId: admin.id, companyId: company.id })
  console.log('✅ Admin created: admin@osgroup.com / Admin@1234')
} else {
  console.log('ℹ️  Admin already exists')
}

console.log('✅ Company:', company.name, company.id)
await sequelize.close()
process.exit(0)
