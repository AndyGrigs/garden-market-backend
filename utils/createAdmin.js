// utils/createAdmin.js - ВИПРАВЛЕНА ВЕРСІЯ
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import UserModel from '../models/user.js';

// ✅ FIX: Завантажуємо .env файл
dotenv.config();

async function createAdmin() {
  try {
    // ✅ FIX: Перевіряємо чи є DATABASE_URL
    const DATABASE_URL = process.env.DATABASE_URL;
    
    if (!DATABASE_URL) {
      console.error('❌ DATABASE_URL не знайдено в .env файлі!');
      console.log('💡 Створи .env файл з DATABASE_URL=mongodb://localhost:27017/your-db-name');
      process.exit(1);
    }

    console.log('🔗 Підключаємось до бази:', DATABASE_URL);
    
    // Підключення до MongoDB
    await mongoose.connect(DATABASE_URL);
    console.log('✅ Підключено до MongoDB');

    // Дані для admin користувача
    const adminData = {
      fullName: 'Admin User',
      email: 'andygrigs88@gmail.com', // ✅ Твій email
      password: '111222', // ✅ Твій пароль
      role: 'admin',
      isVerified: true,
      language: 'uk'
    };

    // Перевіряємо чи вже існує admin
    const existingAdmin = await UserModel.findOne({ 
      email: adminData.email 
    });

    if (existingAdmin) {
      console.log('👤 Admin вже exists:', existingAdmin.email);
      
      // ✅ Оновлюємо роль якщо потрібно
      if (existingAdmin.role !== 'admin') {
        existingAdmin.role = 'admin';
        await existingAdmin.save();
        console.log('✅ Роль оновлено до admin');
      } else {
        console.log('✅ Користувач вже має роль admin');
      }
    } else {
      // Хешуємо пароль
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(adminData.password, saltRounds);

      // Створюємо admin користувача
      const admin = new UserModel({
        fullName: adminData.fullName,
        email: adminData.email,
        passwordHash: passwordHash,
        role: adminData.role,
        isVerified: adminData.isVerified,
        language: adminData.language
      });

      await admin.save();
      console.log('✅ Admin користувача створено:', admin.email);
    }

    console.log('🎉 Готово! Тепер можеш логінитися як admin:');
    console.log('📧 Email:', adminData.email);
    console.log('🔐 Пароль:', adminData.password);
    
  } catch (error) {
    console.error('❌ Помилка створення admin:', error);
  } finally {
    // Закриваємо з'єднання
    await mongoose.connection.close();
    console.log('🔌 З\'єднання з MongoDB закрито');
    process.exit(0);
  }
}

// Запускаємо функцію
createAdmin();