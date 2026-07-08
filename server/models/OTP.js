import { DataTypes, Model } from 'sequelize'
import { sequelize } from '../config/db.js'

class OTP extends Model {}

OTP.init(
{
    id:{
        type:DataTypes.UUID,
        defaultValue:DataTypes.UUIDV4,
        primaryKey:true
    },

    email:{
        type:DataTypes.STRING,
        allowNull:false
    },

    otp:{
        type:DataTypes.STRING,
        allowNull:false
    },

    expiresAt:{
        type:DataTypes.DATE,
        allowNull:false
    },

    verified:{
        type:DataTypes.BOOLEAN,
        defaultValue:false
    }

},{
    sequelize,
    modelName:'OTP',
    tableName:'otps'
})

export default OTP