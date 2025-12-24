import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class InvoiceService {
  constructor() {
    this.invoicesDir = path.resolve('invoices');
    
    // Створюємо папку для рахунків якщо її немає
    if (!fs.existsSync(this.invoicesDir)) {
      fs.mkdirSync(this.invoicesDir, { recursive: true });
    }
  }

  async generateInvoice(order, language = 'ru') {
    const translations = {
      ru: {
        invoice: 'СЧЁТ',
        invoiceNumber: 'Счёт №',
        date: 'Дата',
        orderNumber: 'Заказ №',
        seller: 'ПРОДАВЕЦ',
        buyer: 'ПОКУПАТЕЛЬ',
        product: 'Товар',
        quantity: 'Количество',
        price: 'Цена',
        total: 'Сумма',
        subtotal: 'Итого',
        totalAmount: 'ВСЕГО К ОПЛАТЕ',
        paymentDetails: 'РЕКВИЗИТЫ ДЛЯ ОПЛАТЫ',
        bankName: 'Название банка',
        accountNumber: 'Номер счёта',
        iban: 'IBAN',
        swift: 'SWIFT/BIC',
        beneficiary: 'Получатель',
        paymentPurpose: 'Назначение платежа',
        signature: 'Подпись',
        stamp: 'М.П.'
      },
      ro: {
        invoice: 'FACTURĂ',
        invoiceNumber: 'Factură Nr.',
        date: 'Data',
        orderNumber: 'Comandă Nr.',
        seller: 'VÂNZĂTOR',
        buyer: 'CUMPĂRĂTOR',
        product: 'Produs',
        quantity: 'Cantitate',
        price: 'Preț',
        total: 'Total',
        subtotal: 'Subtotal',
        totalAmount: 'TOTAL DE PLATĂ',
        paymentDetails: 'DETALII DE PLATĂ',
        bankName: 'Nume bancă',
        accountNumber: 'Număr cont',
        iban: 'IBAN',
        swift: 'SWIFT/BIC',
        beneficiary: 'Beneficiar',
        paymentPurpose: 'Scopul plății',
        signature: 'Semnătură',
        stamp: 'Ștampilă'
      }
    };

    const t = translations[language] || translations.ru;
    
    return new Promise((resolve, reject) => {
      try {
        const invoiceNumber = `INV-${order.orderNumber}`;
        const fileName = `${invoiceNumber}.pdf`;
        const filePath = path.join(this.invoicesDir, fileName);
        
        const doc = new PDFDocument({ 
          size: 'A4',
          margin: 50,
          bufferPages: true
        });
        
        const stream = fs.createWriteStream(filePath);
        doc.pipe(stream);

        // === HEADER ===
        doc
          .fontSize(24)
          .font('Helvetica-Bold')
          .text(t.invoice, { align: 'center' })
          .moveDown(0.5);

        // Номер і дата
        doc
          .fontSize(10)
          .font('Helvetica')
          .text(`${t.invoiceNumber}: ${invoiceNumber}`, { align: 'right' })
          .text(`${t.date}: ${new Date().toLocaleDateString('ro-RO')}`, { align: 'right' })
          .text(`${t.orderNumber}: ${order.orderNumber}`, { align: 'right' })
          .moveDown(2);

        // === ПРОДАВЕЦЬ ===
        doc
          .fontSize(12)
          .font('Helvetica-Bold')
          .text(t.seller)
          .fontSize(10)
          .font('Helvetica')
          .text('Covaci Trees')
          .text('IDNO: 1234567890') // Твій IDNO
          .text('Адреса: с. Ришканы, Каушанский район, Молдова')
          .text('Телефон: +373 797 481 311')
          .text('Email: info@covacitrees.md')
          .moveDown(1.5);

        // === ПОКУПЕЦЬ ===
        doc
          .fontSize(12)
          .font('Helvetica-Bold')
          .text(t.buyer)
          .fontSize(10)
          .font('Helvetica')
          .text(order.shippingAddress.name)
          .text(`${order.shippingAddress.address}, ${order.shippingAddress.city}`)
          .text(`Телефон: ${order.shippingAddress.phone}`)
          .text(`Email: ${order.guestEmail || order.userId?.email || ''}`)
          .moveDown(2);

        // === ТАБЛИЦЯ ТОВАРІВ ===
        const tableTop = doc.y;
        const tableHeaders = [
          { label: t.product, x: 50, width: 250 },
          { label: t.quantity, x: 300, width: 60 },
          { label: t.price, x: 360, width: 80 },
          { label: t.total, x: 440, width: 100 }
        ];

        // Заголовки таблиці
        doc
          .fontSize(10)
          .font('Helvetica-Bold');
        
        tableHeaders.forEach(header => {
          doc.text(header.label, header.x, tableTop, { 
            width: header.width,
            align: header.label === t.product ? 'left' : 'right'
          });
        });

        // Лінія під заголовками
        doc
          .moveTo(50, tableTop + 20)
          .lineTo(540, tableTop + 20)
          .stroke();

        // Товари
        let yPosition = tableTop + 30;
        doc.font('Helvetica').fontSize(9);

        order.items.forEach((item, index) => {
          const title = item.title[language] || item.title.ru || item.title.ro;
          
          doc.text(title, 50, yPosition, { width: 240 });
          doc.text(item.quantity.toString(), 300, yPosition, { width: 60, align: 'right' });
          doc.text(`${item.price.toFixed(2)} MDL`, 360, yPosition, { width: 80, align: 'right' });
          doc.text(`${item.subtotal.toFixed(2)} MDL`, 440, yPosition, { width: 100, align: 'right' });
          
          yPosition += 25;
        });

        // Лінія перед підсумком
        doc
          .moveTo(50, yPosition)
          .lineTo(540, yPosition)
          .stroke();

        yPosition += 15;

        // === ПІДСУМОК ===
        doc
          .fontSize(12)
          .font('Helvetica-Bold')
          .text(t.totalAmount, 300, yPosition)
          .text(`${order.totalAmount.toFixed(2)} MDL`, 440, yPosition, { 
            width: 100, 
            align: 'right' 
          });

        yPosition += 40;

        // === РЕКВІЗИТИ ДЛЯ ОПЛАТИ ===
        doc
          .fontSize(12)
          .font('Helvetica-Bold')
          .text(t.paymentDetails, 50, yPosition)
          .moveDown(0.5);

        doc
          .fontSize(10)
          .font('Helvetica')
          .text(`${t.beneficiary}: Covaci Trees`)
          .text(`${t.bankName}: Moldova Agroindbank`)
          .text(`${t.accountNumber}: MD00AG000000000000000000`)
          .text(`${t.iban}: MD00AG000000000000000000`)
          .text(`${t.swift}: AGRNMD2X`)
          .text(`${t.paymentPurpose}: ${t.invoiceNumber} ${invoiceNumber}, ${t.orderNumber} ${order.orderNumber}`)
          .moveDown(2);

        // === ПІДПИС ===
        doc
          .fontSize(10)
          .text(`${t.signature}: _________________`, 50, doc.page.height - 150)
          .text(`${t.stamp}`, 400, doc.page.height - 150);

        // Footer
        doc
          .fontSize(8)
          .font('Helvetica')
          .text('Covaci Trees - www.covacitrees.md', 50, doc.page.height - 50, {
            align: 'center',
            width: 500
          });

        doc.end();

        stream.on('finish', () => {
          resolve({
            success: true,
            fileName: fileName,
            filePath: filePath,
            relativePath: `/invoices/${fileName}`
          });
        });

        stream.on('error', (error) => {
          reject(error);
        });

      } catch (error) {
        reject(error);
      }
    });
  }
}

export default new InvoiceService();