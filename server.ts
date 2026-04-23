import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

    // Email API
    app.post('/api/send-confirmation', async (req, res) => {
      const { email, name, plate, service, address, phone } = req.body;

      if (!email || !name) {
        return res.status(400).json({ error: 'Email and name are required' });
      }

      // Check for missing credentials
      if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.error('SERVER ERROR: SMTP_USER or SMTP_PASS environment variables are missing.');
        return res.status(500).json({ 
          error: 'CONFIG_ERROR', 
          message: 'As credenciais de e-mail (SMTP_USER/SMTP_PASS) não foram encontradas no painel de Secrets.' 
        });
      }

      try {
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST || 'smtp.gmail.com',
          port: parseInt(process.env.SMTP_PORT || '465'),
          secure: true,
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        });

      const mailOptions = {
        from: `"FGL Rastreamento" <${process.env.SMTP_USER}>`,
        to: email,
        subject: 'ORDEM DE SERVIÇO - FGL RASTREAMENTO',
        html: `
          <div style="font-family: 'Helvetica', Arial, sans-serif; color: #333333; max-width: 600px; margin: 0 auto; padding: 40px; border: 1px solid #eeeeee;">
            <div style="margin-bottom: 40px; padding-bottom: 20px; border-bottom: 1px solid #eeeeee;">
              <h1 style="font-size: 18px; font-weight: bold; color: #000000; margin: 0; letter-spacing: -0.5px; text-transform: uppercase;">FGL Rastreamento</h1>
            </div>
            
            <h2 style="font-size: 16px; font-weight: bold; color: #000000; margin-bottom: 24px; text-transform: uppercase; letter-spacing: 1px;">Confirmação de Registro Técnica</h2>
            
            <p style="font-size: 14px; line-height: 1.6; margin-bottom: 16px;">Prezado(a) <strong>${name}</strong>,</p>
            <p style="font-size: 14px; line-height: 1.6; margin-bottom: 24px;">Confirmamos o recebimento da sua solicitação de serviço para o sistema de rastreamento associado ao veículo de placa <strong>${plate}</strong>. Os detalhes do registro seguem abaixo:</p>
            
            <div style="background-color: #fafafa; padding: 24px; margin-bottom: 32px; border: 1px solid #eeeeee;">
              <p style="font-size: 11px; font-weight: bold; color: #999999; margin: 0 0 16px 0; text-transform: uppercase; letter-spacing: 1px;">Detalhamento da Ordem</p>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; font-size: 13px; color: #666666;">Serviço solicitado:</td>
                  <td style="padding: 8px 0; font-size: 13px; color: #000000; font-weight: bold; text-align: right; text-transform: uppercase;">${service}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-size: 13px; color: #666666;">Endereço de atendimento:</td>
                  <td style="padding: 8px 0; font-size: 13px; color: #000000; font-weight: bold; text-align: right; text-transform: uppercase;">${address}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-size: 13px; color: #666666;">Contato registrado:</td>
                  <td style="padding: 8px 0; font-size: 13px; color: #000000; font-weight: bold; text-align: right;">${phone}</td>
                </tr>
              </table>
            </div>

            <p style="font-size: 12px; line-height: 1.6; color: #666666; margin-bottom: 32px;">Nossa equipe técnica entrará em contato via WhatsApp para validação final e agendamento de data e horário conforme disponibilidade.</p>
            
            <div style="border-top: 1px solid #eeeeee; padding-top: 24px; margin-top: 40px; text-align: center;">
              <p style="margin: 0 0 8px 0; font-size: 11px; color: #999999; text-transform: uppercase; letter-spacing: 1.5px;">FGL Rastreamento © Sistema de Gestão Técnica</p>
              <p style="margin: 0; font-size: 10px; color: #cccccc;">Por favor, não responda a este e-mail automático.</p>
            </div>
          </div>
        `,
      };

      await transporter.sendMail(mailOptions);
      res.json({ success: true, message: 'Email sent successfully' });
    } catch (error) {
      console.error('Error sending email:', error);
      res.status(500).json({ error: 'Failed to send email confirmation' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
