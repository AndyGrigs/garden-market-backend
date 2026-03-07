import PDFDocument from 'pdfkit';
import path from 'path';
import { fileURLToPath } from 'url';
import { PassThrough } from 'stream';
import cloudinary from '../config/cloudinary.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class InvoiceService {
  constructor() {
    this.fontsDir = path.join(__dirname, '..', 'fonts');
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
        address: 'Адрес',
        phone: 'Телефон',
        email: 'Эл. почта',
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
        address: 'Adresa',
        phone: 'Telefon',
        email: 'Email',
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
    const invoiceNumber = `INV-${order.orderNumber}`;
    const fileName = `${invoiceNumber}.pdf`;

    // Генеруємо PDF в буфер (без запису на диск)
    const pdfBuffer = await this._generatePdfBuffer(doc => {
      const pageWidth = doc.page.width;
      const marginLeft = 50;
      const marginRight = 50;
      const contentWidth = pageWidth - marginLeft - marginRight;
      const colWidth = (contentWidth - 20) / 2;

      // === HEADER ===
      doc
        .fontSize(20)
        .font('Roboto-Bold')
        .text(t.invoice, marginLeft, 50, { width: contentWidth, align: 'center' });

      // Номер і дата — під заголовком
      doc
        .fontSize(9)
        .font('Roboto')
        .text(`${t.invoiceNumber}: ${invoiceNumber}`, marginLeft, 78, { width: contentWidth, align: 'center' })
        .text(`${t.date}: ${new Date().toLocaleDateString('ro-RO')} | ${t.orderNumber}: ${order.orderNumber}`, marginLeft, 90, { width: contentWidth, align: 'center' });

      // Лінія під заголовком
      doc.moveTo(marginLeft, 108).lineTo(pageWidth - marginRight, 108).stroke();

      // === ПРОДАВЕЦЬ і ПОКУПЕЦЬ — дві колонки ===
      const infoTop = 118;
      const col2X = marginLeft + colWidth + 20;

      doc
        .fontSize(10)
        .font('Roboto-Bold')
        .text(t.seller, marginLeft, infoTop, { width: colWidth })
        .fontSize(9)
        .font('Roboto')
        .text('Covaci Trees', marginLeft, infoTop + 14, { width: colWidth })
        .text('IDNO: 1234567890', marginLeft, infoTop + 26, { width: colWidth })
        .text(`${t.address}: с. Ришканы, Каушанский р-н`, marginLeft, infoTop + 38, { width: colWidth })
        .text(`${t.phone}: +373 797 481 311`, marginLeft, infoTop + 50, { width: colWidth })
        .text(`${t.email}: info@covacitrees.md`, marginLeft, infoTop + 62, { width: colWidth });

      doc
        .fontSize(10)
        .font('Roboto-Bold')
        .text(t.buyer, col2X, infoTop, { width: colWidth })
        .fontSize(9)
        .font('Roboto')
        .text(order.shippingAddress.name, col2X, infoTop + 14, { width: colWidth })
        .text(`${t.address}: ${order.shippingAddress.address}, ${order.shippingAddress.city}`, col2X, infoTop + 26, { width: colWidth })
        .text(`${t.phone}: ${order.shippingAddress.phone}`, col2X, infoTop + 38, { width: colWidth })
        .text(`${t.email}: ${order.guestEmail || order.userId?.email || ''}`, col2X, infoTop + 50, { width: colWidth });

      // Вертикальна лінія між колонками
      doc.moveTo(marginLeft + colWidth + 10, infoTop - 2).lineTo(marginLeft + colWidth + 10, infoTop + 74).stroke();

      // Лінія під блоком продавець/покупець
      const tableTop = infoTop + 84;
      doc.moveTo(marginLeft, tableTop - 10).lineTo(pageWidth - marginRight, tableTop - 10).stroke();

      // === ТАБЛИЦЯ ТОВАРІВ ===
      const tableHeaders = [
        { label: t.product, x: marginLeft, width: 240 },
        { label: t.quantity, x: 295, width: 60 },
        { label: t.price, x: 360, width: 80 },
        { label: t.total, x: 445, width: 100 }
      ];

      doc.fontSize(9).font('Roboto-Bold');
      tableHeaders.forEach(header => {
        doc.text(header.label, header.x, tableTop, {
          width: header.width,
          align: header.label === t.product ? 'left' : 'right'
        });
      });

      doc.moveTo(marginLeft, tableTop + 16).lineTo(pageWidth - marginRight, tableTop + 16).stroke();

      // Товари
      let yPosition = tableTop + 24;
      doc.font('Roboto').fontSize(9);

      order.items.forEach((item) => {
        const title = item.title && (item.title[language] || item.title.ru || item.title.ro) || 'Товар/Produs';

        doc.text(title, marginLeft, yPosition, { width: 235 });
        doc.text(item.quantity.toString(), 295, yPosition, { width: 60, align: 'right' });
        doc.text(`${item.price.toFixed(2)} MDL`, 360, yPosition, { width: 80, align: 'right' });
        doc.text(`${item.subtotal.toFixed(2)} MDL`, 445, yPosition, { width: 100, align: 'right' });

        yPosition += 20;
      });

      // Лінія перед підсумком
      doc.moveTo(marginLeft, yPosition).lineTo(pageWidth - marginRight, yPosition).stroke();
      yPosition += 10;

      // === ПІДСУМОК ===
      doc
        .fontSize(10)
        .font('Roboto-Bold')
        .text(t.totalAmount, 300, yPosition)
        .text(`${order.totalAmount.toFixed(2)} MDL`, 445, yPosition, { width: 100, align: 'right' });

      yPosition += 24;
      doc.moveTo(marginLeft, yPosition).lineTo(pageWidth - marginRight, yPosition).stroke();
      yPosition += 14;

      // === РЕКВІЗИТИ ДЛЯ ОПЛАТИ ===
      doc
        .fontSize(10)
        .font('Roboto-Bold')
        .text(t.paymentDetails, marginLeft, yPosition);

      yPosition += 14;
      doc.fontSize(9).font('Roboto');

      const payRows = [
        [`${t.beneficiary}:`, 'Covaci Trees'],
        [`${t.bankName}:`, 'Moldova Agroindbank'],
        [`${t.iban}:`, 'MD00AG000000000000000000'],
        [`${t.swift}:`, 'AGRNMD2X'],
        [`${t.paymentPurpose}:`, `${invoiceNumber}, ${t.orderNumber} ${order.orderNumber}`],
      ];

      payRows.forEach(([label, value]) => {
        doc.font('Roboto-Bold').text(label, marginLeft, yPosition, { width: 130, continued: false });
        doc.font('Roboto').text(value, marginLeft + 135, yPosition, { width: contentWidth - 135 });
        yPosition += 14;
      });

      // === ПІДПИС ===
      const signY = doc.page.height - 80;
      doc.moveTo(marginLeft, signY - 6).lineTo(pageWidth - marginRight, signY - 6).stroke();
      doc
        .fontSize(9)
        .font('Roboto')
        .text(`${t.signature}: _________________`, marginLeft, signY)
        .text(`${t.stamp}`, pageWidth - marginRight - 80, signY);

      // Footer
      doc
        .fontSize(8)
        .font('Roboto')
        .text('Covaci Trees - www.covacitrees.md', marginLeft, doc.page.height - 35, {
          align: 'center',
          width: contentWidth
        });
    });

    // Завантажуємо PDF напряму в Cloudinary через stream (без локального файлу)
    const result = await this._uploadToCloudinary(pdfBuffer, invoiceNumber);

    return {
      success: true,
      fileName,
      cloudinaryUrl: result.secure_url,
      relativePath: result.secure_url,
      pdfBuffer
    };
  }

  /**
   * Генерує PDF в буфер без запису на диск
   */
  _generatePdfBuffer(buildContent) {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 50,
        bufferPages: true
      });

      doc.registerFont('Roboto', path.join(this.fontsDir, 'Roboto-Regular.ttf'));
      doc.registerFont('Roboto-Bold', path.join(this.fontsDir, 'Roboto-Bold.ttf'));

      const chunks = [];
      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      buildContent(doc);
      doc.end();
    });
  }

  /**
   * Завантажує буфер в Cloudinary через upload_stream
   */
  _uploadToCloudinary(buffer, publicId) {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'raw',
          folder: 'garden-market/invoices',
          public_id: publicId,
          overwrite: true,
          format: 'pdf'
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );

      const passThrough = new PassThrough();
      passThrough.end(buffer);
      passThrough.pipe(uploadStream);
    });
  }
}

export default new InvoiceService();
