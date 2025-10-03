export function generateVerificationEmailContent(link: string): {
  html: string;
  text: string;
} {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; background-color: #f9f9f9; border-radius: 8px; color: #333;">
      <h2 style="color: #2c3e50;">Confirmação de E-mail</h2>
      <p>Olá,</p>
      <p>Para concluir seu cadastro, por favor clique no botão abaixo para verificar seu e-mail:</p>
      <p style="text-align: center; margin: 30px 0;">
        <a href="${link}" style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-size: 16px;">Verificar E-mail</a>
      </p>
      <p>Ou copie e cole o link no seu navegador:</p>
      <p style="word-break: break-all;">${link}</p>
      <p>Este link expirará em 2 horas.</p>
      <hr style="margin-top: 40px;" />
      <p style="font-size: 12px; color: #888;">Se você não solicitou este e-mail, pode ignorá-lo com segurança.</p>
    </div>
  `;

  const text = `
Olá,

Para concluir seu cadastro, clique no link abaixo para verificar seu e-mail:

${link}

Este link expirará em 2 horas.

Se você não solicitou este e-mail, pode ignorá-lo.
  `.trim();

  return { html, text };
}
